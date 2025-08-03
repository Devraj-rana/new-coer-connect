import Image from "next/image";
import React from "react";
import ProfilePhoto from "./shared/ProfilePhoto";
import { User } from "@clerk/nextjs/server";

interface SidebarProps {
  user: User | null;
}

const Sidebar = ({ user }: SidebarProps) => {
  const userFullName = user ? `${user.firstName} ${user.lastName}` : "Guest User";
  const username = user?.username || "guest";

  return (
    <div className="surface overflow-hidden shadow-lg transition-all duration-200">
      {/* Profile Section */}
      <div className="relative">
        {/* Banner */}
        <div className="w-full h-20 gradient-bg">
          {user && (
            <Image
              src="/banner.jpg"
              alt="Profile Banner"
              width={300}
              height={80}
              className="w-full h-full object-cover mix-blend-overlay"
            />
          )}
        </div>
        
        {/* Profile Photo */}
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
          <div className="bg-background p-1 rounded-full shadow-lg">
            <ProfilePhoto src={user?.imageUrl || "/default-avator.png"} />
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="pt-8 pb-4 px-4 text-center border-b border-border">
        <h2 className="font-semibold text-foreground hover:text-primary cursor-pointer transition-colors">
          {userFullName}
        </h2>
        <p className="text-sm text-muted-foreground">@{username}</p>
      </div>

      {/* Stats */}
      <div className="p-4 space-y-1">
        <div className="flex justify-between items-center py-2 px-3 rounded-md hover:bg-accent cursor-pointer transition-colors">
          <span className="text-sm text-muted-foreground">Post Impressions</span>
          <span className="text-sm font-semibold text-primary">88</span>
        </div>
        <div className="flex justify-between items-center py-2 px-3 rounded-md hover:bg-accent cursor-pointer transition-colors">
          <span className="text-sm text-muted-foreground">Total Posts</span>
          <span className="text-sm font-semibold text-primary">12</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
