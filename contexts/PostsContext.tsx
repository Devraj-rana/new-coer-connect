"use client";
import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface PostData {
  _id: string;
  userId: string;
  firstName: string;
  lastName: string;
  username: string;
  content: string;
  imageUrl?: string;
  profilePhoto: string;
  createdAt: Date;
  likes: string[];
  comments: any[];
}

interface PostsContextType {
  posts: PostData[];
  addPost: (post: Omit<PostData, '_id'>) => void;
  updatePost: (postId: string, updates: Partial<PostData>) => void;
}

const PostsContext = createContext<PostsContextType | undefined>(undefined);

// Mock initial posts
const initialPosts: PostData[] = [
  {
    _id: "1",
    userId: "user1",
    firstName: "Ajay",
    lastName: "Patel",
    username: "ajayp",
    content: "Excited to share that I've joined COER Connect! This platform is amazing for connecting with fellow developers and sharing knowledge. #COERConnect #Networking",
    profilePhoto: "/images/ajaypp.jpg",
    createdAt: new Date("2024-01-15"),
    likes: ["user2", "user3"],
    comments: []
  },
  {
    _id: "2",
    userId: "user2",
    firstName: "Aryan",
    lastName: "Sharma",
    username: "aryans",
    content: "Just completed a new project using Next.js and TypeScript. The development experience has been fantastic! Would love to share more details with the community.",
    profilePhoto: "/images/aryanc.jpg",
    createdAt: new Date("2024-01-14"),
    likes: ["user1"],
    comments: []
  },
  {
    _id: "3",
    userId: "user3",
    firstName: "Priya",
    lastName: "Singh",
    username: "priyas",
    content: "Looking forward to the upcoming tech meetup! Who else is planning to attend? Let's connect and share ideas about the latest in web development.",
    profilePhoto: "/default-avator.png",
    createdAt: new Date("2024-01-13"),
    likes: ["user1", "user2"],
    comments: []
  }
];

export const PostsProvider = ({ children }: { children: ReactNode }) => {
  const [posts, setPosts] = useState<PostData[]>(initialPosts);

  const addPost = (postData: Omit<PostData, '_id'>) => {
    const newPost: PostData = {
      ...postData,
      _id: `post_${Date.now()}`, // Simple ID generation
    };
    
    setPosts(prevPosts => [newPost, ...prevPosts]); // Add new post at the beginning
  };

  const updatePost = (postId: string, updates: Partial<PostData>) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post._id === postId ? { ...post, ...updates } : post
      )
    );
  };

  return (
    <PostsContext.Provider value={{ posts, addPost, updatePost }}>
      {children}
    </PostsContext.Provider>
  );
};

export const usePosts = () => {
  const context = useContext(PostsContext);
  if (context === undefined) {
    throw new Error('usePosts must be used within a PostsProvider');
  }
  return context;
};
