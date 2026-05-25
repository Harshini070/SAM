#!/bin/bash

# Install dependencies
echo "📦 Installing dependencies..."
pip install -r requirements.txt

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please update .env with your configuration"
fi

# Start MongoDB (if not running)
echo "🗄️  Starting MongoDB..."
# This assumes MongoDB is installed locally
# For production, use a MongoDB Atlas connection string

# Start the backend server
echo "🚀 Starting FastAPI server..."
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

