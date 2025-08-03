"use client";
import React, { useState } from "react";
import ProfilePhoto from "./shared/ProfilePhoto";
import { Input } from "./ui/input";
import { PostDialog } from "./PostDialog";
import { toast } from "sonner";
import { PenLine } from "lucide-react";

interface PostInputProps {
  user: any;
}

const PostInput = ({ user }: PostInputProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const handleInputClick = () => {
    if (!user) {
      toast.error("Please sign in to create a post");
      return;
    }
    setIsDialogOpen(true);
  };

  const userFullName = user ? `${user.firstName} ${user.lastName}` : "Guest User";
  const userImage = user?.imageUrl || "/default-avator.png";

  return (
    <div className="surface p-4 rounded-lg shadow-sm border">
      <div className="flex items-center gap-3">
        <ProfilePhoto src={userImage} />
        
        <Input
          type="text"
          placeholder="What's on your mind?"
          className="flex-1 rounded-full surface-secondary hover:surface-tertiary h-12 cursor-pointer transition-colors"
          onClick={handleInputClick}
          readOnly
        />
        
        <button
          onClick={handleInputClick}
          className="bg-blue-600 hover:bg-blue-700 p-3 rounded-full text-white transition-colors"
          aria-label="Create post"
        >
          <PenLine size={18} />
        </button>
      </div>

      <PostDialog
        setOpen={setIsDialogOpen}
        open={isDialogOpen}
        src={userImage}
        fullName={userFullName}
      />
    </div>
  );
};

export default PostInput;
