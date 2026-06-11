# ShopEValley Architecture

## Project Structure

```
SHOPEVALLEY/
├── src/                    # Source code
│   ├── components/         # React components
│   ├── lib/                # Utility libraries
│   ├── App.tsx             # Main app component
│   ├── main.tsx            # Entry point
│   ├── types.ts            # TypeScript type definitions
│   ├── data.ts             # Data management
│   └── index.css           # Global styles
├── supabase/               # Supabase configuration
│   ├── migrations/         # Database migrations
│   └── .temp/              # Temporary Supabase files
├── scripts/                # Build and setup scripts
├── docs/                   # Documentation
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite configuration
├── server.ts               # Express server
└── index.html              # HTML entry point
```

## Technology Stack

- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Backend**: Express.js
- **Database**: Supabase (PostgreSQL)
- **AI**: Google GenAI
- **UI Components**: Lucide React, Motion

## Key Features

- Product browsing and search
- Shopping cart and checkout
- Vendor portal
- Admin panel
- Order tracking
- User profiles and addresses
- Recommendations system
- Notifications

## Development Setup

1. Install dependencies: `npm install`
2. Set up environment variables: Copy `.env.example` to `.env`
3. Configure Supabase credentials
4. Run migrations: `npm run dev`
5. Start development server: `npm run dev`

## Build and Deployment

- Development: `npm run dev`
- Production build: `npm run build`
- Preview: `npm run preview`
- Lint: `npm run lint`
