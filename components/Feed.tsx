import React from 'react';
import PostInput from './PostInput';
import Posts from './Posts';
import { User } from '@clerk/nextjs/server';

interface FeedProps {
  user: User | null;
}

const Feed = ({ user }: FeedProps) => {
  const userData = user ? JSON.parse(JSON.stringify(user)) : null;
    
  return (
    <div className="space-y-4">
      <PostInput user={userData} />
      <Posts />
    </div>
  );
};

export default Feed;