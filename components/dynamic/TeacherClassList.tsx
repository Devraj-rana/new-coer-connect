"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { getTeacherClasses } from '@/lib/classActions';
import { IClass } from '@/models/class.model';
import { GraduationCap, BookOpen, PlusCircle, Users, Clock } from 'lucide-react';
import Link from 'next/link';

export function TeacherClassList() {
  const [classes, setClasses] = useState<IClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadClasses = async () => {
      try {
        const teacherClasses = await getTeacherClasses();
        setClasses(teacherClasses);
      } catch (error) {
        console.error('Error loading classes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadClasses();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-12 h-12 rounded-lg" />
                  <div>
                    <Skeleton className="h-5 w-48 mb-2" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
                <div className="text-right">
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
          <Skeleton className="h-10 w-full mt-4" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5" />
          My Classes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {classes.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No classes yet</h3>
            <p className="text-gray-600 mb-4">Create your first class to start teaching!</p>
            <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Link href="/classes/create">
                <PlusCircle className="w-4 h-4 mr-2" />
                Create First Class
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {classes.slice(0, 3).map((classItem) => (
                <div key={classItem._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${
                      classItem.subject.includes('Computer') ? 'from-blue-500 to-blue-600' :
                      classItem.subject.includes('Math') ? 'from-green-500 to-green-600' :
                      'from-purple-500 to-purple-600'
                    } rounded-lg flex items-center justify-center`}>
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{classItem.title}</h3>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {classItem.courseCode}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          {classItem.enrolledStudents?.length || 0} Students
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">
                        {Math.round(((classItem.enrolledStudents?.length || 0) / classItem.maxStudents) * 100)}% Full
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {classItem.assignments?.length || 0} Assignments
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Button className="w-full mt-4" asChild>
              <Link href="/classes">
                <PlusCircle className="w-4 h-4 mr-2" />
                Manage Classes
              </Link>
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
