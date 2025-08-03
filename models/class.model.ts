import { Document, Schema, model, models } from "mongoose";
import { IUser } from "./user.model";

export interface IClass extends Document {
  _id: string;
  title: string;
  description: string;
  courseCode: string;
  subject: string;
  semester: string;
  academicYear: string;
  schedule: {
    dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
    startTime: string;
    endTime: string;
    room?: string;
  }[];
  teacher: IUser;
  enrolledStudents: IUser[];
  maxStudents: number;
  isActive: boolean;
  materials: {
    title: string;
    type: 'PDF' | 'Video' | 'Article' | 'Code' | 'Link';
    url: string;
    description?: string;
    uploadDate: Date;
  }[];
  assignments: {
    title: string;
    description: string;
    dueDate: Date;
    maxMarks: number;
    isActive: boolean;
    createdAt: Date;
  }[];
  announcements: {
    title: string;
    message: string;
    isImportant: boolean;
    createdAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const ClassSchema = new Schema<IClass>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  courseCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  subject: {
    type: String,
    required: true
  },
  semester: {
    type: String,
    required: true,
    enum: ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th']
  },
  academicYear: {
    type: String,
    required: true
  },
  schedule: [{
    dayOfWeek: {
      type: String,
      required: true,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    startTime: {
      type: String,
      required: true
    },
    endTime: {
      type: String,
      required: true
    },
    room: {
      type: String
    }
  }],
  teacher: {
    type: Object,
    required: true
  },
  enrolledStudents: [{
    type: Object,
    default: []
  }],
  maxStudents: {
    type: Number,
    required: true,
    min: 1,
    max: 200
  },
  isActive: {
    type: Boolean,
    default: true
  },
  materials: [{
    title: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true,
      enum: ['PDF', 'Video', 'Article', 'Code', 'Link']
    },
    url: {
      type: String,
      required: true
    },
    description: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  assignments: [{
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    dueDate: {
      type: Date,
      required: true
    },
    maxMarks: {
      type: Number,
      required: true,
      min: 1
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  announcements: [{
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    isImportant: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Create indexes for better performance
ClassSchema.index({ teacher: 1 });
ClassSchema.index({ courseCode: 1 });
ClassSchema.index({ isActive: 1 });
ClassSchema.index({ 'enrolledStudents.userId': 1 });

export const Class = models?.Class || model<IClass>("Class", ClassSchema);
