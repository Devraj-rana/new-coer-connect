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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {students.map((student) => (
              <Card key={student.userId} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Image
                          src={student.profilePhoto}
                          alt={`${student.firstName} ${student.lastName}`}
                          width={64}
                          height={64}
                          className="w-16 h-16 rounded-full object-cover border-2 border-blue-200"
                        />
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 border-2 border-white rounded-full"></div>
                        <div className="absolute -top-1 -left-1">
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
                          className="hover:text-blue-600 transition-colors"
                        >
                          <h3 className="font-semibold text-lg text-gray-900 truncate">
                            {student.firstName} {student.lastName}
                          </h3>
                        </Link>
                        
                        {student.position && (
                          <p className="text-blue-600 text-sm font-medium truncate">
                            {student.position}
                          </p>
                        )}
                        
                        {student.company && (
                          <div className="flex items-center gap-1 mt-1">
                            <Building className="w-3 h-3 text-gray-400" />
                            <p className="text-gray-600 text-xs truncate">
                              {student.company}
                            </p>
                          </div>
                        )}
                        
                        {student.location && (
                          <div className="flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3 text-gray-400" />
                            <p className="text-gray-500 text-xs truncate">
                              {student.location}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  {/* Bio */}
                  {student.bio && (
                    <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                      {student.bio}
                    </p>
                  )}

                  {/* Skills */}
                  {student.skills && student.skills.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {student.skills.slice(0, 3).map((skill, index) => (
                          <Badge key={index} variant="secondary" className="text-xs px-2 py-1 bg-blue-100 text-blue-800">
                            {skill}
                          </Badge>
                        ))}
                        {student.skills.length > 3 && (
                          <Badge variant="outline" className="text-xs px-2 py-1">
                            +{student.skills.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    {user && user.id !== student.userId && (
                      <FollowButton
                        userId={student.userId}
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
                      <Link href={`/profile/${student.userId}`}>
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
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {searchQuery ? "No students found" : "No students available"}
            </h3>
            <p className="text-gray-500">
              {searchQuery 
                ? "Try adjusting your search terms"
                : "Students will appear here once they complete their profiles!"
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
