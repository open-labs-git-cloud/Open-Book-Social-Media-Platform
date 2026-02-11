import { useState, useEffect } from "react";
import { useParams } from "react-router";
import { MapPin, Calendar, Mail } from "lucide-react";
import { Post } from "./Post";
import { useAuth } from "../context/AuthContext";
import { projectId } from "/utils/supabase/info";
import { format } from "date-fns";

interface ProfileData {
  user: {
    id: string;
    email: string;
    name: string;
    avatar: string | null;
    bio?: string;
    location?: string;
    createdAt: string;
  };
  posts: any[];
}

export function Profile() {
  const { userId } = useParams();
  const { accessToken } = useAuth();
  const [profileData, setProfileData] =
    useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    if (!userId) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-7c20c7e0/profile/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setProfileData(data);
      } else {
        console.error("Failed to fetch profile");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken && userId) {
      fetchProfile();
    }
  }, [accessToken, userId]);

  if (loading) {
    return (
      <div
        style={{ backgroundColor: "var(--color-background)" }}
        className="min-h-screen flex items-center justify-center"
      >
        <div
          style={{ color: "var(--color-text)" }}
          className="text-xl"
        >
          Loading profile...
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div
        style={{ backgroundColor: "var(--color-background)" }}
        className="min-h-screen flex items-center justify-center"
      >
        <div
          style={{ color: "var(--color-text)" }}
          className="text-xl"
        >
          User not found
        </div>
      </div>
    );
  }

  return (
    <div
      style={{ backgroundColor: "var(--color-background)" }}
      className="min-h-screen"
    >
      {/* Cover Photo */}
      <div
        style={{
          background: `linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)`,
        }}
        className="h-80 w-full"
      />

      {/* Profile Info */}
      <div className="max-w-5xl mx-auto px-4">
        <div
          style={{
            backgroundColor: "var(--color-surface)",
            borderRadius: "8px",
            border: "1px solid var(--color-border)",
          }}
          className="relative -mt-20 shadow-lg p-6"
        >
          <div className="flex flex-col md:flex-row items-center md:items-end space-y-4 md:space-y-0 md:space-x-6">
            {/* Profile Picture */}
            <div
              style={{
                backgroundColor: "var(--color-primary)",
                color: "white",
                border: "4px solid var(--color-surface)",
              }}
              className="w-40 h-40 rounded-full flex items-center justify-center text-6xl font-bold shadow-lg"
            >
              {profileData.user.name.charAt(0).toUpperCase()}
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <h1
                style={{ color: "var(--color-text)" }}
                className="text-3xl font-bold mb-1"
              >
                {profileData.user.name}
              </h1>

              {profileData.user.bio && (
                <p
                  style={{ color: "var(--color-text)" }}
                  className="text-base mb-2 mt-2"
                >
                  {profileData.user.bio}
                </p>
              )}

              <div
                style={{ color: "var(--color-text-secondary)" }}
                className="space-y-1 text-sm"
              >
                <div className="flex items-center justify-center md:justify-start">
                  <Mail className="h-4 w-4 mr-2" />
                  {profileData.user.email}
                </div>
                {profileData.user.location && (
                  <div className="flex items-center justify-center md:justify-start">
                    <MapPin className="h-4 w-4 mr-2" />
                    {profileData.user.location}
                  </div>
                )}
                <div className="flex items-center justify-center md:justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  Joined{" "}
                  {format(
                    new Date(profileData.user.createdAt),
                    "MMMM yyyy",
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Posts Section */}
        <div className="mt-6 max-w-2xl mx-auto">
          <h2
            style={{ color: "var(--color-text)" }}
            className="text-xl font-semibold mb-4"
          >
            Posts
          </h2>

          {profileData.posts.length === 0 ? (
            <div
              style={{
                backgroundColor: "var(--color-surface)",
                color: "var(--color-text-secondary)",
                borderRadius: "8px",
                border: "1px solid var(--color-border)",
              }}
              className="text-center py-12"
            >
              <p className="text-lg">No posts yet</p>
            </div>
          ) : (
            <div>
              {profileData.posts.map((post) => (
                <Post
                  key={post.id}
                  post={{ ...post, user: profileData.user }}
                  onUpdate={fetchProfile}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}