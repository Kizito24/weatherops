#!/bin/bash
set -e

echo "Installing Python dependencies..."
pip install --upgrade pip setuptools wheel
pip install -r requirements/base.txt

echo "Running database migrations..."
cd backend || true
alembic upgrade head

echo "Build completed successfully!"
