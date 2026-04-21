import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { testSupabaseConnection } from '@/utils/supabase-test';

export function SupabaseConnectionTester() {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<{
    connected: boolean;
    message: string;
    timestamp: string;
  } | null>(null);

  const handleTest = async () => {
    setTesting(true);
    try {
      const testResult = await testSupabaseConnection();
      setResult(testResult);
    } catch (error) {
      setResult({
        connected: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 border border-border rounded-lg bg-card">
      <h3 className="text-lg font-semibold mb-4">🧪 Supabase Connection Test</h3>
      
      <Button 
        onClick={handleTest} 
        disabled={testing}
        className="w-full mb-4"
      >
        {testing ? 'Testing...' : 'Test Connection'}
      </Button>

      {result && (
        <div className={`p-4 rounded-lg ${
          result.connected 
            ? 'bg-green-50 border border-green-200 text-green-900 dark:bg-green-950 dark:border-green-800 dark:text-green-100' 
            : 'bg-red-50 border border-red-200 text-red-900 dark:bg-red-950 dark:border-red-800 dark:text-red-100'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">
              {result.connected ? '✅' : '❌'}
            </span>
            <strong>
              {result.connected ? 'Connected!' : 'Connection Failed'}
            </strong>
          </div>
          <p className="text-sm mb-2">{result.message}</p>
          <p className="text-xs opacity-75">
            Tested at: {new Date(result.timestamp).toLocaleTimeString()}
          </p>
        </div>
      )}
    </div>
  );
}
