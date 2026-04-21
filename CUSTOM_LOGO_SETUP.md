# Custom Logo Setup Guide

## How to Add Your Brand Logo

### Option 1: Replace the Ninja Logo Component (SVG)

Edit `/src/components/NinjaLogo.tsx` and replace the SVG with your brand logo:

```tsx
interface NinjaLogoProps {
  className?: string;
  showText?: boolean;
}

export default function NinjaLogo({ className = '', showText = true }: NinjaLogoProps) {
  return (
    <div className={`flex items-center gap-2.5 group ${className}`}>
      <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-md shadow-primary/20 group-hover:shadow-lg group-hover:shadow-primary/30 transition-all duration-500 group-hover:scale-105">
        {/* Glow ring on hover */}
        <div className="absolute inset-0 rounded-xl bg-primary/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
        
        {/* Replace this SVG with your logo */}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-transform duration-500 group-hover:scale-110">
          {/* Your logo SVG path here */}
          <circle cx="12" cy="12" r="10" fill="currentColor"/>
        </svg>
      </div>
      {showText && (
        <span className="font-display font-bold text-lg tracking-tight transition-all duration-300">
          <span className="text-foreground">Your</span>
          <span className="text-primary group-hover:text-primary/80 transition-colors duration-300">Brand</span>
        </span>
      )}
    </div>
  );
}
```

### Option 2: Use an Image File as Logo

1. Add your logo image to `/public/logo.png` (or other format)
2. Replace `NinjaLogo.tsx`:

```tsx
export default function NinjaLogo({ className = '', showText = true }: NinjaLogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <img 
        src="/logo.png" 
        alt="Brand Logo"
        className="h-9 w-9 object-contain"
      />
      {showText && (
        <span className="font-display font-bold text-lg tracking-tight">
          Your Brand Name
        </span>
      )}
    </div>
  );
}
```

### Option 3: Dynamic Logo Component

Create a more flexible logo component:

```tsx
import { useState } from 'react';

interface NinjaLogoProps {
  className?: string;
  showText?: boolean;
  variant?: 'icon' | 'full' | 'text-only';
}

export default function NinjaLogo({ 
  className = '', 
  showText = true,
  variant = 'full'
}: NinjaLogoProps) {
  const [imageError, setImageError] = useState(false);

  if (variant === 'text-only') {
    return <span className="font-bold">Your Brand</span>;
  }

  if (variant === 'icon' || !showText) {
    return (
      <img 
        src="/logo.png" 
        alt="Brand"
        className="h-9 w-9"
        onError={() => setImageError(true)}
      />
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {!imageError ? (
        <img 
          src="/logo.png" 
          alt="Brand Logo"
          className="h-9 w-9"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="h-9 w-9 bg-primary rounded flex items-center justify-center">
          <span className="text-white font-bold">YB</span>
        </div>
      )}
      <span className="font-display font-bold text-lg">
        Your Brand
      </span>
    </div>
  );
}
```

## Locations Where Logo Appears

The `NinjaLogo` component is used in:

1. **Navbar** (`/src/components/Navbar.tsx`) - Top left navigation
2. **Footer** (`/src/components/Footer.tsx`) - Footer branding
3. **Hero Section** (`/src/components/Hero.tsx`) - Landing page
4. **Various dashboards** - Admin and user dashboards

All these will automatically update when you modify the `NinjaLogo` component!

## Brand Color Customization

Update colors in `/tailwind.config.ts`:

```typescript
colors: {
  primary: '#YOUR_COLOR', // Main brand color
  secondary: '#YOUR_ACCENT_COLOR', // Secondary color
  // ... other colors
}
```

## Logo Best Practices

✅ **SVG Format**: Use SVG for scalability (recommended)
✅ **Transparent Background**: For PNG/JPG files
✅ **Square Aspect Ratio**: 1:1 ratio works best (9x9 current size)
✅ **Simple Design**: Works well at all sizes
✅ **Color Contrast**: Ensure visibility on both light and dark themes

## Testing Your Logo

1. Navigate to different pages to see logo placement:
   - Home page: `http://localhost:8080/`
   - Dashboard: `http://localhost:8080/tester` (after login)
   - Different screen sizes (responsive)

2. Check both light and dark theme modes using the theme toggle (top right)

## Troubleshooting

**Logo not showing:**
- Check file path (relative to `/public` folder)
- Verify file format (SVG, PNG, JPG)
- Clear browser cache (Ctrl+Shift+Delete)
- Restart dev server

**Logo looks distorted:**
- Adjust width/height values in the component
- Ensure original image is square or has aspect-ratio styling
- Use `object-contain` or `object-cover` CSS property

**Color not matching brand:**
- Edit Tailwind colors in `/tailwind.config.ts`
- Use hex color codes (#RRGGBB format)
- Test in both light and dark themes
