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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">Connect with Teachers</h1>
          </div>
          <p className="text-lg text-muted-foreground mb-6">
            Discover and connect with experienced educators and mentors in the COER community
          </p>

          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="Search teachers by name, subject, or expertise..."
              value={searchQuery}
              onChange={handleSearch}
              className="pl-10 pr-4 py-2 w-full"
            />
          </div>
        </div>

        {/* Teachers Grid */}
        {teachers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teachers.map((teacher) => (
              <Card key={teacher.userId} className="group relative overflow-hidden surface hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 border-0 rounded-2xl">
                {/* Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Header with Enhanced Profile */}
                <CardHeader className="pb-4 relative z-10">
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <div className="relative overflow-hidden rounded-2xl">
                        <Image
                          src={teacher.profilePhoto}
                          alt={`${teacher.firstName} ${teacher.lastName}`}
                          width={80}
                          height={80}
                          className="w-20 h-20 object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-green-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                      
                      {/* Status Indicator */}
                      <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-gradient-to-r from-emerald-400 to-green-500 border-3 border-white rounded-full shadow-lg flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      </div>
                      
                      {/* Role Badge */}
                      <div className="absolute -top-2 -left-2">
                        <RoleBadge role="teacher" size="sm" />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <Link 
                        href={`/profile/${teacher.userId}`}
                        className="group/link block"
                      >
                        <h3 className="font-bold text-xl text-foreground group-hover/link:text-primary transition-colors duration-200 truncate">
                          {teacher.firstName} {teacher.lastName}
                        </h3>
                      </Link>
                      
                      {teacher.position && (
                        <div className="flex items-center gap-2 mt-1">
                          <GraduationCap className="w-4 h-4 text-emerald-600" />
                          <p className="text-emerald-600 text-sm font-semibold truncate">
                            {teacher.position}
                          </p>
                        </div>
                      )}
                      
                      {teacher.company && (
                        <div className="flex items-center gap-2 mt-2">
                          <Building className="w-4 h-4 text-muted-foreground" />
                          <p className="text-muted-foreground text-sm truncate">
                            {teacher.company}
                          </p>
                        </div>
                      )}
                      
                      {teacher.location && (
                        <div className="flex items-center gap-2 mt-1">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <p className="text-muted-foreground text-sm truncate">
                            {teacher.location}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0 relative z-10">
                  {/* Bio Section */}
                  {teacher.bio && (
                    <div className="mb-6">
                      <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                        {teacher.bio}
                      </p>
                    </div>
                  )}

                  {/* Skills Section */}
                  {teacher.skills && teacher.skills.length > 0 && (
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <BookOpen className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm font-semibold text-foreground">Expertise</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {teacher.skills.slice(0, 4).map((skill, index) => (
                          <Badge 
                            key={index} 
                            variant="secondary" 
                            className="text-xs px-3 py-1.5 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-700 dark:text-green-300 border-0 rounded-full hover:shadow-md transition-shadow duration-200"
                          >
                            {skill}
                          </Badge>
                        ))}
                        {teacher.skills.length > 4 && (
                          <Badge 
                            variant="outline" 
                            className="text-xs px-3 py-1.5 border-dashed border-emerald-500/30 text-emerald-600 rounded-full"
                          >
                            +{teacher.skills.length - 4}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-border/50">
                    {user && user.id !== teacher.userId && (
                      <FollowButton
                        userId={teacher.userId}
                        size="sm"
                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 border-0 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                      />
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="flex-1 border-emerald-500/20 hover:bg-emerald-500/5 hover:border-emerald-500/40 transition-all duration-200"
                    >
                      <Link href={`/profile/${teacher.userId}`}>
                        <BookOpen className="w-4 h-4 mr-2" />
                        View Profile
                      </Link>
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="px-3 hover:bg-emerald-500/10 transition-colors duration-200"
                    >
                      <Mail className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="mx-auto w-32 h-32 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-full flex items-center justify-center mb-6">
              <GraduationCap className="w-16 h-16 text-emerald-600" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No teachers found</h3>
            <p className="text-muted-foreground">
              {searchQuery 
                ? "Try adjusting your search terms to find teachers" 
                : "Teachers will appear here once they complete their profiles!"
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
