import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { User, UserRole } from '../types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  signUp: (email: string, password: string, role: UserRole, userData: Record<string, any>) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGithub: () => Promise<void>;
  signOut: () => Promise<void>;
  getUser: () => Promise<void>;
  sendEmailVerification: (email: string) => Promise<void>;
  isEmailVerificationError: boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  error: null,
  isEmailVerificationError: false,

  signUp: async (email, password, role, userData) => {
    try {
      set({ isLoading: true, error: null, isEmailVerificationError: false });

      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin + '/auth/signin',
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('User creation failed');

      // Create profile with role and additional data
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email,
          role,
          ...userData,
        });

      if (profileError) throw profileError;

      // If email confirmation is required, show a specific message
      if (!authData.user.email_confirmed_at) {
        set({
          isLoading: false,
          error: 'We sent you a confirmation email. Please check your inbox and confirm your email to sign in.'
        });
        return;
      }

      // Get the full user data
      await get().getUser();
    } catch (error) {
      console.error('Error during sign up:', error);
      set({ error: (error as Error).message, isLoading: false, isEmailVerificationError: false });
    }
  },

  signIn: async (email, password) => {
    try {
      set({ isLoading: true, error: null, isEmailVerificationError: false });

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Handle email not confirmed error specifically
        if (error.message.includes('Email not confirmed')) {
          set({ 
            error: 'Email not confirmed. Please check your inbox for the verification email.', 
            isLoading: false,
            isEmailVerificationError: true
          });
          return;
        }
        throw error;
      }

      // Get the user data
      await get().getUser();
    } catch (error) {
      console.error('Error during sign in:', error);
      set({ error: (error as Error).message, isLoading: false, isEmailVerificationError: false });
    }
  },

  signInWithGithub: async () => {
    try {
      set({ isLoading: true, error: null, isEmailVerificationError: false });

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: window.location.origin + '/dashboard',
        }
      });

      if (error) throw error;
      
      // Note: User will be set after redirect via getUser()
    } catch (error) {
      console.error('Error during GitHub sign in:', error);
      set({ error: (error as Error).message, isLoading: false, isEmailVerificationError: false });
    }
  },

  signOut: async () => {
    try {
      set({ isLoading: true, error: null });

      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      set({ user: null, isLoading: false });
    } catch (error) {
      console.error('Error during sign out:', error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  getUser: async () => {
    try {
      set({ isLoading: true, error: null });

      // Get the current user
      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (!authUser) {
        set({ user: null, isLoading: false });
        return;
      }

      // Get the user's profile with role information
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle(); // Use maybeSingle instead of single to avoid the JSON error

      if (profileError) {
        // If there's a specific error about JSON object/multiple rows
        if (profileError.message.includes('JSON') || profileError.message.includes('multiple')) {
          // Try to fix the profile data by getting the first profile
          const { data: fixedProfileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .limit(1);
            
          if (fixedProfileData && fixedProfileData.length > 0) {
            set({
              user: fixedProfileData[0] as User,
              isLoading: false,
            });
            return;
          }
        }
        throw profileError;
      }

      // If no profile found, create a minimal one using auth data
      if (!profileData) {
        const defaultRole = 'student'; // Default role for new users
        
        // Extract information from OAuth providers if available
        const metadata = authUser.user_metadata || {};
        const userIdentity = authUser.identities?.[0]?.identity_data || {};
        
        // Extract name and avatar data
        let fullName = metadata.full_name || '';
        if (!fullName) {
          fullName = [
            metadata.name, 
            userIdentity.name, 
            userIdentity.full_name,
            `${userIdentity.given_name || ''} ${userIdentity.family_name || ''}`.trim(),
          ].find(name => name && name.trim() !== '') || '';
        }
        
        const avatarUrl = metadata.avatar_url || 
                          metadata.picture || 
                          userIdentity.avatar_url || 
                          userIdentity.picture || 
                          '';
        
        const newProfile = {
          id: authUser.id,
          email: authUser.email,
          role: defaultRole,
          full_name: fullName,
          avatar_url: avatarUrl,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        // Create a new profile
        const { error: insertError } = await supabase
          .from('profiles')
          .insert([newProfile]);

        if (insertError) throw insertError;

        set({
          user: newProfile as User,
          isLoading: false,
        });
        return;
      }

      set({
        user: profileData as User,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error getting user:', error);
      set({ user: null, error: (error as Error).message, isLoading: false });
    }
  },

  sendEmailVerification: async (email) => {
    try {
      set({ isLoading: true, error: null });

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });

      if (error) throw error;

      set({ isLoading: false });
    } catch (error) {
      console.error('Error sending verification email:', error);
      set({ error: (error as Error).message, isLoading: false });
    }
  }
}));