#!/bin/bash

# Project Estimation Assistant - Startup Script
# This script starts all required services for the application

set -e  # Exit on any error

echo "🚀 Starting Project Estimation Assistant..."
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a port is in use
port_in_use() {
    lsof -i :$1 >/dev/null 2>&1
}

# Function to wait for service to be ready
wait_for_service() {
    local url=$1
    local service_name=$2
    local max_attempts=30
    local attempt=1
    
    echo -e "${YELLOW}⏳ Waiting for $service_name to be ready...${NC}"
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$url" >/dev/null 2>&1; then
            echo -e "${GREEN}✅ $service_name is ready!${NC}"
            return 0
        fi
        
        echo -e "${YELLOW}   Attempt $attempt/$max_attempts - waiting...${NC}"
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo -e "${RED}❌ $service_name failed to start after $max_attempts attempts${NC}"
    return 1
}

# Check prerequisites
echo -e "${BLUE}🔍 Checking prerequisites...${NC}"

if ! command_exists ollama; then
    echo -e "${RED}❌ Ollama is not installed. Please install it first:${NC}"
    echo -e "${YELLOW}   brew install ollama${NC}"
    exit 1
fi

if ! command_exists node; then
    echo -e "${RED}❌ Node.js is not installed. Please install it first.${NC}"
    exit 1
fi

if ! command_exists flutter; then
    echo -e "${RED}❌ Flutter is not installed. Please install it first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All prerequisites are installed${NC}"

# Step 1: Start Ollama service
echo -e "\n${BLUE}🤖 Starting Ollama service...${NC}"

if port_in_use 11434; then
    echo -e "${YELLOW}⚠️  Ollama service is already running on port 11434${NC}"
else
    echo -e "${YELLOW}🔄 Starting Ollama service...${NC}"
    ollama serve > /tmp/ollama.log 2>&1 &
    OLLAMA_PID=$!
    echo "Ollama PID: $OLLAMA_PID" > /tmp/ollama.pid
    
    # Wait for Ollama to be ready
    if wait_for_service "http://localhost:11434" "Ollama"; then
        echo -e "${GREEN}✅ Ollama service started successfully${NC}"
    else
        echo -e "${RED}❌ Failed to start Ollama service${NC}"
        exit 1
    fi
fi

# Check if the required model is available
echo -e "${YELLOW}🔍 Checking for required model (llama3.1:8b)...${NC}"
if ! ollama list | grep -q "llama3.1:8b"; then
    echo -e "${YELLOW}📥 Model not found. Downloading llama3.1:8b (this may take a while)...${NC}"
    ollama pull llama3.1:8b
fi
echo -e "${GREEN}✅ Model llama3.1:8b is available${NC}"

# Step 2: Start Backend Server
echo -e "\n${BLUE}🔧 Starting Backend Server...${NC}"

if port_in_use 3000; then
    echo -e "${YELLOW}⚠️  Backend server is already running on port 3000${NC}"
else
    cd "$(dirname "$0")/backend_api"
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}📦 Installing backend dependencies...${NC}"
        npm install
    fi
    
    # Ensure CORS is configured for all origins
    export CORS_ORIGIN="*"
    
    echo -e "${YELLOW}🔄 Starting backend server with CORS enabled...${NC}"
    npm run dev > /tmp/backend.log 2>&1 &
    BACKEND_PID=$!
    echo "Backend PID: $BACKEND_PID" > /tmp/backend.pid
    
    # Wait for backend to be ready
    if wait_for_service "http://localhost:3000/health" "Backend Server"; then
        echo -e "${GREEN}✅ Backend server started successfully${NC}"
    else
        echo -e "${RED}❌ Failed to start backend server${NC}"
        echo -e "${YELLOW}Check logs: tail -f /tmp/backend.log${NC}"
        exit 1
    fi
fi

# Step 3: Start Flutter Web App
echo -e "\n${BLUE}🌐 Starting Flutter Web App...${NC}"

if port_in_use 8080; then
    echo -e "${YELLOW}⚠️  Flutter web app is already running on port 8080${NC}"
else
    cd "$(dirname "$0")/frontend_flutter"
    
    # Get dependencies if needed
    if [ ! -d ".dart_tool" ]; then
        echo -e "${YELLOW}📦 Getting Flutter dependencies...${NC}"
        flutter pub get
    fi
    
    echo -e "${YELLOW}🔄 Starting Flutter web app...${NC}"
    flutter run -d chrome --web-port=8080 --web-hostname=localhost > /tmp/flutter.log 2>&1 &
    FLUTTER_PID=$!
    echo "Flutter PID: $FLUTTER_PID" > /tmp/flutter.pid
    
    # Wait for Flutter to be ready
    if wait_for_service "http://localhost:8080" "Flutter Web App"; then
        echo -e "${GREEN}✅ Flutter web app started successfully${NC}"
    else
        echo -e "${RED}❌ Failed to start Flutter web app${NC}"
        echo -e "${YELLOW}Check logs: tail -f /tmp/flutter.log${NC}"
        exit 1
    fi
fi

# Success message
echo -e "\n${GREEN}🎉 All services are running successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "${BLUE}📱 Flutter Web App: ${NC}http://localhost:8080"
echo -e "${BLUE}🔧 Backend API: ${NC}http://localhost:3000"
echo -e "${BLUE}🤖 Ollama Service: ${NC}http://localhost:11434"
echo -e "\n${YELLOW}📋 Service Management:${NC}"
echo -e "${YELLOW}  • View backend logs: ${NC}tail -f /tmp/backend.log"
echo -e "${YELLOW}  • View flutter logs: ${NC}tail -f /tmp/flutter.log"
echo -e "${YELLOW}  • View ollama logs: ${NC}tail -f /tmp/ollama.log"
echo -e "${YELLOW}  • Stop all services: ${NC}./stop-app.sh"
echo -e "\n${GREEN}🚀 Your Project Estimation Assistant is ready to use!${NC}"
echo -e "${GREEN}   Open your browser and go to: http://localhost:8080${NC}"
