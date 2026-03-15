from rest_framework import serializers
from .models import SimulationRun, BuildingPrediction


class SimulationRunSerializer(serializers.ModelSerializer):
    class Meta:
        model = SimulationRun
        fields = "__all__"


class BuildingPredictionSerializer(serializers.ModelSerializer):
    class Meta:
        model = BuildingPrediction
        fields = "__all__"


class SimulationRequestSerializer(serializers.Serializer):
    magnitude      = serializers.FloatField(min_value=0, max_value=9)
    frequency      = serializers.FloatField(min_value=0.1, max_value=5)
    damping        = serializers.FloatField(min_value=0, max_value=1)
    structure_type = serializers.ChoiceField(choices=["concrete", "dougong"])
    duration       = serializers.FloatField(min_value=1, max_value=30, default=10)


class PredictRequestSerializer(serializers.Serializer):
    building_type    = serializers.CharField(max_length=100)
    height           = serializers.FloatField(min_value=0)
    wall_thickness   = serializers.FloatField(min_value=0)
    foundation_depth = serializers.FloatField(min_value=0)
    age              = serializers.IntegerField(min_value=0)
    location         = serializers.CharField(max_length=200)
    magnitude        = serializers.FloatField(min_value=0, max_value=10)
