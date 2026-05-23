const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        initDb();
    }
});

function initDb() {
    db.serialize(() => {
        // Drop existing tables to start fresh
        db.run(`DROP TABLE IF EXISTS Payments`);
        db.run(`DROP TABLE IF EXISTS Bookings`);
        db.run(`DROP TABLE IF EXISTS ParkingSlots`);
        db.run(`DROP TABLE IF EXISTS ParkingAreas`);
        db.run(`DROP TABLE IF EXISTS Users`);

        // Users Table
        db.run(`CREATE TABLE IF NOT EXISTS Users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            fullName TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            phone TEXT,
            role TEXT DEFAULT 'user',
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Parking Areas Table
        db.run(`CREATE TABLE IF NOT EXISTS ParkingAreas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            location TEXT,
            totalSlots INTEGER NOT NULL,
            ratePerHour REAL NOT NULL
        )`);

        // Parking Slots Table
        db.run(`CREATE TABLE IF NOT EXISTS ParkingSlots (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            areaId INTEGER,
            slotNumber TEXT NOT NULL,
            status TEXT DEFAULT 'Available',
            FOREIGN KEY (areaId) REFERENCES ParkingAreas(id)
        )`);

        // Bookings Table
        db.run(`CREATE TABLE IF NOT EXISTS Bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER,
            slotId INTEGER,
            vehicleNumber TEXT NOT NULL,
            vehicleType TEXT NOT NULL,
            startTime DATETIME NOT NULL,
            endTime DATETIME NOT NULL,
            durationHours REAL NOT NULL,
            totalAmount REAL NOT NULL,
            status TEXT DEFAULT 'Pending',
            otp TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (userId) REFERENCES Users(id),
            FOREIGN KEY (slotId) REFERENCES ParkingSlots(id)
        )`);

        // Payments Table
        db.run(`CREATE TABLE IF NOT EXISTS Payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            bookingId INTEGER,
            amount REAL NOT NULL,
            method TEXT NOT NULL,
            status TEXT DEFAULT 'Pending',
            transactionId TEXT,
            paymentDate DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (bookingId) REFERENCES Bookings(id)
        )`, () => {
            // Seed data after all tables are created
            seedData();
        });
    });
}

function seedData() {
    console.log('Seeding initial data...');
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync('admin123', salt);
    
    // Insert admin user
    db.run(`INSERT INTO Users (fullName, email, password, role) VALUES (?, ?, ?, ?)`, 
        ['Admin User', 'admin@parking.com', hashedPassword, 'admin'], (err) => {
            if (err) console.log('Error inserting admin:', err);
            else console.log('Admin user created');
        });
    
    // Add diverse parking locations
    const locations = [
        { name: 'Westside Mall Parking', location: 'Downtown, Central Avenue', totalSlots: 120, ratePerHour: 50.00 },
        { name: 'PVR Cinema Complex', location: 'Mall Road, Near Station', totalSlots: 80, ratePerHour: 40.00 },
        { name: 'Airport Terminal 1', location: 'Airport Road', totalSlots: 200, ratePerHour: 100.00 },
        { name: 'Indigo Hotel Parking', location: 'Business District', totalSlots: 60, ratePerHour: 80.00 },
        { name: 'Tech Park Campus', location: 'IT City, Sector 5', totalSlots: 150, ratePerHour: 30.00 },
        { name: 'Foodcourt & Restaurant Zone', location: 'Entertainment Street', totalSlots: 90, ratePerHour: 35.00 },
        { name: 'Inox Cinema & Retail', location: 'MG Road, Market Square', totalSlots: 100, ratePerHour: 45.00 },
        { name: 'Metro Station Plaza', location: 'Central Station', totalSlots: 140, ratePerHour: 25.00 },
        { name: 'Hospital & Medical Center', location: 'Healthcare Avenue', totalSlots: 70, ratePerHour: 40.00 },
        { name: 'Beach Parking Lot', location: 'Coastal Road', totalSlots: 180, ratePerHour: 35.00 },
        { name: 'Shopping Complex A', location: 'Commercial Hub', totalSlots: 110, ratePerHour: 55.00 },
        { name: 'Event Convention Center', location: 'Exhibition Ground', totalSlots: 250, ratePerHour: 60.00 }
    ];

    locations.forEach((loc) => {
        db.run(
            `INSERT INTO ParkingAreas (name, location, totalSlots, ratePerHour) VALUES (?, ?, ?, ?)`,
            [loc.name, loc.location, loc.totalSlots, loc.ratePerHour],
            function(err) {
                if (err) {
                    console.log('Error inserting area:', err);
                    return;
                }
                const areaId = this.lastID;
                console.log(`Created area: ${loc.name} (ID: ${areaId})`);
                
                // Create slots for each area
                for (let i = 1; i <= loc.totalSlots; i++) {
                    const slotPrefix = String.fromCharCode(65 + Math.floor((i - 1) / 26)); // A, B, C...
                    const slotNum = ((i - 1) % 26) + 1;
                    const slotNumber = `${slotPrefix}${String(slotNum).padStart(2, '0')}`;
                    
                    db.run(
                        `INSERT INTO ParkingSlots (areaId, slotNumber, status) VALUES (?, ?, ?)`,
                        [areaId, slotNumber, 'Available'],
                        (err) => {
                            if (err) console.log('Error inserting slot:', err);
                        }
                    );
                }
            }
        );
    });

    console.log('Seeding completed!');
}

module.exports = db;
