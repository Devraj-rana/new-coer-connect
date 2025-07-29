import { IPostDocument } from '@/models/post.model'
import React from 'react'
import Comment from './Comment' 

const Comments = ({post}:{post:IPostDocument}) => {
  return (
    <div> 
        {
            post?.comments?.map((comment)=>{
                return (
                    <Comment key={comment._id} comment={comment} postId={post._id}/>
                )
            })
        } 
    </div>
  )
}

export default Comments