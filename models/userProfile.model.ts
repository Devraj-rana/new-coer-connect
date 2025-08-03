import mongoose, { Document, Model } from "mongoose";

export interface IUserProfile {
    userId: string; // Clerk user ID
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    bio?: string;
    location?: string;
    website?: string;
    company?: string;
    position?: string;
    profilePhoto: string;
    coverPhoto?: string;
    dateOfBirth?: Date;
    role: 'student' | 'teacher' | 'admin';
    academicYear?: '1st' | '2nd' | '3rd' | '4th';
    branch?: 'BCA' | 'B.Tech' | 'MCA' | 'M.Tech' | 'BBA' | 'MBA' | 'BSc' | 'MSc' | 'Other';
    skills?: string[];
    education?: {
        institution: string;
        degree: string;
        fieldOfStudy: string;
        startYear: number;
        endYear?: number;
    }[];
    experience?: {
        company: string;
        position: string;
        description?: string;
        startDate: Date;
        endDate?: Date;
        current: boolean;
    }[];
    socialLinks?: {
        linkedin?: string;
        twitter?: string;
        github?: string;
        instagram?: string;
    };
    isProfileComplete: boolean;
    isOnboardingComplete: boolean;
}

export interface IUserProfileDocument extends IUserProfile, Document {
    createdAt: Date;
    updatedAt: Date;
}

const userProfileSchema = new mongoose.Schema<IUserProfileDocument>({
    userId: {
        type: String,
        required: true,
        unique: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        default: ""
    },
    bio: {
        type: String,
        default: ""
    },
    location: {
        type: String,
        default: ""
    },
    website: {
        type: String,
        default: ""
    },
    company: {
        type: String,
        default: ""
    },
    position: {
        type: String,
        default: ""
    },
    profilePhoto: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['student', 'teacher', 'admin'],
        required: true,
        default: 'student'
    },
    academicYear: {
        type: String,
        enum: ['1st', '2nd', '3rd', '4th'],
        required: function(this: IUserProfileDocument) { return this.role === 'student'; }
    },
    branch: {
        type: String,
        enum: ['BCA', 'B.Tech', 'MCA', 'M.Tech', 'BBA', 'MBA', 'BSc', 'MSc', 'Other'],
        required: function(this: IUserProfileDocument) { return this.role === 'student'; }
    },
    coverPhoto: {
        type: String,
        default: ""
    },
    dateOfBirth: {
        type: Date
    },
    skills: [{
        type: String
    }],
    education: [{
        institution: String,
        degree: String,
        fieldOfStudy: String,
        startYear: Number,
        endYear: Number
    }],
    experience: [{
        company: String,
        position: String,
        description: String,
        startDate: Date,
        endDate: Date,
        current: Boolean
    }],
    socialLinks: {
        linkedin: String,
        twitter: String,
        github: String,
        instagram: String
    },
    isProfileComplete: {
        type: Boolean,
        default: false
    },
    isOnboardingComplete: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

export const UserProfile: Model<IUserProfileDocument> = mongoose.models?.UserProfile || mongoose.model("UserProfile", userProfileSchema);
