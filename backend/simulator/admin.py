from django.contrib import admin
from .models import SimulationRun, BuildingPrediction


@admin.register(SimulationRun)
class SimulationRunAdmin(admin.ModelAdmin):
    list_display  = ["id", "created_at", "magnitude", "frequency", "damping", "structure_type", "risk_level", "risk_score"]
    list_filter   = ["structure_type", "risk_level"]
    ordering      = ["-created_at"]


@admin.register(BuildingPrediction)
class BuildingPredictionAdmin(admin.ModelAdmin):
    list_display  = ["id", "created_at", "building_type", "location", "design_magnitude", "resistance_score", "risk_level"]
    list_filter   = ["risk_level", "building_type"]
    ordering      = ["-created_at"]
