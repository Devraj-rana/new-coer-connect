import React from 'react';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, Briefcase, Shield, Star } from 'lucide-react';

interface RoleBadgeProps {
  role: 'student' | 'teacher' | 'admin';
  academicYear?: '1st' | '2nd' | '3rd' | '4th';
  branch?: 'BCA' | 'B.Tech' | 'MCA' | 'M.Tech' | 'BBA' | 'MBA' | 'BSc' | 'MSc' | 'Other';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export default function RoleBadge({ 
  role, 
  academicYear, 
  branch, 
  size = 'md', 
  showIcon = true 
}: RoleBadgeProps) {
  const getBadgeConfig = () => {
    switch (role) {
      case 'admin':
        return {
          color: 'bg-red-100 text-red-700 border-red-200',
          icon: Shield,
          label: 'Admin'
        };
      case 'teacher':
        return {
          color: 'bg-green-100 text-green-700 border-green-200',
          icon: Briefcase,
          label: 'Teacher'
        };
      case 'student':
        if (academicYear) {
          const yearConfig = {
            '1st': { color: 'bg-blue-100 text-blue-700 border-blue-200', label: '1st Year' },
            '2nd': { color: 'bg-purple-100 text-purple-700 border-purple-200', label: '2nd Year' },
            '3rd': { color: 'bg-orange-100 text-orange-700 border-orange-200', label: '3rd Year' },
            '4th': { color: 'bg-pink-100 text-pink-700 border-pink-200', label: '4th Year' }
          };
          return {
            ...yearConfig[academicYear],
            icon: GraduationCap
          };
        }
        return {
          color: 'bg-blue-100 text-blue-700 border-blue-200',
          icon: GraduationCap,
          label: 'Student'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-700 border-gray-200',
          icon: Star,
          label: 'User'
        };
    }
  };

  const config = getBadgeConfig();
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2'
  };

  return (
    <div className="flex flex-wrap gap-1">
      <Badge 
        variant="outline" 
        className={`${config.color} ${sizeClasses[size]} font-medium border flex items-center gap-1`}
      >
        {showIcon && <Icon className={`${size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'}`} />}
        {config.label}
      </Badge>
      
      {role === 'student' && branch && (
        <Badge 
          variant="outline" 
          className={`bg-indigo-100 text-indigo-700 border-indigo-200 ${sizeClasses[size]} font-medium border`}
        >
          {branch}
        </Badge>
      )}
    </div>
  );
}
