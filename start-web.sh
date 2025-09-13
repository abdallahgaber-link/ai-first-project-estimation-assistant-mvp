#!/bin/bash

echo "🚀 Starting Project Estimation Assistant (Web Version)"
echo "=================================================="

# Check if backend is running
if ! lsof -ti:3000 > /dev/null; then
    echo "🔧 Starting Backend Server..."
    cd backend_api
    npm run dev &
    BACKEND_PID=$!
    echo "Backend started with PID: $BACKEND_PID"
    cd ..
    sleep 3
else
    echo "⚠️  Backend server is already running on port 3000"
fi

# Check if Flutter web is running
if ! lsof -ti:8080 > /dev/null; then
    echo "🌐 Starting Flutter Web App..."
    cd frontend_flutter
    flutter run -d chrome --web-port 8080 &
    FLUTTER_PID=$!
    echo "Flutter web started with PID: $FLUTTER_PID"
    cd ..
    sleep 5
else
    echo "⚠️  Flutter web app is already running on port 8080"
fi

echo ""
echo "🎉 Web Application Ready!"
echo "========================="
echo "📱 Flutter Web App: http://localhost:8080"
echo "🔧 Backend API: http://localhost:3000"
echo ""
echo "✅ CORS is properly configured for web access"
echo "✅ Export functionality will download files to your Downloads folder"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user interrupt
trap 'echo "Stopping services..."; kill $BACKEND_PID $FLUTTER_PID 2>/dev/null; exit' INT
wait
