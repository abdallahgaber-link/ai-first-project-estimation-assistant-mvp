#!/bin/bash

# Quick Start Script - Simple version for testing
# This script provides a streamlined startup for the Project Estimation Assistant

echo "🚀 Quick Start - Project Estimation Assistant"
echo "=============================================="

# Make scripts executable
chmod +x start-app.sh stop-app.sh

# Check if Ollama is running, if not start it
if ! curl -s http://localhost:11434 >/dev/null 2>&1; then
    echo "🤖 Starting Ollama..."
    ollama serve &
    sleep 5
fi

# Check if model exists, if not pull it
if ! ollama list | grep -q "llama3.1:8b"; then
    echo "📥 Downloading AI model (this may take a few minutes)..."
    ollama pull llama3.1:8b
fi

# Start backend
echo "🔧 Starting backend server..."
cd backend_api
npm run dev &
sleep 5

# Start frontend
echo "🌐 Starting web app..."
cd ../frontend_flutter
flutter run -d chrome --web-port=8080 &

echo ""
echo "✅ Services starting up..."
echo "🌐 Web App: http://localhost:8080"
echo "🔧 API: http://localhost:3000"
echo ""
echo "💡 To stop all services, run: ./stop-app.sh"
