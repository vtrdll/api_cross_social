FROM python:3.12-slim

# Evita bytecode e buffer
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Diretório de trabalho
WORKDIR /app

# Dependências de sistema
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Instala Poetry
RUN pip install --no-cache-dir poetry

# Configura Poetry para instalar no sistema (sem venv)
ENV POETRY_VIRTUALENVS_CREATE=false

# Copia arquivos de dependência
COPY pyproject.toml poetry.lock* ./

# Instala dependências
RUN poetry install --no-interaction --no-ansi

# Copia o código
COPY . .

# Porta padrão
EXPOSE 8000
