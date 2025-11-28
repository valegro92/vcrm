#!/bin/bash

echo "🚀 Starting vCRM..."
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

# Check if server/node_modules exists
if [ ! -d "server/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd server && npm install && cd ..
fi

# Check if database exists
if [ ! -f "server/database/crm.db" ]; then
    echo "🗄️  Initializing database..."
    cd server && npm run init-db && cd ..
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "🌐 Starting servers..."
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5001"
echo ""
echo "🔑 Login credentials:"
echo "   Username: admin"
echo "   Password: admin123"
echo ""
echo "Press Ctrl+C to stop"
echo ""

npm run dev
