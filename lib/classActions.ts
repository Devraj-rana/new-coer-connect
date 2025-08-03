"use server"

import { Class, IClass } from "@/models/class.model";
import { IUser } from "@/models/user.model";
import { currentUser } from "@clerk/nextjs/server";
import connectDB from "./db";
import { revalidatePath } from "next/cache";

// Create a new class
export const createClass = async (classData: {
  title: string;
  description: string;
  courseCode: string;
  subject: string;
  semester: string;
  academicYear: string;
  schedule: {
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    room?: string;
  }[];
  maxStudents: number;
}) => {
  await connectDB();
  const user = await currentUser();
  if (!user) throw new Error('User not authenticated');

  // Check if user is a teacher (you might want to add role verification here)
  const teacherData: IUser = {
    firstName: user.firstName || "Teacher",
    lastName: user.lastName || "User",
    userId: user.id,
    profilePhoto: user.imageUrl
  };

  try {
    // Check if course code already exists
    const existingClass = await Class.findOne({ courseCode: classData.courseCode });
    if (existingClass) {
      throw new Error('Course code already exists');
    }

    const newClass = await Class.create({
      ...classData,
      teacher: teacherData,
      enrolledStudents: [],
      isActive: true,
      materials: [],
      assignments: [],
      announcements: []
    });

    revalidatePath("/dashboard");
    revalidatePath("/classes");
    return { success: true, classId: newClass._id };
  } catch (error: any) {
    throw new Error(error.message || 'Failed to create class');
  }
};

// Get all classes taught by the current teacher
export const getTeacherClasses = async () => {
  await connectDB();
  const user = await currentUser();
  if (!user) throw new Error('User not authenticated');

  try {
    const classes = await Class.find({ 
      'teacher.userId': user.id,
      isActive: true 
    }).sort({ createdAt: -1 });
    
    return classes;
  } catch (error: any) {
    throw new Error('Failed to fetch classes');
  }
};

// Get a specific class by ID (only if teacher owns it)
export const getClassById = async (classId: string) => {
  await connectDB();
  const user = await currentUser();
  if (!user) throw new Error('User not authenticated');

  try {
    const classData = await Class.findOne({ 
      _id: classId,
      'teacher.userId': user.id 
    });
    
    if (!classData) {
      throw new Error('Class not found or access denied');
    }
    
    return classData;
  } catch (error: any) {
    throw new Error('Failed to fetch class');
  }
};

// Update class information
export const updateClass = async (classId: string, updateData: Partial<IClass>) => {
  await connectDB();
  const user = await currentUser();
  if (!user) throw new Error('User not authenticated');

  try {
    const updatedClass = await Class.findOneAndUpdate(
      { _id: classId, 'teacher.userId': user.id },
      updateData,
      { new: true }
    );

    if (!updatedClass) {
      throw new Error('Class not found or access denied');
    }

    revalidatePath("/dashboard");
    revalidatePath("/classes");
    revalidatePath(`/classes/${classId}`);
    return { success: true };
  } catch (error: any) {
    throw new Error('Failed to update class');
  }
};

// Delete/Archive a class
export const deleteClass = async (classId: string) => {
  await connectDB();
  const user = await currentUser();
  if (!user) throw new Error('User not authenticated');

  try {
    const deletedClass = await Class.findOneAndUpdate(
      { _id: classId, 'teacher.userId': user.id },
      { isActive: false },
      { new: true }
    );

    if (!deletedClass) {
      throw new Error('Class not found or access denied');
    }

    revalidatePath("/dashboard");
    revalidatePath("/classes");
    return { success: true };
  } catch (error: any) {
    throw new Error('Failed to delete class');
  }
};

// Add study material to a class
export const addMaterial = async (classId: string, material: {
  title: string;
  type: 'PDF' | 'Video' | 'Article' | 'Code' | 'Link';
  url: string;
  description?: string;
}) => {
  await connectDB();
  const user = await currentUser();
  if (!user) throw new Error('User not authenticated');

  try {
    const updatedClass = await Class.findOneAndUpdate(
      { _id: classId, 'teacher.userId': user.id },
      { 
        $push: { 
          materials: {
            ...material,
            uploadDate: new Date()
          }
        }
      },
      { new: true }
    );

    if (!updatedClass) {
      throw new Error('Class not found or access denied');
    }

    revalidatePath(`/classes/${classId}`);
    return { success: true };
  } catch (error: any) {
    throw new Error('Failed to add material');
  }
};

// Add assignment to a class
export const addAssignment = async (classId: string, assignment: {
  title: string;
  description: string;
  dueDate: Date;
  maxMarks: number;
}) => {
  await connectDB();
  const user = await currentUser();
  if (!user) throw new Error('User not authenticated');

  try {
    const updatedClass = await Class.findOneAndUpdate(
      { _id: classId, 'teacher.userId': user.id },
      { 
        $push: { 
          assignments: {
            ...assignment,
            isActive: true,
            createdAt: new Date()
          }
        }
      },
      { new: true }
    );

    if (!updatedClass) {
      throw new Error('Class not found or access denied');
    }

    revalidatePath(`/classes/${classId}`);
    return { success: true };
  } catch (error: any) {
    throw new Error('Failed to add assignment');
  }
};

// Add announcement to a class
export const addAnnouncement = async (classId: string, announcement: {
  title: string;
  message: string;
  isImportant: boolean;
}) => {
  await connectDB();
  const user = await currentUser();
  if (!user) throw new Error('User not authenticated');

  try {
    const updatedClass = await Class.findOneAndUpdate(
      { _id: classId, 'teacher.userId': user.id },
      { 
        $push: { 
          announcements: {
            ...announcement,
            createdAt: new Date()
          }
        }
      },
      { new: true }
    );

    if (!updatedClass) {
      throw new Error('Class not found or access denied');
    }

    revalidatePath(`/classes/${classId}`);
    return { success: true };
  } catch (error: any) {
    throw new Error('Failed to add announcement');
  }
};

// Enroll a student in a class
export const enrollStudent = async (classId: string, studentData: IUser) => {
  await connectDB();
  const user = await currentUser();
  if (!user) throw new Error('User not authenticated');

  try {
    const classData = await Class.findById(classId);
    if (!classData) {
      throw new Error('Class not found');
    }

    // Check if student is already enrolled
    const isAlreadyEnrolled = classData.enrolledStudents.some(
      (student: IUser) => student.userId === studentData.userId
    );

    if (isAlreadyEnrolled) {
      throw new Error('Student is already enrolled');
    }

    // Check if class is full
    if (classData.enrolledStudents.length >= classData.maxStudents) {
      throw new Error('Class is full');
    }

    const updatedClass = await Class.findByIdAndUpdate(
      classId,
      { 
        $push: { 
          enrolledStudents: studentData
        }
      },
      { new: true }
    );

    revalidatePath(`/classes/${classId}`);
    return { success: true };
  } catch (error: any) {
    throw new Error(error.message || 'Failed to enroll student');
  }
};

// Get all active classes (for student enrollment)
export const getAllActiveClasses = async () => {
  await connectDB();
  
  try {
    const classes = await Class.find({ isActive: true })
      .select('title description courseCode subject semester academicYear teacher schedule maxStudents enrolledStudents')
      .sort({ createdAt: -1 });
    
    return classes;
  } catch (error: any) {
    throw new Error('Failed to fetch classes');
  }
};

// Get classes for a specific student
export const getStudentClasses = async (userId?: string) => {
  await connectDB();
  
  try {
    const user = userId ? { id: userId } : await currentUser();
    if (!user) throw new Error('User not authenticated');

    const userIdToUse = user.id;

    const classes = await Class.find({
      'enrolledStudents.userId': userIdToUse,
      isActive: true
    })
    .select('title description teacher schedule enrolledStudents assignments')
    .sort({ createdAt: -1 });

    // Transform data for frontend
    return classes.map(classItem => {
      const totalAssignments = classItem.assignments?.length || 0;
      
      // Count pending assignments for this student
      const pendingAssignments = classItem.assignments?.filter((assignment: any) => {
        const studentSubmission = assignment.submissions?.find(
          (sub: any) => sub.studentId === userIdToUse
        );
        
        // Assignment is pending if:
        // 1. Student hasn't submitted yet
        // 2. Due date hasn't passed
        if (!studentSubmission) {
          const dueDate = new Date(assignment.dueDate);
          return dueDate > new Date();
        }
        
        return false;
      }).length || 0;

      return {
        _id: classItem._id.toString(),
        title: classItem.title,
        description: classItem.description,
        teacher: {
          name: `${classItem.teacher.firstName} ${classItem.teacher.lastName}`,
          email: classItem.teacher.userId // Using userId as email placeholder
        },
        schedule: classItem.schedule || [],
        enrolledStudents: classItem.enrolledStudents || [],
        totalAssignments,
        pendingAssignments
      };
    });
  } catch (error: any) {
    console.error('Error fetching student classes:', error);
    throw new Error('Failed to fetch student classes');
  }
};
