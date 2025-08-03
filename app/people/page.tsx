"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { getAllUsers, followUser, unfollowUser } from "@/lib/followActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import RoleBadge from "@/components/RoleBadge";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import { 
  Search, 
  MapPin, 
  Building, 
  UserPlus, 
  UserMinus, 
  Users,
  Briefcase,
  Mail
} from "lucide-react";

interface UserData {
  _id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePhoto: string;
  bio?: string;
  position?: string;
  company?: string;
  location?: string;
  skills?: string[];
  role?: 'student' | 'teacher' | 'admin';
  academicYear?: '1st' | '2nd' | '3rd' | '4th';
  branch?: 'BCA' | 'B.Tech' | 'MCA' | 'M.Tech' | 'BBA' | 'MBA' | 'BSc' | 'MSc' | 'Other';
  isFollowing?: boolean;
}

export default function PeoplePage() {
  const { user } = useUser();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [followingStates, setFollowingStates] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const loadUsersDebounced = async () => {
      try {
        setLoading(true);
        const usersData = await getAllUsers(searchQuery);
        setUsers(usersData);
        
        // Initialize following states
        const states: Record<string, boolean> = {};
        usersData.forEach((userData: any) => {
          states[userData.userId] = userData.isFollowing || false;
        });
        setFollowingStates(states);
      } catch (error) {
        console.error("Error loading users:", error);
        toast.error("Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    loadUsersDebounced();
  }, [searchQuery]);

  const handleFollow = async (userId: string) => {
    try {
      await followUser(userId);
      setFollowingStates(prev => ({ ...prev, [userId]: true }));
      toast.success("User followed successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to follow user");
    }
  };

  const handleUnfollow = async (userId: string) => {
    try {
      await unfollowUser(userId);
      setFollowingStates(prev => ({ ...prev, [userId]: false }));
      toast.success("User unfollowed successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to unfollow user");
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading people...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Discover People</h1>
          </div>
          <p className="text-gray-600 mb-6">
            Connect with professionals in the COER community
          </p>

          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search people by name, company, or position..."
              value={searchQuery}
              onChange={handleSearch}
              className="pl-10 pr-4 py-2 w-full"
            />
          </div>
        </div>

        {/* Users Grid */}
        {users.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((userData) => (
              <Card key={userData.userId} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Image
                          src={userData.profilePhoto}
                          alt={`${userData.firstName} ${userData.lastName}`}
                          width={64}
                          height={64}
                          className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                        />
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Link 
                            href={`/profile/${userData.userId}`}
                            className="hover:text-blue-600 transition-colors"
                          >
                            <h3 className="font-semibold text-lg text-gray-900 truncate">
                              {userData.firstName} {userData.lastName}
                            </h3>
                          </Link>
                          {userData.role && (
                            <RoleBadge 
                              role={userData.role} 
                              academicYear={userData.academicYear}
                              branch={userData.branch}
                              size="sm"
                            />
                          )}
                        </div>
                        
                        {userData.position && (
                          <p className="text-blue-600 text-sm font-medium truncate">
                            {userData.position}
                          </p>
                        )}
                        
                        {userData.company && (
                          <div className="flex items-center gap-1 mt-1">
                            <Building className="w-3 h-3 text-gray-400" />
                            <p className="text-gray-600 text-xs truncate">
                              {userData.company}
                            </p>
                          </div>
                        )}
                        
                        {userData.location && (
                          <div className="flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3 text-gray-400" />
                            <p className="text-gray-500 text-xs truncate">
                              {userData.location}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  {/* Bio */}
                  {userData.bio && (
                    <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                      {userData.bio}
                    </p>
                  )}

                  {/* Skills */}
                  {userData.skills && userData.skills.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {userData.skills.slice(0, 3).map((skill, index) => (
                          <Badge key={index} variant="secondary" className="text-xs px-2 py-1">
                            {skill}
                          </Badge>
                        ))}
                        {userData.skills.length > 3 && (
                          <Badge variant="outline" className="text-xs px-2 py-1">
                            +{userData.skills.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    {user && user.id !== userData.userId && (
                      <Button
                        onClick={() => 
                          followingStates[userData.userId] 
                            ? handleUnfollow(userData.userId)
                            : handleFollow(userData.userId)
                        }
                        variant={followingStates[userData.userId] ? "outline" : "default"}
                        size="sm"
                        className="flex-1"
                      >
                        {followingStates[userData.userId] ? (
                          <>
                            <UserMinus className="w-4 h-4 mr-2" />
                            Unfollow
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4 mr-2" />
                            Follow
                          </>
                        )}
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="flex-1"
                    >
                      <Link href={`/profile/${userData.userId}`}>
                        <Briefcase className="w-4 h-4 mr-2" />
                        View Profile
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {searchQuery ? "No people found" : "No users available"}
            </h3>
            <p className="text-gray-500">
              {searchQuery 
                ? "Try adjusting your search terms"
                : "Be the first to complete your profile and connect with others!"
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
