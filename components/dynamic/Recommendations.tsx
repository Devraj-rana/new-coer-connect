"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getUserRecommendations } from '@/lib/dashboardActions';
import { Users, BookOpen, Star, ArrowRight, UserPlus } from 'lucide-react';
import Link from 'next/link';

export function Recommendations() {
  const [recommendations, setRecommendations] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        const recs = await getUserRecommendations();
        setRecommendations(recs);
      } catch (error) {
        console.error('Error loading recommendations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRecommendations();
  }, []);

  if (isLoading) {
    return (
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const hasRecommendations = 
    (recommendations?.recommendedClasses?.length > 0) || 
    (recommendations?.recommendedTeachers?.length > 0);

  if (!hasRecommendations) {
    return (
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-600" />
            Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No recommendations yet</h3>
            <p className="text-gray-600 text-sm">Explore classes and connect with teachers to get personalized recommendations!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-600" />
          Recommended for You
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Recommended Classes */}
        {recommendations?.recommendedClasses?.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Classes to Join
            </h4>
            <div className="space-y-3">
              {recommendations.recommendedClasses.slice(0, 2).map((classItem: any) => (
                <div key={classItem._id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {classItem.courseCode?.charAt(0) || 'C'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-medium text-sm text-gray-800 truncate">
                      {classItem.title}
                    </h5>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {classItem.courseCode}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {classItem.enrolledStudents?.length || 0}/{classItem.maxStudents} students
                      </span>
                    </div>
                  </div>
                  <Button asChild size="sm" variant="outline" className="text-xs">
                    <Link href={`/classes/${classItem._id}`}>Join</Link>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommended Teachers */}
        {recommendations?.recommendedTeachers?.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Teachers to Follow
            </h4>
            <div className="space-y-3">
              {recommendations.recommendedTeachers.slice(0, 2).map((teacher: any, index: number) => (
                <div key={index} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <img
                    src={teacher.profilePhoto || '/default-avatar.png'}
                    alt={teacher.firstName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h5 className="font-medium text-sm text-gray-800">
                      {teacher.firstName} {teacher.lastName}
                    </h5>
                    <p className="text-xs text-gray-500">Teacher</p>
                  </div>
                  <Button size="sm" variant="outline" className="text-xs">
                    <UserPlus className="w-3 h-3 mr-1" />
                    Follow
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* View More */}
        <div className="pt-2 border-t">
          <Button asChild variant="ghost" className="w-full text-sm">
            <Link href="/explore">
              Explore More
              <ArrowRight className="w-3 h-3 ml-2" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
