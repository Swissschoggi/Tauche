-- V2__create_certifications_and_trips_tables.sql
-- Migration script for Tauche database

-- Create Certifications table
CREATE TABLE certifications (
    id BIGSERIAL PRIMARY KEY,
    diver_id BIGINT NOT NULL,
    certification_name VARCHAR(100) NOT NULL,
    agency VARCHAR(50) NOT NULL,
    max_depth INTEGER NOT NULL,
    date_issued DATE NOT NULL,
    expiry_date DATE,
    certification_number VARCHAR(100),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATE NOT NULL DEFAULT CURRENT_DATE,
    updated_at DATE,
    CONSTRAINT fk_certifications_diver FOREIGN KEY (diver_id) REFERENCES divers(id) ON DELETE CASCADE
);

CREATE INDEX idx_certifications_diver ON certifications(diver_id);
CREATE INDEX idx_certifications_expiry ON certifications(expiry_date);

-- Create Dive Trips table
CREATE TABLE dive_trips (
    id BIGSERIAL PRIMARY KEY,
    diver_id BIGINT NOT NULL,
    trip_name VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    description TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATE NOT NULL DEFAULT CURRENT_DATE,
    updated_at DATE,
    CONSTRAINT fk_dive_trips_diver FOREIGN KEY (diver_id) REFERENCES divers(id) ON DELETE CASCADE
);

CREATE INDEX idx_dive_trips_diver ON dive_trips(diver_id);
CREATE INDEX idx_dive_trips_dates ON dive_trips(start_date, end_date);

-- Create Dive Trip Dives junction table
CREATE TABLE dive_trip_dives (
    id BIGSERIAL PRIMARY KEY,
    dive_trip_id BIGINT NOT NULL,
    dive_log_id BIGINT NOT NULL,
    sequence INTEGER,
    CONSTRAINT fk_dive_trip_dives_trip FOREIGN KEY (dive_trip_id) REFERENCES dive_trips(id) ON DELETE CASCADE,
    CONSTRAINT fk_dive_trip_dives_dive FOREIGN KEY (dive_log_id) REFERENCES dive_logs(id) ON DELETE CASCADE
);

CREATE INDEX idx_dive_trip_dives_trip ON dive_trip_dives(dive_trip_id);
CREATE INDEX idx_dive_trip_dives_dive ON dive_trip_dives(dive_log_id);
