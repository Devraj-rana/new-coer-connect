"use server";

import { auth } from "@clerk/nextjs/server";
import connectToDatabase from "./db";
import Follow from "@/models/follow.model";
import { UserProfile } from "@/models/userProfile.model";

export async function followUser(followingId: string) {
  try {
    const { userId } = auth();
    if (!userId) {
      throw new Error("User not authenticated");
    }

    if (userId === followingId) {
      throw new Error("You cannot follow yourself");
    }

    await connectToDatabase();

    // Check if already following
    const existingFollow = await Follow.findOne({
      followerId: userId,
      followingId: followingId,
    });

    if (existingFollow) {
      throw new Error("Already following this user");
    }

    // Create follow relationship
    await Follow.create({
      followerId: userId,
      followingId: followingId,
    });

    return { success: true, message: "User followed successfully" };
  } catch (error: any) {
    console.error("Error following user:", error);
    throw new Error(error.message || "Failed to follow user");
  }
}

export async function unfollowUser(followingId: string) {
  try {
    const { userId } = auth();
    if (!userId) {
      throw new Error("User not authenticated");
    }

    await connectToDatabase();

    // Remove follow relationship
    const result = await Follow.findOneAndDelete({
      followerId: userId,
      followingId: followingId,
    });

    if (!result) {
      throw new Error("Follow relationship not found");
    }

    return { success: true, message: "User unfollowed successfully" };
  } catch (error: any) {
    console.error("Error unfollowing user:", error);
    throw new Error(error.message || "Failed to unfollow user");
  }
}

export async function isFollowing(followingId: string) {
  try {
    const { userId } = auth();
    if (!userId) {
      return false;
    }

    await connectToDatabase();

    const follow = await Follow.findOne({
      followerId: userId,
      followingId: followingId,
    });

    return !!follow;
  } catch (error) {
    console.error("Error checking follow status:", error);
    return false;
  }
}

export async function getFollowers(userId: string) {
  try {
    await connectToDatabase();

    const followers = await Follow.find({ followingId: userId })
      .populate({
        path: 'followerId',
        model: UserProfile,
        select: 'firstName lastName profilePhoto bio position company'
      });

    return followers.map(follow => ({
      id: follow.followerId,
      ...follow.followerId
    }));
  } catch (error) {
    console.error("Error getting followers:", error);
    return [];
  }
}

export async function getFollowing(userId: string) {
  try {
    await connectToDatabase();

    const following = await Follow.find({ followerId: userId })
      .populate({
        path: 'followingId',
        model: UserProfile,
        select: 'firstName lastName profilePhoto bio position company'
      });

    return following.map(follow => ({
      id: follow.followingId,
      ...follow.followingId
    }));
  } catch (error) {
    console.error("Error getting following:", error);
    return [];
  }
}

export async function getFollowCounts(userId: string) {
  try {
    await connectToDatabase();

    const [followersCount, followingCount] = await Promise.all([
      Follow.countDocuments({ followingId: userId }),
      Follow.countDocuments({ followerId: userId }),
    ]);

    return {
      followers: followersCount,
      following: followingCount,
    };
  } catch (error) {
    console.error("Error getting follow counts:", error);
    return {
      followers: 0,
      following: 0,
    };
  }
}

export async function getAllUsers(searchQuery?: string) {
  try {
    const { userId } = auth();
    
    await connectToDatabase();

    let query: any = {};
    
    // Exclude current user
    if (userId) {
      query.userId = { $ne: userId };
    }

    // Add search functionality
    if (searchQuery) {
      query.$or = [
        { firstName: { $regex: searchQuery, $options: 'i' } },
        { lastName: { $regex: searchQuery, $options: 'i' } },
        { company: { $regex: searchQuery, $options: 'i' } },
        { position: { $regex: searchQuery, $options: 'i' } },
      ];
    }

    const users = await UserProfile.find(query)
      .select('userId firstName lastName profilePhoto bio position company location skills role academicYear branch')
      .limit(50)
      .sort({ createdAt: -1 });

    // Get follow status for each user if current user is authenticated
    if (userId) {
      const followingList = await Follow.find({ followerId: userId }).select('followingId');
      const followingIds = followingList.map(f => f.followingId);
      
      const usersWithFollowStatus = users.map((user: any) => ({
        ...user.toObject(),
        isFollowing: followingIds.includes(user.userId),
      }));
      
      return usersWithFollowStatus;
    }

    return users.map((user: any) => user.toObject());
  } catch (error) {
    console.error("Error getting all users:", error);
    return [];
  }
}

export async function getUsersByRole(role: 'student' | 'teacher' | 'admin', searchQuery?: string) {
  try {
    const { userId } = auth();
    
    await connectToDatabase();

    let query: any = { role };
    
    // Exclude current user
    if (userId) {
      query.userId = { $ne: userId };
    }

    // Add search functionality
    if (searchQuery) {
      query.$or = [
        { firstName: { $regex: searchQuery, $options: 'i' } },
        { lastName: { $regex: searchQuery, $options: 'i' } },
        { company: { $regex: searchQuery, $options: 'i' } },
        { position: { $regex: searchQuery, $options: 'i' } },
        { skills: { $elemMatch: { $regex: searchQuery, $options: 'i' } } },
      ];
    }

    const users = await UserProfile.find(query)
      .select('userId firstName lastName profilePhoto bio position company location skills role academicYear branch')
      .limit(50)
      .sort({ createdAt: -1 });

    // Get follow status for each user if current user is authenticated
    if (userId) {
      const followingList = await Follow.find({ followerId: userId }).select('followingId');
      const followingIds = followingList.map(f => f.followingId);
      
      const usersWithFollowStatus = users.map((user: any) => ({
        ...user.toObject(),
        isFollowing: followingIds.includes(user.userId),
      }));
      
      return usersWithFollowStatus;
    }

    return users.map((user: any) => user.toObject());
  } catch (error) {
    console.error("Error getting users by role:", error);
    return [];
  }
}
