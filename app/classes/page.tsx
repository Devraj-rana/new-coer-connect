"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  PlusCircle, 
  Users, 
  Calendar, 
  Clock, 
  BookOpen, 
  Settings,
  MapPin,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import { getTeacherClasses } from '@/lib/classActions';
import { IClass } from '@/models/class.model';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';

export default function ClassesPage() {
  const { user } = useUser();
  const [classes, setClasses] = useState<IClass[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadClasses();
    }
  }, [user]);

  const loadClasses = async () => {
    try {
      const teacherClasses = await getTeacherClasses();
      setClasses(teacherClasses);
    } catch (error) {
      console.error('Error loading classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScheduleDisplay = (schedule: IClass['schedule']) => {
    if (!schedule || schedule.length === 0) return 'No schedule set';
    
    return schedule.map(s => 
      `${s.dayOfWeek} ${s.startTime}-${s.endTime}${s.room ? ` (${s.room})` : ''}`
    ).join(', ');
  };

  const getStatusColor = (enrolledCount: number, maxStudents: number) => {
    const percentage = (enrolledCount / maxStudents) * 100;
    if (percentage >= 90) return 'bg-red-100 text-red-800';
    if (percentage >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pt-16">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading your classes...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pt-16">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                My Classes
              </h1>
              <p className="text-gray-600 text-sm">Manage your courses and students</p>
            </div>
            <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Link href="/classes/create">
                <PlusCircle className="h-4 w-4 mr-2" />
                Create New Class
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {classes.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Classes Yet</h3>
              <p className="text-gray-600 mb-6">Start by creating your first class to manage students and course content.</p>
              <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Link href="/classes/create">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create Your First Class
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((classItem) => (
              <Card key={classItem._id} className="transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{classItem.title}</CardTitle>
                      <CardDescription className="mt-1">
                        <span className="font-medium">{classItem.courseCode}</span> • {classItem.subject}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {classItem.semester} Sem
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Enrollment Status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {classItem.enrolledStudents?.length || 0}/{classItem.maxStudents} Students
                      </span>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${getStatusColor(classItem.enrolledStudents?.length || 0, classItem.maxStudents)}`}
                    >
                      {((classItem.enrolledStudents?.length || 0) / classItem.maxStudents * 100).toFixed(0)}% Full
                    </Badge>
                  </div>

                  {/* Schedule */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Schedule:</span>
                    </div>
                    <p className="text-xs text-gray-500 ml-6">
                      {getScheduleDisplay(classItem.schedule)}
                    </p>
                  </div>

                  {/* Academic Year */}
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Academic Year: {classItem.academicYear}</span>
                  </div>

                  {/* Course Stats */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                    <div className="text-center">
                      <p className="text-lg font-semibold text-blue-600">{classItem.materials?.length || 0}</p>
                      <p className="text-xs text-gray-500">Materials</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-green-600">{classItem.assignments?.length || 0}</p>
                      <p className="text-xs text-gray-500">Assignments</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-purple-600">{classItem.announcements?.length || 0}</p>
                      <p className="text-xs text-gray-500">Announcements</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-3">
                    <Button asChild size="sm" className="flex-1">
                      <Link href={`/classes/${classItem._id}`}>
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="flex-1">
                      <Link href={`/classes/${classItem._id}/edit`}>
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Link>
                    </Button>
                    <Button size="sm" variant="outline" className="px-2">
                      <Settings className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
