# Development Guide

## Prerequisites

- Node.js 18+
- npm or yarn
- Git

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env
```

Update `.env` with your credentials:
- Supabase URL and API key
- Google GenAI API key

### 3. Database Setup
Ensure Supabase is configured and migrations are applied:
```bash
npm run dev
```

### 4. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Project Structure

### Components (`src/components/`)
- **Header.tsx** - Navigation and header
- **ProductCard.tsx** - Product display component
- **CartAndCheckout.tsx** - Shopping cart functionality
- **AdminPanel.tsx** - Admin management interface
- **VendorPortal.tsx** - Vendor management
- **LoginScreen.tsx** - Authentication UI
- **ProfilePage.tsx** - User profile management
- And more...

### Libraries (`src/lib/`)
- **supabaseClient.ts** - Supabase configuration
- **adminSetup.ts** - Admin initialization

### Types (`src/types.ts`)
TypeScript interfaces and type definitions

### Data (`src/data.ts`)
Data management and constants

## Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run TypeScript lint
npm run clean    # Clean build artifacts
```

## Best Practices

1. Use TypeScript for type safety
2. Follow component naming conventions (PascalCase)
3. Use meaningful commit messages
4. Keep components focused and single-responsibility
5. Document complex logic with comments
6. Use Tailwind CSS for styling

## Debugging

### VS Code Debug Configuration
Use the VS Code debugger with the configured launch configuration.

### Browser DevTools
Use React DevTools and Tailwind CSS DevTools extensions for debugging.

## Code Style

- Use ESLint configuration if available
- Follow TypeScript strict mode rules
- Format code consistently (consider Prettier)

## Common Issues

### Database Connection Errors
- Verify Supabase credentials in `.env`
- Check if migrations have been applied
- Ensure Supabase project is active

### Build Errors
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear dist folder: `npm run clean`
- Check Node.js version compatibility

## Support

Refer to:
- [Supabase Documentation](https://supabase.com/docs)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
