-- Add fields to social_connections table for storing Twitter OAuth tokens
ALTER TABLE public.social_connections 
ADD COLUMN IF NOT EXISTS access_token TEXT,
ADD COLUMN IF NOT EXISTS refresh_token TEXT,
ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMP WITH TIME ZONE;