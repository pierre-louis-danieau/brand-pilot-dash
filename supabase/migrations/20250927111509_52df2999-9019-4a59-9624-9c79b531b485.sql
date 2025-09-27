-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  topics_of_interest TEXT[],
  goal TEXT CHECK (goal IN ('personal_branding', 'startup_promotion')),
  industry_domain TEXT,
  ai_voice TEXT CHECK (ai_voice IN ('professional', 'friendly', 'witty')) DEFAULT 'professional',
  about_context TEXT,
  post_preferences TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create posts table for drafted posts
CREATE TABLE public.posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  platform TEXT NOT NULL DEFAULT 'twitter',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create social_connections table for future social media integrations
CREATE TABLE public.social_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('twitter', 'linkedin', 'instagram', 'reddit')),
  is_connected BOOLEAN NOT NULL DEFAULT false,
  connection_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(profile_id, platform)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_connections ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since app works without auth for now)
-- Note: These policies allow public access for demo purposes
-- When authentication is added, these should be updated to use auth.uid()

CREATE POLICY "Profiles are publicly accessible for demo" 
ON public.profiles 
FOR ALL 
USING (true)
WITH CHECK (true);

CREATE POLICY "Posts are publicly accessible for demo" 
ON public.posts 
FOR ALL 
USING (true)
WITH CHECK (true);

CREATE POLICY "Social connections are publicly accessible for demo" 
ON public.social_connections 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_social_connections_updated_at
  BEFORE UPDATE ON public.social_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();