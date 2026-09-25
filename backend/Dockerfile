FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV PYTHONUNBUFFERED=1

EXPOSE 8000

# Seed on first boot (controlled by SEED_ON_START), then serve
CMD ["sh", "-c", "if [ \"$SEED_ON_START\" = \"1\" ]; then python -m app.seed; fi; uvicorn app.main:app --host 0.0.0.0 --port 8000"]
