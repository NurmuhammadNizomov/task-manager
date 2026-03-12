# Task Manager - Secure Nuxt Application

A modern, secure task management application built with Nuxt 3, featuring enterprise-grade security, multi-language support, and optimized performance.

## 🚀 Features

### 🔐 Security
- **XSS Protection**: Comprehensive input sanitization with DOMPurify
- **CSRF Protection**: Automatic CSRF token validation
- **Secure Authentication**: HttpOnly cookies + JWT tokens
- **Rate Limiting**: Protection against brute force attacks
- **Input Validation**: Joi-based validation with sanitization
- **Session Management**: Redis-backed session caching

### 🌐 User Experience
- **Multi-language Support**: English, Russian, Uzbek (UZ)
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Dark/Light Themes**: System theme detection and user preferences
- **Real-time Updates**: Optimistic UI updates
- **Progressive Web App**: PWA capabilities

### ⚡ Performance
- **Redis Caching**: Sub-millisecond session lookups
- **Database Optimization**: Compound indexes and connection pooling
- **Server-side Rendering**: SEO-friendly with Nuxt 3
- **Code Splitting**: Optimized bundle sizes

### 🛠 Technical Stack
- **Frontend**: Nuxt 3, Vue 3, TypeScript, Tailwind CSS
- **Backend**: Nuxt Server, H3, Node.js
- **Database**: MongoDB with Mongoose ODM
- **Cache**: Redis with connection pooling
- **Authentication**: JWT with refresh tokens
- **Email**: Resend for transactional emails
- **Security**: DOMPurify, bcryptjs, helmet

## 📋 Prerequisites

- Node.js 18+ 
- MongoDB 5.0+
- Redis 6.0+
- npm, yarn, pnpm, or bun

## 🛠 Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd my-nuxt-app
```

### 2. Install dependencies
```bash
# npm
npm install

# pnpm (recommended)
pnpm install

# yarn
yarn install

# bun
bun install
```

### 3. Environment Setup
Copy the example environment file and configure your settings:

```bash
cp .env.example .env
```

See [Environment Configuration](#environment-configuration) below for details.

### 4. Database Setup
Ensure MongoDB and Redis are running:

**MongoDB:**
```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or install locally
# Follow MongoDB installation guide for your OS
```

**Redis:**
```bash
# Using Docker
docker run -d -p 6379:6379 --name redis redis:latest

# Or install locally
# Follow Redis installation guide for your OS
```

## 🚀 Development

### Start Development Server
```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun dev
```

The application will be available at `http://localhost:3000`

### Development Commands
```bash
# Generate types
npm run generate

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

## 🏗 Production

### Build for Production
```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

### Preview Production Build
```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

## 🔧 Environment Configuration

Create a `.env` file based on `.env.example`:

```bash
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/task-manager
MONGODB_DB_NAME=task-manager

# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_PREFIX=task-manager

# JWT Configuration
JWT_ACCESS_SECRET=your-super-secret-access-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Email Configuration
RESEND_API_KEY=your-resend-api-key
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Application Configuration
APP_BASE_URL=http://localhost:3000
```

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|----------|-----------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/task-manager` | ✅ |
| `MONGODB_DB_NAME` | Database name | `task-manager` | ✅ |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` | ✅ |
| `REDIS_PREFIX` | Redis key prefix | `task-manager` | ✅ |
| `JWT_ACCESS_SECRET` | JWT access token secret | - | ✅ |
| `JWT_REFRESH_SECRET` | JWT refresh token secret | - | ✅ |
| `JWT_ACCESS_EXPIRES_IN` | Access token expiry | `15m` | ✅ |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry | `7d` | ✅ |
| `RESEND_API_KEY` | Resend API key | - | ✅ |
| `RESEND_FROM_EMAIL` | From email address | - | ✅ |
| `APP_BASE_URL` | Application base URL | `http://localhost:3000` | ✅ |

## 📚 Project Structure

```
my-nuxt-app/
├── app/                          # Nuxt app directory
│   ├── components/               # Vue components
│   ├── composables/             # Vue composables
│   ├── layouts/                 # Layout components
│   ├── middleware/              # Route middleware
│   ├── pages/                   # Route pages
│   └── plugins/                 # Nuxt plugins
├── server/                       # Server-side code
│   ├── api/                    # API routes
│   ├── middleware/              # Server middleware
│   ├── modules/                # Feature modules
│   └── utils/                  # Server utilities
├── public/                      # Static assets
├── i18n/                       # Internationalization
└── types/                       # TypeScript definitions
```

## 🔐 Security Features

### Authentication & Authorization
- **JWT Tokens**: Access and refresh token pattern
- **HttpOnly Cookies**: Prevents XSS token theft
- **CSRF Protection**: Prevents cross-site request forgery
- **Session Management**: Redis-backed session storage
- **Rate Limiting**: Brute force protection

### Input Validation & Sanitization
- **XSS Prevention**: DOMPurify for HTML sanitization
- **Input Validation**: Joi schemas for all endpoints
- **SQL Injection Prevention**: Mongoose ODM protection
- **File Upload Security**: Type and size validation

### Data Protection
- **Password Hashing**: bcrypt with salt rounds
- **Email Verification**: Secure token-based verification
- **Password Reset**: Time-limited secure reset tokens
- **Data Encryption**: Sensitive data encryption at rest

## 🌍 Internationalization

Supported languages:
- 🇺🇸 **Uzbek** (UZ) - Default
- 🇺🇸 **Russian** (RU) 
- 🇺🇸 **English** (EN)

### Adding New Languages

1. Add translation file to `i18n/locales/`
2. Update `nuxt.config.ts` locales array
3. Update language options in components

## 📊 Monitoring & Logging

### Application Logs
- Authentication events
- Security incidents
- Performance metrics
- Error tracking

### Database Monitoring
- Connection pool status
- Query performance
- Index usage statistics

### Redis Monitoring
- Cache hit rates
- Memory usage
- Connection status

## 🚀 Deployment

### Docker Deployment
```dockerfile
# Build
docker build -t task-manager .

# Run
docker run -p 3000:3000 task-manager
```

### Environment-Specific Configs
- `.env.development` - Development settings
- `.env.production` - Production settings
- `.env.test` - Testing settings

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Development Guidelines
- Follow TypeScript best practices
- Use ESLint and Prettier configurations
- Write meaningful commit messages
- Update documentation for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review existing issues

## 🔄 Updates

- Regular security updates
- Performance improvements
- New features based on user feedback
- Dependency updates and patches

---

**Built with ❤️ using Nuxt 3**
