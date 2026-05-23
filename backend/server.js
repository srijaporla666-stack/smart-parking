const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./database');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;
const JWT_SECRET = 'supersecretkey_for_demo';

// --- Auth Endpoints ---
app.post('/api/auth/register', (req, res) => {
    const { fullName, email, password, phone } = req.body;
    
    db.get('SELECT * FROM Users WHERE email = ?', [email], (err, row) => {
        if (row) return res.status(400).json({ error: 'Email already exists' });
        
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);
        
        db.run(`INSERT INTO Users (fullName, email, password, phone) VALUES (?, ?, ?, ?)`,
            [fullName, email, hashedPassword, phone], function(err) {
                if (err) return res.status(500).json({ error: err.message });
                res.status(201).json({ message: 'User registered successfully', userId: this.lastID });
        });
    });
});

app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    
    db.get('SELECT * FROM Users WHERE email = ?', [email], (err, user) => {
        if (err || !user) return res.status(400).json({ error: 'Invalid credentials' });
        
        const isMatch = bcrypt.compareSync(password, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });
        
        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role } });
    });
});

// Middleware for authentication
const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ error: 'Unauthorized' });
        req.user = decoded;
        next();
    });
};

// --- Parking & Slots Endpoints ---
app.get('/api/areas', (req, res) => {
    db.all('SELECT * FROM ParkingAreas', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.get('/api/slots/:areaId', (req, res) => {
    const { areaId } = req.params;
    db.all('SELECT * FROM ParkingSlots WHERE areaId = ?', [areaId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// --- Booking Endpoints ---
app.post('/api/bookings', authenticate, (req, res) => {
    const { slotId, vehicleNumber, vehicleType, startTime, endTime, durationHours, totalAmount } = req.body;
    const userId = req.user.id;

    // Check if slot is available
    db.get('SELECT status FROM ParkingSlots WHERE id = ?', [slotId], (err, slot) => {
        if (err) return res.status(500).json({ error: err.message });
        if (slot.status !== 'Available') return res.status(400).json({ error: 'Slot not available' });

        // Update slot status to Reserved
        db.run('UPDATE ParkingSlots SET status = ? WHERE id = ?', ['Reserved', slotId], (err) => {
            if (err) return res.status(500).json({ error: err.message });

            // Create booking
            db.run(`INSERT INTO Bookings (userId, slotId, vehicleNumber, vehicleType, startTime, endTime, durationHours, totalAmount, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [userId, slotId, vehicleNumber, vehicleType, startTime, endTime, durationHours, totalAmount, 'Pending'],
                function(err) {
                    if (err) return res.status(500).json({ error: err.message });
                    res.status(201).json({ bookingId: this.lastID, message: 'Slot reserved, pending payment' });
            });
        });
    });
});

// --- Payment Endpoint ---
app.post('/api/payments', authenticate, (req, res) => {
    const { bookingId, amount, method } = req.body;
    
    // Simulate payment success (always success for demo)
    const transactionId = 'TXN' + Date.now();
    const otp = Math.floor(1000 + Math.random() * 9000).toString(); // Generate 4-digit OTP
    
    db.run(`INSERT INTO Payments (bookingId, amount, method, status, transactionId) VALUES (?, ?, ?, ?, ?)`,
        [bookingId, amount, method, 'Success', transactionId], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            
            // Update booking status and save OTP
            db.run('UPDATE Bookings SET status = ?, otp = ? WHERE id = ?', ['Confirmed', otp, bookingId], (err) => {
                res.json({ message: 'Payment successful', transactionId, otp });
            });
    });
});

// --- Occupancy Confirmation Endpoint ---
app.post('/api/occupancy', authenticate, (req, res) => {
    const { slotId, otp } = req.body;
    const userId = req.user.id;
    
    db.get('SELECT * FROM Bookings WHERE slotId = ? AND status = ? AND userId = ?', [slotId, 'Confirmed', userId], (err, booking) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!booking) return res.status(404).json({ error: 'No confirmed booking found for this slot.' });
        if (booking.otp !== otp) return res.status(400).json({ error: 'Invalid OTP. Please check your booking details.' });

        db.run('UPDATE ParkingSlots SET status = ? WHERE id = ?', ['Occupied', slotId], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Slot is now occupied' });
        });
    });
});

// --- Admin Endpoints ---
app.get('/api/admin/dashboard', authenticate, (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    
    const stats = {};
    db.get('SELECT COUNT(*) as usersCount FROM Users WHERE role = "user"', (err, row) => {
        stats.usersCount = row.usersCount;
        db.get('SELECT COUNT(*) as bookingsCount, SUM(totalAmount) as revenue FROM Bookings WHERE status = "Confirmed"', (err, row2) => {
            stats.bookingsCount = row2.bookingsCount;
            stats.revenue = row2.revenue || 0;
            db.all('SELECT status, COUNT(*) as count FROM ParkingSlots GROUP BY status', (err, rows) => {
                stats.slots = rows;
                res.json(stats);
            });
        });
    });
});

app.get('/api/admin/bookings', authenticate, (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    
    db.all(`SELECT b.*, u.fullName, p.slotNumber 
            FROM Bookings b 
            JOIN Users u ON b.userId = u.id 
            JOIN ParkingSlots p ON b.slotId = p.id
            ORDER BY b.createdAt DESC`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
