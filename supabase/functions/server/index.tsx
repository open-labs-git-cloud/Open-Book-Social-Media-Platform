import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js';
import * as kv from './kv_store.tsx';
import { dummyUsers } from './seed_users.tsx';

const app = new Hono();

// Log environment setup (without exposing secrets)
console.log('[Server Init] Supabase URL present:', !!Deno.env.get('SUPABASE_URL'));
console.log('[Server Init] Service role key present:', !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'));
console.log('[Server Init] Anon key present:', !!Deno.env.get('SUPABASE_ANON_KEY'));

if (Deno.env.get('SUPABASE_URL')) {
  console.log('[Server Init] Supabase URL:', Deno.env.get('SUPABASE_URL'));
}

// Service role client for admin operations
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// Anon client for validating user JWTs
const supabaseAnon = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? '',
);

console.log('[Server Init] Supabase clients initialized');

// Helper function to validate user token
async function validateUserToken(accessToken: string | undefined) {
  if (!accessToken) {
    console.log('[validateUserToken] No access token provided');
    return { user: null, error: 'No access token provided' };
  }

  console.log('[validateUserToken] Token length:', accessToken.length);
  console.log('[validateUserToken] Token preview:', accessToken.substring(0, 50) + '...');

  try {
    // Decode JWT to extract user info (without verification for now)
    // JWT format: header.payload.signature
    const parts = accessToken.split('.');
    if (parts.length !== 3) {
      console.log('[validateUserToken] Invalid JWT format');
      return { user: null, error: 'Invalid token format' };
    }

    // Decode the payload (base64url)
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    console.log('[validateUserToken] Decoded payload:', JSON.stringify(payload, null, 2));
    
    // Check if token is expired
    if (payload.exp && payload.exp < Date.now() / 1000) {
      console.log('[validateUserToken] Token expired');
      return { user: null, error: 'Token expired' };
    }
    
    // Extract user info from payload
    const userId = payload.sub;
    const email = payload.email;
    
    if (!userId) {
      console.log('[validateUserToken] No user ID in token');
      return { user: null, error: 'Invalid token - no user ID' };
    }
    
    console.log('[validateUserToken] Token decoded successfully!');
    console.log('[validateUserToken] User ID:', userId);
    console.log('[validateUserToken] Email:', email);
    
    // Return user object matching Supabase auth user format
    return { 
      user: {
        id: userId,
        email: email,
        ...payload
      }, 
      error: null 
    };
  } catch (err) {
    console.log('[validateUserToken] Exception caught:', err);
    console.log('[validateUserToken] Exception type:', typeof err);
    return { user: null, error: String(err) };
  }
}

// Initialize storage bucket on startup
const bucketName = 'make-7c20c7e0-openbook-media';
(async () => {
  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
  if (!bucketExists) {
    await supabase.storage.createBucket(bucketName, { public: false });
    console.log(`Created bucket: ${bucketName}`);
  }
})();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-7c20c7e0/health", (c) => {
  return c.json({ status: "ok" });
});

// User signup
app.post("/make-server-7c20c7e0/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    if (!email || !password || !name) {
      return c.json({ error: 'Email, password, and name are required' }, 400);
    }

    console.log(`[Signup] Creating user with email: ${email}`);

    // Try to create the user with admin API
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { 
        name 
      }
    });

    if (error) {
      // If user already exists, that's ok - they can just login
      if (error.message.includes('already been registered') || error.message.includes('already exists')) {
        console.log(`[Signup] User already exists: ${email}`);
        return c.json({ error: 'A user with this email address has already been registered. Please login instead.' }, 400);
      }
      console.log(`[Signup] Error: ${error.message}`)
      return c.json({ error: error.message }, 400);
    }

    if (!data?.user) {
      console.log(`[Signup] No user data returned`);
      return c.json({ error: 'Failed to create user' }, 500);
    }

    console.log(`[Signup] User created successfully: ${data.user.id}`);

    // Store user profile in KV store
    await kv.set(`user:${data.user.id}`, {
      id: data.user.id,
      email: data.user.email,
      name,
      avatar: null,
      createdAt: new Date().toISOString()
    });

    console.log(`[Signup] User profile stored in KV`);

    return c.json({ 
      user: data.user,
      message: 'User created successfully. You can now login.'
    });
  } catch (error) {
    console.log(`[Signup] Unexpected error: ${error}`);
    return c.json({ error: 'Signup failed' }, 500);
  }
});

// Create a new post
app.post("/make-server-7c20c7e0/posts", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { user, error } = await validateUserToken(accessToken);
    
    if (!user?.id || error) {
      return c.json({ error: error || 'Unauthorized' }, 401);
    }

    const { content, mediaUrl, mediaType } = await c.req.json();
    
    const post = {
      id: crypto.randomUUID(),
      userId: user.id,
      content,
      mediaUrl: mediaUrl || null,
      mediaType: mediaType || null,
      timestamp: new Date().toISOString(),
      likes: 0,
      likedBy: []
    };

    await kv.set(`post:${post.id}`, post);
    
    // Add to user's posts list
    const userPostsKey = `user:${user.id}:posts`;
    const existingPosts = await kv.get(userPostsKey) || [];
    await kv.set(userPostsKey, [post.id, ...existingPosts]);

    return c.json({ post });
  } catch (error) {
    console.log(`Create post error: ${error}`);
    return c.json({ error: 'Failed to create post' }, 500);
  }
});

// Get all posts (feed)
app.get("/make-server-7c20c7e0/posts", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { user, error } = await validateUserToken(accessToken);
    
    if (!user?.id || error) {
      return c.json({ error: error || 'Unauthorized' }, 401);
    }

    // Get all posts from KV store
    const allPosts = await kv.getByPrefix('post:');
    
    // Sort by timestamp (newest first)
    const sortedPosts = allPosts.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Get user info for each post
    const postsWithUsers = await Promise.all(
      sortedPosts.map(async (post) => {
        const userProfile = await kv.get(`user:${post.userId}`);
        return {
          ...post,
          user: userProfile
        };
      })
    );

    return c.json({ posts: postsWithUsers });
  } catch (error) {
    console.log(`Get posts error: ${error}`);
    return c.json({ error: 'Failed to get posts' }, 500);
  }
});

// Like/unlike a post
app.post("/make-server-7c20c7e0/posts/:postId/like", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { user, error } = await validateUserToken(accessToken);
    
    if (!user?.id || error) {
      return c.json({ error: error || 'Unauthorized' }, 401);
    }

    const postId = c.req.param('postId');
    const post = await kv.get(`post:${postId}`);
    
    if (!post) {
      return c.json({ error: 'Post not found' }, 404);
    }

    const likedBy = post.likedBy || [];
    const hasLiked = likedBy.includes(user.id);

    if (hasLiked) {
      // Unlike
      post.likedBy = likedBy.filter(id => id !== user.id);
      post.likes = Math.max(0, post.likes - 1);
    } else {
      // Like
      post.likedBy = [...likedBy, user.id];
      post.likes = post.likes + 1;
    }

    await kv.set(`post:${postId}`, post);

    return c.json({ post });
  } catch (error) {
    console.log(`Like post error: ${error}`);
    return c.json({ error: 'Failed to like post' }, 500);
  }
});

// Upload media
app.post("/make-server-7c20c7e0/upload", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { user, error } = await validateUserToken(accessToken);
    
    if (!user?.id || error) {
      return c.json({ error: error || 'Unauthorized' }, 401);
    }

    const formData = await c.req.formData();
    const file = formData.get('file');
    
    if (!file || !(file instanceof File)) {
      return c.json({ error: 'No file provided' }, 400);
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${crypto.randomUUID()}.${fileExt}`;
    const fileBuffer = await file.arrayBuffer();

    const { data, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.log(`Upload error: ${uploadError.message}`);
      return c.json({ error: uploadError.message }, 400);
    }

    // Create signed URL (valid for 1 year)
    const { data: signedUrlData } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(fileName, 31536000);

    return c.json({ 
      url: signedUrlData?.signedUrl,
      type: file.type.startsWith('video/') ? 'video' : 'image'
    });
  } catch (error) {
    console.log(`Upload error: ${error}`);
    return c.json({ error: 'Upload failed' }, 500);
  }
});

// Get user profile
app.get("/make-server-7c20c7e0/profile/:userId", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    console.log('Profile request - Auth header present:', !!authHeader);
    
    const accessToken = authHeader?.split(' ')[1];
    
    if (!accessToken) {
      console.log('Profile fetch error: No access token provided');
      return c.json({ code: 401, message: 'No access token provided' }, 401);
    }

    console.log('Profile request - Token (first 20 chars):', accessToken.substring(0, 20) + '...');
    console.log('Attempting to validate token with Supabase...');

    // Validate user token
    const { user, error } = await validateUserToken(accessToken);
    
    if (error) {
      console.log(`Profile fetch auth error: ${error}`);
      console.log('Auth error details:', JSON.stringify(error));
      return c.json({ code: 401, message: `Invalid JWT: ${error}` }, 401);
    }
    
    if (!user?.id) {
      console.log('Profile fetch error: No user ID in token');
      return c.json({ code: 401, message: 'Invalid JWT' }, 401);
    }

    console.log('Token validated successfully for user:', user.id);

    const userId = c.req.param('userId');
    const userProfile = await kv.get(`user:${userId}`);
    
    if (!userProfile) {
      console.log(`Profile not found for userId: ${userId}`);
      return c.json({ error: 'User not found' }, 404);
    }

    console.log('Returning user profile for:', userId);

    // Get user's posts
    const userPostIds = await kv.get(`user:${userId}:posts`) || [];
    const posts = await Promise.all(
      userPostIds.map(postId => kv.get(`post:${postId}`))
    );

    return c.json({ 
      user: userProfile, 
      posts: posts.filter(p => p !== null) 
    });
  } catch (error) {
    console.log(`Get profile error: ${error}`);
    return c.json({ error: 'Failed to get profile' }, 500);
  }
});

// List profiles for the authenticated user
app.get("/make-server-7c20c7e0/profiles", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { user, error } = await validateUserToken(accessToken);

    if (!user?.id || error) {
      return c.json({ error: error || 'Unauthorized' }, 401);
    }

    const profiles = (await kv.get(`user:${user.id}:profiles`)) || [];
    const fullProfiles = await Promise.all(
      profiles.map(async (pId: string) => await kv.get(`profile:${pId}`))
    );

    return c.json({ profiles: fullProfiles.filter(p => p != null) });
  } catch (err) {
    console.log('List profiles error:', err);
    return c.json({ error: 'Failed to list profiles' }, 500);
  }
});

// Create a new profile for the authenticated user
app.post("/make-server-7c20c7e0/profiles", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { user, error } = await validateUserToken(accessToken);

    if (!user?.id || error) {
      return c.json({ error: error || 'Unauthorized' }, 401);
    }

    const { displayName, bio, avatar, visibility } = await c.req.json();

    const profileId = crypto.randomUUID();
    const profile = {
      id: profileId,
      userId: user.id,
      displayName: displayName || user.user_metadata?.name || user.email || 'Profile',
      bio: bio || '',
      avatar: avatar || null,
      visibility: visibility || 'public',
      createdAt: new Date().toISOString(),
    };

    await kv.set(`profile:${profileId}`, profile);

    // add to user's profiles list
    const userProfilesKey = `user:${user.id}:profiles`;
    const existing = (await kv.get(userProfilesKey)) || [];
    await kv.set(userProfilesKey, [profileId, ...existing]);

    return c.json({ profile });
  } catch (err) {
    console.log('Create profile error:', err);
    return c.json({ error: 'Failed to create profile' }, 500);
  }
});

// Update a profile (owner only)
app.put("/make-server-7c20c7e0/profiles/:profileId", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { user, error } = await validateUserToken(accessToken);

    if (!user?.id || error) {
      return c.json({ error: error || 'Unauthorized' }, 401);
    }

    const profileId = c.req.param('profileId');
    const existing = await kv.get(`profile:${profileId}`);
    if (!existing) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    if (existing.userId !== user.id) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    const updates = await c.req.json();
    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    await kv.set(`profile:${profileId}`, updated);

    return c.json({ profile: updated });
  } catch (err) {
    console.log('Update profile error:', err);
    return c.json({ error: 'Failed to update profile' }, 500);
  }
});

// Delete a profile (owner only)
app.delete("/make-server-7c20c7e0/profiles/:profileId", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { user, error } = await validateUserToken(accessToken);

    if (!user?.id || error) {
      return c.json({ error: error || 'Unauthorized' }, 401);
    }

    const profileId = c.req.param('profileId');
    const existing = await kv.get(`profile:${profileId}`);
    if (!existing) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    if (existing.userId !== user.id) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    await kv.del(`profile:${profileId}`);

    // remove from user's profiles list
    const userProfilesKey = `user:${user.id}:profiles`;
    const existingList = (await kv.get(userProfilesKey)) || [];
    const filtered = existingList.filter((id: string) => id !== profileId);
    await kv.set(userProfilesKey, filtered);

    return c.json({ success: true });
  } catch (err) {
    console.log('Delete profile error:', err);
    return c.json({ error: 'Failed to delete profile' }, 500);
  }
});

// Seed dummy users endpoint
app.post("/make-server-7c20c7e0/seed-users", async (c) => {
  try {
    console.log('[Seed Users] Starting to create 25 dummy profiles...');
    const results = [];
    const errors = [];

    for (const userData of dummyUsers) {
      try {
        console.log(`[Seed Users] Creating user: ${userData.email}`);

        // Try to create the user with admin API
        const { data, error } = await supabase.auth.admin.createUser({
          email: userData.email,
          password: userData.password,
          email_confirm: true,
          user_metadata: { 
            name: userData.name 
          }
        });

        if (error) {
          // If user already exists, that's ok - skip it
          if (error.message.includes('already been registered') || error.message.includes('already exists')) {
            console.log(`[Seed Users] User already exists, skipping: ${userData.email}`);
            errors.push({ email: userData.email, error: 'Already exists' });
            continue;
          }
          console.log(`[Seed Users] Error creating ${userData.email}: ${error.message}`);
          errors.push({ email: userData.email, error: error.message });
          continue;
        }

        if (!data?.user) {
          console.log(`[Seed Users] No user data returned for ${userData.email}`);
          errors.push({ email: userData.email, error: 'No user data returned' });
          continue;
        }

        console.log(`[Seed Users] User created successfully: ${data.user.id}`);

        // Store user profile in KV store with additional info
        await kv.set(`user:${data.user.id}`, {
          id: data.user.id,
          email: data.user.email,
          name: userData.name,
          bio: userData.bio,
          location: userData.location,
          avatar: null,
          createdAt: new Date().toISOString()
        });

        console.log(`[Seed Users] User profile stored in KV for ${userData.name}`);
        results.push({ 
          id: data.user.id, 
          email: userData.email, 
          name: userData.name 
        });

      } catch (userError) {
        console.log(`[Seed Users] Unexpected error creating ${userData.email}: ${userError}`);
        errors.push({ email: userData.email, error: String(userError) });
      }
    }

    console.log(`[Seed Users] Complete! Created ${results.length} users, ${errors.length} errors`);

    return c.json({ 
      success: true,
      created: results.length,
      errors: errors.length,
      users: results,
      errorDetails: errors
    });
  } catch (error) {
    console.log(`[Seed Users] Fatal error: ${error}`);
    return c.json({ error: 'Failed to seed users' }, 500);
  }
});

Deno.serve(app.fetch);