-- Create relevant_posts table to store Twitter posts found for users
CREATE TABLE relevant_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  twitter_post_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_username TEXT NOT NULL,
  author_id TEXT NOT NULL,
  content TEXT NOT NULL,
  twitter_url TEXT NOT NULL,
  created_at_twitter TIMESTAMPTZ NOT NULL,
  retweet_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  quote_count INTEGER DEFAULT 0,
  topic TEXT,
  context_annotations JSONB,
  ai_response TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_relevant_posts_profile_id ON relevant_posts(profile_id);
CREATE INDEX idx_relevant_posts_created_at ON relevant_posts(created_at DESC);
CREATE UNIQUE INDEX idx_relevant_posts_twitter_id_profile ON relevant_posts(twitter_post_id, profile_id);

-- Enable RLS
ALTER TABLE relevant_posts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own relevant posts" ON relevant_posts
  FOR SELECT USING (profile_id = auth.uid());

CREATE POLICY "Users can insert their own relevant posts" ON relevant_posts
  FOR INSERT WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Users can update their own relevant posts" ON relevant_posts
  FOR UPDATE USING (profile_id = auth.uid());

CREATE POLICY "Users can delete their own relevant posts" ON relevant_posts
  FOR DELETE USING (profile_id = auth.uid());

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_relevant_posts_updated_at BEFORE UPDATE
    ON relevant_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
