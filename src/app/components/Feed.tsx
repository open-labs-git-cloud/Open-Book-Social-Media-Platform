import { useState, useEffect } from 'react';
import { CreatePost } from './CreatePost';
import { Post } from './Post';
import { useAuth } from '../context/AuthContext';
import { projectId } from '/utils/supabase/info';

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

export function Feed() {
  const { accessToken } = useAuth();
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-7c20c7e0/posts`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
      } else {
        console.error('Failed to fetch posts');
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchPosts();
    }
  }, [accessToken]);

  return (
    <div className="max-w-2xl mx-auto py-4 px-4">
      <CreatePost onPostCreated={fetchPosts} />

      {loading ? (
        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text)',
          }}
          className="text-center py-8 rounded-lg"
        >
          Loading posts...
        </div>
      ) : posts.length === 0 ? (
        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text-secondary)',
            borderRadius: '8px',
            border: '1px solid var(--color-border)',
          }}
          className="text-center py-12"
        >
          <p className="text-lg mb-2">No posts yet</p>
          <p className="text-sm">Be the first to share something!</p>
        </div>
      ) : (
        <div>
          {posts.map((post) => (
            <Post key={post.id} post={post} onUpdate={fetchPosts} />
          ))}
        </div>
      )}
    </div>
  );
}
