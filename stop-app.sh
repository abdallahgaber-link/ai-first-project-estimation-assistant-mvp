#!/bin/bash

# Project Estimation Assistant - Stop Script
# This script stops all running services

set -e

echo "🛑 Stopping Project Estimation Assistant..."
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to stop service by PID file
stop_service_by_pid() {
    local pid_file=$1
    local service_name=$2
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if kill -0 "$pid" 2>/dev/null; then
            echo -e "${YELLOW}🔄 Stopping $service_name (PID: $pid)...${NC}"
            kill "$pid"
            sleep 2
            if kill -0 "$pid" 2>/dev/null; then
                echo -e "${YELLOW}⚠️  Force killing $service_name...${NC}"
                kill -9 "$pid"
            fi
            echo -e "${GREEN}✅ $service_name stopped${NC}"
        else
            echo -e "${YELLOW}⚠️  $service_name was not running${NC}"
        fi
        rm -f "$pid_file"
    else
        echo -e "${YELLOW}⚠️  No PID file found for $service_name${NC}"
    fi
}

# Function to stop service by port
stop_service_by_port() {
    local port=$1
    local service_name=$2
    
    local pid=$(lsof -ti :$port 2>/dev/null || echo "")
    if [ -n "$pid" ]; then
        echo -e "${YELLOW}🔄 Stopping $service_name on port $port (PID: $pid)...${NC}"
        kill "$pid" 2>/dev/null || true
        sleep 2
        
        # Check if still running and force kill if needed
        local still_running=$(lsof -ti :$port 2>/dev/null || echo "")
        if [ -n "$still_running" ]; then
            echo -e "${YELLOW}⚠️  Force killing $service_name...${NC}"
            kill -9 "$still_running" 2>/dev/null || true
        fi
        echo -e "${GREEN}✅ $service_name stopped${NC}"
    else
        echo -e "${YELLOW}⚠️  No service running on port $port${NC}"
    fi
}

# Stop Flutter Web App
echo -e "${BLUE}🌐 Stopping Flutter Web App...${NC}"
stop_service_by_pid "/tmp/flutter.pid" "Flutter Web App"
stop_service_by_port "8080" "Flutter Web App (port 8080)"

# Stop Backend Server
echo -e "${BLUE}🔧 Stopping Backend Server...${NC}"
stop_service_by_pid "/tmp/backend.pid" "Backend Server"
stop_service_by_port "3000" "Backend Server (port 3000)"

# Stop Ollama Service
echo -e "${BLUE}🤖 Stopping Ollama Service...${NC}"
stop_service_by_pid "/tmp/ollama.pid" "Ollama Service"
stop_service_by_port "11434" "Ollama Service (port 11434)"

# Clean up any remaining processes
echo -e "${BLUE}🧹 Cleaning up remaining processes...${NC}"

# Kill any remaining tsx/node processes related to our project
pkill -f "tsx watch" 2>/dev/null || true
pkill -f "flutter run" 2>/dev/null || true

# Clean up log files
echo -e "${BLUE}🗑️  Cleaning up log files...${NC}"
rm -f /tmp/ollama.log /tmp/backend.log /tmp/flutter.log
rm -f /tmp/ollama.pid /tmp/backend.pid /tmp/flutter.pid

echo -e "\n${GREEN}✅ All services have been stopped successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}🎯 Project Estimation Assistant is now offline${NC}"
