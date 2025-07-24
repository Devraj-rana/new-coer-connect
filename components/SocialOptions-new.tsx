import React, { useState } from "react";
import { Button } from "./ui/button";
import { MessageCircleMore, Repeat, Send, ThumbsUp } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import CommentInput from "./CommentInput";
import Comments from "./Comments";

interface PostData {
  _id: string;
  userId: string;
  firstName: string;
  lastName: string;
  username: string;
  content: string;
  imageUrl?: string;
  profilePhoto: string;
  createdAt: Date;
  likes: string[];
  comments: any[];
}

const SocialOptions = ({ post }: { post: PostData }) => {
  const { user } = useUser();
  const [liked, setLiked] = useState(post.likes?.includes(user?.id || ''));
  const [likes, setLikes] = useState(post.likes || []);
  const [commentOpen, setCommentOpen] = useState(false);

  const likeOrDislikeHandler = async () => {
    if (!user) {
      console.log("User not authenticated");
      return;
    }

    // Mock like/unlike functionality
    const isLiked = likes.includes(user.id);
    if (isLiked) {
      setLikes(likes.filter(id => id !== user.id));
      setLiked(false);
    } else {
      setLikes([...likes, user.id]);
      setLiked(true);
    }
  };

  return (
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
      >
        <Repeat className="w-4 h-4" />
        <span className="text-xs">Share</span>
      </Button>

      <Button
        variant="ghost"
        className="flex items-center space-x-1 text-gray-500 hover:text-blue-600"
      >
        <Send className="w-4 h-4" />
        <span className="text-xs">Send</span>
      </Button>
    </div>
  );
};

export default SocialOptions;
