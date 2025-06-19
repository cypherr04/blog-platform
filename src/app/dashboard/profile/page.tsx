"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserProfile() {
      try {
        setIsLoading(true);
        
        // Check if user is authenticated
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          router.push("/login");
          return;
        }

        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError) throw profileError;

        setUser(session.user);
        setProfile(profileData || {
          id: session.user.id,
          full_name: '',
          avatar_url: '',
          bio: '',
          website: '',
          location: ''
        });
      } catch (err: any) {
        console.error("Error fetching profile:", err);
        setError(err.message || "Failed to load profile data");
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserProfile();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="bg-red-50 p-4 rounded-md">
          <p className="text-red-800">{error}</p>
          <button 
            onClick={() => router.push('/dashboard')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      {/* Profile Header */}
      <div className="bg-blue-900 h-48 relative">
        <div className="container mx-auto px-6">
          <div className="absolute -bottom-16 left-6 md:left-1/2 md:transform md:-translate-x-1/2 flex items-end">
            <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-200 overflow-hidden">
              {profile?.avatar_url ? (
                <Image 
                  src={profile.avatar_url} 
                  alt={profile.full_name || "User"} 
                  width={128} 
                  height={128}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
            </div>
            <div className="ml-4 mb-4">
              <h1 className="text-2xl font-bold text-white">{profile?.full_name || "User"}</h1>
              <p className="text-blue-200">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="container mx-auto px-6 pt-24 mt-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Profile Information</h2>
              <Link 
                href="/dashboard/settings" 
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Edit Profile
              </Link>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
                <p className="mt-1 text-lg text-gray-900">{profile?.full_name || "Not set"}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Email</h3>
                <p className="mt-1 text-lg text-gray-900">{user?.email}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Bio</h3>
                <p className="mt-1 text-lg text-gray-900">{profile?.bio || "No bio provided"}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Website</h3>
                  <p className="mt-1 text-lg text-gray-900">
                    {profile?.website ? (
                      <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {profile.website}
                      </a>
                    ) : (
                      "Not set"
                    )}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Location</h3>
                  <p className="mt-1 text-lg text-gray-900">{profile?.location || "Not set"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Account Settings Section */}
        <div className="mt-8 bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Account Settings</h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Password</h3>
                <div className="mt-1 flex items-center">
                  <p className="text-lg text-gray-900">••••••••</p>
                  <Link 
                    href="/forgot-password" 
                    className="ml-4 text-sm text-blue-600 hover:text-blue-800"
                  >
                    Change Password
                  </Link>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Account Created</h3>
                <p className="mt-1 text-lg text-gray-900">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "Unknown"}
                </p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <button 
                onClick={async () => {
                  await supabase.auth.signOut();
                  router.push('/login');
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
