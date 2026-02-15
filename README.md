# Unified Civic Intelligence Platform

> A production-grade civic technology platform designed to bridge the gap between citizens and government systems through intelligent automation and structured workflows.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![AWS](https://img.shields.io/badge/AWS-Cloud-orange.svg)](https://aws.amazon.com/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)

## 🎯 Overview

The Unified Civic Intelligence Platform is a comprehensive civic middleware layer that transforms how citizens interact with government services. Built for the AI-for-public-impact hackathon, this platform demonstrates real-world scalability, security awareness, and operational feasibility for deployment across India and similar public governance environments.

### Key Features

- **🔐 Persistent Digital Identity**: One-time profile creation with continuous context maintenance
- **🎁 Proactive Entitlement Discovery**: Automatic eligibility evaluation for welfare schemes
- **📢 Intelligent Issue Reporting**: Multi-modal civic issue reporting with AI-assisted classification
- **🤖 Multilingual AI Assistant**: Conversational support in Hindi, English, and regional languages
- **📊 Government Execution Dashboard**: Structured workflow management for government officials
- **🔒 Enterprise-Grade Security**: End-to-end encryption, RBAC, and comprehensive audit logging

## 📋 Table of Contents

- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Documentation](#documentation)
- [Development](#development)
- [Deployment](#deployment)
- [Team](#team)
- [License](#license)

## 🏗️ Architecture

The platform follows a cloud-native, microservices-oriented architecture designed for production-grade scalability:

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer                             │
│  ┌──────────────────┐         ┌──────────────────┐         │
│  │  Web Application │         │  Mobile App      │         │
│  │  React + Tailwind│         │  Expo            │         │
│  └──────────────────┘         └──────────────────┘         │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                   API Gateway Layer                          │
│              AWS Application Load Balancer                   │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                  Application Services                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │   Auth   │ │ Profile  │ │Entitlement│ │  Issue   │      │
│  │ Service  │ │ Service  │ │  Engine   │ │ Service  │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│  ┌──────────┐ ┌──────────────────────────────────┐         │
│  │Assistant │ │   Government Dashboard Service   │         │
│  │ Service  │ └──────────────────────────────────┘         │
│  └──────────┘                                                │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                  AI Processing Layer                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │  Issue   │ │   NLP    │ │  Image   │ │Eligibility│      │
│  │Classifier│ │Processor │ │ Analyzer │ │ Explainer │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  PostgreSQL  │  │ ElastiCache  │  │  S3 Storage  │     │
│  │     RDS      │  │    Redis     │  │    Bucket    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### Core Design Principles

1. **Separation of Concerns**: Clear boundaries between citizen-facing, government-facing, and AI processing layers
2. **Data Sovereignty**: Single source of truth in PostgreSQL with proper normalization
3. **Security by Design**: Encryption, RBAC, and audit logging at every layer
4. **Graceful Degradation**: System remains functional even when AI services are unavailable
5. **API-First Development**: All features exposed through RESTful APIs

## 🛠️ Technology Stack

### Frontend
- **Web**: React 18, Tailwind CSS, Redux Toolkit, React Query
- **Mobile**: Expo (React Native), AsyncStorage, Expo Notifications

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Language**: TypeScript
- **Validation**: Zod
- **ORM**: Prisma / TypeORM

### Database & Storage
- **Primary Database**: PostgreSQL 15 (AWS RDS)
- **Cache**: Redis 7.0 (AWS ElastiCache)
- **Object Storage**: AWS S3
- **Search**: PostgreSQL Full-Text Search + PostGIS

### AI & ML Services
- **LLM**: Amazon Bedrock (GPT-3.5/4)
- **Image Analysis**: Amazon Rekognition
- **Speech-to-Text**: Amazon Transcribe
- **Translation**: Amazon Translate
- **Custom Models**: Fine-tuned BERT for classification

### Infrastructure
- **Cloud Provider**: AWS
- **Compute**: ECS Fargate
- **Load Balancer**: Application Load Balancer
- **CDN**: CloudFront
- **DNS**: Route 53
- **Monitoring**: CloudWatch, X-Ray
- **CI/CD**: GitHub Actions

## 🚀 Getting Started

### Prerequisites

- Node.js 20 or higher
- PostgreSQL 15
- Redis 7.0
- AWS Account (for deployment)
- Expo CLI (for mobile development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/civic-intelligence-platform.git
   cd civic-intelligence-platform
   ```

2. **Install dependencies**
   ```bash
   # Backend
   cd backend
   npm install

   # Frontend
   cd ../frontend
   npm install

   # Mobile
   cd ../mobile
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Backend
   cp backend/.env.example backend/.env
   # Edit .env with your configuration
   ```

4. **Initialize database**
   ```bash
   cd backend
   npm run db:migrate
   npm run db:seed
   ```

5. **Start development servers**
   ```bash
   # Backend (Terminal 1)
   cd backend
   npm run dev

   # Frontend (Terminal 2)
   cd frontend
   npm run dev

   # Mobile (Terminal 3)
   cd mobile
   npm start
   ```

### Quick Start with Docker

```bash
docker-compose up -d
```

This will start:
- Backend API on `http://localhost:3000`
- Frontend on `http://localhost:5173`
- PostgreSQL on `localhost:5432`
- Redis on `localhost:6379`

## 📁 Project Structure

```
civic-intelligence-platform/
├── backend/                    # Node.js backend services
│   ├── src/
│   │   ├── services/          # Business logic services
│   │   ├── controllers/       # API controllers
│   │   ├── models/            # Database models
│   │   ├── middleware/        # Express middleware
│   │   ├── utils/             # Utility functions
│   │   └── config/            # Configuration files
│   ├── tests/                 # Backend tests
│   └── package.json
│
├── frontend/                   # React web application
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/             # Page components
│   │   ├── services/          # API services
│   │   ├── store/             # Redux store
│   │   ├── hooks/             # Custom hooks
│   │   └── utils/             # Utility functions
│   └── package.json
│
├── mobile/                     # Expo mobile application
│   ├── app/                   # App screens (Expo Router)
│   ├── components/            # React Native components
│   ├── services/              # API services
│   └── package.json
│
├── ai-workers/                 # AI processing workers
│   ├── classifier/            # Issue classification
│   ├── nlp/                   # NLP processing
│   ├── vision/                # Image analysis
│   └── explainer/             # Eligibility explanation
│
├── infrastructure/             # Infrastructure as Code
│   ├── terraform/             # Terraform configurations
│   ├── docker/                # Docker configurations
│   └── k8s/                   # Kubernetes manifests
│
├── docs/                       # Additional documentation
│   ├── api/                   # API documentation
│   ├── architecture/          # Architecture diagrams
│   └── deployment/            # Deployment guides
│
└── .kiro/                      # Kiro spec files
    └── specs/
        └── unified-civic-intelligence-platform/
            ├── requirements.md # Requirements document
            ├── design.md      # Design document
            └── tasks.md       # Implementation tasks
```

## 📚 Documentation

Comprehensive documentation is available in the `.kiro/specs/unified-civic-intelligence-platform/` directory:

### Core Documents

1. **[Requirements Document](/.kiro/specs/unified-civic-intelligence-platform/requirements.md)**
   - User stories and acceptance criteria (EARS format)
   - Functional and non-functional requirements
   - Security and compliance requirements
   - 12 major requirement categories covering all platform features

2. **[Design Document](/.kiro/specs/unified-civic-intelligence-platform/design.md)**
   - System architecture and component design
   - Database schema and data models
   - API specifications and interfaces
   - Security architecture and encryption
   - Infrastructure and deployment strategy
   - AI processing layer design
   - Frontend architecture (web and mobile)
   - Error handling and testing strategy

### Quick Links

- **Architecture Overview**: See [Design Document - System Architecture](/.kiro/specs/unified-civic-intelligence-platform/design.md#system-architecture)
- **API Reference**: See [Design Document - Components and Interfaces](/.kiro/specs/unified-civic-intelligence-platform/design.md#components-and-interfaces)
- **Database Schema**: See [Design Document - Data Models](/.kiro/specs/unified-civic-intelligence-platform/design.md#data-models)
- **Security**: See [Design Document - Security Architecture](/.kiro/specs/unified-civic-intelligence-platform/design.md#security-architecture)
- **Deployment**: See [Design Document - Infrastructure and Deployment](/.kiro/specs/unified-civic-intelligence-platform/design.md#infrastructure-and-deployment)

## 💻 Development

### Running Tests

```bash
# Backend unit tests
cd backend
npm test

# Backend integration tests
npm run test:integration

# Frontend tests
cd frontend
npm test

# E2E tests
npm run test:e2e
```

### Code Quality

```bash
# Linting
npm run lint

# Type checking
npm run type-check

# Format code
npm run format
```

### Database Migrations

```bash
# Create new migration
npm run db:migrate:create -- --name=add_new_table

# Run migrations
npm run db:migrate

# Rollback migration
npm run db:migrate:rollback
```

## 🚢 Deployment

### AWS Deployment

1. **Configure AWS credentials**
   ```bash
   aws configure
   ```

2. **Deploy infrastructure**
   ```bash
   cd infrastructure/terraform
   terraform init
   terraform plan
   terraform apply
   ```

3. **Deploy application**
   ```bash
   # Build and push Docker images
   npm run docker:build
   npm run docker:push

   # Deploy to ECS
   npm run deploy:production
   ```

### Environment Variables

Key environment variables required for deployment:

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname
REDIS_URL=redis://host:6379

# AWS Services
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET_NAME=civic-platform-media

# AI Services
BEDROCK_MODEL_ID=anthropic.claude-v2
REKOGNITION_COLLECTION_ID=civic-issues

# Authentication
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=24h
REFRESH_TOKEN_EXPIRATION=30d

# SMS Gateway
SMS_PROVIDER=twilio
SMS_API_KEY=your_sms_api_key
```

## 👥 Team

**The Mirror Family**

- **Team Leader**: Romeiro Fernandes
- **Team Members**: 
  - Aliqyaan Mahimwala
  - Gavin Soares
  - Russel Paul

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built for the AI-for-Bharat hackathon
- Designed for deployment in India and similar public governance environments
- Inspired by the need to bridge the gap between citizens and government services
