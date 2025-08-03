import Feed from "@/components/Feed";
import DynamicNews from "@/components/dynamic/DynamicNews";
import Sidebar from "@/components/Sidebar";
import { currentUser } from "@clerk/nextjs/server";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, Users, BookOpen, TrendingUp, MessageCircle, Share2 } from "lucide-react";
import { PlatformStats } from "@/components/dynamic/PlatformStats";
import { UserStats } from "@/components/dynamic/UserStats";
import { FeaturedClasses } from "@/components/dynamic/FeaturedClasses";
import { TrendingPosts } from "@/components/dynamic/TrendingPosts";
import { getPlatformStats, getUserStats } from "@/lib/dashboardActions";

export default async function Home() {
  const user = await currentUser();
  
  // Get platform statistics for both authenticated and non-authenticated users
  const platformStats = await getPlatformStats();
   
  // Hero section for non-authenticated users
  if (!user) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Hero Section */}
        <div className="pt-32 pb-20">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-16">
              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6">
                COER Connect
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
                The ultimate academic social platform connecting students, teachers, and learners worldwide.
                Share knowledge, collaborate, and grow together.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <SignUpButton>
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-3 text-lg">
                    Join COER Connect
                  </Button>
                </SignUpButton>
                <SignInButton>
                  <Button variant="outline" size="lg" className="px-8 py-3 text-lg border-2 border-blue-600 text-blue-600 hover:bg-blue-50">
                    Sign In
                  </Button>
                </SignInButton>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <GraduationCap className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-800">Academic Excellence</h3>
                  <p className="text-gray-600">Connect with peers and educators to enhance your learning journey with collaborative tools and resources.</p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-800">Global Community</h3>
                  <p className="text-gray-600">Join thousands of students and teachers from different institutions sharing knowledge and experiences.</p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-800">Knowledge Sharing</h3>
                  <p className="text-gray-600">Share insights, ask questions, and participate in discussions that matter to your academic growth.</p>
                </CardContent>
              </Card>
            </div>

            {/* Stats Section */}
            <PlatformStats stats={platformStats} />
          </div>
        </div>
      </main>
    );
  }

  // Get user-specific data for authenticated users
  const userStats = await getUserStats();

  // Authenticated user dashboard
  return (
    <main className="pt-20 min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
              Welcome back, {user.firstName}! 👋
            </h1>
            <p className="text-gray-600">Stay connected with your academic community and discover new opportunities.</p>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="hidden lg:block w-[20%] flex-shrink-0">
            <div className="sticky top-24">
              <Sidebar user={user} />
            </div>
          </div>
          
          {/* Main Feed */}
          <div className="flex-1 max-w-2xl">
            <Feed user={user} />
          </div>
          
          {/* News & Quick Actions */}
          <div className="hidden xl:block w-[25%] flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              {/* Dynamic News Component */}
              <DynamicNews />
              
              {/* Featured Classes */}
              <FeaturedClasses />
              
              {/* Trending Posts */}
              <TrendingPosts />
              
              {/* Quick Actions Card */}
              <Card className="bg-white shadow-lg">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-800 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <a href="/live-study">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Join Study Session
                      </a>
                    </Button>
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <a href="/teachers">
                        <Users className="w-4 h-4 mr-2" />
                        Find Teachers
                      </a>
                    </Button>
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <a href="/students">
                        <GraduationCap className="w-4 h-4 mr-2" />
                        Connect with Students
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* User Stats */}
              <UserStats userRole={(userStats?.teachingClasses || 0) > 0 ? 'teacher' : 'student'} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
