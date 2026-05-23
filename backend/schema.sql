-- Smart Parking Management System - MySQL Schema

CREATE DATABASE IF NOT EXISTS smart_parking;
USE smart_parking;

-- Users Table (Admin & Customers)
CREATE TABLE IF NOT EXISTS Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fullName VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role ENUM('user', 'admin') DEFAULT 'user',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Parking Areas Table
CREATE TABLE IF NOT EXISTS ParkingAreas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(255),
    totalSlots INT NOT NULL,
    ratePerHour DECIMAL(10, 2) NOT NULL
);

-- Parking Slots Table
CREATE TABLE IF NOT EXISTS ParkingSlots (
    id INT AUTO_INCREMENT PRIMARY KEY,
    areaId INT,
    slotNumber VARCHAR(20) NOT NULL,
    status ENUM('Available', 'Reserved', 'Occupied') DEFAULT 'Available',
    FOREIGN KEY (areaId) REFERENCES ParkingAreas(id) ON DELETE CASCADE
);

-- Bookings Table
CREATE TABLE IF NOT EXISTS Bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT,
    slotId INT,
    vehicleNumber VARCHAR(50) NOT NULL,
    vehicleType ENUM('Car', 'Bike', 'Other') NOT NULL,
    startTime DATETIME NOT NULL,
    endTime DATETIME NOT NULL,
    durationHours DECIMAL(5,2) NOT NULL,
    totalAmount DECIMAL(10, 2) NOT NULL,
    status ENUM('Pending', 'Confirmed', 'Cancelled') DEFAULT 'Pending',
    otp VARCHAR(10),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES Users(id),
    FOREIGN KEY (slotId) REFERENCES ParkingSlots(id)
);

-- Payments Table
CREATE TABLE IF NOT EXISTS Payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bookingId INT,
    amount DECIMAL(10, 2) NOT NULL,
    method ENUM('UPI', 'Credit/Debit Card', 'Net Banking') NOT NULL,
    status ENUM('Success', 'Failed', 'Pending') DEFAULT 'Pending',
    transactionId VARCHAR(100),
    paymentDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bookingId) REFERENCES Bookings(id) ON DELETE CASCADE
);

-- Sample Data Insertion (Mock)
INSERT INTO Users (fullName, email, password, role) VALUES 
('Admin User', 'admin@parking.com', '$2a$10$X8O.U/6O.R7YJ.e7O8K1O.T/2e2mC2D.z0W7G3E5I0L9Q8X4C4F', 'admin'); 
-- password is 'admin123' (bcrypt hash depends on salt, this is an example)

INSERT INTO ParkingAreas (name, location, totalSlots, ratePerHour) VALUES 
('City Center Mall Parking', 'Downtown', 10, 50.00),
('Airport Terminal 1', 'Airport Road', 20, 100.00);

-- Generating slots for Area 1
INSERT INTO ParkingSlots (areaId, slotNumber) VALUES 
(1, 'A1'), (1, 'A2'), (1, 'A3'), (1, 'A4'), (1, 'A5'),
(1, 'A6'), (1, 'A7'), (1, 'A8'), (1, 'A9'), (1, 'A10');

-- Generating slots for Area 2
INSERT INTO ParkingSlots (areaId, slotNumber) VALUES 
(2, 'B1'), (2, 'B2'), (2, 'B3'), (2, 'B4'), (2, 'B5');
