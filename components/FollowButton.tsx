"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { followUser, unfollowUser, isFollowing } from "@/lib/followActions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { UserPlus, UserMinus, Loader2 } from "lucide-react";

interface FollowButtonProps {
  userId: string;
  className?: string;
  size?: "sm" | "default" | "lg";
}

export default function FollowButton({ userId, className, size = "default" }: FollowButtonProps) {
  const { user } = useUser();
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const status = await isFollowing(userId);
        setFollowing(status);
      } catch (error) {
        console.error("Error checking follow status:", error);
      } finally {
        setCheckingStatus(false);
      }
    };

    if (user && user.id !== userId) {
      checkStatus();
    } else {
      setCheckingStatus(false);
    }
  }, [user, userId]);

  const handleToggleFollow = async () => {
    if (!user) {
      toast.error("Please sign in to follow users");
      return;
    }

    try {
      setLoading(true);
      
      if (following) {
        await unfollowUser(userId);
        setFollowing(false);
        toast.success("User unfollowed successfully!");
      } else {
        await followUser(userId);
        setFollowing(true);
        toast.success("User followed successfully!");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update follow status");
    } finally {
      setLoading(false);
    }
  };

  // Don't show button if not signed in or trying to follow yourself
  if (!user || user.id === userId || checkingStatus) {
    return null;
  }

  return (
    <Button
      onClick={handleToggleFollow}
      disabled={loading}
      variant={following ? "outline" : "default"}
      size={size}
      className={className}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : following ? (
        <>
          <UserMinus className="w-4 h-4 mr-2" />
          Unfollow
        </>
      ) : (
        <>
          <UserPlus className="w-4 h-4 mr-2" />
          Follow
        </>
      )}
    </Button>
  );
}
