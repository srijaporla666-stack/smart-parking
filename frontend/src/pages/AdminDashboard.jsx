import { useState, useEffect } from 'react';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        fetchStats();
        fetchBookings();
    }, []);

    const fetchStats = async () => {
        const res = await fetch('http://localhost:5000/api/admin/dashboard', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) {
            setStats(await res.json());
        }
    };

    const fetchBookings = async () => {
        const res = await fetch('http://localhost:5000/api/admin/bookings', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) {
            setBookings(await res.json());
        }
    };

    if (!stats) return <div>Loading admin data...</div>;

    return (
        <div className="animate-fade-in">
            <h2>Admin Dashboard</h2>
            
            <div className="stats-grid" style={{ marginTop: '2rem' }}>
                <div className="glass-card stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(0, 210, 255, 0.1)' }}>👥</div>
                    <div>
                        <div className="stat-value">{stats.usersCount}</div>
                        <div className="stat-label">Total Users</div>
                    </div>
                </div>
                <div className="glass-card stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--status-available)' }}>🎫</div>
                    <div>
                        <div className="stat-value">{stats.bookingsCount}</div>
                        <div className="stat-label">Total Bookings</div>
                    </div>
                </div>
                <div className="glass-card stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--status-reserved)' }}>₹</div>
                    <div>
                        <div className="stat-value">₹{stats.revenue}</div>
                        <div className="stat-label">Total Revenue</div>
                    </div>
                </div>
            </div>

            <div className="glass-card" style={{ marginTop: '2rem', overflowX: 'auto' }}>
                <h3 style={{ marginBottom: '1.5rem' }}>Recent Bookings</h3>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>User</th>
                            <th>Slot</th>
                            <th>Vehicle</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.map(b => (
                            <tr key={b.id}>
                                <td>#{b.id}</td>
                                <td>{b.fullName}</td>
                                <td>{b.slotNumber}</td>
                                <td>{b.vehicleNumber}</td>
                                <td>₹{b.totalAmount}</td>
                                <td>
                                    <span className={`badge ${b.status === 'Confirmed' ? 'success' : b.status === 'Pending' ? 'warning' : 'danger'}`}>
                                        {b.status}
                                    </span>
                                </td>
                                <td>{new Date(b.createdAt).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminDashboard;
