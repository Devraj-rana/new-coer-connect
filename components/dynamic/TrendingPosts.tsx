"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getTrendingPosts } from '@/lib/dashboardActions';
import { TrendingUp, Heart, MessageCircle, Share2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { IPostDocument } from '@/models/post.model';

export function TrendingPosts() {
  const [posts, setPosts] = useState<IPostDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTrendingPosts = async () => {
      try {
        const trendingPosts = await getTrendingPosts();
        setPosts(trendingPosts || []);
      } catch (error) {
        console.error('Error loading trending posts:', error);
        setPosts([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadTrendingPosts();
  }, []);

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  if (isLoading) {
    return (
      <Card className="surface shadow-lg">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16 mt-1" />
                </div>
              </div>
              <Skeleton className="h-12 w-full" />
              <div className="flex gap-4">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-12" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (posts.length === 0) {
    return (
      <Card className="surface shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Trending Posts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-card-foreground">No trending posts</h3>
            <p className="text-muted-foreground">Check back later for trending content!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="surface shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Trending Posts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {posts.slice(0, 3).map((post, index) => (
          <div key={post._id} className="border-b last:border-b-0 pb-4 last:pb-0">
            <div className="flex items-center gap-2 mb-2">
              <img
                src={post.user?.profilePhoto || '/default-avatar.png'}
                alt={post.user?.firstName || 'User'}
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm text-foreground truncate">
                  {post.user?.firstName} {post.user?.lastName}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {formatTimeAgo(post.createdAt)}
                </p>
              </div>
            </div>
            
            <p className="text-sm text-foreground mb-3 line-clamp-3">{post.description}</p>
            
            {post.imageUrl && (
              <div className="mb-3">
                <img
                  src={post.imageUrl}
                  alt="Post content"
                  className="w-full h-32 object-cover rounded-lg"
                />
              </div>
            )}
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Heart className="w-3 h-3" />
                {post.likes?.length || 0}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="w-3 h-3" />
                {post.comments?.length || 0}
              </span>
              <span className="flex items-center gap-1">
                <Share2 className="w-3 h-3" />
                Share
              </span>
            </div>
          </div>
        ))}
        
        <div className="pt-2">
          <Button asChild variant="outline" className="w-full" size="sm">
            <Link href="/">
              View All Posts
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
