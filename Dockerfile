# Estágio de construção
FROM python:3.11-slim as builder

WORKDIR /app

RUN apt-get update && \
    apt-get install -y --no-install-recommends gcc python3-dev && \
    rm -rf /var/lib/apt/lists/*

RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

FROM python:3.11-slim

WORKDIR /app

COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY ./src /app

ENV PYTHONPATH=/app
ENV APP_ENV=production
ENV PORT=8000

RUN groupadd -r appuser && useradd -r -g appuser appuser && \
    chown -R appuser:appuser /app
USER appuser

EXPOSE $PORT

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]