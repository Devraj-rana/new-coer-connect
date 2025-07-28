import React from 'react';
import Post from './Post';
import { getAllPosts } from '@/lib/serveractions';

interface DatabasePost {
  _id: string;
  user: {
    userId: string;
    firstName: string;
    lastName: string;
    profilePhoto: string;
  };
  description: string;
  imageUrl?: string;
  createdAt: Date;
  likes: string[];
  comments: any[];
}

interface PostData {
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

const Posts = async () => {
  let databasePosts: DatabasePost[] = [];
  
  try {
    databasePosts = await getAllPosts() || [];
  } catch (error) {
    console.error('Error fetching posts:', error);
  }

  // Transform database posts to component format
  const transformedPosts: PostData[] = databasePosts.map(post => ({
    _id: post._id,
    userId: post.user.userId,
    firstName: post.user.firstName,
    lastName: post.user.lastName,
    username: `${post.user.firstName.toLowerCase()}${post.user.lastName.toLowerCase()}`,
    content: post.description,
    imageUrl: post.imageUrl,
    profilePhoto: post.user.profilePhoto,
    createdAt: post.createdAt,
    likes: post.likes || [],
    comments: post.comments || []
  }));

  // Mock data for demonstration (fallback if no real posts)
  const mockPosts: PostData[] = [
    {
      _id: "mock1",
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
      _id: "mock2",
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
      _id: "mock3",
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

  // Use real posts if available, otherwise show mock posts
  const displayPosts = transformedPosts.length > 0 ? transformedPosts : mockPosts;

  if (displayPosts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <p className="text-gray-500">No posts yet. Be the first to share something!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {displayPosts.map((post) => (
        <Post key={post._id} post={post} />
      ))}
    </div>
  );
};

export default Posts;