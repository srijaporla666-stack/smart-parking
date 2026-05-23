import { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckCircle } from 'lucide-react';

const Booking = () => {
    const { slotId } = useParams();
    const { state } = useLocation();
    const { slot, area } = state || {};
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Details, 2: Payment, 3: Confirmation, 4: Occupancy
    const [bookingDetails, setBookingDetails] = useState({
        vehicleNumber: '',
        vehicleType: 'Car',
        durationHours: 1,
        date: new Date().toISOString().split('T')[0],
        time: '10:00'
    });
    const [bookingResponse, setBookingResponse] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('UPI');

    const handleChange = (e) => setBookingDetails({ ...bookingDetails, [e.target.name]: e.target.value });

    const totalAmount = bookingDetails.durationHours * (area?.ratePerHour || 0);

    const handleBook = async (e) => {
        e.preventDefault();
        const startTime = `${bookingDetails.date}T${bookingDetails.time}:00`;
        const endTime = new Date(new Date(startTime).getTime() + bookingDetails.durationHours * 60 * 60 * 1000).toISOString();
        
        try {
            const res = await fetch('http://localhost:5000/api/bookings', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    slotId,
                    ...bookingDetails,
                    startTime,
                    endTime,
                    totalAmount
                })
            });
            const data = await res.json();
            if (res.ok) {
                setBookingResponse(data);
                setStep(2); // Proceed to Payment
            } else {
                alert(data.error);
            }
        } catch (err) {
            alert('Booking failed');
        }
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/api/payments', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    bookingId: bookingResponse.bookingId,
                    amount: totalAmount,
                    method: paymentMethod
                })
            });
            if (res.ok) {
                setStep(3); // Proceed to Confirmation
            }
        } catch (err) {
            alert('Payment failed');
        }
    };

    const handleConfirmParking = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/occupancy', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ slotId })
            });
            if (res.ok) {
                setStep(4);
            }
        } catch (err) {
            alert('Confirmation failed');
        }
    };

    if (!slot || !area) return <div>Invalid Slot selected</div>;

    return (
        <div className="auth-container animate-fade-in" style={{ maxWidth: '600px' }}>
            <div className="glass-card">
                {step === 1 && (
                    <>
                        <h2>Book Slot {slot.slotNumber}</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{area.name} • ₹{area.ratePerHour}/hr</p>
                        <form onSubmit={handleBook}>
                            <div className="form-group">
                                <label>Vehicle Number</label>
                                <input type="text" name="vehicleNumber" required className="form-control" onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Vehicle Type</label>
                                <select name="vehicleType" className="form-control" onChange={handleChange}>
                                    <option>Car</option>
                                    <option>Bike</option>
                                    <option>Other</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label>Date</label>
                                    <input type="date" name="date" required className="form-control" value={bookingDetails.date} onChange={handleChange} />
                                </div>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label>Time</label>
                                    <input type="time" name="time" required className="form-control" value={bookingDetails.time} onChange={handleChange} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Duration (Hours)</label>
                                <input type="number" min="1" name="durationHours" required className="form-control" value={bookingDetails.durationHours} onChange={handleChange} />
                            </div>
                            <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                                <span>Total Amount:</span>
                                <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>₹{totalAmount}</span>
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Proceed to Payment</button>
                        </form>
                    </>
                )}

                {step === 2 && (
                    <>
                        <h2>Payment Details</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Amount to pay: ₹{totalAmount}</p>
                        <form onSubmit={handlePayment}>
                            <div className="form-group">
                                <label>Select Payment Method</label>
                                <select className="form-control" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                                    <option>UPI</option>
                                    <option>Credit/Debit Card</option>
                                    <option>Net Banking</option>
                                </select>
                            </div>
                            {paymentMethod === 'UPI' && (
                                <div className="form-group">
                                    <label>UPI ID</label>
                                    <input type="text" placeholder="example@upi" className="form-control" required />
                                </div>
                            )}
                            {paymentMethod === 'Credit/Debit Card' && (
                                <div className="form-group">
                                    <label>Card Number</label>
                                    <input type="text" placeholder="XXXX XXXX XXXX XXXX" className="form-control" required />
                                </div>
                            )}
                            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Pay ₹{totalAmount}</button>
                        </form>
                    </>
                )}

                {step === 3 && (
                    <div style={{ textAlign: 'center' }}>
                        <CheckCircle size={64} color="var(--status-available)" style={{ margin: '0 auto 1rem' }} />
                        <h2 style={{ marginBottom: '1rem' }}>Booking Confirmed!</h2>
                        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '12px', textAlign: 'left', marginBottom: '1.5rem' }}>
                            <p><strong>Slot:</strong> {slot.slotNumber}</p>
                            <p><strong>Area:</strong> {area.name}</p>
                            <p><strong>Vehicle:</strong> {bookingDetails.vehicleNumber}</p>
                            <p><strong>Time:</strong> {bookingDetails.time} on {bookingDetails.date}</p>
                        </div>
                        <button className="btn btn-primary" onClick={handleConfirmParking} style={{ width: '100%' }}>
                            Confirm Parking Occupancy
                        </button>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
                            Click this button once you have parked your vehicle in the designated slot.
                        </p>
                    </div>
                )}

                {step === 4 && (
                    <div style={{ textAlign: 'center' }}>
                        <CheckCircle size={64} color="var(--status-available)" style={{ margin: '0 auto 1rem' }} />
                        <h2 style={{ marginBottom: '1rem' }}>Parking Confirmed</h2>
                        <p style={{ color: 'var(--text-muted)' }}>Slot {slot.slotNumber} is now occupied and unavailable for other users.</p>
                        <button className="btn btn-outline" onClick={() => navigate('/dashboard')} style={{ marginTop: '2rem' }}>
                            Return to Dashboard
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Booking;
