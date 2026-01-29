#!/bin/sh
# Backend container entrypoint script
# Ensures the correct command is executed

set -e

echo "=========================================="
echo "Rwanda Real Estate Backend - Starting"
echo "=========================================="
echo "Node version: $(node --version)"
echo "Working directory: $(pwd)"
echo "Contents of dist directory:"
ls -la dist/ || echo "dist/ directory not found!"
echo "=========================================="

# Check if server.js exists
if [ ! -f "dist/server.js" ]; then
    echo "ERROR: dist/server.js not found!"
    echo "Build may have failed. Contents of current directory:"
    ls -la
    exit 1
fi

echo "Starting server with: node dist/server.js"
echo "=========================================="

# Execute the command passed as arguments (or default to node dist/server.js)
exec "$@"
