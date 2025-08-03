"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getUserStats } from '@/lib/dashboardActions';
import { BookOpen, Users, Clock, FileText, GraduationCap } from 'lucide-react';

interface UserStatsProps {
  userRole?: 'student' | 'teacher' | 'admin';
}

export function UserStats({ userRole = 'student' }: UserStatsProps) {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserStats = async () => {
      try {
        const userStats = await getUserStats();
        setStats(userStats);
      } catch (error) {
        console.error('Error loading user stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserStats();
  }, []);

  const getStatsForRole = () => {
    if (!stats) return [];

    if (userRole === 'teacher') {
      return [
        {
          icon: GraduationCap,
          label: 'Classes Teaching',
          value: stats.teachingClasses,
          color: 'text-blue-600'
        },
        {
          icon: Users,
          label: 'Students Taught',
          value: stats.teachingClasses * 25, // Estimated
          color: 'text-green-600'
        },
        {
          icon: FileText,
          label: 'Posts Shared',
          value: stats.postsShared,
          color: 'text-purple-600'
        }
      ];
    }

    // Student stats
    return [
      {
        icon: FileText,
        label: 'Posts Shared',
        value: stats.postsShared,
        color: 'text-blue-600'
      },
      {
        icon: Users,
        label: 'Connections',
        value: stats.connections,
        color: 'text-green-600'
      },
      {
        icon: Clock,
        label: 'Study Hours',
        value: `${stats.studyHours}h`,
        color: 'text-purple-600'
      }
    ];
  };

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg">
        <CardContent className="p-6">
          <Skeleton className="h-6 w-32 mb-4 bg-white/20" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-center justify-between">
                <Skeleton className="h-4 w-20 bg-white/20" />
                <Skeleton className="h-6 w-8 bg-white/20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const statsData = getStatsForRole();

  return (
    <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg">
      <CardContent className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Your Impact
        </h3>
        <div className="space-y-3">
          {statsData.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="flex items-center justify-between group hover:bg-white/10 rounded-lg p-2 transition-colors">
                <span className="opacity-90 flex items-center gap-2">
                  <IconComponent className="w-4 h-4" />
                  {stat.label}
                </span>
                <span className="font-bold text-lg">{stat.value}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
