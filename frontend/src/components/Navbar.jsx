import { Link, useNavigate } from 'react-router-dom';
import { CarFront, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="nav-brand">
                <CarFront size={28} color="var(--primary-color)" />
                SmartPark
            </div>
            <div className="nav-links">
                {user ? (
                    <>
                        {user.role === 'admin' ? (
                            <Link to="/admin"><LayoutDashboard size={18} /> Admin</Link>
                        ) : (
                            <Link to="/dashboard"><LayoutDashboard size={18} /> Dashboard</Link>
                        )}
                        <button className="btn btn-outline" onClick={handleLogout} style={{ padding: '0.4rem 1rem' }}>
                            <LogOut size={16} /> Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login">Login</Link>
                        <Link to="/register" className="btn btn-primary" style={{ padding: '0.4rem 1rem' }}>Sign Up</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
