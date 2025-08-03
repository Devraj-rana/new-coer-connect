"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, Calendar, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { getStudentClasses } from "@/lib/classActions";
import Link from "next/link";

interface StudentClassListProps {
  userId?: string;
}

interface ClassData {
  _id: string;
  title: string;
  description: string;
  teacher: {
    name: string;
    email: string;
  };
  schedule: {
    day: string;
    time: string;
  }[];
  enrolledStudents: string[];
  totalAssignments: number;
  pendingAssignments: number;
}

export default function StudentClassList({ userId }: StudentClassListProps) {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchClasses() {
      try {
        setLoading(true);
        const data = await getStudentClasses(userId);
        setClasses(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load classes");
      } finally {
        setLoading(false);
      }
    }

    fetchClasses();
  }, [userId]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <div className="flex gap-4 text-sm">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">Error loading classes: {error}</p>
        </CardContent>
      </Card>
    );
  }

  if (classes.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">No Classes Enrolled</h3>
            <p className="text-muted-foreground mb-4">You haven't enrolled in any classes yet.</p>
            <Link href="/classes" className="text-blue-600 hover:underline">
              Browse Available Classes
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {classes.map((classItem) => (
        <Card key={classItem._id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{classItem.title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  by {classItem.teacher.name}
                </p>
              </div>
              <Badge variant={classItem.pendingAssignments > 0 ? "destructive" : "secondary"}>
                {classItem.pendingAssignments > 0 
                  ? `${classItem.pendingAssignments} pending`
                  : "Up to date"
                }
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {classItem.description}
            </p>
            
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{classItem.enrolledStudents.length} students</span>
              </div>
              
              <div className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                <span>{classItem.totalAssignments} assignments</span>
              </div>
              
              {classItem.schedule.length > 0 && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {classItem.schedule[0].day} at {classItem.schedule[0].time}
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center mt-4">
              <Link 
                href={`/classes/${classItem._id}`}
                className="text-blue-600 hover:underline text-sm font-medium"
              >
                View Class Details
              </Link>
              
              {classItem.pendingAssignments > 0 && (
                <div className="flex items-center gap-1 text-orange-600">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">Action needed</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
