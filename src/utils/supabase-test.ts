/**
 * Supabase Connection Test Utility
 * Run this to verify your Supabase connection is working properly
 */

import { supabase } from '@/integrations/supabase/client';

export const testSupabaseConnection = async () => {
  console.group('🧪 Supabase Connection Test');

  try {
    // Test 1: Check client initialization
    console.log('✓ Test 1: Client Initialization');
    console.log('  URL:', supabase.supabaseUrl);
    console.log('  Auth enabled:', !!supabase.auth);

    // Test 2: Get current session
    console.log('\n✓ Test 2: Session Check');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.warn('  ⚠️ Session error (normal if not logged in):', sessionError.message);
    } else {
      console.log('  Session status:', session ? '✅ User logged in' : '⚪ Not logged in');
      if (session?.user) {
        console.log('  User email:', session.user.email);
      }
    }

    // Test 3: Query profiles table
    console.log('\n✓ Test 3: Database Query (profiles table)');
    const { data: profiles, error: profilesError, status: profilesStatus } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (profilesError) {
      console.error('  ❌ Error:', profilesError.message);
      console.error('  Status:', profilesStatus);
    } else {
      console.log('  ✅ Query successful!');
      console.log('  Row count:', profiles?.length || 0);
      if (profiles && profiles.length > 0) {
        console.log('  Sample data:', profiles[0]);
      }
    }

    // Test 4: Query user_roles table
    console.log('\n✓ Test 4: Database Query (user_roles table)');
    const { data: roles, error: rolesError, status: rolesStatus } = await supabase
      .from('user_roles')
      .select('*')
      .limit(1);

    if (rolesError) {
      console.error('  ❌ Error:', rolesError.message);
      console.error('  Status:', rolesStatus);
    } else {
      console.log('  ✅ Query successful!');
      console.log('  Row count:', roles?.length || 0);
      if (roles && roles.length > 0) {
        console.log('  Sample data:', roles[0]);
      }
    }

    // Test 5: Query tests table
    console.log('\n✓ Test 5: Database Query (tests table)');
    const { data: tests, error: testsError, status: testsStatus } = await supabase
      .from('tests')
      .select('*')
      .limit(1);

    if (testsError) {
      console.error('  ❌ Error:', testsError.message);
      console.error('  Status:', testsStatus);
    } else {
      console.log('  ✅ Query successful!');
      console.log('  Row count:', tests?.length || 0);
      if (tests && tests.length > 0) {
        console.log('  Sample data:', tests[0]);
      }
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('✅ ALL TESTS PASSED - Supabase is connected!');
    console.log('='.repeat(50));

    return {
      connected: true,
      message: 'Supabase connection is working correctly',
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.group('❌ CRITICAL ERROR');
    console.error('Error:', error);
    console.groupEnd();

    console.log('\n' + '='.repeat(50));
    console.log('❌ CONNECTION FAILED');
    console.log('='.repeat(50));

    return {
      connected: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };
  } finally {
    console.groupEnd();
  }
};

// Export for direct console use
if (typeof window !== 'undefined') {
  (window as any).testSupabaseConnection = testSupabaseConnection;
}
