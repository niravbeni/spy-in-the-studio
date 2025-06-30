-- SQL script to set up the game_states table in Supabase
-- Run this in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS game_states (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on updated_at for performance
CREATE INDEX IF NOT EXISTS idx_game_states_updated_at ON game_states(updated_at);

-- Enable Row Level Security (optional, but recommended)
ALTER TABLE game_states ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations for now (you can make this more restrictive later)
CREATE POLICY "Allow all operations on game_states" ON game_states
  FOR ALL USING (true); 