import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const [formData, setFormData] = useState({ fullName: '', email: '', password: '', phone: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            
            if (res.ok) {
                navigate('/login');
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError('Failed to connect to server');
        }
    };

    return (
        <div className="auth-container animate-fade-in">
            <div className="glass-card">
                <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Create Account</h2>
                {error && <div style={{ color: 'var(--status-occupied)', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
                <form onSubmit={handleRegister}>
                    <div className="form-group">
                        <label>Full Name</label>
                        <input type="text" name="fullName" required className="form-control" onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input type="email" name="email" required className="form-control" onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Phone Number</label>
                        <input type="text" name="phone" required className="form-control" onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input type="password" name="password" required className="form-control" onChange={handleChange} />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                        Sign Up
                    </button>
                </form>
                <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--primary-color)' }}>Log in</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
