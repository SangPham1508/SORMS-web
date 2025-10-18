-- =================================================================
-- MODULE 1: IDENTITY & ACCESS MANAGEMENT
-- Purpose: Manages users, roles, and permissions.
-- =================================================================

-- Table: roles
CREATE TABLE roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255) NULL
);

-- Table: users
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50) NULL,
    status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table: users_roles (Junction Table)
CREATE TABLE users_roles (
    user_id BIGINT NOT NULL,
    role_id INT NOT NULL,
    assigned_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- =================================================================
-- MODULE 2: ASSET & RESIDENCY MANAGEMENT
-- Purpose: Manages physical assets (rooms) and the guest lifecycle.
-- =================================================================

-- Table: room_types
CREATE TABLE room_types (
    id SMALLINT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255) NULL,
    base_price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    capacity TINYINT UNSIGNED NOT NULL DEFAULT 1
);

-- Table: rooms
CREATE TABLE rooms (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NULL,
    room_type_id SMALLINT NOT NULL,
    floor INT NULL,
    status ENUM('AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'CLEANING', 'OUT_OF_SERVICE') NOT NULL DEFAULT 'AVAILABLE',
    description VARCHAR(255) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_room_type_id (room_type_id),
    INDEX idx_status (status),
    FOREIGN KEY (room_type_id) REFERENCES room_types(id) ON DELETE RESTRICT
);

-- Table: bookings
CREATE TABLE bookings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(50) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    room_id BIGINT NOT NULL,
    checkin_date DATE NOT NULL,
    checkout_date DATE NOT NULL,
    num_guests TINYINT UNSIGNED NOT NULL,
    note VARCHAR(500) NULL,
    status ENUM('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'CHECKED_IN', 'CHECKED_OUT') NOT NULL DEFAULT 'PENDING',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_checkout_date CHECK (checkout_date > checkin_date),
    INDEX idx_user_id (user_id),
    INDEX idx_room_id (room_id),
    INDEX idx_status (status),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE RESTRICT
);

-- Table: booking_approvals
CREATE TABLE booking_approvals (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    booking_id BIGINT NOT NULL,
    approver_id BIGINT NOT NULL,
    decision ENUM('APPROVED', 'REJECTED') NOT NULL,
    reason VARCHAR(500) NULL,
    decided_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (approver_id) REFERENCES users(id) ON DELETE RESTRICT
);

-- Table: checkins
CREATE TABLE checkins (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    booking_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    room_id BIGINT NOT NULL,
    face_ref VARCHAR(255) NULL,
    checkin_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    checkout_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_booking_id (booking_id),
    INDEX idx_user_id (user_id),
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE RESTRICT
);

-- =================================================================
-- MODULE 3: SERVICE & FINANCIAL MANAGEMENT
-- Purpose: Manages value-added services, orders, and payments.
-- =================================================================

-- Table: services
CREATE TABLE services (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    description VARCHAR(255) NULL,
    unit_price DECIMAL(12, 2) NOT NULL,
    unit_name VARCHAR(50) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_unit_price CHECK (unit_price >= 0),
    INDEX idx_is_active (is_active)
);

-- Table: service_orders
CREATE TABLE service_orders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(50) NOT NULL UNIQUE,
    booking_id BIGINT NOT NULL,
    requested_by BIGINT NOT NULL,
    status ENUM('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    subtotal_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    discount_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    note VARCHAR(500) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_order_amounts CHECK (subtotal_amount >= 0 AND discount_amount >= 0 AND total_amount >= 0 AND discount_amount <= subtotal_amount),
    INDEX idx_booking_id (booking_id),
    INDEX idx_requested_by (requested_by),
    INDEX idx_status (status),
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE RESTRICT,
    FOREIGN KEY (requested_by) REFERENCES users(id) ON DELETE RESTRICT
);

-- Table: service_order_items
CREATE TABLE service_order_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    service_order_id BIGINT NOT NULL,
    service_id BIGINT NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    unit_price DECIMAL(12, 2) NOT NULL,
    line_total DECIMAL(12, 2) NOT NULL,
    UNIQUE KEY uq_order_service (service_order_id, service_id),
    CONSTRAINT chk_item_values CHECK (quantity > 0 AND unit_price >= 0 AND line_total >= 0),
    INDEX idx_service_id (service_id),
    FOREIGN KEY (service_order_id) REFERENCES service_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE RESTRICT
);

-- Table: payment_transactions
CREATE TABLE payment_transactions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    service_order_id BIGINT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    currency CHAR(3) NOT NULL DEFAULT 'VND',
    method ENUM('CASH', 'CARD', 'BANK_TRANSFER', 'WALLET') NOT NULL,
    status ENUM('PENDING', 'SUCCEEDED', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    provider_txn_id VARCHAR(100) NULL,
    paid_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_service_order_id (service_order_id),
    INDEX idx_provider_txn_id (provider_txn_id),
    INDEX idx_status (status),
    FOREIGN KEY (service_order_id) REFERENCES service_orders(id) ON DELETE RESTRICT
);

-- =================================================================
-- MODULE 4: OPERATIONAL MANAGEMENT
-- Purpose: Manages internal staff tasks and workflows.
-- =================================================================

-- Table: staff_tasks
CREATE TABLE staff_tasks (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    related_type ENUM('SERVICE_ORDER', 'ROOM', 'BOOKING') NOT NULL,
    related_id BIGINT NOT NULL,
    title VARCHAR(150) NOT NULL,
    description VARCHAR(500) NULL,
    assigned_to BIGINT NULL,
    created_by BIGINT NOT NULL,
    priority ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT') NOT NULL DEFAULT 'MEDIUM',
    status ENUM('OPEN', 'ASSIGNED', 'IN_PROGRESS', 'DONE', 'CANCELLED') NOT NULL DEFAULT 'OPEN',
    due_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_related_object (related_type, related_id),
    INDEX idx_assigned_to (assigned_to),
    INDEX idx_status (status),
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
);
