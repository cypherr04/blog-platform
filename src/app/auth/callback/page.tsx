"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthRedirectHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleAuthRedirect = async () => {
      // Check if this is a redirect from email verification
      const accessToken = searchParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token');
      const type = searchParams.get('type');
      
      if (accessToken && type === 'recovery') {
        // Handle password reset confirmation
        try {
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          });
          
          // Redirect to change password page
          router.push('/reset-password');
        } catch (error) {
          console.error('Error setting session:', error);
          router.push('/login?error=auth');
        }
      } else if (accessToken && type === 'signup') {
        // Handle signup confirmation
        try {
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          });
          
          // Get user data
          const { data: { user } } = await supabase.auth.getUser();
          
          if (user) {
            // Check if user profile exists
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .single();
            
            if (!profile) {
              // Create profile if it doesn't exist
              const { error: profileError } = await supabase
                .from('profiles')
                .insert([
                  {
                    id: user.id,
                    full_name: user.user_metadata?.full_name || '',
                    avatar_url: user.user_metadata?.avatar_url || '',
                    email: user.email,
                  },
                ]);
              
              if (profileError) {
                console.error('Error creating profile:', profileError);
              }
            }
            
            // Redirect to dashboard
            router.push('/dashboard');
          } else {
            router.push('/login');
          }
        } catch (error) {
          console.error('Error setting session:', error);
          router.push('/login?error=auth');
        }
      } else if (type === 'magiclink') {
        // Handle magic link login
        try {
          if (accessToken) {
            await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || '',
            });
          }
          
          router.push('/dashboard');
        } catch (error) {
          console.error('Error setting session:', error);
          router.push('/login?error=auth');
        }
      } else {
        // No valid auth parameters, redirect to login
        router.push('/login');
      }
    };

    handleAuthRedirect();
  }, [router, searchParams]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Verifying your account...</p>
      </div>
    </div>
  );
}
