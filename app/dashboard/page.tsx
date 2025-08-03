"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { getUserProfile } from "@/lib/profileActions";
import { getFollowCounts } from "@/lib/followActions";
import StudentDashboard from "@/components/dashboards/StudentDashboard";
import TeacherDashboard from "@/components/dashboards/TeacherDashboard";
import AdminDashboard from "@/components/dashboards/AdminDashboard";

interface ProfileData {
  userId: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'teacher' | 'admin';
  profilePhoto: string;
}

export default function DashboardPage() {
  const { user } = useUser();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const profileData = await getUserProfile();
      if (profileData) {
        setProfile(profileData);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Profile not found</h2>
          <p className="text-gray-600">Please complete your onboarding first.</p>
        </div>
      </div>
    );
  }

  // Render role-specific dashboard
  switch (profile.role) {
    case 'student':
      return <StudentDashboard profile={profile} />;
    case 'teacher':
      return <TeacherDashboard profile={profile} />;
    case 'admin':
      return <AdminDashboard profile={profile} />;
    default:
      return <StudentDashboard profile={profile} />;
  }
}
