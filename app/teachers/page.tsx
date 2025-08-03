"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { getUsersByRole } from "@/lib/followActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import RoleBadge from "@/components/RoleBadge";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import FollowButton from "@/components/FollowButton";
import { 
  Search, 
  MapPin, 
  Building, 
  GraduationCap,
  Briefcase,
  Mail,
  Users,
  BookOpen
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
  role: string;
  academicYear?: '1st' | '2nd' | '3rd' | '4th';
  branch?: 'BCA' | 'B.Tech' | 'MCA' | 'M.Tech' | 'BBA' | 'MBA' | 'BSc' | 'MSc' | 'Other';
  isFollowing?: boolean;
}

export default function TeachersPage() {
  const { user } = useUser();
  const [teachers, setTeachers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadTeachersData = async () => {
      try {
        setLoading(true);
        const teachersData = await getUsersByRole('teacher', searchQuery);
        setTeachers(teachersData);
      } catch (error) {
        console.error("Error loading teachers:", error);
        toast.error("Failed to load teachers");
      } finally {
        setLoading(false);
      }
    };

    loadTeachersData();
  }, [searchQuery]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading teachers...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <GraduationCap className="w-8 h-8 text-green-600" />
            <h1 className="text-3xl font-bold text-gray-900">Teachers</h1>
          </div>
          <p className="text-gray-600 mb-6">
            Connect with educators and mentors in the COER community
          </p>

          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search teachers by name, subject, or institution..."
              value={searchQuery}
              onChange={handleSearch}
              className="pl-10 pr-4 py-2 w-full"
            />
          </div>
        </div>

        {/* Teachers Grid */}
        {teachers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teachers.map((teacher) => (
              <Card key={teacher.userId} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Image
                          src={teacher.profilePhoto}
                          alt={`${teacher.firstName} ${teacher.lastName}`}
                          width={64}
                          height={64}
                          className="w-16 h-16 rounded-full object-cover border-2 border-green-200"
                        />
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
                        <div className="absolute -top-1 -left-1">
                          <RoleBadge role="teacher" size="sm" />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <Link 
                          href={`/profile/${teacher.userId}`}
                          className="hover:text-green-600 transition-colors"
                        >
                          <h3 className="font-semibold text-lg text-gray-900 truncate">
                            {teacher.firstName} {teacher.lastName}
                          </h3>
                        </Link>
                        
                        {teacher.position && (
                          <p className="text-green-600 text-sm font-medium truncate">
                            {teacher.position}
                          </p>
                        )}
                        
                        {teacher.company && (
                          <div className="flex items-center gap-1 mt-1">
                            <Building className="w-3 h-3 text-gray-400" />
                            <p className="text-gray-600 text-xs truncate">
                              {teacher.company}
                            </p>
                          </div>
                        )}
                        
                        {teacher.location && (
                          <div className="flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3 text-gray-400" />
                            <p className="text-gray-500 text-xs truncate">
                              {teacher.location}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  {/* Bio */}
                  {teacher.bio && (
                    <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                      {teacher.bio}
                    </p>
                  )}

                  {/* Skills */}
                  {teacher.skills && teacher.skills.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {teacher.skills.slice(0, 3).map((skill, index) => (
                          <Badge key={index} variant="secondary" className="text-xs px-2 py-1 bg-green-100 text-green-800">
                            {skill}
                          </Badge>
                        ))}
                        {teacher.skills.length > 3 && (
                          <Badge variant="outline" className="text-xs px-2 py-1">
                            +{teacher.skills.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    {user && user.id !== teacher.userId && (
                      <FollowButton
                        userId={teacher.userId}
                        size="sm"
                        className="flex-1"
                      />
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="flex-1"
                    >
                      <Link href={`/profile/${teacher.userId}`}>
                        <BookOpen className="w-4 h-4 mr-2" />
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
            <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {searchQuery ? "No teachers found" : "No teachers available"}
            </h3>
            <p className="text-gray-500">
              {searchQuery 
                ? "Try adjusting your search terms"
                : "Teachers will appear here once they complete their profiles!"
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
