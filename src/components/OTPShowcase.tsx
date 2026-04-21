import React, { useState } from 'react';
import OTPDisplay, {
  OTPDisplayBoxes,
  OTPDisplayBadge,
  OTPDisplayPill,
  OTPDisplayMinimal,
} from './OTPDisplay';
import OTPInput from './OTPInput';

export default function OTPShowcase() {
  const [selectedCode, setSelectedCode] = useState('123456');
  const [inputCode, setInputCode] = useState('');
  const demoCode = '428591';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-gray-900 mb-4">OTP UI Components</h1>
          <p className="text-gray-600 text-lg">
            Beautiful and accessible OTP display and input components for your authentication flow
          </p>
        </div>

        {/* OTP Display Styles */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Style 1: Default (Large Text) */}
          <div className="bg-white rounded-xl p-8 shadow-lg">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Option 1: Large Text (Current)
            </h2>
            <OTPDisplay code={demoCode} expiresIn={547} />
          </div>

          {/* Style 2: Individual Boxes */}
          <div className="bg-white rounded-xl p-8 shadow-lg">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Option 2: Digit Boxes
            </h2>
            <OTPDisplayBoxes code={demoCode} expiresIn={547} />
          </div>

          {/* Style 3: Badge */}
          <div className="bg-white rounded-xl p-8 shadow-lg">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Option 3: Badge Style
            </h2>
            <OTPDisplayBadge code={demoCode} expiresIn={547} />
          </div>

          {/* Style 4: Pill */}
          <div className="bg-white rounded-xl p-8 shadow-lg">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Option 4: Modern Pill
            </h2>
            <OTPDisplayPill code={demoCode} expiresIn={547} />
          </div>

          {/* Style 5: Minimal */}
          <div className="bg-white rounded-xl p-8 shadow-lg lg:col-span-2">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Option 5: Minimal & Clean
            </h2>
            <div className="max-w-md mx-auto">
              <OTPDisplayMinimal code={demoCode} expiresIn={547} />
            </div>
          </div>
        </div>

        {/* OTP Input */}
        <div className="bg-white rounded-xl p-8 shadow-lg mb-12">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            OTP Input Component
          </h2>
          <div className="max-w-md mx-auto">
            <p className="text-sm text-gray-600 mb-6 text-center">
              Try entering digits, pasting, or using arrow keys. This is a fully interactive input field.
            </p>
            <OTPInput
              length={6}
              value={inputCode}
              onChange={setInputCode}
              onComplete={(code) => console.log('OTP Complete:', code)}
            />
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Current value: <span className="font-mono font-semibold text-gray-900">{inputCode || '(empty)'}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Usage Examples */}
        <div className="bg-white rounded-xl p-8 shadow-lg">
          <h2 className="text-lg font-bold text-gray-900 mb-6">
            How to Use
          </h2>
          <div className="space-y-6">
            {/* Example 1 */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">Display OTP Code</h3>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto mb-3">
{`import OTPDisplay from '@/components/OTPDisplay';

<OTPDisplay 
  code="123456"
  expiresIn={900}
  onResend={() => console.log('Resend')}
/>`}
              </pre>
              <p className="text-sm text-gray-600">
                Shows the OTP code to users with expiry countdown and resend button
              </p>
            </div>

            {/* Example 2 */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">Input OTP Code</h3>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto mb-3">
{`import OTPInput from '@/components/OTPInput';

<OTPInput
  length={6}
  value={otpCode}
  onChange={setOtpCode}
  onComplete={(code) => verifyCode(code)}
  error={error}
  isLoading={loading}
/>`}
              </pre>
              <p className="text-sm text-gray-600">
                6 individual input boxes with paste support, keyboard navigation, and validation
              </p>
            </div>

            {/* Example 3 */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">Full Verification Page</h3>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto mb-3">
{`import OTPVerificationPage from '@/components/OTPVerificationPage';

<OTPVerificationPage
  email="user@example.com"
  onVerify={async (code) => {
    const result = await verifyOTP(code);
    return { success: result.ok };
  }}
  onResendClick={async () => {
    await resendOTP();
  }}
/>`}
              </pre>
              <p className="text-sm text-gray-600">
                Complete verification page with input, display, resend logic, and error handling
              </p>
            </div>

            {/* Example 4 */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">Alternative Display Styles</h3>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto mb-3">
{`// Use different visual styles:
import {
  OTPDisplayBoxes,
  OTPDisplayBadge,
  OTPDisplayPill,
  OTPDisplayMinimal,
} from '@/components/OTPDisplay';

<OTPDisplayBoxes code="123456" />
<OTPDisplayBadge code="123456" />
<OTPDisplayPill code="123456" />
<OTPDisplayMinimal code="123456" />`}
              </pre>
              <p className="text-sm text-gray-600">
                Choose from 5 different display styles to match your brand
              </p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-2">OTPInput Features</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✓ Auto-focus next field on digit entry</li>
              <li>✓ Paste support for full code</li>
              <li>✓ Arrow key navigation</li>
              <li>✓ Backspace/delete support</li>
              <li>✓ Error state display</li>
              <li>✓ Loading state</li>
            </ul>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <h3 className="font-semibold text-purple-900 mb-2">OTPDisplay Features</h3>
            <ul className="text-sm text-purple-800 space-y-1">
              <li>✓ 5 different visual styles</li>
              <li>✓ Real-time countdown timer</li>
              <li>✓ Resend functionality</li>
              <li>✓ Security warnings</li>
              <li>✓ Fully responsive</li>
              <li>✓ Accessible & keyboard friendly</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
