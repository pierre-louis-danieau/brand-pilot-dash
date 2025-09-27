import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { onboardingProfileApi } from "@/integrations/supabase/api";
import type { Database } from "@/integrations/supabase/types";

type OnboardingProfile = Database['public']['Tables']['onboarding_profiles']['Row'];

interface ProfileSettingsDialogProps {
  profile: OnboardingProfile | null;
  onProfileUpdate: (updatedProfile: OnboardingProfile) => void;
}

const ProfileSettingsDialog = ({ profile, onProfileUpdate }: ProfileSettingsDialogProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    email: profile?.email || '',
    username: profile?.username || '',
    domain: profile?.domain || '',
    user_type: profile?.user_type || '',
    business_description: profile?.business_description || '',
    social_media_goal: profile?.social_media_goal || ''
  });

  const handleSave = async () => {
    if (!profile) return;

    try {
      setIsLoading(true);
      const updatedProfile = await onboardingProfileApi.updateOnboardingProfile(profile.id, formData);
      onProfileUpdate(updatedProfile);
      setIsOpen(false);
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error updating profile",
        description: error instanceof Error ? error.message : "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const userTypeOptions = [
    { value: "entrepreneur", label: "Entrepreneur" },
    { value: "business_owner", label: "Business Owner" },
    { value: "professional", label: "Professional" },
    { value: "content_creator", label: "Content Creator" },
    { value: "freelancer", label: "Freelancer" },
    { value: "other", label: "Other" }
  ];

  const socialGoalOptions = [
    { value: "personal_branding", label: "Personal Branding" },
    { value: "business_growth", label: "Business Growth" },
    { value: "thought_leadership", label: "Thought Leadership" },
    { value: "networking", label: "Networking" },
    { value: "lead_generation", label: "Lead Generation" },
    { value: "brand_awareness", label: "Brand Awareness" }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Profile Settings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your full name"
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={formData.username || ''}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="Enter your username"
              />
            </div>
            
            <div>
              <Label htmlFor="domain">Domain/Industry</Label>
              <Input
                id="domain"
                value={formData.domain}
                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                placeholder="e.g., Technology, Marketing, Finance"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="user_type">User Type</Label>
            <Select value={formData.user_type} onValueChange={(value) => setFormData({ ...formData, user_type: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select your user type" />
              </SelectTrigger>
              <SelectContent>
                {userTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="business_description">Business Description</Label>
            <Textarea
              id="business_description"
              value={formData.business_description}
              onChange={(e) => setFormData({ ...formData, business_description: e.target.value })}
              placeholder="Describe your business or professional background..."
              className="min-h-[100px]"
            />
          </div>

          <div>
            <Label htmlFor="social_media_goal">Social Media Goal</Label>
            <Select value={formData.social_media_goal} onValueChange={(value) => setFormData({ ...formData, social_media_goal: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select your primary social media goal" />
              </SelectTrigger>
              <SelectContent>
                {socialGoalOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileSettingsDialog;