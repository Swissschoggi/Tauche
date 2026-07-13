-- V1__create_base_tables.sql
-- Base schema for Tauche dive logbook

CREATE TABLE IF NOT EXISTS divers (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(60),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dive_logs (
    id BIGSERIAL PRIMARY KEY,
    dive_title VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    location VARCHAR(255) NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    dive_type VARCHAR(20),
    dive_purpose VARCHAR(20),
    dive_site VARCHAR(255),
    depth_meters DOUBLE PRECISION NOT NULL,
    cylinder_volume_liters DOUBLE PRECISION,
    duration_minutes INTEGER NOT NULL,
    water_temperature_celsius DOUBLE PRECISION,
    visibility_meters DOUBLE PRECISION,
    water_type VARCHAR(10),
    weather VARCHAR(255),
    suit VARCHAR(255),
    weight_kg DOUBLE PRECISION,
    gas VARCHAR(20),
    pressure_start_bar DOUBLE PRECISION,
    pressure_end_bar DOUBLE PRECISION,
    buddy VARCHAR(255),
    dive_center VARCHAR(255),
    notes VARCHAR(2000),
    image_path VARCHAR(255),
    share_token VARCHAR(255) UNIQUE,
    diver_id BIGINT NOT NULL REFERENCES divers(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS equipment (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    serial_number VARCHAR(100),
    purchase_date DATE,
    last_service_date DATE,
    service_interval_dives INTEGER DEFAULT 100,
    service_interval_months INTEGER DEFAULT 12,
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    manufacturer VARCHAR(100),
    model VARCHAR(100),
    purchase_price DOUBLE PRECISION,
    last_service_notes TEXT,
    diver_id BIGINT NOT NULL REFERENCES divers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS dive_log_equipment (
    dive_log_id BIGINT NOT NULL REFERENCES dive_logs(id) ON DELETE CASCADE,
    equipment_id BIGINT NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    PRIMARY KEY (dive_log_id, equipment_id)
);

CREATE TABLE IF NOT EXISTS gallery_images (
    id BIGSERIAL PRIMARY KEY,
    image_path VARCHAR(255) NOT NULL,
    tags TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    dive_log_id BIGINT NOT NULL REFERENCES dive_logs(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_dive_logs_diver ON dive_logs(diver_id);
CREATE INDEX IF NOT EXISTS idx_dive_logs_date ON dive_logs(date);
CREATE INDEX IF NOT EXISTS idx_dive_logs_share_token ON dive_logs(share_token);
CREATE INDEX IF NOT EXISTS idx_equipment_diver ON equipment(diver_id);
CREATE INDEX IF NOT EXISTS idx_gallery_images_dive_log ON gallery_images(dive_log_id);
