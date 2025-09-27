-- Create onboarding table for freelancers and startup founders
CREATE TABLE public.onboarding_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  username TEXT,
  user_type TEXT NOT NULL CHECK (user_type IN ('freelancer', 'startup_founder')),
  domain TEXT NOT NULL,
  social_media_goal TEXT NOT NULL CHECK (social_media_goal IN ('find_clients', 'personal_branding', 'for_fund')),
  business_description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.onboarding_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (demo mode)
CREATE POLICY "Onboarding profiles are publicly accessible for demo" 
ON public.onboarding_profiles 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_onboarding_profiles_updated_at
BEFORE UPDATE ON public.onboarding_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();