import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, DollarSign, ParkingCircle } from 'lucide-react';

const Locations = () => {
    const [areas, setAreas] = useState([]);
    const [slots, setSlots] = useState({});
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch all parking areas
        fetch('http://localhost:5000/api/areas')
            .then(res => res.json())
            .then(data => {
                setAreas(data);
                // Fetch slots for each area
                data.forEach(area => {
                    fetch(`http://localhost:5000/api/slots/${area.id}`)
                        .then(res => res.json())
                        .then(slotData => {
                            setSlots(prev => ({
                                ...prev,
                                [area.id]: slotData
                            }));
                        });
                });
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching areas:', err);
                setLoading(false);
            });
    }, []);

    const getAvailableSlots = (areaId) => {
        const areaSlots = slots[areaId] || [];
        return areaSlots.filter(slot => slot.status === 'Available').length;
    };

    const handleSelectArea = (area) => {
        navigate(`/dashboard`, { state: { selectedAreaId: area.id } });
    };

    if (loading) {
        return (
            <div className="animate-fade-in" style={{ textAlign: 'center', padding: '2rem' }}>
                <p>Loading parking locations...</p>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <div className="dashboard-header">
                <h2>🚗 Select Parking Location</h2>
                <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                    Choose from available parking areas at malls, movie halls, and more
                </p>
            </div>

            {areas.length === 0 ? (
                <div className="glass-card" style={{ textAlign: 'center', padding: '2rem' }}>
                    <p>No parking locations available at the moment.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                    {areas.map(area => {
                        const availableCount = getAvailableSlots(area.id);
                        const occupiedCount = (slots[area.id] || []).filter(s => s.status === 'Occupied').length;
                        const reservedCount = (slots[area.id] || []).filter(s => s.status === 'Reserved').length;

                        return (
                            <div 
                                key={area.id} 
                                className="glass-card"
                                style={{
                                    cursor: 'pointer',
                                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                                    border: '2px solid rgba(255, 255, 255, 0.1)'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-5px)';
                                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                                onClick={() => handleSelectArea(area)}
                            >
                                {/* Header with Area Name */}
                                <div style={{ marginBottom: '1rem' }}>
                                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.4rem' }}>
                                        {area.name}
                                    </h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                                        <MapPin size={16} />
                                        <span>{area.location}</span>
                                    </div>
                                </div>

                                {/* Divider */}
                                <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.1)', margin: '1rem 0' }}></div>

                                {/* Stats Grid */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                    {/* Available Slots */}
                                    <div style={{ 
                                        padding: '1rem', 
                                        background: 'rgba(76, 175, 80, 0.1)', 
                                        borderRadius: '8px',
                                        border: '1px solid rgba(76, 175, 80, 0.3)'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                            <ParkingCircle size={16} style={{ color: '#4CAF50' }} />
                                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Available</span>
                                        </div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4CAF50' }}>
                                            {availableCount}
                                        </div>
                                    </div>

                                    {/* Occupied Slots */}
                                    <div style={{ 
                                        padding: '1rem', 
                                        background: 'rgba(255, 107, 107, 0.1)', 
                                        borderRadius: '8px',
                                        border: '1px solid rgba(255, 107, 107, 0.3)'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                            <ParkingCircle size={16} style={{ color: '#FF6B6B' }} />
                                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Occupied</span>
                                        </div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#FF6B6B' }}>
                                            {occupiedCount}
                                        </div>
                                    </div>
                                </div>

                                {/* Pricing & Duration */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <DollarSign size={16} style={{ color: '#2196F3' }} />
                                        <div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Rate</div>
                                            <div style={{ fontWeight: 'bold', color: '#2196F3' }}>₹{area.ratePerHour}/hr</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Clock size={16} style={{ color: '#FF9800' }} />
                                        <div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Slots</div>
                                            <div style={{ fontWeight: 'bold', color: '#FF9800' }}>{area.totalSlots}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Availability Status Bar */}
                                <div style={{ marginBottom: '1rem' }}>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                                        Availability
                                    </div>
                                    <div style={{ 
                                        height: '8px', 
                                        background: 'rgba(255, 255, 255, 0.1)', 
                                        borderRadius: '4px', 
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            height: '100%',
                                            width: `${(availableCount / area.totalSlots) * 100}%`,
                                            background: 'linear-gradient(90deg, #4CAF50, #81C784)',
                                            transition: 'width 0.3s ease'
                                        }}></div>
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                        {availableCount} of {area.totalSlots} slots available
                                    </div>
                                </div>

                                {/* Action Button */}
                                <button
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        background: availableCount > 0 
                                            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                                            : 'rgba(255, 255, 255, 0.1)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '1rem',
                                        fontWeight: '600',
                                        cursor: availableCount > 0 ? 'pointer' : 'not-allowed',
                                        opacity: availableCount > 0 ? 1 : 0.5,
                                        transition: 'all 0.3s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (availableCount > 0) {
                                            e.target.style.background = 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (availableCount > 0) {
                                            e.target.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                                        }
                                    }}
                                    disabled={availableCount === 0}
                                >
                                    {availableCount > 0 ? 'View Slots' : 'No Available Slots'}
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Locations;
