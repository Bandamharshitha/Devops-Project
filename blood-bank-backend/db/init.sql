-- Create database
CREATE DATABASE IF NOT EXISTS bloodbank;
USE bloodbank;

-- Create Donors Table
CREATE TABLE IF NOT EXISTS donors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  blood_group VARCHAR(5) NOT NULL,
  email VARCHAR(100),
  phone VARCHAR(20),
  location VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert some sample donors
INSERT INTO donors (name, blood_group, email, phone, location)
VALUES
('Ravi Kumar', 'A+', 'ravi@example.com', '9876543210', 'Hyderabad'),
('Anjali Sharma', 'B-', 'anjali@example.com', '9876501234', 'Delhi'),
('Rahul Verma', 'O+', 'rahul@example.com', '9123456789', 'Mumbai');
