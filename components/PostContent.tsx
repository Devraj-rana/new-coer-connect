import Image from 'next/image'
import React from 'react'

interface PostData {
  _id: string;
  userId: string;
  firstName: string;
  lastName: string;
  username: string;
  content: string;
  description: string;
  imageUrl?: string;
  profilePhoto: string;
  createdAt: Date;
  likes: string[];
  comments: any[];
  user: {
    userId: string;
    firstName: string;
    lastName: string;
    profilePhoto: string;
  };
}

const PostContent = ({ post }: { post: PostData }) => {
  return (
    <div className='my-3'>
      <p className='my-3 px-4'>{post?.content}</p>
      {
        post?.imageUrl && (
          <Image
            src={post?.imageUrl}
            width={500}
            height={500}
            alt="post-image"
            className='w-full mx-auto'
          />
        )
      }
    </div>
  )
}

export default PostContent;