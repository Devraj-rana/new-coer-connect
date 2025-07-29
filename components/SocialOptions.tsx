import React, { useState } from "react";
import { Button } from "./ui/button";
import { MessageCircleMore, Repeat, Send, ThumbsUp } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import CommentInput from "./CommentInput";
import Comment from "./Comment";
import { likePostAction, sharePostAction, sendPostAction } from "@/lib/serveractions";
import { toast } from "sonner";

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

const SocialOptions = ({ post }: { post: PostData }) => {
  const { user } = useUser();
  const [liked, setLiked] = useState(post.likes?.includes(user?.id || ''));
  const [likes, setLikes] = useState(post.likes || []);
  const [commentOpen, setCommentOpen] = useState(false);

  const likeOrDislikeHandler = async () => {
    if (!user) {
      toast.error("Please sign in to like posts");
      return;
    }

    try {
      const result = await likePostAction(post._id);
      setLiked(result.isLiked);
      
      // Update local state for immediate feedback
      if (result.isLiked) {
        setLikes([...likes.filter(id => id !== user.id), user.id]);
        toast.success("Post liked!");
      } else {
        setLikes(likes.filter(id => id !== user.id));
        toast.success("Post unliked!");
      }
    } catch (error: any) {
      console.error("Like error:", error);
      toast.error("Failed to like post");
    }
  };

  const shareHandler = async () => {
    if (!user) {
      toast.error("Please sign in to share posts");
      return;
    }

    const shareText = prompt("Add a comment to your share (optional):");
    if (shareText === null) return; // User cancelled

    try {
      await sharePostAction(post._id, shareText);
      toast.success("Post shared successfully!");
    } catch (error: any) {
      console.error("Share error:", error);
      toast.error("Failed to share post");
    }
  };

  const sendHandler = async () => {
    if (!user) {
      toast.error("Please sign in to send posts");
      return;
    }

    // Simplified send - in a real app you'd have a user selector
    const recipientId = prompt("Enter recipient user ID (simplified demo):");
    if (!recipientId) return;

    const message = prompt("Add a message (optional):");

    try {
      await sendPostAction(post._id, recipientId, message || undefined);
      toast.success("Post sent successfully!");
    } catch (error: any) {
      console.error("Send error:", error);
      toast.error("Failed to send post");
    }
  };

  return (
    <>
      <div className="flex justify-between items-center px-4 py-2 border-t border-gray-200">
        <Button
          variant="ghost"
          className={`flex items-center space-x-1 ${
            liked ? "text-blue-600" : "text-gray-500"
          } hover:text-blue-600`}
          onClick={likeOrDislikeHandler}
        >
          <ThumbsUp className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
          <span className="text-xs">{likes.length}</span>
        </Button>

        <Button
          variant="ghost"
          className="flex items-center space-x-1 text-gray-500 hover:text-blue-600"
          onClick={() => setCommentOpen(!commentOpen)}
        >
          <MessageCircleMore className="w-4 h-4" />
          <span className="text-xs">{post.comments?.length || 0}</span>
        </Button>

        <Button
          variant="ghost"
          className="flex items-center space-x-1 text-gray-500 hover:text-blue-600"
          onClick={shareHandler}
        >
          <Repeat className="w-4 h-4" />
          <span className="text-xs">Share</span>
        </Button>

        <Button
          variant="ghost"
          className="flex items-center space-x-1 text-gray-500 hover:text-blue-600"
          onClick={sendHandler}
        >
          <Send className="w-4 h-4" />
          <span className="text-xs">Send</span>
        </Button>
      </div>
      
      {commentOpen && (
        <div className="px-4 pb-4">
          <CommentInput postId={post._id} />
          <div className="mt-4 space-y-2">
            {post.comments?.map((comment: any) => (
              <Comment 
                key={comment._id} 
                comment={comment} 
                postId={post._id}
              />
            ))}
            {(!post.comments || post.comments.length === 0) && (
              <p className="text-gray-500 text-sm text-center py-4">No comments yet. Be the first to comment!</p>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default SocialOptions;
