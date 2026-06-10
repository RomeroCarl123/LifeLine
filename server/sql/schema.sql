DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('donor', 'requester', 'admin');
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'urgency_level') THEN
    CREATE TYPE urgency_level AS ENUM ('normal', 'urgent', 'critical');
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'request_status') THEN
    CREATE TYPE request_status AS ENUM ('pending', 'approved', 'in_progress', 'completed');
  END IF;
END
$$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'request_status')
     AND NOT EXISTS (
       SELECT 1
       FROM pg_enum
       WHERE enumtypid = 'request_status'::regtype
         AND enumlabel = 'in_progress'
     ) THEN
    ALTER TYPE request_status ADD VALUE 'in_progress' BEFORE 'completed';
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role user_role NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS donors (
  user_id INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  blood_type TEXT NOT NULL,
  location TEXT NOT NULL,
  availability BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS requests (
  id SERIAL PRIMARY KEY,
  requester_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blood_type TEXT NOT NULL,
  units INT NOT NULL,
  urgency urgency_level NOT NULL,
  status request_status DEFAULT 'pending',
  location TEXT NOT NULL,
  hospital TEXT NOT NULL,
  contact TEXT NOT NULL,
  assigned_donor_id INT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_urgency ON requests(urgency);
CREATE INDEX IF NOT EXISTS idx_donors_blood_location ON donors(blood_type, location);

CREATE TABLE IF NOT EXISTS direct_requests (
  id SERIAL PRIMARY KEY,
  requester_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  donor_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  units INT NOT NULL,
  request_date DATE NOT NULL,
  request_time TIME NOT NULL,
  note TEXT,
  status request_status DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_direct_requests_donor ON direct_requests(donor_id);
CREATE INDEX IF NOT EXISTS idx_direct_requests_requester ON direct_requests(requester_id);
