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
import { z } from "zod";

// Validation schema matching the database constraints
const profileSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }).max(255, { message: "Email must be less than 255 characters" }),
  name: z.string().trim().min(1, { message: "Name is required" }).max(100, { message: "Name must be less than 100 characters" }),
  username: z.string().trim().max(50, { message: "Username must be less than 50 characters" }).optional(),
  user_type: z.enum(['freelancer', 'startup_founder'], { 
    errorMap: () => ({ message: "Please select a valid user type" }) 
  }),
  domain: z.string().trim().min(1, { message: "Domain/Industry is required" }).max(100, { message: "Domain must be less than 100 characters" }),
  social_media_goal: z.enum(['find_clients', 'personal_branding', 'for_fund'], {
    errorMap: () => ({ message: "Please select a valid social media goal" })
  }),
  business_description: z.string().trim().min(1, { message: "Business description is required" }).max(1000, { message: "Business description must be less than 1000 characters" })
});

type ProfileFormData = z.infer<typeof profileSchema>;

type OnboardingProfile = Database['public']['Tables']['onboarding_profiles']['Row'];

interface ProfileSettingsDialogProps {
  profile: OnboardingProfile | null;
  onProfileUpdate: (updatedProfile: OnboardingProfile) => void;
}

const ProfileSettingsDialog = ({ profile, onProfileUpdate }: ProfileSettingsDialogProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<ProfileFormData>({
    name: profile?.name || '',
    email: profile?.email || '',
    username: profile?.username || '',
    user_type: (profile?.user_type as 'freelancer' | 'startup_founder') || 'freelancer',
    domain: profile?.domain || '',
    social_media_goal: (profile?.social_media_goal as 'find_clients' | 'personal_branding' | 'for_fund') || 'personal_branding',
    business_description: profile?.business_description || ''
  });

  const handleSave = async () => {
    if (!profile) return;

    try {
      // Validate form data
      const validatedData = profileSchema.parse(formData);
      setErrors({});
      
      setIsLoading(true);
      const updatedProfile = await onboardingProfileApi.updateOnboardingProfile(profile.id, validatedData);
      onProfileUpdate(updatedProfile);
      setIsOpen(false);
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
        toast({
          title: "Validation Error",
          description: "Please check the form fields and try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error updating profile",
          description: error instanceof Error ? error.message : "Failed to update profile. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const userTypeOptions = [
    { value: "freelancer", label: "Freelancer", description: "I work independently and offer services to clients" },
    { value: "startup_founder", label: "Startup Founder", description: "I'm building or running my own startup company" }
  ];

  const socialGoalOptions = [
    { value: "find_clients", label: "Find Clients", description: "Connect with potential clients and customers" },
    { value: "personal_branding", label: "Personal Branding", description: "Build my professional reputation and thought leadership" },
    { value: "for_fund", label: "Fundraising", description: "Attract investors and raise funding for my business" }
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
              <Label htmlFor="name">Full Name <span className="text-red-500">*</span></Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your full name"
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>
            
            <div>
              <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter your email"
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="username">Username (Optional)</Label>
              <Input
                id="username"
                value={formData.username || ''}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="@yourusername"
                className={errors.username ? "border-red-500" : ""}
              />
              {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
            </div>
            
            <div>
              <Label htmlFor="domain">Domain/Industry <span className="text-red-500">*</span></Label>
              <Input
                id="domain"
                value={formData.domain}
                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                placeholder="e.g., Technology, Marketing, Finance"
                className={errors.domain ? "border-red-500" : ""}
              />
              {errors.domain && <p className="text-red-500 text-sm mt-1">{errors.domain}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="user_type">What best describes you? <span className="text-red-500">*</span></Label>
            <Select 
              value={formData.user_type} 
              onValueChange={(value: 'freelancer' | 'startup_founder') => setFormData({ ...formData, user_type: value })}
            >
              <SelectTrigger className={errors.user_type ? "border-red-500" : ""}>
                <SelectValue placeholder="Select what best describes you" />
              </SelectTrigger>
              <SelectContent>
                {userTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-muted-foreground">{option.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.user_type && <p className="text-red-500 text-sm mt-1">{errors.user_type}</p>}
          </div>

          <div>
            <Label htmlFor="business_description">Tell us about your business <span className="text-red-500">*</span></Label>
            <Textarea
              id="business_description"
              value={formData.business_description}
              onChange={(e) => setFormData({ ...formData, business_description: e.target.value })}
              placeholder="Describe your business, what you do, your target market, and your unique value proposition..."
              className={`min-h-[100px] ${errors.business_description ? "border-red-500" : ""}`}
            />
            {errors.business_description && <p className="text-red-500 text-sm mt-1">{errors.business_description}</p>}
          </div>

          <div>
            <Label htmlFor="social_media_goal">What's your main goal with social media? <span className="text-red-500">*</span></Label>
            <Select 
              value={formData.social_media_goal} 
              onValueChange={(value: 'find_clients' | 'personal_branding' | 'for_fund') => setFormData({ ...formData, social_media_goal: value })}
            >
              <SelectTrigger className={errors.social_media_goal ? "border-red-500" : ""}>
                <SelectValue placeholder="Select your primary social media goal" />
              </SelectTrigger>
              <SelectContent>
                {socialGoalOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-muted-foreground">{option.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.social_media_goal && <p className="text-red-500 text-sm mt-1">{errors.social_media_goal}</p>}
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