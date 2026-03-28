from django.urls import path
from .views import (
    HealthView,
    SimulateView,
    PredictView,
    ChatView,
    SimulationHistoryView,
    PredictionHistoryView,
)

urlpatterns = [
    path("health/",      HealthView.as_view(),            name="health"),
    path("simulate/",    SimulateView.as_view(),          name="simulate"),
    path("predict/",     PredictView.as_view(),           name="predict"),
    path("chat/",        ChatView.as_view(),              name="chat"),
    path("history/",     SimulationHistoryView.as_view(), name="history"),
    path("predictions/", PredictionHistoryView.as_view(), name="predictions"),
]
