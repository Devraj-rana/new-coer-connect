"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getTeacherClasses } from '@/lib/classActions';
import { Post } from '@/models/post.model';
import { Users, BookOpen, FileText, BarChart3 } from 'lucide-react';

interface TeacherStatsProps {
  teacherId: string;
}

export function TeacherStats({ teacherId }: TeacherStatsProps) {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalClasses: 0,
    totalAssignments: 0,
    avgScore: 0,
    isLoading: true
  });

  useEffect(() => {
    const loadTeacherStats = async () => {
      try {
        const classes = await getTeacherClasses();
        
        // Calculate stats from real data
        const totalClasses = classes.length;
        const totalStudents = classes.reduce((sum, cls) => sum + (cls.enrolledStudents?.length || 0), 0);
        const totalAssignments = classes.reduce((sum, cls) => sum + (cls.assignments?.length || 0), 0);
        
        // Calculate average completion/score (placeholder calculation)
        const avgScore = totalClasses > 0 ? Math.round((totalStudents / (totalClasses * 50)) * 100) : 0;

        setStats({
          totalStudents,
          totalClasses,
          totalAssignments,
          avgScore,
          isLoading: false
        });
      } catch (error) {
        console.error('Error loading teacher stats:', error);
        setStats(prev => ({ ...prev, isLoading: false }));
      }
    };

    loadTeacherStats();
  }, [teacherId]);

  const statsData = [
    {
      icon: Users,
      label: 'Students',
      value: stats.totalStudents,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      icon: BookOpen,
      label: 'Classes',
      value: stats.totalClasses,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      icon: FileText,
      label: 'Assignments',
      value: stats.totalAssignments,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      icon: BarChart3,
      label: 'Engagement',
      value: `${stats.avgScore}%`,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  if (stats.isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Skeleton className="w-12 h-12 rounded-lg" />
                <div>
                  <Skeleton className="h-4 w-16 mb-2" />
                  <Skeleton className="h-8 w-12" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statsData.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 ${stat.bgColor} rounded-lg`}>
                  <IconComponent className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
