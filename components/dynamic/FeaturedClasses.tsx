"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getFeaturedClasses } from '@/lib/dashboardActions';
import { Users, BookOpen, GraduationCap, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { IClass } from '@/models/class.model';

export function FeaturedClasses() {
  const [classes, setClasses] = useState<IClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadFeaturedClasses = async () => {
      try {
        const featuredClasses = await getFeaturedClasses();
        setClasses(featuredClasses);
      } catch (error) {
        console.error('Error loading featured classes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFeaturedClasses();
  }, []);

  if (isLoading) {
    return (
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-60" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="p-4 border rounded-lg">
              <Skeleton className="h-5 w-48 mb-2" />
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-3 w-64 mb-3" />
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-16" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (classes.length === 0) {
    return (
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            Featured Classes
          </CardTitle>
          <CardDescription>Discover popular courses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No classes available</h3>
            <p className="text-gray-600 mb-4">Check back later for new courses!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-blue-600" />
          Featured Classes
        </CardTitle>
        <CardDescription>Discover popular courses from top educators</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {classes.slice(0, 3).map((classItem, index) => (
          <div key={classItem._id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors group">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                  {classItem.title}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {classItem.courseCode}
                  </Badge>
                  <span className="text-sm text-gray-500">{classItem.subject}</span>
                </div>
              </div>
            </div>
            
            {classItem.description && (
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {classItem.description}
              </p>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {classItem.enrolledStudents?.length || 0}/{classItem.maxStudents}
                </span>
                <span className="flex items-center gap-1">
                  <GraduationCap className="w-3 h-3" />
                  {classItem.teacher?.firstName} {classItem.teacher?.lastName}
                </span>
              </div>
              <Button asChild size="sm" variant="ghost" className="text-blue-600 hover:bg-blue-50">
                <Link href={`/classes/${classItem._id}`}>
                  View <ArrowRight className="w-3 h-3 ml-1" />
                </Link>
              </Button>
            </div>
          </div>
        ))}
        
        {classes.length > 3 && (
          <div className="pt-2">
            <Button asChild variant="outline" className="w-full">
              <Link href="/classes">
                View All Classes
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
