import { useState } from 'react';
import { ThumbsUp, MessageCircle, Share2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from './ui/button';
import { projectId } from '/utils/supabase/info';
import { useAuth } from '../context/AuthContext';

interface PostData {
  id: string;
  userId: string;
  content: string;
  mediaUrl: string | null;
  mediaType: 'image' | 'video' | null;
  timestamp: string;
  likes: number;
  likedBy: string[];
  user: {
    name: string;
    avatar: string | null;
  };
}

interface PostProps {
  post: PostData;
  onUpdate: () => void;
}

export function Post({ post, onUpdate }: PostProps) {
  const { user, accessToken } = useAuth();
  const [isLiking, setIsLiking] = useState(false);

  const hasLiked = post.likedBy?.includes(user?.id || '');

  const handleLike = async () => {
    if (isLiking) return;

    setIsLiking(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-7c20c7e0/posts/${post.id}/like`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error liking post:', error);
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        borderRadius: '8px',
        border: '1px solid var(--color-border)',
      }}
      className="shadow-sm mb-4"
    >
      {/* Post Header */}
      <div className="p-4">
        <div className="flex items-center space-x-3">
          <div
            style={{
              backgroundColor: 'var(--color-primary)',
              color: 'white',
            }}
            className="w-10 h-10 rounded-full flex items-center justify-center font-semibold"
          >
            {post.user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h3 style={{ color: 'var(--color-text)' }} className="font-semibold">
              {post.user?.name || 'Unknown User'}
            </h3>
            <p style={{ color: 'var(--color-text-secondary)' }} className="text-xs">
              {formatDistanceToNow(new Date(post.timestamp), { addSuffix: true })}
            </p>
          </div>
        </div>

        {/* Post Content */}
        {post.content && (
          <p style={{ color: 'var(--color-text)' }} className="mt-3 whitespace-pre-wrap">
            {post.content}
          </p>
        )}
      </div>

      {/* Post Media */}
      {post.mediaUrl && (
        <div className="w-full">
          {post.mediaType === 'image' ? (
            <img
              src={post.mediaUrl}
              alt="Post content"
              className="w-full max-h-[600px] object-cover"
            />
          ) : (
            <video
              src={post.mediaUrl}
              controls
              className="w-full max-h-[600px]"
            />
          )}
        </div>
      )}

      {/* Post Stats */}
      <div
        style={{ borderTop: '1px solid var(--color-border)' }}
        className="px-4 py-2"
      >
        <div className="flex items-center justify-between">
          <div style={{ color: 'var(--color-text-secondary)' }} className="text-sm">
            {post.likes > 0 && (
              <span className="flex items-center">
                <span
                  style={{ backgroundColor: 'var(--color-primary)' }}
                  className="inline-flex items-center justify-center w-5 h-5 rounded-full text-white text-xs mr-1"
                >
                  👍
                </span>
                {post.likes}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Post Actions */}
      <div
        style={{
          borderTop: '1px solid var(--color-border)',
          borderBottom: '1px solid var(--color-border)',
        }}
        className="px-2 py-1"
      >
        <div className="flex items-center justify-around">
          <Button
            variant="ghost"
            onClick={handleLike}
            disabled={isLiking}
            style={{
              color: hasLiked ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            }}
            className="flex-1 hover:bg-[var(--color-hover)] py-2"
          >
            <ThumbsUp className={`h-5 w-5 mr-2 ${hasLiked ? 'fill-current' : ''}`} />
            Like
          </Button>
          <Button
            variant="ghost"
            style={{ color: 'var(--color-text-secondary)' }}
            className="flex-1 hover:bg-[var(--color-hover)] py-2"
          >
            <MessageCircle className="h-5 w-5 mr-2" />
            Comment
          </Button>
          <Button
            variant="ghost"
            style={{ color: 'var(--color-text-secondary)' }}
            className="flex-1 hover:bg-[var(--color-hover)] py-2"
          >
            <Share2 className="h-5 w-5 mr-2" />
            Share
          </Button>
        </div>
      </div>
    </div>
  );
}
