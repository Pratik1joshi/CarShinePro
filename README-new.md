# CarPolish Pro - E-commerce Platform

A modern, feature-rich e-commerce platform for car polish and car care products built with Next.js, Supabase, and Tailwind CSS.

## 🚀 Features

### 🛍️ Customer Features
- **Beautiful Product Showcase**: Modern, responsive product gallery with detailed product pages
- **Smart Shopping Cart**: Persistent cart with real-time updates and quantity management
- **User Authentication**: Secure sign-up/sign-in with email verification
- **Order Management**: Complete order tracking and history
- **Responsive Design**: Mobile-first design that works on all devices

### 🔧 Admin Features
- **Comprehensive Dashboard**: Real-time analytics and key metrics
- **Product Management**: Full CRUD operations for products with image uploads
- **Order Management**: Order status tracking and fulfillment
- **User Management**: Customer overview and management
- **Analytics**: Sales reports and performance metrics

### 🏗️ Technical Features
- **Modern Stack**: Next.js 15, React 18, Tailwind CSS
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Authentication**: Supabase Auth with JWT tokens
- **State Management**: React Context for cart and authentication
- **UI Components**: Custom components with Radix UI primitives
- **TypeScript Ready**: Fully typed codebase (can be migrated to TypeScript)

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 18, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **UI Components**: Custom components with Radix UI
- **Icons**: Lucide React
- **Styling**: Tailwind CSS with custom design system
- **State Management**: React Context API

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd carshine
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Set Up Supabase Database

#### Create Tables
Run the SQL scripts in the `scripts/` directory in order:

1. **Create Tables** (`scripts/01-create-tables.sql`):
```sql
-- Run this script in your Supabase SQL editor
-- Creates users, products, cart_items, orders, and order_items tables
```

2. **Seed Data** (`scripts/02-seed-data.sql`):
```sql
-- Run this script to populate initial product data
-- Includes sample car polish products
```

3. **Set Up Security** (`scripts/03-setup-rls.sql`):
```sql
-- Run this script to enable Row Level Security (RLS)
-- Sets up proper access policies for all tables
```

### 5. Start Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 🗂️ Project Structure

```
carshine/
├── app/                    # Next.js App Router
│   ├── admin/             # Admin dashboard pages
│   │   ├── page.js        # Admin dashboard
│   │   ├── products/      # Product management
│   │   ├── orders/        # Order management
│   │   └── users/         # User management
│   ├── auth/              # Authentication pages
│   ├── cart/              # Shopping cart
│   ├── products/          # Product pages
│   │   └── [id]/         # Dynamic product detail pages
│   ├── globals.css        # Global styles
│   ├── layout.js          # Root layout
│   └── page.js            # Homepage
├── components/            # Reusable components
│   ├── ui/               # UI component library
│   ├── navbar.js         # Navigation component
│   └── footer.js         # Footer component
├── contexts/             # React Context providers
│   ├── auth-context.js   # Authentication state
│   └── cart-context-new.js # Shopping cart state
├── lib/                  # Utility libraries
│   ├── supabase.js      # Supabase client and helpers
│   └── utils.js         # General utilities
├── scripts/             # Database setup scripts
│   ├── 01-create-tables.sql
│   ├── 02-seed-data.sql
│   └── 03-setup-rls.sql
└── public/              # Static assets
```

## 🎨 Design System

### Colors
- **Primary**: Blue (600-50)
- **Secondary**: Gray (900-50)
- **Accent**: Cyan, Green, Yellow
- **Status**: Red (errors), Green (success), Yellow (warnings)

### Components
- Custom button variants (primary, secondary, outline, ghost)
- Responsive card layouts
- Modern form components
- Loading states and skeletons
- Toast notifications (ready to implement)

## 🔐 Authentication & Security

### User Authentication
- Email/password registration and login
- JWT-based session management
- Protected routes for admin and user areas
- Automatic session persistence

### Database Security
- Row Level Security (RLS) enabled on all tables
- User-specific data isolation
- Admin role checking
- SQL injection protection

### API Security
- Supabase handles all database operations
- Built-in rate limiting
- CORS configuration
- Environment variable protection

## 🛒 E-commerce Features

### Product Management
- Dynamic product catalog
- Category filtering and search
- Image gallery with zoom
- Stock tracking
- Product variants (future enhancement)

### Shopping Cart
- Persistent cart across sessions
- Real-time quantity updates
- Price calculations with tax and shipping
- Guest and authenticated user support

### Order Processing
- Complete checkout flow
- Order confirmation emails (to be implemented)
- Order status tracking
- Admin order management

## 📊 Admin Dashboard

### Analytics
- Sales overview and trends
- Product performance metrics
- Customer insights
- Revenue tracking

### Management Tools
- Product CRUD operations
- Order status updates
- Customer management
- Inventory tracking

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables for Production
```env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_supabase_anon_key
```

## 🔧 Configuration

### Tailwind CSS
Custom configuration in `tailwind.config.js`:
- Extended color palette
- Custom spacing scale
- Component-specific utilities
- Responsive breakpoints

### Next.js
Optimized configuration in `next.config.mjs`:
- Image optimization
- Bundle analysis
- Performance optimizations

## 🧪 Testing (Future Enhancement)

Planned testing setup:
- **Unit Tests**: Jest + React Testing Library
- **Integration Tests**: Playwright
- **E2E Tests**: Cypress
- **API Tests**: Supabase testing utilities

## 📱 Mobile Optimization

- Mobile-first responsive design
- Touch-friendly interactions
- Optimized images and loading
- Progressive Web App ready

## 🔮 Future Enhancements

### Features
- [ ] Product reviews and ratings
- [ ] Wishlist functionality
- [ ] Advanced search and filtering
- [ ] Inventory management
- [ ] Email notifications
- [ ] Payment gateway integration (Stripe/PayPal)
- [ ] Multi-language support
- [ ] SEO optimization
- [ ] Analytics dashboard

### Technical
- [ ] TypeScript migration
- [ ] Automated testing suite
- [ ] CI/CD pipeline
- [ ] Performance monitoring
- [ ] Error tracking (Sentry)
- [ ] CDN integration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you need help with setup or have questions:

1. Check the documentation above
2. Review the code comments
3. Check Supabase documentation
4. Open an issue on GitHub

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Supabase for the backend-as-a-service platform
- Tailwind CSS for the utility-first CSS framework
- Radix UI for accessible component primitives
- Lucide for beautiful icons
