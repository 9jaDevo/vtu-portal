# VTU Recharge Platform

A comprehensive VTU (Virtual Top-Up) platform built with React and Node.js, providing seamless bill payments, airtime purchases, data subscriptions, and more. The platform integrates with VTPass for VTU services and Paystack for payment processing.

![VTU Platform](https://images.pexels.com/photos/4386431/pexels-photo-4386431.jpeg?auto=compress&cs=tinysrgb&w=1200&h=400&fit=crop)

## 🚀 Features

### Core Services
- **Airtime Top-up** - All major Nigerian networks (MTN, Airtel, Glo, 9mobile)
- **Data Bundles** - Affordable data plans for all networks including Smile and Spectranet
- **TV Subscriptions** - DSTV, GOtv, Startimes, and Showmax
- **Electricity Bills** - Support for all major electricity providers
- **Education Payments** - WAEC, JAMB, NECO registration and result checking
- **Insurance** - Third-party vehicle insurance

### Platform Features
- **User Authentication** - Registration, login, email verification
- **Wallet Management** - Fund wallet, view balance, transaction history
- **API Integration** - RESTful API for third-party integrations
- **Admin Dashboard** - User management, transaction monitoring, analytics
- **Real-time Processing** - Instant transaction processing
- **Secure Payments** - Bank-level security with encrypted transactions

### Developer Features
- **API Key Management** - Generate and manage API keys for external integrations
- **Webhook Support** - Real-time transaction status updates
- **Comprehensive Documentation** - Well-documented API endpoints
- **Rate Limiting** - Built-in API rate limiting and usage tracking

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **React Router DOM** - Client-side routing
- **React Hook Form** - Form handling and validation
- **Lucide React** - Beautiful icons
- **Axios** - HTTP client for API requests
- **React Hot Toast** - Toast notifications

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **TypeScript** - Type-safe server development
- **JWT** - JSON Web Token authentication
- **bcryptjs** - Password hashing
- **Winston** - Logging framework
- **Joi** - Data validation

### Database
- **Supabase** - PostgreSQL database with built-in authentication and APIs
- **Database Migrations** - SQL migrations for schema management

### External Services
- **VTPass API** - VTU service provider
- **Paystack** - Payment gateway for wallet funding
- **Email Verification** - User account verification

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Supabase Account** - Create one at [supabase.com](https://supabase.com) if you don't have one

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd vtu-recharge-platform
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory based on `.env.example`:

```bash
cp .env.example .env
```

Configure the following environment variables:

#### Database Configuration
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
VITE_SUPABASE_URL=your_supabase_project_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

#### Authentication
```env
JWT_SECRET=your_super_secret_jwt_key_here
```

#### VTPass Configuration
```env
# Development (Sandbox)
VTPASS_BASE_URL=https://sandbox.vtpass.com/api
VTPASS_API_KEY=your_sandbox_api_key
VTPASS_PUBLIC_KEY=your_sandbox_public_key
VTPASS_SECRET_KEY=your_sandbox_secret_key

# Production
# VTPASS_BASE_URL=https://vtpass.com/api
# VTPASS_API_KEY=your_production_api_key
# VTPASS_PUBLIC_KEY=your_production_public_key
# VTPASS_SECRET_KEY=your_production_secret_key
```

#### Paystack Configuration
```env
PAYSTACK_PUBLIC_KEY=pk_test_your_paystack_public_key
PAYSTACK_SECRET_KEY=sk_test_your_paystack_secret_key
PAYSTACK_WEBHOOK_SECRET=your_paystack_webhook_secret
```

#### Server Configuration
```env
PORT=3001
NODE_ENV=development
CLIENT_URL=http://localhost:5173
LOG_LEVEL=info
```

#### Admin User (for seeding)
```env
ADMIN_EMAIL=admin@vtuplatform.com
ADMIN_PASSWORD=Admin@123456
```

### 4. Database Setup
The database schema is managed through Supabase migrations. To set up your database:

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Copy your project URL and API keys to your `.env` file
3. Run the database migrations and seed script:

```bash
npm run seed
```

### 5. Start the Application

#### Development Mode
```bash
npm run dev
```
This starts both the client (http://localhost:5173) and server (http://localhost:3001) concurrently.

#### Production Mode
```bash
# Build the client
npm run build

# Build the server
npm run build:server

# Start the server
node server/dist/index.js
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-email` - Email verification

### Wallet Endpoints
- `GET /api/wallet/balance` - Get wallet balance
- `GET /api/wallet/transactions` - Get wallet transactions
- `POST /api/wallet/fund` - Fund wallet
- `GET /api/wallet/stats` - Get wallet statistics

### Transaction Endpoints
- `GET /api/transactions` - Get user transactions
- `POST /api/transactions` - Create new transaction
- `GET /api/transactions/:id` - Get specific transaction
- `POST /api/transactions/verify-customer` - Verify customer details

### Admin Endpoints (Admin Only)
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/users` - Get all users
- `GET /api/admin/transactions` - Get all transactions
- `PATCH /api/admin/users/:id/status` - Update user status

### Public API Endpoints (Requires API Key)
- `GET /api/v1/balance` - Get account balance
- `POST /api/v1/purchase` - Purchase services
- `GET /api/v1/transaction/:reference` - Get transaction status
- `GET /api/v1/transactions` - Get transaction history
- `GET /api/v1/services` - Get available services

### API Key Management
- `GET /api/v1/keys` - Get user's API keys
- `POST /api/v1/keys` - Generate new API key
- `PATCH /api/v1/keys/:id` - Update API key
- `DELETE /api/v1/keys/:id` - Revoke API key

### Webhook Endpoints
- `POST /api/webhook/vtpass` - VTPass webhook notifications
- `POST /api/webhook/paystack` - Paystack webhook notifications

## 🎯 Usage

### For End Users
1. **Register** an account at `/register`
2. **Verify** your email address
3. **Login** to access the dashboard
4. **Fund** your wallet using Paystack
5. **Purchase** VTU services (airtime, data, TV, etc.)
6. **Monitor** transactions in real-time

### For Developers
1. **Generate** API keys in the dashboard
2. **Integrate** using our RESTful API
3. **Monitor** usage and transaction status
4. **Handle** webhook notifications for real-time updates

### For Administrators
1. **Access** admin panel at `/admin`
2. **Monitor** platform statistics
3. **Manage** users and transactions
4. **View** system analytics

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development servers (client + server)
- `npm run dev:client` - Start client development server only
- `npm run dev:server` - Start server development with auto-reload
- `npm run build` - Build client for production
- `npm run build:server` - Build server for production
- `npm run seed` - Seed database with sample data (development)
- `npm run seed:prod` - Seed database for production
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run test:coverage` - Run tests with coverage

### Project Structure
```
├── src/                    # React frontend
│   ├── components/        # Reusable components
│   ├── contexts/          # React contexts
│   ├── pages/             # Page components
│   ├── services/          # API services
│   └── main.tsx           # App entry point
├── server/                # Node.js backend
│   ├── database/          # Database setup and seed scripts
│   ├── middleware/        # Express middleware
│   ├── routes/            # API routes
│   ├── services/          # Business logic services
│   ├── utils/             # Utility functions
│   └── index.ts           # Server entry point
├── supabase/              # Supabase configuration
│   ├── migrations/        # SQL migration files
│   └── functions/         # Supabase Edge Functions
├── public/                # Static assets
└── package.json           # Dependencies and scripts
```

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt with salt rounds
- **Rate Limiting** - API rate limiting to prevent abuse
- **Input Validation** - Joi schema validation
- **SQL Injection Protection** - Parameterized queries
- **CORS Configuration** - Cross-origin resource sharing
- **Helmet Security** - Security headers
- **Environment Variables** - Sensitive data protection

## 🌐 Deployment

### Environment Setup
1. Set `NODE_ENV=production`
2. Configure Supabase connection variables
3. Set up production VTPass and Paystack credentials
4. Configure proper CORS settings
5. Set up SSL/TLS certificates

### Database Migration
```bash
# Apply migrations to your Supabase project
# This is typically handled through the Supabase dashboard or CLI
# For initial setup, run:
npm run seed
```

### Process Management
Consider using PM2 for production process management:
```bash
npm install -g pm2
pm2 start server/dist/index.js --name "vtu-platform"
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support and questions:
- **Email**: support@vtuplatform.com
- **Documentation**: [API Docs](https://docs.vtuplatform.com)
- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)

## 🙏 Acknowledgments

- [VTPass](https://vtpass.com) - VTU service provider
- [Paystack](https://paystack.com) - Payment gateway
- [Supabase](https://supabase.com) - Database and authentication
- [React](https://reactjs.org) - Frontend framework
- [Express.js](https://expressjs.com) - Backend framework
- [Tailwind CSS](https://tailwindcss.com) - CSS framework

---

**Built with ❤️ for seamless VTU services**