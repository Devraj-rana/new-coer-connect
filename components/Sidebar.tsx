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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Profile Section */}
      <div className="relative">
        {/* Banner */}
        <div className="w-full h-20 bg-gradient-to-r from-blue-600 to-indigo-800">
          {user && (
            <Image
              src="/banner.jpg"
              alt="Profile Banner"
              width={300}
              height={80}
              className="w-full h-full object-cover"
            />
          )}
        </div>
        
        {/* Profile Photo */}
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
          <div className="bg-white p-1 rounded-full">
            <ProfilePhoto src={user?.imageUrl || "/default-avator.png"} />
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="pt-8 pb-4 px-4 text-center border-b border-gray-200">
        <h2 className="font-semibold text-gray-900 hover:text-blue-600 cursor-pointer transition-colors">
          {userFullName}
        </h2>
        <p className="text-sm text-gray-500">@{username}</p>
      </div>

      {/* Stats */}
      <div className="p-4 space-y-1">
        <div className="flex justify-between items-center py-2 px-3 rounded-md hover:bg-gray-50 cursor-pointer transition-colors">
          <span className="text-sm text-gray-600">Post Impressions</span>
          <span className="text-sm font-semibold text-blue-600">88</span>
        </div>
        <div className="flex justify-between items-center py-2 px-3 rounded-md hover:bg-gray-50 cursor-pointer transition-colors">
          <span className="text-sm text-gray-600">Total Posts</span>
          <span className="text-sm font-semibold text-blue-600">12</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
