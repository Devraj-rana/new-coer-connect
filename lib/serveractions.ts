"use server"

import { Post } from "@/models/post.model";
import { IUser } from "@/models/user.model";
import { currentUser } from "@clerk/nextjs/server"
import connectDB from "./db";
import { revalidatePath } from "next/cache";
import { Comment } from "@/models/comment.model";
import { ADMIN_USERNAMES } from "./admin";

// creating post using server actions
export const createPostAction = async (inputText: string, selectedFile: string) => {
    await connectDB();
    const user = await currentUser();
    if (!user) throw new Error('User not authenticated');
    if (!inputText) throw new Error('Input field is required');

    const userDatabase: IUser = {
        firstName: user.firstName || "Patel",
        lastName: user.lastName || "Mern Stack",
        userId: user.id,
        profilePhoto: user.imageUrl
    }

    try {
        if (selectedFile) {
            // 1. Create post with image stored directly in MongoDB
            await Post.create({
                description: inputText,
                user: userDatabase,
                imageUrl: selectedFile // Store Base64 image data directly
            })
        } else {
            // 2. Create post with text only
            await Post.create({
                description: inputText,
                user: userDatabase
            })
        }
        revalidatePath("/");
    } catch (error: any) {
        throw new Error(error);
    }
}
// get all post using server actions
export const getAllPosts = async () => {
    try {
        await connectDB();
        // Get all posts from all users (public feed)
        const posts = await Post.find().sort({ createdAt: -1 }).populate({ path: 'comments', options: { sort: { createdAt: -1 } } });
        if(!posts) return [];
        return JSON.parse(JSON.stringify(posts));
    } catch (error) {
        console.log(error);
    }
}

// get posts by specific user
export const getUserPosts = async (userId?: string) => {
    try {
        await connectDB();
        const user = await currentUser();
        if (!user) throw new Error('User not authenticated');
        
        // Use provided userId or current user's ID
        const targetUserId = userId || user.id;
        
        // Get posts from specific user
        const posts = await Post.find({ 'user.userId': targetUserId })
            .sort({ createdAt: -1 })
            .populate({ path: 'comments', options: { sort: { createdAt: -1 } } });
        
        if (!posts) return [];
        return JSON.parse(JSON.stringify(posts));
    } catch (error) {
        console.log(error);
        return [];
    }
}

// delete post by id
export const deletePostAction = async (postId: string) => {
    await connectDB();
    const user = await currentUser();
    if (!user) throw new Error('User not authenticated.');
    const post = await Post.findById(postId);
    if (!post) throw new Error('Post not found.');

    // Only the post owner can delete their own post
    if (post.user.userId !== user.id) {
        throw new Error('You are not the owner of this post.');
    }
    try {
        await Post.deleteOne({ _id: postId });
        revalidatePath("/");
    } catch (error: any) {
        throw new Error('An error occurred while deleting the post.');
    }
}

// Admin delete function for inappropriate content
export const adminDeletePostAction = async (postId: string) => {
    await connectDB();
    const user = await currentUser();
    if (!user) throw new Error('User not authenticated.');
    
    // Check if user is admin by username
    const isAdmin = user.username && ADMIN_USERNAMES.includes(user.username.toLowerCase());
    
    if (!isAdmin) {
        throw new Error('Admin access required.');
    }
    
    try {
        const post = await Post.findById(postId);
        if (!post) throw new Error('Post not found.');
        
        await Post.deleteOne({ _id: postId });
        revalidatePath("/");
    } catch (error: any) {
        throw new Error('An error occurred while deleting the post.');
    }
}

export const createCommentAction = async (postId: string, formData: FormData) => {
    try {
        const user = await currentUser();
        if (!user) throw new Error("User not authenticated");
        const inputText = formData.get('inputText') as string;
        if (!inputText) throw new Error("Field is required");
        if (!postId) throw new Error("Post id required");

        const userDatabase: IUser = {
            firstName: user.firstName || "Patel",
            lastName: user.lastName || "Mern Stack",
            userId: user.id,
            profilePhoto: user.imageUrl
        }
        const post = await Post.findById({ _id: postId });
        if (!post) throw new Error('Post not found');

        const comment = await Comment.create({
            textMessage: inputText,
            user: userDatabase,
        });

        post.comments?.push(comment._id);
        await post.save();

        revalidatePath("/");
    } catch (error) {
        throw new Error('An error occurred')
    }
}

// Delete comment by id
export const deleteCommentAction = async (commentId: string, postId: string) => {
    try {
        await connectDB();
        const user = await currentUser();
        if (!user) throw new Error('User not authenticated.');
        
        const comment = await Comment.findById(commentId);
        if (!comment) throw new Error('Comment not found.');

        // Check if user is the comment owner or admin
        const isOwner = comment.user.userId === user.id;
        const isAdmin = user.username && ADMIN_USERNAMES.includes(user.username.toLowerCase()) || 
                       (user.username && ADMIN_USERNAMES.includes(`@${user.username.toLowerCase()}`));
        
        if (!isOwner && !isAdmin) {
            throw new Error('You can only delete your own comments.');
        }

        // Delete the comment
        await Comment.deleteOne({ _id: commentId });
        
        // Remove comment reference from post
        await Post.findByIdAndUpdate(postId, {
            $pull: { comments: commentId }
        });

        revalidatePath("/");
    } catch (error: any) {
        throw new Error('An error occurred while deleting the comment.');
    }
}

// Like or unlike post
export const likePostAction = async (postId: string) => {
    try {
        await connectDB();
        const user = await currentUser();
        if (!user) throw new Error("User not authenticated");

        const post = await Post.findById(postId);
        if (!post) throw new Error('Post not found');

        const isLiked = post.likes?.includes(user.id);
        
        if (isLiked) {
            // Unlike the post
            post.likes = post.likes?.filter(id => id !== user.id) || [];
        } else {
            // Like the post
            post.likes = post.likes || [];
            post.likes.push(user.id);
        }

        await post.save();
        revalidatePath("/");
        return { success: true, isLiked: !isLiked, likesCount: post.likes.length };
    } catch (error: any) {
        throw new Error('An error occurred while liking the post');
    }
}

// Share post functionality
export const sharePostAction = async (postId: string, shareText?: string) => {
    try {
        await connectDB();
        const user = await currentUser();
        if (!user) throw new Error("User not authenticated");

        const originalPost = await Post.findById(postId);
        if (!originalPost) throw new Error('Post not found');

        const userDatabase: IUser = {
            firstName: user.firstName || "Patel",
            lastName: user.lastName || "Mern Stack",
            userId: user.id,
            profilePhoto: user.imageUrl
        }

        // Create a new post as a share
        const sharedPost = await Post.create({
            description: shareText || `Shared: ${originalPost.description}`,
            user: userDatabase,
            imageUrl: originalPost.imageUrl,
            sharedFrom: originalPost._id // Reference to original post
        });

        revalidatePath("/");
        return { success: true, message: "Post shared successfully!" };
    } catch (error: any) {
        throw new Error('An error occurred while sharing the post');
    }
}

// Send post to specific user (simplified version - could be extended to messaging system)
export const sendPostAction = async (postId: string, recipientId: string, message?: string) => {
    try {
        await connectDB();
        const user = await currentUser();
        if (!user) throw new Error("User not authenticated");

        const post = await Post.findById(postId);
        if (!post) throw new Error('Post not found');

        // In a real app, you'd have a messages/notifications collection
        // For now, we'll just log this action or create a notification
        console.log(`User ${user.id} sent post ${postId} to ${recipientId} with message: ${message}`);
        
        // You could create a notification/message document here
        // For simplicity, we'll just return success
        return { success: true, message: "Post sent successfully!" };
    } catch (error: any) {
        throw new Error('An error occurred while sending the post');
    }
}