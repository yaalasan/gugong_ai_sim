"""
views.py — API Views for Gugong Earthquake Simulator
=====================================================
Endpoints:
    POST /api/simulate/      — run physics simulation
    POST /api/predict/       — AI building assessment
    GET  /api/history/       — past simulation runs
    GET  /api/predictions/   — past AI predictions
    GET  /api/health/        — server health check
"""

import json
import logging
from openai import OpenAI
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .physics import SimulationParams, run_simulation, compute_seismic_risk_score
from .serializers import (
    SimulationRequestSerializer,
    PredictRequestSerializer,
    SimulationRunSerializer,
    BuildingPredictionSerializer,
)
from .models import SimulationRun, BuildingPrediction

logger = logging.getLogger(__name__)


class HealthView(APIView):
    """Simple health check endpoint."""

    def get(self, request):
        return Response({
            "status": "ok",
            "message": "故宫抗震模拟系统 API is running",
            "version": "2.0.0",
        })


class SimulateView(APIView):
    """
    Run physics simulation and return time series data.

    POST /api/simulate/
    {
        "magnitude": 6.5,
        "frequency": 1.2,
        "damping": 0.15,
        "structure_type": "dougong",
        "duration": 10
    }
    """

    def post(self, request):
        serializer = SimulationRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data

        # Run physics simulation
        params = SimulationParams(
            magnitude=data["magnitude"],
            frequency=data["frequency"],
            damping=data["damping"],
            duration=data["duration"],
        )

        try:
            result = run_simulation(params)
        except Exception as e:
            logger.error(f"Simulation error: {e}")
            return Response(
                {"error": "Simulation failed", "detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # Choose displacement based on structure type
        if data["structure_type"] == "dougong":
            primary_disp = result.max_dougong_disp
        else:
            primary_disp = result.max_concrete_disp

        # Compute risk
        risk = compute_seismic_risk_score(
            magnitude=data["magnitude"],
            displacement=primary_disp,
            damping=data["damping"],
            frequency_ratio=result.frequency_ratio,
        )

        # Save to database (subsample time series for storage)
        step = max(1, len(result.time) // 100)
        SimulationRun.objects.create(
            magnitude=data["magnitude"],
            frequency=data["frequency"],
            damping=data["damping"],
            structure_type=data["structure_type"],
            max_displacement=round(primary_disp, 4),
            risk_score=risk["score"],
            risk_level=risk["level"],
            frequency_ratio=round(result.frequency_ratio, 3),
        )

        return Response({
            "time":             result.time[::step],
            "ground":           result.ground[::step],
            "concrete":         result.concrete[::step],
            "dougong":          result.dougong[::step],
            "max_concrete_disp": result.max_concrete_disp,
            "max_dougong_disp":  result.max_dougong_disp,
            "frequency_ratio":   result.frequency_ratio,
            "resonance_risk":    result.resonance_risk,
            "risk":              risk,
        })


class PredictView(APIView):
    """
    AI-powered building seismic assessment using Claude.

    POST /api/predict/
    {
        "building_type": "斗拱 Dougong Timber",
        "height": 35,
        "wall_thickness": 80,
        "foundation_depth": 3.5,
        "age": 600,
        "location": "Beijing",
        "magnitude": 8.0
    }
    """

    def post(self, request):
        serializer = PredictRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data


        prompt = f"""You are an expert structural engineer specialising in ancient Chinese imperial architecture and seismic resilience.

A researcher wants to assess the earthquake resistance of a building with these properties:
- Building Type: {data['building_type']}
- Height: {data['height']} m
- Wall Thickness: {data['wall_thickness']} cm
- Foundation Depth: {data['foundation_depth']} m
- Age of Building: {data['age']} years
- Location / Region: {data['location']}
- Design Earthquake Magnitude: {data['magnitude']} Mw

Respond ONLY with a valid JSON object, no markdown, no explanation outside the JSON:
{{
  "resistanceScore": <integer 0-100>,
  "riskLevel": "<LOW | MODERATE | HIGH | CRITICAL>",
  "summary": "<2-3 sentence plain English summary of seismic performance>",
  "keyStrengths": ["<strength 1>", "<strength 2>"],
  "keyVulnerabilities": ["<vulnerability 1>", "<vulnerability 2>"],
  "recommendation": "<1 sentence practical recommendation>",
  "historicalContext": "<1 sentence about how similar structures performed historically>"
}}"""

        try:
            api_key = getattr(settings, "DEEPSEEK_API_KEY", "")
            base_url = getattr(settings, "DEEPSEEK_BASE_URL", "https://api.deepseek.com")

            if not api_key:
                return Response(
                    {"error": "DEEPSEEK_API_KEY not configured"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

            client = OpenAI(
                api_key=api_key,
                base_url=base_url,
            )

            completion = client.chat.completions.create(
                model="deepseek-chat",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a structural engineering expert. Always respond with valid JSON only."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.3,  # lower = more consistent JSON
                max_tokens=1000,
            )

            text = completion.choices[0].message.content

            # Clean response
            clean = text.strip().replace("```json", "").replace("```", "").strip()
            ai_result = json.loads(clean)

        except json.JSONDecodeError as e:
            logger.error(f"JSON parse error: {e} — raw: {text}")
            return Response(
                {"error": "AI returned malformed response", "detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        except Exception as e:
            logger.error(f"DeepSeek API error: {e}")
            return Response(
                {"error": "AI prediction failed", "detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        except json.JSONDecodeError as e:
            logger.error(f"JSON parse error: {e} — raw: {text}")
            return Response(
                {"error": "AI returned malformed response", "detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        except Exception as e:
            logger.error(f"Claude API error: {e}")
            return Response(
                {"error": "AI prediction failed", "detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # Save to database
        try:
            BuildingPrediction.objects.create(
                building_type=data["building_type"],
                height=data["height"],
                wall_thickness=data["wall_thickness"],
                foundation_depth=data["foundation_depth"],
                age_years=data["age"],
                location=data["location"],
                design_magnitude=data["magnitude"],
                resistance_score=ai_result.get("resistanceScore", 0),
                risk_level=ai_result.get("riskLevel", "UNKNOWN"),
                summary=ai_result.get("summary", ""),
                recommendation=ai_result.get("recommendation", ""),
            )
        except Exception as e:
            logger.warning(f"Could not save prediction to DB: {e}")

        return Response(ai_result)
class ChatView(APIView):
    """
    POST /api/chat/
    {
        "message": "Why is dougong more earthquake-resistant?",
        "context": {
            "magnitude": 6.5,
            "frequency": 1.2,
            "damping": 0.3,
            "structure_type": "dougong"
        }
    }
    """

    def post(self, request):
        message = request.data.get("message", "").strip()
        context = request.data.get("context", {})

        if not message:
            return Response(
                {"error": "Message is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        api_key = getattr(settings, "DEEPSEEK_API_KEY", "")
        base_url = getattr(settings, "DEEPSEEK_BASE_URL", "https://api.deepseek.com")

        if not api_key:
            return Response(
                {"error": "DEEPSEEK_API_KEY not configured"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        system_prompt = f"""
You are '明代工程导师' — a Ming-dynasty master engineer and educational guide for the Gugong AI Ancient Engineering Simulation System.

Your role:
- Explain ancient Chinese palace engineering in simple but accurate terms.
- Help users understand why structures like dougong behave differently under earthquakes.
- Relate answers to the current simulation context when provided.
- Be educational, clear, and concise.
- If the user asks about engineering, materials, palace design, earthquake resistance, or historical construction logic, answer as a knowledgeable mentor.
- Do not invent exact historical facts when uncertain. State uncertainty clearly.
- Keep answers practical and understandable for students.

Current simulation context:
- Magnitude: {context.get("magnitude", "unknown")}
- Frequency: {context.get("frequency", "unknown")}
- Damping: {context.get("damping", "unknown")}
- Structure Type: {context.get("structure_type", "unknown")}
"""

        try:
            client = OpenAI(
                api_key=api_key,
                base_url=base_url,
            )

            completion = client.chat.completions.create(
                model="deepseek-chat",
                messages=[
                    {"role": "system", "content": system_prompt.strip()},
                    {"role": "user", "content": message},
                ],
                temperature=0.7,
                max_tokens=700,
            )

            reply = completion.choices[0].message.content.strip()

            return Response({
                "reply": reply
            })

        except Exception as e:
            logger.error(f"DeepSeek chat error: {e}")
            return Response(
                {"error": "Chat request failed", "detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class SimulationHistoryView(APIView):
    """
    GET /api/history/ — last 50 simulation runs
    """

    def get(self, request):
        runs = SimulationRun.objects.all()[:50]
        serializer = SimulationRunSerializer(runs, many=True)
        return Response(serializer.data)


class PredictionHistoryView(APIView):
    """
    GET /api/predictions/ — last 20 AI building assessments
    """

    def get(self, request):
        preds = BuildingPrediction.objects.all()[:20]
        serializer = BuildingPredictionSerializer(preds, many=True)
        return Response(serializer.data)
