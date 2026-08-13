CREATE TABLE transactions(
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    merchant_id INT,
    transaction_type ENUM('PURCHASE','PAYBACK') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    commission DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    commission_percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00
);
