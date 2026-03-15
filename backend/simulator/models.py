from django.db import models


class SimulationRun(models.Model):
    """
    Stores a record of each simulation run.
    Useful for research — track which parameters were tested.
    """
    created_at      = models.DateTimeField(auto_now_add=True)
    magnitude       = models.FloatField()
    frequency       = models.FloatField()
    damping         = models.FloatField()
    structure_type  = models.CharField(max_length=50)
    max_displacement = models.FloatField()
    risk_score      = models.FloatField()
    risk_level      = models.CharField(max_length=20)
    frequency_ratio = models.FloatField()

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Sim {self.id} — Mag {self.magnitude} | {self.structure_type} | {self.risk_level}"


class BuildingPrediction(models.Model):
    """
    Stores AI predictions for user-submitted buildings.
    Builds a dataset of assessed historic structures over time.
    """
    created_at        = models.DateTimeField(auto_now_add=True)
    building_type     = models.CharField(max_length=100)
    height            = models.FloatField()
    wall_thickness    = models.FloatField()
    foundation_depth  = models.FloatField()
    age_years         = models.IntegerField()
    location          = models.CharField(max_length=200)
    design_magnitude  = models.FloatField()
    resistance_score  = models.IntegerField()
    risk_level        = models.CharField(max_length=20)
    summary           = models.TextField()
    recommendation    = models.TextField()

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.building_type} @ {self.location} — Score {self.resistance_score}"
