"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Clock, Award, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { getStudentStats } from "@/lib/dashboardActions";

interface StudentStatsProps {
  userId?: string;
}

interface StudentStatsData {
  enrolledClasses: number;
  completedAssignments: number;
  pendingAssignments: number;
  averageGrade: number;
}

export default function StudentStats({ userId }: StudentStatsProps) {
  const [stats, setStats] = useState<StudentStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        const data = await getStudentStats(userId);
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load student stats");
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [userId]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Error loading stats: {error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      title: "Enrolled Classes",
      value: stats.enrolledClasses,
      description: "Active enrollments",
      icon: BookOpen,
      color: "text-blue-600"
    },
    {
      title: "Pending Tasks",
      value: stats.pendingAssignments,
      description: "Assignments due",
      icon: Clock,
      color: "text-orange-600"
    },
    {
      title: "Completed",
      value: stats.completedAssignments,
      description: "Tasks finished",
      icon: Award,
      color: "text-green-600"
    },
    {
      title: "Average Grade",
      value: `${stats.averageGrade}%`,
      description: "Performance score",
      icon: TrendingUp,
      color: "text-purple-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
