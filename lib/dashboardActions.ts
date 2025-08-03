"use server"

import { Post } from "@/models/post.model";
import { Class } from "@/models/class.model";
import { IUser } from "@/models/user.model";
import { currentUser } from "@clerk/nextjs/server";
import connectDB from "./db";

// Get platform statistics for home page
export const getPlatformStats = async () => {
  await connectDB();
  
  try {
    const [
      totalPosts,
      totalClasses,
      totalTeachers,
      totalStudents
    ] = await Promise.all([
      Post.countDocuments(),
      Class.countDocuments({ isActive: true }),
      // You might need to implement user counting based on roles
      // For now, using estimated numbers based on classes
      Class.distinct('teacher.userId').then(teachers => teachers.length),
      Class.aggregate([
        { $unwind: "$enrolledStudents" },
        { $group: { _id: "$enrolledStudents.userId" } },
        { $count: "totalStudents" }
      ]).then(result => result[0]?.totalStudents || 0)
    ]);

    const totalUsers = totalTeachers + totalStudents;

    return {
      totalUsers,
      totalTeachers,
      totalClasses,
      totalPosts
    };
  } catch (error) {
    console.error('Error fetching platform stats:', error);
    return {
      totalUsers: 0,
      totalTeachers: 0,
      totalClasses: 0,
      totalPosts: 0
    };
  }
};

// Get user-specific statistics
export const getUserStats = async () => {
  await connectDB();
  const user = await currentUser();
  if (!user) return null;

  try {
    const [
      userPosts,
      enrolledClasses,
      teachingClasses
    ] = await Promise.all([
      Post.countDocuments({ 'user.userId': user.id }),
      Class.countDocuments({ 'enrolledStudents.userId': user.id }),
      Class.countDocuments({ 'teacher.userId': user.id, isActive: true })
    ]);

    // Get user connections (followers/following)
    // This would depend on your user/follow system implementation
    const connections = 0; // Placeholder

    // Calculate study hours (could be based on class enrollments, session time, etc.)
    const studyHours = enrolledClasses * 2; // Placeholder calculation

    return {
      postsShared: userPosts,
      connections,
      studyHours,
      enrolledClasses,
      teachingClasses
    };
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return {
      postsShared: 0,
      connections: 0,
      studyHours: 0,
      enrolledClasses: 0,
      teachingClasses: 0
    };
  }
};

// Get recent activity for feed
export const getRecentActivity = async () => {
  await connectDB();
  const user = await currentUser();
  if (!user) return [];

  try {
    // Get recent posts from user's network
    // For now, get all recent posts
    const recentPosts = await Post.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate({ path: 'comments', options: { sort: { createdAt: -1 } } });

    return recentPosts;
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return [];
  }
};

// Get featured classes
export const getFeaturedClasses = async () => {
  await connectDB();
  
  try {
    const featuredClasses = await Class.find({ isActive: true })
      .sort({ 'enrolledStudents': -1, createdAt: -1 })
      .limit(6)
      .select('title description courseCode subject enrolledStudents maxStudents teacher');

    return featuredClasses;
  } catch (error) {
    console.error('Error fetching featured classes:', error);
    return [];
  }
};

// Get trending posts
export const getTrendingPosts = async () => {
  await connectDB();
  
  try {
    // Get posts with most likes/comments (trending)
    const trendingPosts = await Post.find()
      .sort({ likes: -1, 'comments.length': -1, createdAt: -1 })
      .limit(3)
      .populate({ path: 'comments', options: { sort: { createdAt: -1 } } });

    return trendingPosts;
  } catch (error) {
    console.error('Error fetching trending posts:', error);
    return [];
  }
};

// Get user recommendations (teachers to follow, classes to join)
export const getUserRecommendations = async () => {
  await connectDB();
  const user = await currentUser();
  if (!user) return { recommendedTeachers: [], recommendedClasses: [] };

  try {
    // Get classes user is not enrolled in
    const userClasses = await Class.find({ 'enrolledStudents.userId': user.id }).select('_id');
    const userClassIds = userClasses.map(c => c._id);

    const recommendedClasses = await Class.find({ 
      isActive: true,
      _id: { $nin: userClassIds },
      'teacher.userId': { $ne: user.id }
    })
    .limit(3)
    .select('title description courseCode teacher enrolledStudents maxStudents');

    // Get popular teachers (those with most classes)
    const recommendedTeachers = await Class.aggregate([
      { $match: { isActive: true, 'teacher.userId': { $ne: user.id } } },
      { $group: { _id: '$teacher', classCount: { $sum: 1 } } },
      { $sort: { classCount: -1 } },
      { $limit: 3 }
    ]);

    return {
      recommendedClasses,
      recommendedTeachers: recommendedTeachers.map(t => t._id)
    };
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return { recommendedTeachers: [], recommendedClasses: [] };
  }
};

// Get student statistics for dashboard
export const getStudentStats = async (userId?: string) => {
  await connectDB();
  
  try {
    const user = userId ? { id: userId } : await currentUser();
    if (!user) throw new Error('User not authenticated');

    const userIdToUse = user.id;

    // Get enrolled classes count
    const enrolledClasses = await Class.countDocuments({
      'enrolledStudents.userId': userIdToUse,
      isActive: true
    });

    // Get assignment stats
    const classesWithAssignments = await Class.find({
      'enrolledStudents.userId': userIdToUse,
      isActive: true
    }).select('assignments');

    let totalAssignments = 0;
    let completedAssignments = 0;
    let pendingAssignments = 0;
    let totalGrades = 0;
    let gradeCount = 0;

    classesWithAssignments.forEach(classItem => {
      if (classItem.assignments && classItem.assignments.length > 0) {
        classItem.assignments.forEach((assignment: any) => {
          totalAssignments++;
          
          const studentSubmission = assignment.submissions?.find(
            (sub: any) => sub.studentId === userIdToUse
          );
          
          if (studentSubmission) {
            if (studentSubmission.grade !== undefined) {
              completedAssignments++;
              totalGrades += studentSubmission.grade;
              gradeCount++;
            }
          } else {
            // Check if assignment is still open
            const dueDate = new Date(assignment.dueDate);
            if (dueDate > new Date()) {
              pendingAssignments++;
            }
          }
        });
      }
    });

    const averageGrade = gradeCount > 0 ? Math.round(totalGrades / gradeCount) : 0;

    return {
      enrolledClasses,
      completedAssignments,
      pendingAssignments,
      averageGrade
    };
  } catch (error) {
    console.error('Error fetching student stats:', error);
    return {
      enrolledClasses: 0,
      completedAssignments: 0,
      pendingAssignments: 0,
      averageGrade: 0
    };
  }
};

// Get recent announcements and platform news
export const getRecentAnnouncements = async (limit: number = 5) => {
  await connectDB();
  
  try {
    // For now, return mock data since we don't have an announcements model yet
    // In a real app, you would fetch from an Announcements collection
    const mockAnnouncements = [
      {
        _id: "1",
        title: "New Class Management System Live!",
        content: "We've launched a comprehensive class management system with assignment tracking, material sharing, and real-time announcements. Teachers can now create and manage classes more efficiently.",
        type: "update" as const,
        author: {
          name: "Platform Team",
          role: "Administrator"
        },
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        priority: "high" as const
      },
      {
        _id: "2",
        title: "Platform Statistics Now Available",
        content: "Check out the new dashboard with real-time platform statistics including user counts, popular classes, and trending posts. Stay updated with platform activity.",
        type: "announcement" as const,
        author: {
          name: "Development Team",
          role: "Developer"
        },
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
        priority: "medium" as const
      },
      {
        _id: "3",
        title: "Welcome New Students and Teachers!",
        content: "We're excited to welcome our growing community of learners and educators. Join study groups, connect with peers, and make the most of your learning journey.",
        type: "news" as const,
        author: {
          name: "Community Team",
          role: "Community Manager"
        },
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        priority: "low" as const
      }
    ];

    // You could also fetch real announcements from classes
    const classAnnouncements = await Class.find({
      isActive: true,
      announcements: { $exists: true, $not: { $size: 0 } }
    })
    .select('announcements teacher')
    .sort({ 'announcements.createdAt': -1 })
    .limit(2);

    // Transform class announcements to match the format
    const transformedClassAnnouncements = classAnnouncements.flatMap(classItem => 
      classItem.announcements?.slice(0, 1).map((announcement: any) => ({
        _id: announcement._id?.toString() || Math.random().toString(),
        title: announcement.title || "Class Announcement",
        content: announcement.content || announcement.message || "No content available",
        type: "announcement" as const,
        author: {
          name: `${classItem.teacher.firstName} ${classItem.teacher.lastName}`,
          role: "Teacher"
        },
        createdAt: announcement.createdAt || new Date().toISOString(),
        priority: "medium" as const
      })) || []
    );

    // Combine mock and real announcements
    const allAnnouncements = [...mockAnnouncements, ...transformedClassAnnouncements]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);

    return allAnnouncements;
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return [];
  }
};
