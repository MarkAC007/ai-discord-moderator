#!/bin/bash

# Discord AI Bot Deployment Script
# This script helps you deploy the Discord AI bot quickly

set -e

echo "🤖 Discord AI Bot Deployment Script"
echo "=================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "✅ .env file created. Please edit it with your credentials:"
    echo "   - DISCORD_BOT_TOKEN"
    echo "   - DISCORD_APP_ID" 
    echo "   - OPENAI_API_KEY"
    echo ""
    echo "After editing .env, run this script again."
    exit 0
fi

# Validate required environment variables
echo "🔍 Checking environment variables..."

# Safe .env parser - replaces insecure 'source .env'
load_env_safe() {
    local env_file="$1"
    
    if [ ! -f "$env_file" ]; then
        echo "❌ Environment file $env_file not found"
        return 1
    fi
    
    while IFS= read -r line || [ -n "$line" ]; do
        # Skip empty lines and comments
        if [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]]; then
            continue
        fi
        
        # Remove leading/trailing whitespace
        line=$(echo "$line" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
        
        # Validate KEY=VALUE pattern with safe characters
        # Key: alphanumeric, underscore, hyphen only
        # Value: any character except newline
        if [[ "$line" =~ ^([a-zA-Z_][a-zA-Z0-9_-]*)=(.*)$ ]]; then
            local key="${BASH_REMATCH[1]}"
            local value="${BASH_REMATCH[2]}"
            
            # Strip surrounding quotes from value (single or double quotes)
            if [[ "$value" =~ ^\"(.*)\"$ ]]; then
                value="${BASH_REMATCH[1]}"
            elif [[ "$value" =~ ^\'(.*)\'$ ]]; then
                value="${BASH_REMATCH[1]}"
            fi
            
            # Export the variable safely
            export "$key"="$value"
        else
            echo "⚠️  Skipping invalid line in .env: $line"
        fi
    done < "$env_file"
}

# Load environment variables safely
load_env_safe .env

if [ -z "$DISCORD_BOT_TOKEN" ]; then
    echo "❌ DISCORD_BOT_TOKEN is not set in .env"
    exit 1
fi

if [ -z "$DISCORD_APP_ID" ]; then
    echo "❌ DISCORD_APP_ID is not set in .env"
    exit 1
fi

if [ -z "$OPENAI_API_KEY" ]; then
    echo "❌ OPENAI_API_KEY is not set in .env"
    exit 1
fi

echo "✅ Environment variables are set"

# Build and start the bot
echo "🐳 Building and starting the bot..."
docker-compose up -d --build

echo "⏳ Waiting for bot to start..."
sleep 10

# Check if bot is running
if docker-compose ps | grep -q "Up"; then
    echo "✅ Bot is running successfully!"
    echo ""
    echo "📊 Bot Status:"
    docker-compose ps
    echo ""
    echo "📝 Recent logs:"
    docker-compose logs --tail=10 bot
    echo ""
    echo "🔗 Health check: http://localhost:${PORT:-3000}/health"
    echo ""
    echo "🎉 Deployment complete! Your bot should now be online in Discord."
    echo "   Try using /ping in your server to test it!"
else
    echo "❌ Bot failed to start. Check logs:"
    docker-compose logs bot
    exit 1
fi
