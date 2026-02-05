-- Add missing columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('freshman', 'sophomore', 'junior', 'senior', 'graduated', 'alumni'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS semester INT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS resume_url TEXT;