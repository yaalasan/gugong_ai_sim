# Backend — Django + Python

## Setup
```bash
pip install -r requirements.txt
cp .env.example .env        # fill in your ANTHROPIC_API_KEY
python manage.py migrate
python manage.py runserver
```

## Structure
```
backend/
├── manage.py
├── gugong_backend/         ← Django project config
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
└── simulator/              ← main app
    ├── physics.py          ← numpy physics engine
    ├── views.py            ← API endpoints
    ├── models.py           ← database models
    ├── serializers.py      ← DRF serializers
    └── urls.py             ← route definitions
```

## Adding the Chatbot
Create a new view in `simulator/views.py`:
```python
class ChatView(APIView):
    def post(self, request):
        # your chatbot logic here
        pass
```
Add to `simulator/urls.py`:
```python
path("chat/", ChatView.as_view()),
```
