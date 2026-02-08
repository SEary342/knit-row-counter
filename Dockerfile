FROM python:3.14-slim

# Install uv.
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Copy the application into the container.
COPY . /backend

# Install the application dependencies.
WORKDIR /backend
RUN uv sync --frozen --no-cache

# Run the application.
CMD ["/backend/.venv/bin/fastapi", "run", "backend/main.py", "--port", "80", "--host", "0.0.0.0"]