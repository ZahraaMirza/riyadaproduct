-- Create rooms table
CREATE TABLE rooms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create startups table
CREATE TABLE startups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  spots INTEGER NOT NULL DEFAULT 5,
  room_id TEXT REFERENCES rooms(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create bookings table
CREATE TABLE bookings (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  startups TEXT[] NOT NULL,
  room_id TEXT REFERENCES rooms(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Insert default rooms
INSERT INTO rooms (id, name) VALUES
  ('room1', 'Room 1'),
  ('room2', 'Room 2');

-- Insert default startups
INSERT INTO startups (id, name, spots, room_id) VALUES
  ('1', 'Tamam', 5, 'room1'),
  ('2', 'Cater Me', 5, 'room1'),
  ('3', 'TellSaleem', 5, 'room1'),
  ('4', 'Twazn', 5, 'room1'),
  ('5', 'Soor', 5, 'room2'),
  ('6', 'Rentat', 5, 'room2'),
  ('7', 'Academity', 5, 'room2');

-- Enable Row Level Security (RLS)
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE startups ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access to rooms" ON rooms
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access to startups" ON startups
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access to bookings" ON bookings
  FOR SELECT USING (true);

-- Create policies for public insert access
CREATE POLICY "Allow public insert access to bookings" ON bookings
  FOR INSERT WITH CHECK (true);

-- Create policies for public update access
CREATE POLICY "Allow public update access to startups" ON startups
  FOR UPDATE USING (true);

-- Create policies for public delete access
CREATE POLICY "Allow public delete access to bookings" ON bookings
  FOR DELETE USING (true);

-- Create indexes for better performance
CREATE INDEX idx_bookings_created_at ON bookings(created_at DESC);
CREATE INDEX idx_startups_room_id ON startups(room_id);
CREATE INDEX idx_bookings_room_id ON bookings(room_id); 