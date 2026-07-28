create table users(
    id int AUTO_INCREMENT primary key,
    user_name varchar(100) not null,
    email varchar(100) unique not null,
    credit_limit decimal(10,2) not null default 2000,
    current_due decimal(10,2) not null default 0
);
create table merchants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    merchant_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(15),
    commission_percentage DECIMAL(5,2) NOT NULL
);
create table transactions(
    id int AUTO_INCREMENT PRIMARY KEY,
    user_id int NOT NULL,
    merchant_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    commission DECIMAL(10,2) NOT NULL,
    commission_percentage DECIMAL(5,2) NOT NULL,
    transaction_date TIMESTAMP default current_Timestamp,
    foreign key(user_id) references users(id),
    foreign key(merchant_id) references merchants(id)
);
