"use server";

import { Story, IStory } from "@/models/story.model";
import { UserProfile } from "@/models/userProfile.model";
import Follow from "@/models/follow.model";
import connectDB from "./db";
import { currentUser } from "@clerk/nextjs/server";

// Create story (expires in 24h)
export const createStory = async (data: { mediaUrl: string; type: 'image'|'video'; textOverlay?: string; }) => {
  await connectDB();
  const user = await currentUser();
  if (!user) throw new Error("Not authenticated");

  const profile = await UserProfile.findOne({ userId: user.id });
  if (!profile) throw new Error("Profile not found");

  const now = new Date();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const story = await Story.create({
    userId: user.id,
    mediaUrl: data.mediaUrl,
    type: data.type,
    textOverlay: data.textOverlay || '',
    expiresAt,
    viewers: [],
    isPrivateAtCreation: !!profile.isPrivate,
  } as IStory);
  return JSON.parse(JSON.stringify(story));
};

// Get feed: own stories + followed users' stories, respecting privacy
export const getStoriesFeed = async () => {
  await connectDB();
  const user = await currentUser();
  if (!user) throw new Error("Not authenticated");

  const following = await Follow.find({ followerId: user.id }).select('followingId');
  const followingIds = following.map((f:any)=> f.followingId);
  const visibleUserIds = [user.id, ...followingIds];

  const stories = await Story.find({
    userId: { $in: visibleUserIds },
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 }).lean();

  // Filter out private users if viewer is not a follower
  const profiles = await UserProfile.find({ userId: { $in: stories.map(s=>s.userId) } }).lean();
  const profileMap = new Map(profiles.map((p:any)=>[p.userId,p]));

  const allowed = stories.filter((s:any)=>{
    if (s.userId === user.id) return true;
    const p:any = profileMap.get(s.userId);
    if (!p) return false;
    if (!p.isPrivate) return true;
    return followingIds.includes(s.userId);
  });

  return allowed;
};

// Record viewer
export const addViewer = async (storyId: string) => {
  await connectDB();
  const user = await currentUser();
  if (!user) throw new Error("Not authenticated");
  await Story.updateOne(
    { _id: storyId, 'viewers.userId': { $ne: user.id } },
    { $push: { viewers: { userId: user.id, viewedAt: new Date() } } }
  );
};

// Cleanup expired stories (call from cron or on demand)
export const deleteExpiredStories = async () => {
  await connectDB();
  await Story.deleteMany({ expiresAt: { $lte: new Date() } });
};
