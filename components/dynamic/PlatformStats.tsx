"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface PlatformStatsProps {
  stats?: {
    totalUsers: number;
    totalTeachers: number;
    totalClasses: number;
    totalPosts: number;
  };
}

export function PlatformStats({ stats }: PlatformStatsProps) {
  const [isLoading, setIsLoading] = useState(!stats);

  useEffect(() => {
    if (stats) {
      setIsLoading(false);
    }
  }, [stats]);

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const statsData = [
    {
      value: stats?.totalUsers || 0,
      label: 'Active Users',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      value: stats?.totalTeachers || 0,
      label: 'Teachers',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      value: stats?.totalClasses || 0,
      label: 'Active Classes',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    {
      value: stats?.totalPosts || 0,
      label: 'Posts Shared',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    }
  ];

  if (isLoading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 md:p-12">
        <Skeleton className="h-8 w-64 mx-auto mb-12" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="text-center">
              <Skeleton className="h-12 w-20 mx-auto mb-2" />
              <Skeleton className="h-4 w-16 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 md:p-12">
      <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-12">
        Join Our Growing Community
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {statsData.map((stat, index) => (
          <div key={index} className="text-center group">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${stat.bgColor} mb-4 group-hover:scale-110 transition-transform duration-300`}>
              <div className={`text-4xl md:text-5xl font-bold ${stat.color}`}>
                {formatNumber(stat.value)}
              </div>
            </div>
            <div className="text-gray-600 font-medium">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
