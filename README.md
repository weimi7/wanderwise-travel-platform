# 🌍 Wanderwise Travel Platform

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-15.4.3-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=flat&logo=react)](https://reactjs.org/)
[![Express](https://img.shields.io/badge/Express-5.1.0-404D59?logo=express&logoColor=white)](https://expressjs.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Python-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-316192?style=flat&logo=postgresql)](https://www.postgresql.org/)

**An AI-powered travel planning platform specialized for creating structured, emoji-rich, and personalized itineraries for Sri Lanka.**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Environment Setup](#-environment-variables) • [API Documentation](#-api-documentation)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Deployment](#-deployment)
- [Security](#-security)
- [Contributing](#-contributing)
- [License](#-license)
- [Support](#-support)

---

## Overview

**Wanderwise** combines cutting-edge AI technology with modern web development to deliver an exceptional travel planning experience for Sri Lanka. The platform leverages OpenAI's GPT models and Hugging Face's inference capabilities to generate personalized, detailed itineraries that help travelers make the most of their Sri Lankan adventure.

### Why Wanderwise?

- 🎯 **Personalized Planning**: AI-driven itineraries tailored to your preferences, budget, and travel style
- 🗺️ **Sri Lanka Specialist**: Deep knowledge of Sri Lankan destinations, culture, and hidden gems
- 📱 **Modern UX**: Beautiful, responsive interface built with the latest web technologies
- 🔒 **Secure & Reliable**: Enterprise-grade security with JWT authentication and data encryption
- 📄 **Export Ready**: Professional PDF generation for offline access

---

## ✨ Features

### 🤖 AI-Powered Itinerary Generation
- Create detailed day-by-day travel plans based on: 
  - Destinations
  - Trip dates
  - Travel style (adventure, relaxation, culture, etc.)
- Real-time itinerary generation with streaming support
- Emoji-rich formatting for enhanced readability

### 💬 Intelligent AI Chat Assistant
- 24/7 travel assistance for Sri Lanka
- Ask questions about:
  - Destinations and attractions
  - Local culture and customs
  - Safety and health information
  - Transportation options
  - Weather and best times to visit
- Context-aware responses with conversation history

### 📄 Professional PDF Export
- Download itineraries as beautifully formatted PDFs
- Includes:
  - Day-by-day schedules
  - Location maps
  - Activity descriptions
  - Budget breakdowns
  - Travel tips
- Optimized for printing and offline viewing

### 🔐 User Authentication & Management
- Secure JWT-based authentication
- Google OAuth 2.0 integration
- User profile management
- Password reset functionality
- Session management

### 💳 Payment Integration
- Subscription management
- Payment history tracking
- Secure transaction handling

### 📱 Responsive Design
- Mobile-first approach
- Optimized for all screen sizes
- Touch-friendly interfaces
- Progressive Web App (PWA) capabilities

### 🗺️ Interactive Maps
- Leaflet-based map integration
- Location markers and routes
- Interactive destination exploration

### 📊 User Dashboard
- Travel history
- Account settings
- Payment management
- Activity analytics

---

## 🏗 Tech Stack

### Frontend (`/client`)

| Technology | Version | Purpose |
|------------|---------|---------|
| **[Next.js](https://nextjs.org/)** | 15.4.3 | React framework with SSR/SSG capabilities |
| **[React](https://reactjs.org/)** | 19.1.0 | UI library for building interactive interfaces |
| **[Tailwind CSS](https://tailwindcss.com/)** | 4.x | Utility-first CSS framework |
| **[Framer Motion](https://www.framer.com/motion/)** | 12.23.12 | Animation library for smooth transitions |
| **[React Leaflet](https://react-leaflet.js.org/)** | 5.0.0 | Interactive map integration |
| **[Axios](https://axios-http.com/)** | 1.11.0 | HTTP client for API requests |
| **[jsPDF](https://github.com/parallax/jsPDF)** | 3.0.4 | PDF generation library |
| **[React Hot Toast](https://react-hot-toast.com/)** | 2.6.0 | Notification system |
| **[Recharts](https://recharts.org/)** | 3.2.1 | Data visualization charts |
| **[Lucide React](https://lucide.dev/)** | 0.535.0 | Icon library |

### Backend (`/server`)

| Technology | Version | Purpose |
|------------|---------|---------|
| **[Node.js](https://nodejs.org/)** | 18+ | JavaScript runtime |
| **[Express.js](https://expressjs.com/)** | 5.1.0 | Web application framework |
| **[PostgreSQL](https://www.postgresql.org/)** | Latest | Relational database |
| **[JWT](https://jwt.io/)** | 9.0.2 | Token-based authentication |
| **[Google Auth Library](https://github.com/googleapis/google-auth-library-nodejs)** | 10.5.0 | Google OAuth implementation |
| **[Bcrypt](https://www.npmjs.com/package/bcrypt)** | 6.0.0 | Password hashing |
| **[Cloudinary](https://cloudinary.com/)** | 2.8.0 | Image upload and management |
| **[SendGrid](https://sendgrid.com/en-us/)** | 8.1.6 | Email service |

### AI Service (`/ai-service`)

| Technology | Purpose |
|------------|---------|
| **[FastAPI](https://fastapi.tiangolo.com/)** | High-performance Python web framework |
| **[Hugging Face](https://huggingface.co/)** | AI model inference |
| **[Uvicorn](https://www.uvicorn.org/)** | ASGI server |
| **Python 3.10+ (3.14)** | Programming language |

---

## 🏛 Architecture

```
┌─────────────────┐
│   Client        │  Next.js 15 + React 19
│   (Port 3000)   │  Tailwind CSS, Framer Motion
└────────┬────────┘
         │
         │ HTTP/HTTPS
         │
┌────────▼────────┐
│   Server        │  Express.js + Node.js
│   (Port 5000)   │  JWT Auth, PostgreSQL
└────────┬────────┘
         │
         ├─────────────────┐
         │                 │
         │                 │
┌────────▼────────┐  ┌────▼──────────┐
│  PostgreSQL     │  │  AI Service   │
│  Database       │  │  (Port 8001)  │
└─────────────────┘  │  FastAPI      │
                     └───────────────┘
                            │
                            │
                     ┌──────▼───────┐
                     │ Hugging Face │
                     │   Models     │
                     └──────────────┘
```

### Request Flow

1. **User Action** → Client sends request to Server
2. **Authentication** → Server validates JWT token
3. **Business Logic** → Server processes request
4. **AI Processing** (if needed) → Server calls AI Service
5. **Data Storage** → Server interacts with PostgreSQL
6. **Response** → Server sends response back to Client

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed: 

- **Node.js** v18 or higher ([Download](https://nodejs.org/))
- **Python** v3.9 or higher ([Download](https://www.python.org/))
- **PostgreSQL** v14 or higher ([Download](https://www.postgresql.org/))
- **npm** or **yarn** package manager
- **Git** for version control

### Required API Keys

You'll need API keys from the following services:

- [Hugging Face](https://huggingface.co/) - For AI model inference
- [Google Cloud Console](https://console.cloud.google.com/) - For OAuth 2.0
- [Stripe](https://stripe.com/) - For payment processing
- [Cloudinary](https://cloudinary.com/) - For image management (optional)
- [SendGrid](https://sendgrid.com/) - For email services (optional)

---

### Installation Steps

#### 1️⃣ Clone the Repository

```bash
git clone https://github.com/supunakalanka76/wanderwise-travel-platform.git
cd wanderwise-travel-platform
```

---

#### 2️⃣ Database Setup

Create a PostgreSQL database: 

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE wanderwise;

# Create user (optional)
CREATE USER wanderwise_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE wanderwise TO wanderwise_user;
```

Run the database migrations:

```bash
cd server
# Execute the SQL files in the database folder
psql -U postgres -d wanderwise -f database/schema.sql
```

---

#### 3️⃣ Backend Server Setup

```bash
cd server

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit . env file with your configuration
nano .env

# Start development server
npm run dev
```

The server will run on `http://localhost:5000`

---

#### 4️⃣ Frontend Client Setup

```bash
cd client

# Install dependencies
npm install

# Create environment file
cp .env.local.example .env.local

# Edit .env.local with your configuration
nano .env.local

# Start development server
npm run dev
```

The client will run on `http://localhost:3000`

---

#### 5️⃣ AI Service Setup

```bash
cd ai-service

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows: 
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp . env.example .env

# Edit .env with your configuration
nano .env

# Start FastAPI server
uvicorn main:app --reload --port 8001
```

The AI service will run on `http://localhost:8001`

---

## 🔐 Environment Variables

### Server (`.env`)

```bash
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/wanderwise
DB_HOST=localhost
DB_PORT=5432
DB_NAME=wanderwise
DB_USER=your_username
DB_PASSWORD=your_password

# Authentication
JWT_SECRET=your_super_secret_jwt_key_min_32_characters
JWT_EXPIRE=7d
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRE=30d

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback

# OpenAI
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4-turbo-preview


# Email Service (SendGrid)
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=noreply@wanderwise.com

# Cloudinary (Image Upload)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# AI Service
AI_SERVICE_URL=http://localhost:8001

# CORS
CLIENT_URL=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Client (`.env.local`)

```bash
# API Endpoints
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_AI_SERVICE_URL=http://localhost:8001

# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id

# App Configuration
NEXT_PUBLIC_APP_NAME=Wanderwise
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Features
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_CHAT=true
NEXT_PUBLIC_ENABLE_PAYMENTS=true

# Turnstile (Captcha) - Optional
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_turnstile_site_key
```

### AI Service (`.env`)

```bash
# Hugging Face
HUGGINGFACE_API_KEY=your_hugging_face_api_key
HUGGINGFACE_MODEL=mistralai/Mixtral-8x7B-Instruct-v0.1

# Service Configuration
SERVICE_PORT=8001
SERVICE_HOST=0.0.0.0

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5000
```

---

## 📂 Project Structure

```
wanderwise-travel-platform/
│
├── client/                      # Frontend Application (Next.js)
│   ├── app/                     # Next.js 15 App Directory
│   │   ├── (auth)/              # Authentication pages
│   │   ├── (dashboard)/         # User dashboard pages
│   │   ├── itinerary/           # Itinerary pages
│   │   ├── chat/                # AI chat interface
│   │   ├── api/                 # API routes
│   │   └── layout.js            # Root layout
│   ├── components/              # React components
│   │   ├── ui/                  # UI components
│   │   ├── forms/               # Form components
│   │   ├── layouts/             # Layout components
│   │   └── features/            # Feature-specific components
│   ├── lib/                     # Utility functions
│   ├── hooks/                   # Custom React hooks
│   ├── contexts/                # React contexts
│   ├── styles/                  # Global styles
│   ├── public/                  # Static assets
│   └── package.json             # Dependencies
│
├── server/                      # Backend Application (Express.js)
│   ├── controllers/             # Route controllers
│   │   ├── authController.js
│   │   ├── itineraryController.js
│   │   ├── chatController. js
│   │   └── paymentController.js
│   ├── routes/                  # API routes
│   │   ├── auth.js
│   │   ├── itinerary.js
│   │   ├── chat.js
│   │   └── payment.js
│   ├── middleware/              # Express middleware
│   │   ├── auth.js
│   │   ├── validation.js
│   │   └── errorHandler.js
│   ├── config/                  # Configuration files
│   │   ├── db.js
│   │   └── cloudinary.js
│   ├── utils/                   # Utility functions
│   │   ├── fileValidator.js
│
│   ├── database/                # Database files
│   │   ├── schema.sql
│   │   └── seeds.sql
│   ├── index.js                 # Server entry point
│   └── package.json             # Dependencies
│
├── ai-service/                  # AI Service (FastAPI)
│   ├── main.py                  # FastAPI app entry
│   ├── routers/                 # API routers
│   │   ├── itinerary.py
│   │   └── chat.py
│   ├── services/                # Business logic
│   │   ├── ai_service.py
│   │   └── prompts.py
│   ├── models/                  # Pydantic models
│   │   └── schemas.py
│   ├── utils/                   # Utility functions
│   ├── requirements.txt         # Python dependencies
│   └── . env                     # Environment variables
│
├── . gitignore                   # Git ignore rules
├── README.md                    # Project documentation
└── LICENSE                      # MIT License
```

---

## 🔌 API Documentation

### Base URLs

- **Client**: `http://localhost:3000`
- **Server**: `http://localhost:5000`
- **AI Service**: `http://localhost:8001`

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type:  application/json

{
  "name": "John Doe",
  "email": "john@example. com",
  "password": "SecurePassword123!"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

#### Google OAuth
```http
POST /api/auth/google
Content-Type: application/json

{
  "token": "google_oauth_token"
}
```

### Itinerary Endpoints

#### Generate Itinerary
```http
POST /api/itinerary/generate
Authorization: Bearer <jwt_token>
Content-Type:  application/json

{
  "destination": "Colombo, Kandy, Galle",
  "duration": 7,
  "startDate": "2025-12-25",
  "budget": "medium",
  "preferences": ["culture", "nature", "adventure"],
  "travelers": 2
}
```

#### Get User Itineraries
```http
GET /api/itinerary/user
Authorization: Bearer <jwt_token>
```

#### Get Itinerary by ID
```http
GET /api/itinerary/: id
Authorization: Bearer <jwt_token>
```

#### Export to PDF
```http
GET /api/itinerary/: id/pdf
Authorization: Bearer <jwt_token>
```

### Chat Endpoints

#### Send Message
```http
POST /api/chat/message
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "message":  "What are the best places to visit in Ella? ",
  "conversationId": "optional_conversation_id"
}
```

### Payment Endpoints

#### Create Payment Intent
```http
POST /api/payment/create-intent
Authorization:  Bearer <jwt_token>
Content-Type: application/json

{
  "amount": 2999,
  "currency": "usd",
  "planId": "premium_plan"
}
```

---

## 🗄 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  google_id VARCHAR(255) UNIQUE,
  avatar_url VARCHAR(500),
  role VARCHAR(50) DEFAULT 'user',
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Itineraries Table
```sql
CREATE TABLE itineraries (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  destination VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  duration INTEGER NOT NULL,
  budget VARCHAR(50),
  travelers INTEGER DEFAULT 1,
  preferences JSONB,
  content JSONB NOT NULL,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Chat Conversations Table
```sql
CREATE TABLE chat_conversations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255),
  messages JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Payments Table
```sql
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  stripe_payment_id VARCHAR(255) UNIQUE NOT NULL,
  amount INTEGER NOT NULL,
  currency VARCHAR(10) DEFAULT 'usd',
  status VARCHAR(50) NOT NULL,
  plan_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🚢 Deployment

### Frontend Deployment (Vercel)

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to client directory
cd client

# Deploy
vercel --prod
```

### Backend Deployment (Railway/Heroku)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Navigate to server directory
cd server

# Initialize Railway
railway init

# Deploy
railway up
```

### Database (Railway/Supabase)

1. Create PostgreSQL instance
2. Update connection string in `.env`
3. Run migrations

### AI Service (Google Cloud Run/AWS Lambda)

```bash
# Build Docker image
docker build -t wanderwise-ai-service .

# Deploy to Cloud Run
gcloud run deploy wanderwise-ai --image wanderwise-ai-service --platform managed
```

---

## 🔐 Security

### Implemented Security Measures

- ✅ **Password Hashing**: bcrypt with salt rounds
- ✅ **JWT Authentication**: Secure token-based auth
- ✅ **Role-Based Access Control (RBAC)**: User permissions
- ✅ **Input Validation**: express-validator for all inputs
- ✅ **SQL Injection Prevention**:  Parameterized queries
- ✅ **XSS Protection**: DOMPurify sanitization
- ✅ **CORS Configuration**:  Restricted origins
- ✅ **Rate Limiting**: Prevent abuse and DDoS
- ✅ **HTTPS**: SSL/TLS encryption
- ✅ **Environment Variables**: Sensitive data protection
- ✅ **Helmet. js**: HTTP security headers
- ✅ **CSRF Protection**: Token-based validation

### Best Practices

- Never commit `.env` files
- Rotate API keys regularly
- Use strong passwords
- Enable 2FA where possible
- Keep dependencies updated
- Regular security audits

---

## 👤 Student Details

| Field | Value |
|-------|-------|
| **Student ID** | 24063586 (E219113) |
| **Student Name** | M.W. H. G. Supun Akalanka |
| **Project Type** | Final Year Project |
| **Institution** | London Metropolitan University / ESOFT Metro Campus |
| **Academic Year** | 2024/2025 |

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. Commit your changes
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. Push to the branch
   ```bash
   git push origin feature/AmazingFeature
   ```
5. Open a Pull Request

### Coding Standards

- Follow ESLint configuration
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation
- Write tests for new features

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## 📧 Support

For support, questions, or feedback:

- **Email**: 
  - Academic: e219113@esoft.academy
  - Personal: supunakalanka76@gmail.com
- **GitHub Issues**: [Create an issue](https://github.com/supunakalanka76/wanderwise-travel-platform/issues)

---

## 🎓 Academic Integrity

This project adheres to academic integrity guidelines and proper citation of all resources used during development.

> **Note**: This is an academic project developed for educational purposes as part of the Advanced Software Engineering course at ESOFT Metro Campus, affiliated with London Metropolitan University.

---

## 🙏 Acknowledgments

- OpenAI for GPT models
- Hugging Face for AI infrastructure
- Next.js team for the amazing framework
- All open-source contributors
- ESOFT Metro Campus for academic support
- London Metropolitan University

---

## 📊 Project Statistics

- **Total Lines of Code**: ~50,000+
- **Components**:  100+
- **API Endpoints**: 30+
- **Database Tables**: 10+
- **Dependencies**: 120+

---

## 🗓 Version History

- **v1.0.0** (December 2025)
  - Initial release
  - Core features implemented
  - Full authentication system
  - AI itinerary generation
  - Payment integration

---

## 🔮 Future Enhancements

- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Social features (share itineraries)
- [ ] Real-time collaboration
- [ ] Offline mode
- [ ] Advanced analytics dashboard
- [ ] Travel booking integration
- [ ] Weather API integration
- [ ] Community reviews and ratings
- [ ] Video tour guides

---

<div align="center">

**Made with ❤️ by Supun Akalanka**

[![GitHub](https://img.shields.io/badge/GitHub-supunakalanka76-181717?style=flat&logo=github)](https://github.com/supunakalanka76)

---

<p align="right"> 
<i>Last Updated: December 21, 2025</i>
</p>

</div>
