"use client";
import React from "react";
import ProfilePhoto from "./shared/ProfilePhoto";
import { useUser } from "@clerk/nextjs";
import { Button } from "./ui/button";
import { Trash2, ShieldAlert } from "lucide-react";
import { Badge } from "./ui/badge";
import PostContent from "./PostContent";
import SocialOptions from "./SocialOptions";
import ReactTimeago from "react-timeago";
import { deletePostAction, adminDeletePostAction } from "@/lib/serveractions";
import { toast } from "sonner";
import { isUserAdmin } from "@/lib/admin";

interface PostData {
  _id: string;
  userId: string;
  firstName: string;
  lastName: string;
  username: string;
  content: string;
  description: string;
  imageUrl?: string;
  profilePhoto: string;
  createdAt: Date;
  likes: string[];
  comments: any[];
  user: {
    userId: string;
    firstName: string;
    lastName: string;
    profilePhoto: string;
  };
}

const Post = ({ post }: { post: PostData }) => {
  const { user } = useUser();
  const fullName = `${post.firstName} ${post.lastName}`;
  const loggedInUser = user?.id === post.userId;
  
  // Check if current user is admin by username
  const isAdmin = isUserAdmin(user?.username || undefined);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post?")) {
      return;
    }
    
    try {
      await deletePostAction(post._id);
      toast.success("Post deleted successfully!");
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error(error.message || "Failed to delete post");
    }
  };

  const handleAdminDelete = async () => {
    if (!confirm("Are you sure you want to delete this post as admin? This action cannot be undone.")) {
      return;
    }
    
    try {
      await adminDeletePostAction(post._id);
      toast.success("Post deleted by admin!");
    } catch (error: any) {
      console.error("Admin delete error:", error);
      toast.error(error.message || "Failed to delete post");
    }
  };

  return (
    <div className="bg-white my-2 mx-2 md:mx-0 rounded-lg border border-gray-300">
      <div className="flex gap-2 p-4">
        <ProfilePhoto src={post.profilePhoto} />
        <div className="flex items-center justify-between w-full">
          <div>
            <h1 className="text-sm font-bold">
              {fullName}{" "}
              {loggedInUser && (
                <Badge variant={"secondary"} className="ml-2">
                  You
                </Badge>
              )}
              {isAdmin && (
                <Badge variant={"destructive"} className="ml-2">
                  Admin
                </Badge>
              )}
            </h1>
            <p className="text-xs text-gray-500">
              @{post.username}
            </p>

            <p className="text-xs text-gray-500">
              <ReactTimeago date={new Date(post.createdAt)} />
            </p>
          </div>
        </div>
        <div>
          {loggedInUser && (
            <Button
              onClick={handleDelete}
              size={"icon"}
              className="rounded-full"
              variant={"outline"}
            >
              <Trash2 />
            </Button>
          )}
          {!loggedInUser && isAdmin && (
            <Button
              onClick={handleAdminDelete}
              size={"icon"}
              className="rounded-full bg-red-500 hover:bg-red-600 text-white"
              variant={"outline"}
              title="Admin Delete"
            >
              <ShieldAlert />
            </Button>
          )}
        </div>
      </div>
      <PostContent post={post} />
      <SocialOptions post={post} />
    </div>
  );
};

export default Post;
