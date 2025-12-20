-- Consolidated schema: core tables and indexes (no seed data)

-- Required for gen_random_uuid() in the users table
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'traveler', 'business')),
    phone VARCHAR(20),
    country VARCHAR(100),
    business_name VARCHAR(255),
    business_type VARCHAR(50) CHECK (business_type IN ('Hotel/Accommodation', 'Tour/Activity Provider') OR business_type IS NULL),
    business_address TEXT,
    license_number VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_role_active ON users(role, is_active);
CREATE INDEX IF NOT EXISTS idx_users_email_active ON users(email, is_active);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE users IS 'Main users table supporting admin, traveler, and business partner roles';
COMMENT ON COLUMN users.id IS 'Primary key using UUID for security';
COMMENT ON COLUMN users.role IS 'User type: admin, traveler, or business';
COMMENT ON COLUMN users.business_type IS 'Type of business for business partners only';
COMMENT ON COLUMN users.license_number IS 'Business license number (optional)';
COMMENT ON COLUMN users.is_active IS 'Whether the user account is active';

ALTER TABLE users ADD CONSTRAINT IF NOT EXISTS check_email_format
    CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

ALTER TABLE users ADD CONSTRAINT IF NOT EXISTS check_phone_format
    CHECK (phone IS NULL OR phone ~* '^\+?[1-9]\d{1,14}$');

ALTER TABLE users ADD CONSTRAINT IF NOT EXISTS check_traveler_fields
    CHECK (
        role <> 'traveler' OR
        (country IS NOT NULL AND phone IS NOT NULL)
    );

ALTER TABLE users ADD CONSTRAINT IF NOT EXISTS check_business_fields
    CHECK (
        role <> 'business' OR
        (business_name IS NOT NULL AND business_type IS NOT NULL AND business_address IS NOT NULL)
    );

ALTER TABLE users ADD CONSTRAINT IF NOT EXISTS check_non_business_fields
    CHECK (
        role = 'business' OR
        (business_name IS NULL AND business_type IS NULL AND business_address IS NULL AND license_number IS NULL)
    );

ALTER TABLE users ADD CONSTRAINT IF NOT EXISTS check_non_traveler_fields
    CHECK (
        role IN ('traveler', 'business') OR
        (country IS NULL)
    );

CREATE OR REPLACE VIEW users_safe AS
SELECT
    id,
    full_name,
    email,
    role,
    phone,
    country,
    business_name,
    business_type,
    business_address,
    license_number,
    is_active,
    last_login,
    created_at,
    updated_at
FROM users;

-- Social Accounts
CREATE TABLE IF NOT EXISTS social_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  provider_id TEXT NOT NULL,
  provider_profile JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(provider, provider_id)
);

CREATE INDEX IF NOT EXISTS idx_social_accounts_user ON social_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_social_accounts_provider ON social_accounts(provider, provider_id);

-- Destinations
CREATE TABLE IF NOT EXISTS destinations (
  destination_id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  category VARCHAR(100),
  location VARCHAR(100),
  rating DECIMAL(2,1),
  small_description VARCHAR(255),
  long_description TEXT,
  image_url TEXT,
  highlights TEXT[],
  best_time TEXT,
  what_to_bring TEXT[],
  facilities TEXT[],
  tips TEXT,
  price DECIMAL(10,2),
  currency VARCHAR(10) DEFAULT 'USD',
  duration VARCHAR(100),
  difficulty VARCHAR(50),
  latitude DECIMAL(9,6),
  longitude DECIMAL(9,6)
);

-- Accommodations
CREATE TABLE IF NOT EXISTS accommodations (
    accommodation_id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(150) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL,
    description TEXT,
    address TEXT,
    city VARCHAR(100) NOT NULL,
    state_province VARCHAR(100),
    country VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    rating DECIMAL(2,1) CHECK (rating >= 0 AND rating <= 5),
    base_price_per_night DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    total_capacity INTEGER,
    total_bedrooms INTEGER,
    total_bathrooms INTEGER,
    check_in_time TIME DEFAULT '15:00',
    check_out_time TIME DEFAULT '11:00',
    minimum_stay INTEGER DEFAULT 1,
    maximum_stay INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_accommodations_slug ON accommodations(slug);
CREATE INDEX IF NOT EXISTS idx_accommodations_location ON accommodations(city, country);
CREATE INDEX IF NOT EXISTS idx_accommodations_type ON accommodations(type);
CREATE INDEX IF NOT EXISTS idx_accommodations_price ON accommodations(base_price_per_night);
CREATE INDEX IF NOT EXISTS idx_accommodations_rating ON accommodations(rating);
CREATE INDEX IF NOT EXISTS idx_accommodations_active ON accommodations(is_active);

-- Accommodation Images
CREATE TABLE IF NOT EXISTS accommodation_images (
    image_id SERIAL PRIMARY KEY,
    accommodation_id INTEGER REFERENCES accommodations(accommodation_id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(255),
    image_type VARCHAR(20) DEFAULT 'gallery',
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_accommodation_images_type ON accommodation_images(accommodation_id, image_type);
CREATE INDEX IF NOT EXISTS idx_accommodation_images_order ON accommodation_images(accommodation_id, display_order);

-- Room Types
CREATE TABLE IF NOT EXISTS room_types (
    room_type_id SERIAL PRIMARY KEY,
    accommodation_id INTEGER REFERENCES accommodations(accommodation_id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    capacity INTEGER NOT NULL,
    bedrooms INTEGER DEFAULT 1,
    bathrooms INTEGER DEFAULT 1,
    size_sqm DECIMAL(8,2),
    price_per_night DECIMAL(10,2) NOT NULL,
    total_rooms INTEGER DEFAULT 1,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_room_types_accommodation ON room_types(accommodation_id);
CREATE INDEX IF NOT EXISTS idx_room_types_available ON room_types(accommodation_id, is_available);
CREATE INDEX IF NOT EXISTS idx_room_types_price ON room_types(price_per_night);

-- Room Type Images
CREATE TABLE IF NOT EXISTS room_type_images (
    image_id SERIAL PRIMARY KEY,
    room_type_id INTEGER REFERENCES room_types(room_type_id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(255),
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_room_type_images_room ON room_type_images(room_type_id);
CREATE INDEX IF NOT EXISTS idx_room_type_images_order ON room_type_images(room_type_id, display_order);

-- Amenities
CREATE TABLE IF NOT EXISTS amenities (
    amenity_id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    icon VARCHAR(100),
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_amenities_category ON amenities(category);
CREATE INDEX IF NOT EXISTS idx_amenities_name ON amenities(name);

-- Accommodation Amenities (many-to-many)
CREATE TABLE IF NOT EXISTS accommodation_amenities (
    accommodation_id INTEGER REFERENCES accommodations(accommodation_id) ON DELETE CASCADE,
    amenity_id INTEGER REFERENCES amenities(amenity_id) ON DELETE CASCADE,
    PRIMARY KEY (accommodation_id, amenity_id)
);

CREATE INDEX IF NOT EXISTS idx_accommodation_amenities_accommodation ON accommodation_amenities(accommodation_id);
CREATE INDEX IF NOT EXISTS idx_accommodation_amenities_amenity ON accommodation_amenities(amenity_id);

-- Room Type Amenities (many-to-many)
CREATE TABLE IF NOT EXISTS room_type_amenities (
    room_type_id INTEGER REFERENCES room_types(room_type_id) ON DELETE CASCADE,
    amenity_id INTEGER REFERENCES amenities(amenity_id) ON DELETE CASCADE,
    PRIMARY KEY (room_type_id, amenity_id)
);

CREATE INDEX IF NOT EXISTS idx_room_type_amenities_room_type ON room_type_amenities(room_type_id);
CREATE INDEX IF NOT EXISTS idx_room_type_amenities_amenity ON room_type_amenities(amenity_id);

-- Activities and lookups
CREATE TABLE IF NOT EXISTS activities (
  activity_id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) UNIQUE,
  description TEXT NOT NULL,
  image_url TEXT,
  min_price DECIMAL(10,2),
  max_price DECIMAL(10,2),
  original_price DECIMAL(10,2),
  currency VARCHAR(10) DEFAULT 'USD',
  free_cancellation BOOLEAN DEFAULT FALSE,
  rating DECIMAL(2,1) CHECK (rating >= 0 AND rating <= 5),
  review_count INT DEFAULT 0,
  rating_breakdown JSONB,
  duration VARCHAR(100),
  group_size INT,
  max_participants INT,
  difficulty VARCHAR(50),
  season VARCHAR(50),
  age_limit INT,
  availability VARCHAR(50),
  inclusions TEXT[],
  exclusions TEXT[],
  highlights TEXT[],
  accessibility TEXT,
  weather_notes TEXT,
  operator_name VARCHAR(100),
  pickup_info VARCHAR(255),
  cancellation_policy TEXT,
  CHECK (max_price IS NULL OR min_price IS NULL OR max_price >= min_price)
);

CREATE INDEX IF NOT EXISTS idx_activities_slug ON activities(slug);

CREATE TABLE IF NOT EXISTS categories (
  category_id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS activity_categories (
  activity_id INT NOT NULL,
  category_id INT NOT NULL,
  PRIMARY KEY (activity_id, category_id),
  FOREIGN KEY (activity_id) REFERENCES activities(activity_id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS destination_activities (
  destination_id INT NOT NULL,
  activity_id INT NOT NULL,
  PRIMARY KEY (destination_id, activity_id),
  FOREIGN KEY (destination_id) REFERENCES destinations(destination_id) ON DELETE CASCADE,
  FOREIGN KEY (activity_id) REFERENCES activities(activity_id) ON DELETE CASCADE
);

-- Bookings
CREATE TABLE IF NOT EXISTS bookings (
  booking_id SERIAL PRIMARY KEY,
  user_id UUID NULL REFERENCES users(id) ON DELETE SET NULL,
  booking_type VARCHAR(32) NOT NULL CHECK (booking_type IN ('room', 'activity')),
  reference_id INTEGER NOT NULL,
  start_date DATE,
  end_date DATE,
  quantity INT DEFAULT 1,
  guests INT DEFAULT 1,
  contact_name TEXT,
  contact_email VARCHAR(255),
  contact_phone VARCHAR(32),
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency VARCHAR(10) DEFAULT 'USD',
  payment_method VARCHAR(32) NOT NULL,
  payment_status VARCHAR(32) NOT NULL DEFAULT 'pending',
  status VARCHAR(32) NOT NULL DEFAULT 'pending',
  payment_details JSONB,
  meta JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_bookings_type ON bookings(booking_type);

-- Favorites
CREATE TABLE IF NOT EXISTS user_favorites (
  favorite_id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  favorite_type TEXT NOT NULL,
  reference_id INTEGER NOT NULL,
  reference_slug TEXT,
  meta JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, favorite_type, reference_id)
);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  review_id SERIAL PRIMARY KEY,
  reviewable_type VARCHAR(64) NOT NULL,
  reviewable_id INTEGER NOT NULL,
  user_id UUID NULL REFERENCES users(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  body TEXT,
  status VARCHAR(16) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_reviews_reviewable ON reviews(reviewable_type, reviewable_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);

-- Destination Nearby
CREATE TABLE IF NOT EXISTS destination_nearby (
  id SERIAL PRIMARY KEY,
  destination_id INT REFERENCES destinations(destination_id) ON DELETE CASCADE,
  nearby_destination_id INT REFERENCES destinations(destination_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_destination_nearby_destination ON destination_nearby(destination_id);
CREATE INDEX IF NOT EXISTS idx_destination_nearby_nearby ON destination_nearby(nearby_destination_id);

-- Audit logs
CREATE TABLE IF NOT EXISTS audit_logs (
  audit_id SERIAL PRIMARY KEY,
  actor_id UUID NULL,
  actor_name TEXT NULL,
  action VARCHAR(64) NOT NULL,
  review_ids INTEGER[] NOT NULL,
  reviewable_type VARCHAR(64) NULL,
  details JSONB NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_reviewable ON audit_logs(reviewable_type);

-- create_planner_tables.sql

-- Presets saved by users (snapshot of planner payload)
CREATE TABLE IF NOT EXISTS planner_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  payload JSONB NOT NULL,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_planner_presets_user ON planner_presets(user_id);
CREATE INDEX IF NOT EXISTS idx_planner_presets_public ON planner_presets(is_public);

-- Shares: short token for public read-only access to a preset (optional expiry, usage count)
CREATE TABLE IF NOT EXISTS planner_shares (
  token VARCHAR(64) PRIMARY KEY,
  preset_id UUID REFERENCES planner_presets(id) ON DELETE CASCADE,
  expires_at TIMESTAMP WITH TIME ZONE NULL,
  access_count INT DEFAULT 0,
  password_hash TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_planner_shares_preset ON planner_shares(preset_id);

-- Add helpful_votes and review_replies tables
CREATE TABLE IF NOT EXISTS helpful_votes (
  id SERIAL PRIMARY KEY,
  review_id INTEGER NOT NULL REFERENCES reviews(review_id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vote SMALLINT NOT NULL CHECK (vote IN (1, -1)),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(review_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_helpful_votes_review ON helpful_votes(review_id);
CREATE INDEX IF NOT EXISTS idx_helpful_votes_user ON helpful_votes(user_id);

CREATE TABLE IF NOT EXISTS review_replies (
  reply_id SERIAL PRIMARY KEY,
  review_id INTEGER NOT NULL REFERENCES reviews(review_id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_review_replies_review ON review_replies(review_id);
CREATE INDEX IF NOT EXISTS idx_review_replies_user ON review_replies(user_id);

-- Optional triggers to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_helpful_votes_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_helpful_votes_updated_at
BEFORE UPDATE ON helpful_votes
FOR EACH ROW EXECUTE FUNCTION update_helpful_votes_updated_at();

CREATE OR REPLACE FUNCTION update_review_replies_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_review_replies_updated_at
BEFORE UPDATE ON review_replies
FOR EACH ROW EXECUTE FUNCTION update_review_replies_updated_at();

-- Create table for storing saved cards
-- SECURITY NOTE: This schema stores encrypted PAN (bytea). For production prefer storing tokens generated by a payment provider.

CREATE TABLE IF NOT EXISTS user_cards (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  card_holder TEXT,
  card_type TEXT,
  brand TEXT,
  last4 VARCHAR(4) NOT NULL,
  expiry_month INT,
  expiry_year INT,
  encrypted_pan BYTEA,   -- AES-GCM encrypted PAN (demo only)
  pan_iv BYTEA,          -- IV used for encryption
  pan_tag BYTEA,         -- Auth tag for GCM
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_cards_user_id ON user_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_user_cards_user_default ON user_cards(user_id, is_default);

-- Create newsletter_subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  subscribed_at TIMESTAMP DEFAULT NOW(),
  unsubscribed_at TIMESTAMP,
  source VARCHAR(100) DEFAULT 'footer',
  ip_address VARCHAR(45),
  user_agent TEXT,
  CONSTRAINT email_unique UNIQUE (email)
);

-- Create index for faster queries
CREATE INDEX idx_newsletter_email ON newsletter_subscribers(email);
CREATE INDEX idx_newsletter_status ON newsletter_subscribers(status);

-- Create contact_submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'new',
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_contact_email ON contact_submissions(email);
CREATE INDEX idx_contact_status ON contact_submissions(status);
CREATE INDEX idx_contact_created ON contact_submissions(created_at DESC);

-- Add comments
COMMENT ON TABLE contact_submissions IS 'Stores contact form submissions from website visitors';
COMMENT ON COLUMN contact_submissions.status IS 'Status:  new, in-progress, resolved, archived';

-- Run this script to create all careers-related tables

-- 1. Jobs Table
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  department VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL,
  location VARCHAR(255) NOT NULL,
  salary_range VARCHAR(100),
  experience_required VARCHAR(50),
  description TEXT NOT NULL,
  overview TEXT,
  skills TEXT[],
  responsibilities TEXT[],
  requirements TEXT[],
  nice_to_have TEXT[],
  perks TEXT[],
  benefits TEXT[],
  urgency VARCHAR(20) DEFAULT 'normal',
  openings INTEGER DEFAULT 1,
  team_size VARCHAR(50),
  team_manager VARCHAR(100),
  team_culture TEXT,
  application_process TEXT[],
  status VARCHAR(20) DEFAULT 'active',
  posted_date TIMESTAMP DEFAULT NOW(),
  closing_date TIMESTAMP,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Job Applications Table
CREATE TABLE IF NOT EXISTS job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id VARCHAR(20) UNIQUE NOT NULL,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  job_title VARCHAR(255) NOT NULL,
  job_department VARCHAR(100) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  location VARCHAR(255) NOT NULL,
  current_position VARCHAR(255) NOT NULL,
  experience_years VARCHAR(50) NOT NULL,
  expected_salary VARCHAR(100),
  notice_period VARCHAR(50),
  portfolio_url TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  website_url TEXT,
  resume_url TEXT NOT NULL,
  resume_filename VARCHAR(255) NOT NULL,
  resume_size INTEGER,
  resume_public_id VARCHAR(255),
  cover_letter TEXT NOT NULL,
  how_did_you_hear VARCHAR(100),
  status VARCHAR(50) DEFAULT 'pending',
  stage VARCHAR(100) DEFAULT 'Applied',
  priority VARCHAR(20) DEFAULT 'normal',
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMP,
  ip_address VARCHAR(50),
  user_agent TEXT,
  referrer TEXT,
  applied_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL
);

-- 3. Application Activities Table
CREATE TABLE IF NOT EXISTS application_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES job_applications(id) ON DELETE CASCADE,
  activity_type VARCHAR(100) NOT NULL,
  old_value TEXT,
  new_value TEXT,
  description TEXT,
  performed_by UUID REFERENCES users(id),
  performed_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB
);

-- 4. Interview Schedules Table
CREATE TABLE IF NOT EXISTS interview_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES job_applications(id) ON DELETE CASCADE,
  interview_type VARCHAR(100) NOT NULL,
  interview_mode VARCHAR(50) NOT NULL,
  scheduled_date TIMESTAMP NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  interviewer_ids UUID[],
  interviewer_names TEXT[],
  meeting_link TEXT,
  meeting_location TEXT,
  status VARCHAR(50) DEFAULT 'scheduled',
  notes TEXT,
  feedback TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. Application Emails Table
CREATE TABLE IF NOT EXISTS application_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES job_applications(id) ON DELETE CASCADE,
  email_type VARCHAR(100) NOT NULL,
  template_id VARCHAR(100),
  to_address VARCHAR(255) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  body_html TEXT,
  body_text TEXT,
  status VARCHAR(50) DEFAULT 'sent',
  provider VARCHAR(50) DEFAULT 'SendGrid',
  provider_message_id TEXT,
  error_message TEXT,
  sent_by UUID REFERENCES users(id),
  sent_at TIMESTAMP DEFAULT NOW()
);

-- 6. Job Bookmarks Table
CREATE TABLE IF NOT EXISTS job_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, job_id)
);

-- Create Indexes
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_department ON jobs(department);
CREATE INDEX IF NOT EXISTS idx_jobs_type ON jobs(type);
CREATE INDEX IF NOT EXISTS idx_jobs_posted_date ON jobs(posted_date DESC);

CREATE INDEX IF NOT EXISTS idx_applications_job_id ON job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_email ON job_applications(email);
CREATE INDEX IF NOT EXISTS idx_applications_status ON job_applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_applied_at ON job_applications(applied_at DESC);
CREATE INDEX IF NOT EXISTS idx_applications_application_id ON job_applications(application_id);

CREATE INDEX IF NOT EXISTS idx_activities_application_id ON application_activities(application_id);
CREATE INDEX IF NOT EXISTS idx_activities_performed_at ON application_activities(performed_at DESC);

CREATE INDEX IF NOT EXISTS idx_interviews_application_id ON interview_schedules(application_id);
CREATE INDEX IF NOT EXISTS idx_interviews_scheduled_date ON interview_schedules(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_interviews_status ON interview_schedules(status);

CREATE INDEX IF NOT EXISTS idx_app_emails_application_id ON application_emails(application_id);
CREATE INDEX IF NOT EXISTS idx_app_emails_email_type ON application_emails(email_type);
CREATE INDEX IF NOT EXISTS idx_app_emails_sent_at ON application_emails(sent_at DESC);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON job_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_job_id ON job_bookmarks(job_id);

-- Create Triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_jobs_updated_at ON jobs;
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_applications_updated_at ON job_applications;
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON job_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_interviews_updated_at ON interview_schedules;
CREATE TRIGGER update_interviews_updated_at BEFORE UPDATE ON interview_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions (adjust as needed)
GRANT SELECT, INSERT, UPDATE ON jobs TO your_app_user;
GRANT SELECT, INSERT, UPDATE ON job_applications TO your_app_user;
GRANT SELECT, INSERT ON application_activities TO your_app_user;
GRANT SELECT, INSERT, UPDATE ON interview_schedules TO your_app_user;
GRANT SELECT, INSERT ON application_emails TO your_app_user;
GRANT SELECT, INSERT, DELETE ON job_bookmarks TO your_app_user;