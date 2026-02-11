import { useState, useRef } from 'react';
import { Image, Video, Smile, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { projectId } from '/utils/supabase/info';

interface CreatePostProps {
  onPostCreated: () => void;
}

export function CreatePost({ onPostCreated }: CreatePostProps) {
  const { user, accessToken } = useAuth();
  const [content, setContent] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMediaFile(file);
    const type = file.type.startsWith('video/') ? 'video' : 'image';
    setMediaType(type);

    const reader = new FileReader();
    reader.onloadend = () => {
      setMediaPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const clearMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    setMediaType(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!content.trim() && !mediaFile) return;

    setLoading(true);
    try {
      let mediaUrl = null;
      let uploadedMediaType = null;

      // Upload media if present
      if (mediaFile && accessToken) {
        const formData = new FormData();
        formData.append('file', mediaFile);

        const uploadResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-7c20c7e0/upload`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
            body: formData,
          }
        );

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          mediaUrl = uploadData.url;
          uploadedMediaType = uploadData.type;
        } else {
          throw new Error('Failed to upload media');
        }
      }

      // Create post
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-7c20c7e0/posts`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            content: content.trim(),
            mediaUrl,
            mediaType: uploadedMediaType,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create post');
      }

      // Reset form
      setContent('');
      clearMedia();
      onPostCreated();
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        borderRadius: '8px',
        border: '1px solid var(--color-border)',
      }}
      className="p-4 shadow-sm mb-4"
    >
      <div className="flex items-start space-x-3">
        <div
          style={{
            backgroundColor: 'var(--color-primary)',
            color: 'white',
          }}
          className="w-10 h-10 rounded-full flex items-center justify-center font-semibold flex-shrink-0"
        >
          {user?.name?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div className="flex-1">
          <Textarea
            placeholder={`What's on your mind, ${user?.name}?`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{
              backgroundColor: 'var(--color-hover)',
              color: 'var(--color-text)',
              border: 'none',
            }}
            className="resize-none min-h-[60px] mb-2"
          />

          {mediaPreview && (
            <div className="relative mb-3">
              <button
                onClick={clearMedia}
                style={{ backgroundColor: 'var(--color-surface)' }}
                className="absolute top-2 right-2 p-1 rounded-full shadow-lg hover:opacity-80"
              >
                <X className="h-5 w-5" />
              </button>
              {mediaType === 'image' ? (
                <img
                  src={mediaPreview}
                  alt="Preview"
                  className="w-full rounded-lg max-h-96 object-cover"
                />
              ) : (
                <video
                  src={mediaPreview}
                  controls
                  className="w-full rounded-lg max-h-96"
                />
              )}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
                id="media-upload"
              />
              <label htmlFor="media-upload">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                  className="hover:bg-[var(--color-hover)]"
                  onClick={() => fileInputRef.current?.click()}
                  asChild
                >
                  <span className="cursor-pointer flex items-center">
                    <Image className="h-5 w-5 mr-1" style={{ color: '#45bd62' }} />
                    Photo/Video
                  </span>
                </Button>
              </label>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={loading || (!content.trim() && !mediaFile)}
              style={{
                backgroundColor: 'var(--color-primary)',
                color: 'white',
              }}
              className="px-6 hover:opacity-90 disabled:opacity-50"
            >
              {loading ? 'Posting...' : 'Post'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
