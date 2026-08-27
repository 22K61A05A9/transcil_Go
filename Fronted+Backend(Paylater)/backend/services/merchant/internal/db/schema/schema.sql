CREATE TABLE merchants(
    id INT AUTO_INCREMENT PRIMARY KEY,
    merchant_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone_number VARCHAR(15),
    commission_percentage DECIMAL(5,2) NOT NULL
);
