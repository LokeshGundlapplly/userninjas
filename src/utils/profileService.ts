import { supabase } from '@/integrations/supabase/client';

export interface UserProfile {
  full_name: string;
  email: string;
  role: 'tester' | 'recruiter' | 'admin';
  company?: string;
  bio?: string;
  avatar_url?: string;
  phone?: string;
  location?: string;
  website?: string;
  linkedin_url?: string;
  auth_provider?: 'email' | 'linkedin_oidc' | 'google';
  linkedin_verified?: boolean;
  google_verified?: boolean;
  company_email?: boolean;
}

export const createOrUpdateProfile = async (
  userId: string,
  profileData: Partial<UserProfile>
): Promise<{ success: boolean; error?: Error }> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .upsert(
        {
          user_id: userId,
          full_name: profileData.full_name || '',
          email: profileData.email || '',
          company: profileData.company || null,
          bio: profileData.bio || null,
          avatar_url: profileData.avatar_url || null,
          phone: profileData.phone || null,
          location: profileData.location || null,
          website: profileData.website || null,
          linkedin_url: profileData.linkedin_url || null,
          auth_provider: profileData.auth_provider || 'email',
          linkedin_verified: profileData.linkedin_verified || false,
          google_verified: profileData.google_verified || false,
          company_email: profileData.company_email || false,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Error creating/updating profile:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error('Failed to create/update profile')
    };
  }
};

export const createUserRole = async (
  userId: string,
  role: 'tester' | 'recruiter' | 'admin'
): Promise<{ success: boolean; error?: Error }> => {
  try {
    // Check if role already exists
    const { data: existingRole, error: selectError } = await supabase
      .from('user_roles')
      .select('id')
      .eq('user_id', userId)
      .eq('role', role)
      .single();

    if (selectError && selectError.code !== 'PGRST116') {
      throw selectError;
    }

    // If role doesn't exist, create it
    if (!existingRole) {
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role });

      if (insertError) {
        throw insertError;
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error creating user role:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error('Failed to create user role')
    };
  }
};

export const getProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data || null;
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
};

export const updateProfile = async (
  userId: string,
  updates: Partial<UserProfile>
): Promise<{ success: boolean; error?: Error }> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error('Failed to update profile')
    };
  }
};

export const deleteProfile = async (userId: string): Promise<{ success: boolean; error?: Error }> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting profile:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error('Failed to delete profile')
    };
  }
};
