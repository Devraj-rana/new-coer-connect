"use client";
import { ICommentDocument } from '@/models/comment.model'
import React from 'react'
import ProfilePhoto from './shared/ProfilePhoto'
import ReactTimeago from 'react-timeago'
import { useUser } from '@clerk/nextjs'
import { Button } from './ui/button'
import { Trash2 } from 'lucide-react'
import { deleteCommentAction } from '@/lib/serveractions'
import { toast } from 'sonner'
import { isUserAdmin } from '@/lib/admin'

interface CommentProps {
    comment: ICommentDocument;
    postId: string;
}

const Comment = ({ comment, postId }: CommentProps) => {
    const { user } = useUser();
    const isOwner = user?.id === comment.user.userId;
    const isAdmin = isUserAdmin(user?.username || undefined);
    const canDelete = isOwner || isAdmin;

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this comment?")) {
            return;
        }
        
        try {
            await deleteCommentAction(comment._id, postId);
            toast.success("Comment deleted successfully!");
        } catch (error: any) {
            console.error("Delete comment error:", error);
            toast.error(error.message || "Failed to delete comment");
        }
    };
    return (
        <div className='flex gap-2 my-4'>
            <div className='mt-2'>
                <ProfilePhoto src={comment?.user?.profilePhoto!} />
            </div>
            <div className='flex flex-1 justify-between p-3 bg-[#F2F2F2] rounded-lg'>
                <div className='flex-1'>
                    <h1 className='text-sm font-medium'>{`${comment?.user?.firstName} ${comment?.user?.lastName}`}</h1>
                    <p className='text-xs text-gray-500'>@{comment?.user?.firstName}</p>
                    <p className='my-2'>{comment.textMessage}</p>
                </div>
                <div className='flex items-start gap-2'>
                    <p className='text-xs text-gray-500'>
                        <ReactTimeago date={new Date(comment.createdAt)} />
                    </p>
                    {canDelete && (
                        <Button
                            onClick={handleDelete}
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                        >
                            <Trash2 className="h-3 w-3" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Comment