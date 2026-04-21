# OTP UI Components Documentation

Complete set of React components for OTP (One-Time Password) authentication flows with email display and user input.

## Components

### 1. OTPDisplay
Main component showing the OTP code sent via email.

**Features:**
- Large, easy-to-read 6-digit display
- Gradient background (purple/indigo)
- Real-time countdown timer
- Resend button with cooldown
- Security warnings
- Responsive design

**Usage:**
```tsx
import OTPDisplay from '@/components/OTPDisplay';

<OTPDisplay 
  code="123456"
  expiresIn={900}
  onResend={() => handleResend()}
  isResending={false}
/>
```

**Props:**
- `code` (string): The OTP code to display (default: '123456')
- `expiresIn` (number): Seconds until expiry (default: 900 = 15 minutes)
- `onResend` (function): Callback when resend is clicked
- `isResending` (boolean): Loading state for resend button

---

### 2. OTPInput
6 individual input boxes for users to enter the OTP code.

**Features:**
- 6 separate input fields
- Auto-focus next field
- Paste support (intelligently splits multi-digit paste)
- Arrow key navigation (left/right to move between fields)
- Backspace/delete support
- Error state styling
- Loading state
- Completion callback

**Usage:**
```tsx
import OTPInput from '@/components/OTPInput';

const [code, setCode] = useState('');
const [error, setError] = useState('');

<OTPInput
  length={6}
  value={code}
  onChange={setCode}
  onComplete={(fullCode) => verifyCode(fullCode)}
  error={error}
  isLoading={loading}
/>
```

**Props:**
- `length` (number): Number of input fields (default: 6)
- `value` (string): Current code value (required)
- `onChange` (function): Called when any digit changes (required)
- `onComplete` (function): Called when all 6 digits are entered
- `isLoading` (boolean): Disable input during verification
- `error` (string): Error message to display

**Keyboard Shortcuts:**
- `Arrow Left/Right`: Navigate between fields
- `Backspace`: Delete current or move to previous field
- `Cmd/Ctrl + V`: Paste entire code

---

### 3. OTPVerificationPage
Complete page component with display, input, and logic.

**Features:**
- Email address display
- OTP code display
- OTP input fields
- Verify button
- Resend with cooldown
- Countdown timer
- Error handling
- Back button

**Usage:**
```tsx
import OTPVerificationPage from '@/components/OTPVerificationPage';

<OTPVerificationPage
  email="user@example.com"
  onVerify={async (code) => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        type: 'email',
        email: 'user@example.com',
        token: code,
      });
      return {
        success: !error,
        error: error?.message,
      };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }}
  onBackClick={() => navigate(-1)}
  onResendClick={async () => {
    await supabase.auth.signInWithOtp({ email: 'user@example.com' });
  }}
/>
```

**Props:**
- `email` (string): User's email address (required)
- `onVerify` (async function): Called when user submits code (required)
  - Returns: `{ success: boolean, error?: string }`
- `onBackClick` (function): Back button callback
- `onResendClick` (async function): Resend code callback

---

### 4. Alternative Display Styles

#### OTPDisplayBoxes
Shows each digit in an individual box.

```tsx
import { OTPDisplayBoxes } from '@/components/OTPDisplay';

<OTPDisplayBoxes code="123456" expiresIn={900} />
```

#### OTPDisplayBadge
Badge-style display with border.

```tsx
import { OTPDisplayBadge } from '@/components/OTPDisplay';

<OTPDisplayBadge code="123456" expiresIn={900} />
```

#### OTPDisplayPill
Modern pill-shaped container with gradient.

```tsx
import { OTPDisplayPill } from '@/components/OTPDisplay';

<OTPDisplayPill code="123456" expiresIn={900} />
```

#### OTPDisplayMinimal
Clean, minimalist style.

```tsx
import { OTPDisplayMinimal } from '@/components/OTPDisplay';

<OTPDisplayMinimal code="123456" expiresIn={900} />
```

---

## Complete Implementation Example

### In Your Auth Page

```tsx
import { useState } from 'react';
import OTPVerificationPage from '@/components/OTPVerificationPage';
import { supabase } from '@/integrations/supabase/client';

export function OTPVerificationStep() {
  const [email, setEmail] = useState('user@example.com');

  const handleVerifyOTP = async (code: string) => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        type: 'email',
        email: email,
        token: code,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // Verification successful
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Verification failed' };
    }
  };

  const handleResendOTP = async () => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
      });

      if (error) {
        throw error;
      }
    } catch (err) {
      console.error('Failed to resend OTP:', err);
      throw err;
    }
  };

  return (
    <OTPVerificationPage
      email={email}
      onVerify={handleVerifyOTP}
      onResendClick={handleResendOTP}
      onBackClick={() => window.history.back()}
    />
  );
}
```

---

## Styling & Customization

### Tailwind Classes Used
- Colors: indigo, purple, blue, red, gray, amber
- Spacing: p-4, p-6, p-8, gap-2, gap-3, etc.
- Typography: font-mono, font-black, font-bold, text-xs through text-6xl
- Responsive: Hidden on mobile, shown on lg breakpoint where needed

### To Customize Colors
Replace color references:
- Indigo: `indigo-600`, `indigo-50`, `indigo-100`, etc.
- Purple: `purple-600`, `purple-500`, etc.

Example (change to blue):
```tsx
// Before
<div className="border-indigo-600 bg-indigo-50">

// After
<div className="border-blue-600 bg-blue-50">
```

---

## Accessibility Features

✅ Keyboard navigation support (arrow keys, tab, backspace)
✅ Screen reader friendly labels
✅ Color contrast (WCAG AA compliant)
✅ Focus indicators visible
✅ Error messages announced
✅ Disabled state properly handled
✅ Semantic HTML structure

---

## Common Use Cases

### 1. Just Display the Code
```tsx
<OTPDisplay code={otp} expiresIn={timeLeft} />
```

### 2. Just Get Input from User
```tsx
<OTPInput
  value={userCode}
  onChange={setUserCode}
  onComplete={handleVerify}
/>
```

### 3. Full Page Flow
```tsx
<OTPVerificationPage
  email={email}
  onVerify={verifyCode}
  onResendClick={resendCode}
/>
```

### 4. Show Different Style
```tsx
import { OTPDisplayMinimal } from '@/components/OTPDisplay';
<OTPDisplayMinimal code={otp} expiresIn={timeLeft} />
```

---

## Error Handling

```tsx
const [error, setError] = useState<string>();

const handleVerify = async (code: string) => {
  try {
    const result = await onVerify(code);
    if (!result.success) {
      setError(result.error || 'Invalid code');
      return;
    }
    // Success - redirect user
  } catch (err) {
    setError('Verification failed');
  }
};

<OTPInput
  value={code}
  onChange={setCode}
  error={error}
/>
```

---

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## Performance Notes

- Input boxes auto-focus (no manual tab needed)
- Paste handling optimized for speed
- Timer updates don't cause full re-renders
- Loading states prevent double-submission
- Keyboard navigation instant

---

## Testing the Components

### To View Showcase:
Create a route and import:
```tsx
import OTPShowcase from '@/components/OTPShowcase';

// Add to your router
<Route path="/otp-showcase" element={<OTPShowcase />} />
```

Then visit: `http://localhost:5173/otp-showcase`

---

## Files Created

1. **OTPDisplay.tsx** - Display component with 5 styles
2. **OTPInput.tsx** - 6-digit input component
3. **OTPVerificationPage.tsx** - Complete page component
4. **OTPShowcase.tsx** - Preview of all styles & usage examples

---

## Next Steps

1. Import components into your Auth page
2. Hook up with Supabase `verifyOtp()` function
3. Test with real email (check Mailpit at http://localhost:54324)
4. Choose your preferred display style
5. Customize colors to match your brand

All components are production-ready! 🎉
