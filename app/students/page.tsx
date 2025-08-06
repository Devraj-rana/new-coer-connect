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

export default function StudentsPage() {
  const { user } = useUser();
  const [students, setStudents] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadStudentsData = async () => {
      try {
        setLoading(true);
        const studentsData = await getUsersByRole('student', searchQuery);
        setStudents(studentsData);
      } catch (error) {
        console.error("Error loading students:", error);
        toast.error("Failed to load students");
      } finally {
        setLoading(false);
      }
    };

    loadStudentsData();
  }, [searchQuery]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading students...</div>
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
            <h1 className="text-3xl font-bold text-gray-900">Students</h1>
          </div>
          <p className="text-gray-600 mb-6">
            Connect with fellow learners in the COER community
          </p>

          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search students by name, skills, or interests..."
              value={searchQuery}
              onChange={handleSearch}
              className="pl-10 pr-4 py-2 w-full"
            />
          </div>
        </div>

        {/* Students Grid */}
        {students.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {students.map((student) => (
              <Card key={student.userId} className="group relative overflow-hidden surface hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 border-0 rounded-2xl">
                {/* Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Header with Enhanced Profile */}
                <CardHeader className="pb-4 relative z-10">
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <div className="relative overflow-hidden rounded-2xl">
                        <Image
                          src={student.profilePhoto}
                          alt={`${student.firstName} ${student.lastName}`}
                          width={80}
                          height={80}
                          className="w-20 h-20 object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                      
                      {/* Status Indicator */}
                      <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-gradient-to-r from-green-400 to-blue-500 border-3 border-white rounded-full shadow-lg flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      </div>
                      
                      {/* Role Badge */}
                      <div className="absolute -top-2 -left-2">
                        <RoleBadge 
                          role="student" 
                          academicYear={student.academicYear} 
                          branch={student.branch}
                          size="sm" 
                        />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <Link 
                        href={`/profile/${student.userId}`}
                        className="group/link block"
                      >
                        <h3 className="font-bold text-xl text-foreground group-hover/link:text-primary transition-colors duration-200 truncate">
                          {student.firstName} {student.lastName}
                        </h3>
                      </Link>
                      
                      {student.position && (
                        <div className="flex items-center gap-2 mt-1">
                          <GraduationCap className="w-4 h-4 text-primary" />
                          <p className="text-primary text-sm font-semibold truncate">
                            {student.position}
                          </p>
                        </div>
                      )}
                      
                      {student.company && (
                        <div className="flex items-center gap-2 mt-2">
                          <Building className="w-4 h-4 text-muted-foreground" />
                          <p className="text-muted-foreground text-sm truncate">
                            {student.company}
                          </p>
                        </div>
                      )}
                      
                      {student.location && (
                        <div className="flex items-center gap-2 mt-1">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <p className="text-muted-foreground text-sm truncate">
                            {student.location}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0 relative z-10">
                  {/* Bio Section */}
                  {student.bio && (
                    <div className="mb-6">
                      <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                        {student.bio}
                      </p>
                    </div>
                  )}

                  {/* Skills Section */}
                  {student.skills && student.skills.length > 0 && (
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <BookOpen className="w-4 h-4 text-primary" />
                        <span className="text-sm font-semibold text-foreground">Skills</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {student.skills.slice(0, 4).map((skill, index) => (
                          <Badge 
                            key={index} 
                            variant="secondary" 
                            className="text-xs px-3 py-1.5 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-700 dark:text-blue-300 border-0 rounded-full hover:shadow-md transition-shadow duration-200"
                          >
                            {skill}
                          </Badge>
                        ))}
                        {student.skills.length > 4 && (
                          <Badge 
                            variant="outline" 
                            className="text-xs px-3 py-1.5 border-dashed border-primary/30 text-primary rounded-full"
                          >
                            +{student.skills.length - 4}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-border/50">
                    {user && user.id !== student.userId && (
                      <FollowButton
                        userId={student.userId}
                        size="sm"
                        className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                      />
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="flex-1 border-primary/20 hover:bg-primary/5 hover:border-primary/40 transition-all duration-200"
                    >
                      <Link href={`/profile/${student.userId}`}>
                        <BookOpen className="w-4 h-4 mr-2" />
                        View Profile
                      </Link>
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="px-3 hover:bg-primary/10 transition-colors duration-200"
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
            <div className="mx-auto w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center mb-6">
              <Users className="w-16 h-16 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No students found</h3>
            <p className="text-muted-foreground">
              {searchQuery 
                ? "Try adjusting your search terms to find students" 
                : "Students will appear here once they complete their profiles!"
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
