#!/bin/bash

# Windows (Git Bash) friendly development server launcher
# Usage: bash dev-windows.sh

export NODE_ENV=development

# Load environment variables
if [ -f .env.local ]; then
    echo "Loading .env.local"
    set -a
    source .env.local
    set +a
elif [ -f .env ]; then
    echo "Loading .env"
    set -a
    source .env
    set +a
else
    echo "Warning: No .env or .env.local file found"
    echo "Please create .env file with DATABASE_URL and OPENAI_API_KEY"
fi

# Start the dev server
npx tsx server/index.ts
