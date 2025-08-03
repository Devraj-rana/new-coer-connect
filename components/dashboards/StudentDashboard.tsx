"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { 
  Calendar, 
  Clock,
  Target,
  Star,
  MessageCircle,
  PlusCircle
} from "lucide-react";
import StudentStats from "@/components/dynamic/StudentStats";
import StudentClassList from "@/components/dynamic/StudentClassList";

interface ProfileData {
  userId: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'teacher' | 'admin';
  profilePhoto: string;
}

interface StudentDashboardProps {
  profile: ProfileData;
}

export default function StudentDashboard({ profile }: StudentDashboardProps) {
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
              className="rounded-full border-4 border-blue-200"
            />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {profile.firstName}!
              </h1>
              <p className="text-blue-600 font-medium">Student Dashboard</p>
            </div>
          </div>
        </div>

        {/* Dynamic Student Stats */}
        <div className="mb-8">
          <StudentStats userId={profile.userId} />
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Classes */}
          <div className="lg:col-span-2 space-y-6">
            {/* My Classes */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold">My Classes</CardTitle>
                  <Link href="/classes">
                    <Button variant="outline" size="sm">
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Browse Classes
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <StudentClassList userId={profile.userId} />
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Link href="/classes">
                    <div className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer">
                      <PlusCircle className="w-8 h-8 text-blue-600 mb-2" />
                      <span className="text-sm font-medium">Join Class</span>
                    </div>
                  </Link>
                  
                  <Link href="/live-study">
                    <div className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors cursor-pointer">
                      <MessageCircle className="w-8 h-8 text-green-600 mb-2" />
                      <span className="text-sm font-medium">Study Group</span>
                    </div>
                  </Link>
                  
                  <Link href="/profile">
                    <div className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors cursor-pointer">
                      <Target className="w-8 h-8 text-purple-600 mb-2" />
                      <span className="text-sm font-medium">Set Goals</span>
                    </div>
                  </Link>
                  
                  <Link href="/teachers">
                    <div className="flex flex-col items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors cursor-pointer">
                      <Star className="w-8 h-8 text-orange-600 mb-2" />
                      <span className="text-sm font-medium">Find Teachers</span>
                    </div>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
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
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-2 h-8 bg-blue-600 rounded"></div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Data Structures</p>
                      <p className="text-xs text-gray-600">10:00 AM - 11:30 AM</p>
                    </div>
                    <Clock className="w-4 h-4 text-blue-600" />
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-2 h-8 bg-green-600 rounded"></div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Web Development</p>
                      <p className="text-xs text-gray-600">2:00 PM - 3:30 PM</p>
                    </div>
                    <Clock className="w-4 h-4 text-green-600" />
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <div className="w-2 h-8 bg-purple-600 rounded"></div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Study Group</p>
                      <p className="text-xs text-gray-600">7:00 PM - 8:00 PM</p>
                    </div>
                    <Clock className="w-4 h-4 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Deadlines */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Upcoming Deadlines
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border-l-4 border-red-500 bg-red-50 rounded">
                    <div>
                      <p className="font-medium text-sm">Algorithm Assignment</p>
                      <p className="text-xs text-gray-600">Due in 2 days</p>
                    </div>
                    <div className="text-red-600 text-xs font-medium">High</div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border-l-4 border-yellow-500 bg-yellow-50 rounded">
                    <div>
                      <p className="font-medium text-sm">React Project</p>
                      <p className="text-xs text-gray-600">Due in 5 days</p>
                    </div>
                    <div className="text-yellow-600 text-xs font-medium">Medium</div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border-l-4 border-green-500 bg-green-50 rounded">
                    <div>
                      <p className="font-medium text-sm">Database Quiz</p>
                      <p className="text-xs text-gray-600">Due in 1 week</p>
                    </div>
                    <div className="text-green-600 text-xs font-medium">Low</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Recent Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Star className="w-4 h-4 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Perfect Attendance</p>
                      <p className="text-xs text-gray-600">No missed classes this week</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Target className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Assignment Streak</p>
                      <p className="text-xs text-gray-600">5 assignments completed on time</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
