# ShopEValley 🛍️

A modern e-commerce platform built with React, TypeScript, Supabase, and Tailwind CSS.

## Features

- ✅ **Product Browsing** - Browse and search products by category
- ✅ **Shopping Cart** - Add/remove items and manage cart
- ✅ **Checkout** - Secure checkout process
- ✅ **Order Tracking** - Real-time order status updates
- ✅ **Vendor Portal** - Manage products and inventory
- ✅ **Admin Panel** - Manage users, products, and orders
- ✅ **User Profiles** - Manage account and addresses
- ✅ **Recommendations** - AI-powered product recommendations
- ✅ **Notifications** - Real-time notifications system
- ✅ **Global Shipping** - International delivery support
- ✅ **Payment Gateway** - Integrated payment processing

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite |
| Styling | Tailwind CSS, Lucide React |
| Animations | Motion |
| Backend | Express.js |
| Database | Supabase (PostgreSQL) |
| AI | Google GenAI |
| Infrastructure | Docker, AWS Amplify |

## Quick Start

### Prerequisites
- Node.js 18 or higher
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SHOPEVALLEY
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   ```
   Update `.env` with your credentials

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   Navigate to `http://localhost:3000`

## Available Scripts

```bash
npm run dev      # Start development server (port 3000)
npm run build    # Build for production
npm run preview  # Preview production build locally
npm run lint     # Run TypeScript type checking
npm run clean    # Clean build artifacts
```

## Project Structure

```
src/
├── components/       # React components
├── lib/              # Utility functions and API clients
├── App.tsx           # Main application component
├── main.tsx          # React entry point
├── types.ts          # TypeScript type definitions
├── data.ts           # Constants and data
└── index.css         # Global styles

docs/
├── ARCHITECTURE.md   # System architecture overview
├── DEVELOPMENT.md    # Development setup guide
└── DEPLOYMENT.md     # Deployment instructions

supabase/
└── migrations/       # Database migration scripts
```

## Environment Variables

Create a `.env` file based on `.env.example`:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GOOGLE_API_KEY=your_google_api_key
VITE_API_URL=http://localhost:3000
PORT=3000
NODE_ENV=development
```

## Documentation

- [Architecture Guide](./docs/ARCHITECTURE.md) - System design and structure
- [Development Guide](./docs/DEVELOPMENT.md) - Development setup and best practices
- [Deployment Guide](./docs/DEPLOYMENT.md) - Deployment and production setup
- [Supabase Setup](./SUPABASE_SETUP.md) - Database configuration
- [Agent Rules](./AGENTRULES.md) - AI agent configuration
- [Contributing Guide](./CONTRIBUTING.md) - How to contribute

## Database Setup

The project uses Supabase with PostgreSQL. Key tables:
- `profiles` - User profiles
- `products` - Product catalog
- `orders` - Order management
- `cart_items` - Shopping cart

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed database configuration.

## Development Workflow

1. Create a new branch for your feature
2. Make your changes
3. Test locally with `npm run dev`
4. Run lint check with `npm run lint`
5. Commit and push changes
6. Create a pull request

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a pull request

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed contribution guidelines.

## Troubleshooting

### Port Already in Use
```bash
# Change port in development
npm run dev -- --port 3001
```

### Build Errors
```bash
# Clear and reinstall dependencies
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Database Connection Issues
- Verify Supabase credentials in `.env`
- Check if Supabase project is active
- Ensure database migrations have been applied

## Support

For issues and questions:
1. Check existing documentation in `/docs`
2. Review [Supabase documentation](https://supabase.com/docs)
3. Check [React documentation](https://react.dev)
4. Open an issue on GitHub

## License

This project is licensed under the MIT License - see LICENSE file for details.

## Acknowledgments

- Built with [React](https://react.dev)
- Powered by [Supabase](https://supabase.com)
- Styled with [Tailwind CSS](https://tailwindcss.com)
- Icons by [Lucide React](https://lucide.dev)

---

**Last Updated**: June 2026 
