-- Check current platform constraints
SELECT conname, pg_get_constraintdef(oid) as definition 
FROM pg_constraint 
WHERE conrelid = 'social_connections'::regclass 
AND contype = 'c';

-- Update platform check constraint to allow twitter_temp for OAuth flow
ALTER TABLE social_connections DROP CONSTRAINT IF EXISTS social_connections_platform_check;
ALTER TABLE social_connections ADD CONSTRAINT social_connections_platform_check 
CHECK (platform IN ('twitter', 'facebook', 'instagram', 'linkedin', 'youtube', 'tiktok', 'twitter_temp'));