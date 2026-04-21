import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { Helmet } from 'react-helmet-async';

export default function OAuthConsent() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const clientId = searchParams.get('client_id');
  const redirectUri = searchParams.get('redirect_uri');
  const scope = searchParams.get('scope');
  const state = searchParams.get('state');
  const responseType = searchParams.get('response_type');

  const handleApprove = async () => {
    setIsLoading(true);
    try {
      // Build authorization response with state parameter
      let responseUrl = redirectUri || '/';
      const separator = redirectUri?.includes('?') ? '&' : '?';
      
      responseUrl += `${separator}response_type=${encodeURIComponent(responseType || 'code')}`;
      responseUrl += `&client_id=${encodeURIComponent(clientId || '')}`;
      if (state) {
        responseUrl += `&state=${encodeURIComponent(state)}`;
      }
      
      window.location.href = responseUrl;
    } catch (err) {
      console.error('OAuth approval error:', err);
      setIsLoading(false);
    }
  };

  const handleDeny = () => {
    if (redirectUri && state) {
      window.location.href = `${redirectUri}?error=access_denied&state=${encodeURIComponent(state)}`;
    } else if (redirectUri) {
      window.location.href = `${redirectUri}?error=access_denied`;
    } else {
      navigate('/auth');
    }
  };

  // Parse scopes for display
  const scopes = scope ? scope.split(' ').filter(s => s.length > 0) : [];

  return (
    <>
      <Helmet>
        <title>Authorization Required - User Ninjas</title>
        <meta name="description" content="Authorize third-party application access" />
      </Helmet>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white shadow-2xl">
          <CardHeader className="border-b">
            <CardTitle className="text-xl">Authorization Required</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              A third-party application is requesting access to your account
            </p>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {/* Client Info */}
            {clientId && (
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-slate-900">Application ID</p>
                <p className="text-xs text-slate-600 mt-1 font-mono break-all">{clientId}</p>
              </div>
            )}

            {/* Requested Scopes */}
            {scopes.length > 0 && (
              <div>
                <p className="text-sm font-medium text-slate-900 mb-3">Requesting access to:</p>
                <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                  {scopes.map((s) => (
                    <div key={s} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <span className="text-sm text-slate-700">{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Redirect URI Info */}
            {redirectUri && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <p className="text-xs font-medium text-blue-900">Redirect URI</p>
                <p className="text-xs text-blue-700 mt-1 font-mono break-all">{redirectUri}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={handleDeny}
                disabled={isLoading}
              >
                Deny
              </Button>
              <Button 
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                onClick={handleApprove}
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Approve'}
              </Button>
            </div>

            <p className="text-xs text-center text-slate-500 pt-2">
              You can revoke this authorization in your account settings at any time.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
