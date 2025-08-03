"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { checkUserProfile } from "@/lib/profileActions";
import Onboarding from "@/components/Onboarding";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const { user, isLoaded } = useUser();
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (isLoaded && user) {
        try {
          const profile = await checkUserProfile();
          
          // If profile doesn't exist or onboarding is not complete
          if (!profile || !profile.isOnboardingComplete) {
            setNeedsOnboarding(true);
          } else {
            setNeedsOnboarding(false);
          }
        } catch (error) {
          console.error("Error checking onboarding status:", error);
          // If there's an error, assume they need onboarding
          setNeedsOnboarding(true);
        }
      }
      setLoading(false);
    };

    checkOnboardingStatus();
  }, [user, isLoaded]);

  const handleOnboardingComplete = () => {
    setNeedsOnboarding(false);
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <>{children}</>;
  }

  if (needsOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return <>{children}</>;
};

export default MainLayout;
