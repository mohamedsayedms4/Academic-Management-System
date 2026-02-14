-- Insert default admin user for testing
-- Password: admin123 (BCrypt hashed)
-- You can generate BCrypt hash online at: https://bcrypt-generator.com/

INSERT INTO users (username, email, password, full_name, phone, role, active, created_at, updated_at)
VALUES (
    'admin',
    'admin@academy.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- password: admin123
    'System Administrator',
    '01000000000',
    'ADMIN',
    true,
    NOW(),
    NOW()
);

-- Insert a test telesales user
-- Password: pass123
INSERT INTO users (username, email, password, full_name, phone, role, active, created_at, updated_at)
VALUES (
    'telesales1',
    'telesales@academy.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: pass123
    'Ahmed Mohamed',
    '01012345678',
    'TELESALES',
    true,
    NOW(),
    NOW()
);

-- Note: Make sure to run this SQL script after the application has created the database tables
-- You can run this using MySQL Workbench, phpMyAdmin, or MySQL command line:
-- mysql -u root -p academic_db < insert_admin_user.sql
