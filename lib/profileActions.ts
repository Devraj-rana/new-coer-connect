"use server"

import { UserProfile, IUserProfile } from "@/models/userProfile.model";
import { currentUser } from "@clerk/nextjs/server";
import connectDB from "./db";
import { revalidatePath } from "next/cache";

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
