import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Locations from './pages/Locations';
import AdminDashboard from './pages/AdminDashboard';
import Booking from './pages/Booking';

const ProtectedRoute = ({ children, requireAdmin }) => {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" />;
    if (requireAdmin && user.role !== 'admin') return <Navigate to="/dashboard" />;
    return children;
};

function App() {
    return (
        <BrowserRouter>
            <div className="app-container">
                <Navbar />
                <main className="main-content">
                    <Routes>
                        <Route path="/" element={<Navigate to="/login" />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/locations" element={
                            <ProtectedRoute>
                                <Locations />
                            </ProtectedRoute>
                        } />
                        <Route path="/dashboard" element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        } />
                        <Route path="/booking/:slotId" element={
                            <ProtectedRoute>
                                <Booking />
                            </ProtectedRoute>
                        } />
                        <Route path="/admin" element={
                            <ProtectedRoute requireAdmin={true}>
                                <AdminDashboard />
                            </ProtectedRoute>
                        } />
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    );
}

export default App;
