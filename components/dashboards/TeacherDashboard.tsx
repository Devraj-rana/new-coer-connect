"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { 
  Users, 
  BookOpen, 
  Calendar, 
  Award, 
  TrendingUp, 
  Clock,
  Target,
  Star,
  MessageCircle,
  PlusCircle,
  GraduationCap,
  FileText,
  BarChart3,
  UserCheck
} from "lucide-react";
import { TeacherStats } from "../dynamic/TeacherStats";
import { TeacherClassList } from "../dynamic/TeacherClassList";
import TeacherQuizList from "../dynamic/TeacherQuizList";

interface ProfileData {
  userId: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'teacher' | 'admin';
  profilePhoto: string;
}

interface TeacherDashboardProps {
  profile: ProfileData;
}

export default function TeacherDashboard({ profile }: TeacherDashboardProps) {
  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Image
              src={profile.profilePhoto}
              alt={profile.firstName}
              width={64}
              height={64}
              className="rounded-full border-4 border-green-200"
            />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, Professor {profile.lastName}!
              </h1>
              <p className="text-green-600 font-medium">Teacher Dashboard</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <TeacherStats teacherId={profile.userId} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* My Classes */}
            <TeacherClassList />
            
            {/* My Quizzes */}
            <TeacherQuizList userId={profile.userId} />

            {/* Recent Submissions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Recent Submissions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                        <FileText className="w-4 h-4 text-yellow-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">Binary Tree Assignment</h4>
                        <p className="text-sm text-gray-600">John Smith • Data Structures</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-yellow-600 font-medium">Needs Review</span>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <FileText className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">React Portfolio Project</h4>
                        <p className="text-sm text-gray-600">Sarah Johnson • Web Development</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-blue-600 font-medium">Needs Review</span>
                      <p className="text-xs text-gray-500">4 hours ago</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <UserCheck className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">ML Model Implementation</h4>
                        <p className="text-sm text-gray-600">Mike Chen • Machine Learning</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-green-600 font-medium">Reviewed</span>
                      <p className="text-xs text-gray-500">Yesterday</p>
                    </div>
                  </div>
                </div>

                <Button variant="outline" className="w-full mt-4" asChild>
                  <Link href="/assignments/review">
                    View All Submissions
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Today's Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Today's Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-2 h-8 bg-green-500 rounded"></div>
                    <div>
                      <p className="font-medium">Data Structures Lecture</p>
                      <p className="text-sm text-gray-600">9:00 - 10:30 AM</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-2 h-8 bg-blue-500 rounded"></div>
                    <div>
                      <p className="font-medium">Web Dev Workshop</p>
                      <p className="text-sm text-gray-600">2:00 - 4:00 PM</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <div className="w-2 h-8 bg-purple-500 rounded"></div>
                    <div>
                      <p className="font-medium">Office Hours</p>
                      <p className="text-sm text-gray-600">4:30 - 6:00 PM</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Student Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Student Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Data Structures</span>
                      <span className="text-sm text-gray-600">85%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full">
                      <div className="w-[85%] h-2 bg-green-500 rounded-full"></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Web Development</span>
                      <span className="text-sm text-gray-600">78%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full">
                      <div className="w-[78%] h-2 bg-blue-500 rounded-full"></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Machine Learning</span>
                      <span className="text-sm text-gray-600">92%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full">
                      <div className="w-[92%] h-2 bg-purple-500 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <UserCheck className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm">Graded 5 assignments</p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <FileText className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm">Posted new lecture materials</p>
                      <p className="text-xs text-gray-500">Yesterday</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm">Hosted study session</p>
                      <p className="text-xs text-gray-500">2 days ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/assignments/create">
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Create Assignment
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/live-study">
                    <Users className="w-4 h-4 mr-2" />
                    Start Study Session
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/students">
                    <Users className="w-4 h-4 mr-2" />
                    View All Students
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
