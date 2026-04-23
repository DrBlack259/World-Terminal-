#!/bin/bash
# Start the World Terminal ML Backend
cd "$(dirname "$0")"
echo "Installing Python dependencies..."
pip install -r requirements.txt -q
echo "Starting World Terminal ML Engine on http://localhost:8000"
echo "API Docs available at http://localhost:8000/docs"
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
