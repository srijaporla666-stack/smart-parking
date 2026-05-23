import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const [areas, setAreas] = useState([]);
    const [selectedArea, setSelectedArea] = useState(null);
    const [slots, setSlots] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetch('http://localhost:5000/api/areas')
            .then(res => res.json())
            .then(data => {
                setAreas(data);
                if (data.length > 0) {
                    setSelectedArea(data[0]);
                    fetchSlots(data[0].id);
                }
            });
    }, []);

    const fetchSlots = (areaId) => {
        fetch(`http://localhost:5000/api/slots/${areaId}`)
            .then(res => res.json())
            .then(data => setSlots(data));
    };

    const handleAreaChange = (e) => {
        const areaId = parseInt(e.target.value);
        const area = areas.find(a => a.id === areaId);
        setSelectedArea(area);
        fetchSlots(areaId);
    };

    const handleSlotClick = (slot) => {
        if (slot.status === 'Available') {
            navigate(`/booking/${slot.id}`, { state: { slot, area: selectedArea } });
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="dashboard-header">
                <h2>Find Parking</h2>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <label>Select Area: </label>
                    <select 
                        className="form-control" 
                        style={{ width: 'auto', padding: '0.5rem' }}
                        onChange={handleAreaChange}
                        value={selectedArea?.id || ''}
                    >
                        {areas.map(area => (
                            <option key={area.id} value={area.id}>{area.name} - ₹{area.ratePerHour}/hr</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="glass-card">
                <h3>{selectedArea?.name}</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Location: {selectedArea?.location}</p>
                
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '15px', height: '15px', background: 'var(--status-available)', borderRadius: '3px' }}></div> Available
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '15px', height: '15px', background: 'var(--status-reserved)', borderRadius: '3px' }}></div> Reserved
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '15px', height: '15px', background: 'var(--status-occupied)', borderRadius: '3px' }}></div> Occupied
                    </div>
                </div>

                <div className="slots-container">
                    {slots.map(slot => (
                        <div 
                            key={slot.id} 
                            className={`slot-card ${slot.status.toLowerCase()}`}
                            onClick={() => handleSlotClick(slot)}
                            title={slot.status === 'Available' ? 'Click to book' : slot.status}
                        >
                            <div className="slot-number">{slot.slotNumber}</div>
                            <div className="slot-status">{slot.status}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
