import { useEffect, useState } from "react";
import { useUserProfile } from "@/hooks/useUserProfile";
import ProfileSetup from "./ProfileSetup";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function ProfileGuard({ children }: { children: React.ReactNode }) {
  const { hasProfile, loading, refreshProfile } = useUserProfile();
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  useEffect(() => {
    if (!loading && !hasProfile) {
      setShowProfileSetup(true);
    }
  }, [loading, hasProfile]);

  const handleProfileComplete = () => {
    setShowProfileSetup(false);
    refreshProfile();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      {children}
      <Dialog open={showProfileSetup} onOpenChange={(open) => !open && setShowProfileSetup(false)}>
        <DialogContent className="sm:max-w-[500px]" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Welcome! Let's set up your profile</DialogTitle>
          </DialogHeader>
          <ProfileSetup onComplete={handleProfileComplete} />
        </DialogContent>
      </Dialog>
    </>
  );
}
