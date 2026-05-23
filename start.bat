@echo off
echo Starting Smart Parking Management System...

echo Starting Backend on Port 5000...
start cmd /k "cd backend && npm start || node server.js"

echo Starting Frontend via Vite...
start cmd /k "cd frontend && npm run dev"

echo Done! Servers are spinning up.
