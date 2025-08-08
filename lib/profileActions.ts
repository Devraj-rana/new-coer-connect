"use server"

import { UserProfile, IUserProfile } from "@/models/userProfile.model";
import { currentUser } from "@clerk/nextjs/server";
import connectDB from "./db";
import { revalidatePath } from "next/cache";
import { Post } from "@/models/post.model";
import { Comment } from "@/models/comment.model";
import Follow from "@/models/follow.model";
import { Story } from "@/models/story.model";
import { sendEmail } from "./mailer";

// Check if user profile exists and is complete
export const checkUserProfile = async () => {
    try {
        await connectDB();
        const user = await currentUser();
        if (!user) return null;

        const profile = await UserProfile.findOne({ userId: user.id });
        return profile ? JSON.parse(JSON.stringify(profile)) : null;
    } catch (error) {
        console.error("Error checking user profile:", error);
        return null;
    }
};

// Create or update user profile during onboarding
export const createUserProfile = async (profileData: Partial<IUserProfile>) => {
    try {
        await connectDB();
        const user = await currentUser();
        if (!user) throw new Error("User not authenticated");

        // Check if profile already exists
        let profile = await UserProfile.findOne({ userId: user.id });

        const userData = {
            userId: user.id,
            firstName: profileData.firstName || user.firstName || "",
            lastName: profileData.lastName || user.lastName || "",
            email: profileData.email || user.emailAddresses[0]?.emailAddress || "",
            phone: profileData.phone || "",
            bio: profileData.bio || "",
            location: profileData.location || "",
            website: profileData.website || "",
            company: profileData.company || "",
            position: profileData.position || "",
            profilePhoto: profileData.profilePhoto || user.imageUrl || "/default-avator.png",
            role: profileData.role || 'student',
            academicYear: profileData.academicYear,
            branch: profileData.branch,
            skills: profileData.skills || [],
            socialLinks: profileData.socialLinks || {},
            isOnboardingComplete: true,
            isProfileComplete: true
        };

        if (profile) {
            // Update existing profile
            profile = await UserProfile.findOneAndUpdate(
                { userId: user.id },
                userData,
                { new: true }
            );
        } else {
            // Create new profile
            profile = await UserProfile.create(userData);
        }

        revalidatePath("/");
        return JSON.parse(JSON.stringify(profile));
    } catch (error: any) {
        console.error("Error creating user profile:", error);
        throw new Error(error.message || "Failed to create profile");
    }
};

// Update user profile
export const updateUserProfile = async (profileData: Partial<IUserProfile>) => {
    try {
        await connectDB();
        const user = await currentUser();
        if (!user) throw new Error("User not authenticated");

        const profile = await UserProfile.findOneAndUpdate(
            { userId: user.id },
            profileData,
            { new: true }
        );

        if (!profile) throw new Error("Profile not found");

        revalidatePath("/profile");
        revalidatePath("/");
        return JSON.parse(JSON.stringify(profile));
    } catch (error: any) {
        console.error("Error updating user profile:", error);
        throw new Error(error.message || "Failed to update profile");
    }
};

// Get user profile by ID
export const getUserProfile = async (userId?: string) => {
    try {
        await connectDB();
        const user = await currentUser();
        if (!user) throw new Error("User not authenticated");

        const targetUserId = userId || user.id;
        const profile = await UserProfile.findOne({ userId: targetUserId });
        
        if (!profile) return null;
        return JSON.parse(JSON.stringify(profile));
    } catch (error) {
        console.error("Error getting user profile:", error);
        return null;
    }
};

// Add education entry
export const addEducation = async (education: any) => {
    try {
        await connectDB();
        const user = await currentUser();
        if (!user) throw new Error("User not authenticated");

        const profile = await UserProfile.findOneAndUpdate(
            { userId: user.id },
            { $push: { education: education } },
            { new: true }
        );

        revalidatePath("/profile");
        return JSON.parse(JSON.stringify(profile));
    } catch (error: any) {
        throw new Error(error.message || "Failed to add education");
    }
};

// Add experience entry
export const addExperience = async (experience: any) => {
    try {
        await connectDB();
        const user = await currentUser();
        if (!user) throw new Error("User not authenticated");

        const profile = await UserProfile.findOneAndUpdate(
            { userId: user.id },
            { $push: { experience: experience } },
            { new: true }
        );

        revalidatePath("/profile");
        return JSON.parse(JSON.stringify(profile));
    } catch (error: any) {
        throw new Error(error.message || "Failed to add experience");
    }
};

export const setAccountPrivacy = async (isPrivate: boolean) => {
    try {
        await connectDB();
        const user = await currentUser();
        if (!user) throw new Error("User not authenticated");

        const profile = await UserProfile.findOneAndUpdate(
            { userId: user.id },
            { isPrivate },
            { new: true }
        );
        if (!profile) throw new Error("Profile not found");

        revalidatePath("/profile");
        revalidatePath("/");
        return JSON.parse(JSON.stringify(profile));
    } catch (error: any) {
        throw new Error(error.message || "Failed to update privacy");
    }
};

export const touchLastActive = async () => {
    try {
        await connectDB();
        const user = await currentUser();
        if (!user) return;
        await UserProfile.updateOne(
            { userId: user.id },
            { $set: { lastActiveAt: new Date() } }
        );
    } catch {
        // ignore
    }
};

export const scheduleAccountDeletion = async () => {
  await connectDB();
  const user = await currentUser();
  if (!user) throw new Error("User not authenticated");
  const now = new Date();
  const after = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const profile = await UserProfile.findOneAndUpdate(
    { userId: user.id },
    { isDeletionScheduled: true, deletionRequestedAt: now, deleteAfterAt: after, deletionReminderSent: false },
    { new: true }
  );
  if (!profile) throw new Error("Profile not found");
  revalidatePath('/profile');
  return JSON.parse(JSON.stringify(profile));
};

export const cancelAccountDeletion = async () => {
  await connectDB();
  const user = await currentUser();
  if (!user) throw new Error("User not authenticated");
  const profile = await UserProfile.findOneAndUpdate(
    { userId: user.id },
    { isDeletionScheduled: false, deletionRequestedAt: undefined, deleteAfterAt: undefined, deletionReminderSent: false },
    { new: true }
  );
  if (!profile) throw new Error("Profile not found");
  revalidatePath('/profile');
  return JSON.parse(JSON.stringify(profile));
};

// Hard delete after grace period
export const permanentlyDeleteUserData = async (userId?: string) => {
  await connectDB();
  let id = userId;
  if (!id) {
    const user = await currentUser();
    if (!user) throw new Error("User not authenticated");
    id = user.id;
  }
  // Remove user-generated content
  await Promise.all([
    Post.deleteMany({ 'user.userId': id }),
    Comment.deleteMany({ 'user.userId': id }),
    Follow.deleteMany({ $or: [{ followerId: id }, { followingId: id }] }),
    Story.deleteMany({ userId: id }),
  ]);
  await UserProfile.deleteOne({ userId: id });
  revalidatePath('/');
};

// Send reminder emails ~24h before deletion time
export const sendDeletionReminders = async () => {
  await connectDB();
  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  // Find users scheduled for deletion within the next 24h (±1h window) and not yet reminded
  const lower = new Date(in24h.getTime() - 60 * 60 * 1000);
  const upper = new Date(in24h.getTime() + 60 * 60 * 1000);
  const toRemind = await UserProfile.find({
    isDeletionScheduled: true,
    deletionReminderSent: { $ne: true },
    deleteAfterAt: { $gte: lower, $lte: upper },
  }).lean();

  for (const p of toRemind) {
    try {
      await sendEmail({
        to: p.email,
        subject: "Your account is scheduled for deletion in 24 hours",
        text: `Hi ${p.firstName},\n\nYour account is scheduled to be permanently deleted on ${p.deleteAfterAt?.toLocaleString?.() || p.deleteAfterAt}. If this was a mistake, you can cancel deletion from your profile page before the deadline.\n\n— Team`,
      });
      await UserProfile.updateOne({ userId: p.userId }, { $set: { deletionReminderSent: true } });
    } catch (e) {
      console.error('Failed to send deletion reminder', p.userId, e);
    }
  }
};

// Cleanup job: delete any profiles past deleteAfterAt
export const purgeScheduledDeletions = async () => {
  await connectDB();
  // Also attempt to send reminders each time this job runs
  try { await sendDeletionReminders(); } catch {}
  const due = await UserProfile.find({ isDeletionScheduled: true, deleteAfterAt: { $lte: new Date() } }).select('userId').lean();
  for (const p of due) {
    await permanentlyDeleteUserData(p.userId);
  }
};
