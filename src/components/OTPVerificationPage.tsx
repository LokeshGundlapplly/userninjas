import React, { useState, useEffect } from 'react';
import { ArrowLeft, RotateCw } from 'lucide-react';
import OTPDisplay from './OTPDisplay';
import OTPInput from './OTPInput';

interface OTPVerificationPageProps {
  email: string;
  onVerify: (code: string) => Promise<{ success: boolean; error?: string }>;
  onBackClick?: () => void;
  onResendClick?: () => Promise<void>;
}

export default function OTPVerificationPage({
  email,
  onVerify,
  onBackClick,
  onResendClick,
}: OTPVerificationPageProps) {
  const [otpCode, setOtpCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string>();
  const [resendCooldown, setResendCooldown] = useState(0);
  const [expiresIn, setExpiresIn] = useState(900); // 15 minutes

  // Countdown timer for expiry
  useEffect(() => {
    if (expiresIn <= 0) return;
    const timer = setTimeout(() => setExpiresIn(expiresIn - 1), 1000);
    return () => clearTimeout(timer);
  }, [expiresIn]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleVerify = async () => {
    if (otpCode.length !== 8) {
      setError('Please enter all 8 digits');
      return;
    }

    setIsLoading(true);
    setError(undefined);

    try {
      const result = await onVerify(otpCode);
      if (!result.success) {
        setError(result.error || 'Invalid code. Please try again.');
        setOtpCode('');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      setOtpCode('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || !onResendClick) return;

    setIsResending(true);
    setError(undefined);

    try {
      await onResendClick();
      setResendCooldown(60);
      setExpiresIn(900);
      setOtpCode('');
    } catch (err) {
      setError('Failed to resend code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="bg-white rounded-t-2xl p-8 border-b border-gray-200">
          <button
            onClick={onBackClick}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium text-sm mb-6 transition-colors"
          >
            <ArrowLeft size={18} />
            Back
          </button>
          <h1 className="text-3xl font-black text-gray-900 mb-2">
            Verify Your Identity
          </h1>
          <p className="text-gray-600">
            We sent a code to <span className="font-semibold text-gray-900">{email}</span>
          </p>
        </div>

        {/* Content */}
        <div className="bg-white p-8">
          {/* OTP Display (shows what was sent) */}
          <div className="mb-8">
            <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-4">
              Code was sent to your email
            </p>
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl p-6 shadow-lg">
              <p className="text-xs font-semibold text-indigo-100 tracking-widest mb-3 uppercase">
                Enter this code
              </p>
              <p className="text-4xl font-black text-white tracking-widest font-mono">
                ••••••••
              </p>
              <p className="text-xs text-indigo-100 mt-3">
                (Check your email)
              </p>
            </div>
          </div>

          {/* Input Section */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-900 mb-4">
              Enter Code
            </label>
            <OTPInput
              length={8}
              value={otpCode}
              onChange={setOtpCode}
              onComplete={handleVerify}
              isLoading={isLoading}
              error={error}
            />
          </div>

          {/* Verify Button */}
          <button
            onClick={handleVerify}
            disabled={isLoading || otpCode.length !== 8}
            className={`
              w-full py-3 px-4 rounded-lg font-semibold text-white transition-all
              ${isLoading || otpCode.length !== 8
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg active:scale-95'
              }
            `}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <RotateCw size={18} className="animate-spin" />
                Verifying...
              </span>
            ) : (
              'Verify & Sign In'
            )}
          </button>

          {/* Resend Section */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 mb-3">
              Didn't receive the code?
            </p>
            {resendCooldown > 0 ? (
              <p className="text-sm text-gray-500">
                Resend available in <span className="font-semibold">{resendCooldown}s</span>
              </p>
            ) : (
              <button
                onClick={handleResend}
                disabled={isResending}
                className={`
                  text-sm font-semibold transition-colors
                  ${isResending
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-indigo-600 hover:text-indigo-700'
                  }
                `}
              >
                {isResending ? (
                  <span className="flex items-center justify-center gap-2">
                    <RotateCw size={14} className="animate-spin" />
                    Sending...
                  </span>
                ) : (
                  'Resend Code'
                )}
              </button>
            )}
          </div>
        </div>

        {/* Footer Info */}
        <div className="bg-gray-50 rounded-b-2xl px-8 py-6 border-t border-gray-200">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-3">
            <p className="text-xs text-blue-900">
              <strong>💡 Tips:</strong> Check your spam/promotions folder if you don't see the email
            </p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-xs text-amber-900">
              <strong>🔒 Security:</strong> Never share this code with anyone
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
