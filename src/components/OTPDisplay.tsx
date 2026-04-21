import React from 'react';
import { Shield, Clock } from 'lucide-react';

interface OTPDisplayProps {
  code?: string;
  expiresIn?: number; // seconds
  onResend?: () => void;
  isResending?: boolean;
}

export default function OTPDisplay({ 
  code = '123456', 
  expiresIn = 900, // 15 minutes
  onResend,
  isResending = false 
}: OTPDisplayProps) {
  const minutes = Math.floor(expiresIn / 60);
  const seconds = expiresIn % 60;

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Option 1: Large Text Display (Current Email Style) */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl p-8 mb-6 shadow-lg">
        <p className="text-xs font-semibold text-indigo-100 tracking-widest mb-4 uppercase">
          Verification Code
        </p>
        <p className="text-5xl font-black text-white tracking-widest font-mono">
          {code}
        </p>
        <p className="text-xs text-indigo-100 mt-4 flex items-center justify-center gap-2">
          <Clock size={14} />
          Expires in {minutes}:{seconds.toString().padStart(2, '0')}
        </p>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border-l-4 border-indigo-600 rounded-lg p-4 mb-4">
        <p className="text-sm font-semibold text-blue-900 flex items-center gap-2">
          💡 Enter this code in the verification field
        </p>
        <p className="text-xs text-blue-700 mt-2">
          It expires in 15 minutes
        </p>
      </div>

      {/* Security Note */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex gap-3">
        <Shield size={18} className="text-amber-700 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-amber-900">
            Never share this code
          </p>
          <p className="text-xs text-amber-700 mt-1">
            User Ninjas staff will never ask for your verification code
          </p>
        </div>
      </div>

      {/* Resend Button */}
      {onResend && (
        <button
          onClick={onResend}
          disabled={isResending}
          className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium text-gray-700 transition-colors"
        >
          {isResending ? 'Sending...' : 'Didn\'t receive the code? Resend'}
        </button>
      )}
    </div>
  );
}

/**
 * Alternative OTP Display Styles
 * Uncomment any of these to use different visual styles
 */

// ─── Option 2: Individual Digit Boxes ───
export function OTPDisplayBoxes({ 
  code = '123456', 
  expiresIn = 900 
}: OTPDisplayProps) {
  const digits = code.split('');

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-blue-50 rounded-xl p-8 mb-6">
        <p className="text-sm font-semibold text-blue-900 mb-6 text-center">
          Your Verification Code
        </p>
        <div className="flex gap-3 justify-center mb-6">
          {digits.map((digit, idx) => (
            <div
              key={idx}
              className="w-14 h-14 border-2 border-indigo-600 rounded-lg flex items-center justify-center"
            >
              <span className="text-2xl font-bold text-indigo-600 font-mono">
                {digit}
              </span>
            </div>
          ))}
        </div>
        <p className="text-xs text-blue-600 text-center flex items-center justify-center gap-2">
          <Clock size={14} />
          Expires in {Math.floor(expiresIn / 60)}:{(expiresIn % 60).toString().padStart(2, '0')}
        </p>
      </div>
    </div>
  );
}

// ─── Option 3: Highlighted Badge Style ───
export function OTPDisplayBadge({ 
  code = '123456', 
  expiresIn = 900 
}: OTPDisplayProps) {
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center">
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-4 font-semibold">
          Code
        </p>
        <div className="inline-block bg-blue-50 border-2 border-indigo-600 rounded-lg px-8 py-6 mb-4">
          <p className="text-6xl font-black text-indigo-600 tracking-wider font-mono">
            {code}
          </p>
        </div>
        <p className="text-xs text-gray-400 flex items-center justify-center gap-2">
          <Clock size={14} />
          Valid for {Math.floor(expiresIn / 60)} minutes
        </p>
      </div>
    </div>
  );
}

// ─── Option 4: Modern Pill Style ───
export function OTPDisplayPill({ 
  code = '123456', 
  expiresIn = 900 
}: OTPDisplayProps) {
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full px-8 py-10 shadow-lg text-center">
        <p className="text-xs font-semibold text-white tracking-widest uppercase mb-4 opacity-90">
          Verification Code
        </p>
        <p className="text-5xl font-black text-white tracking-widest font-mono mb-4">
          {code}
        </p>
        <p className="text-xs text-white opacity-90 flex items-center justify-center gap-2">
          ⏱ Expires in {Math.floor(expiresIn / 60)}:{(expiresIn % 60).toString().padStart(2, '0')}
        </p>
      </div>
    </div>
  );
}

// ─── Option 5: Minimal Clean Style ───
export function OTPDisplayMinimal({ 
  code = '123456', 
  expiresIn = 900 
}: OTPDisplayProps) {
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="border-2 border-gray-200 rounded-lg p-8 text-center bg-white">
        <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-6">
          Enter this code
        </p>
        <p className="text-5xl font-black text-gray-900 tracking-wider font-mono mb-6">
          {code}
        </p>
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
          <Clock size={14} />
          {Math.floor(expiresIn / 60)}:{(expiresIn % 60).toString().padStart(2, '0')} remaining
        </div>
      </div>
    </div>
  );
}
