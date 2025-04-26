
<div align="center">
  
# ✨ MindGrove - AI-Powered Academic Research Assistant ✨

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)

<h3>Transforming Academic Research & Learning Through AI</h3>

</div>

---

## 📚 Table of Contents
1. [Introduction](#-introduction)
2. [Features](#-features)
3. [Tech Stack](#-tech-stack)
4. [Project Structure](#-project-structure)
5. [Getting Started](#-getting-started)
6. [User Types](#-user-types)
7. [API & Integration](#-api--integration)
8. [Deployment](#-deployment)

---

## 📖 Introduction

MindGrove is an innovative AI-powered platform designed to enhance academic research and learning through intelligent document analysis, summarization, and knowledge extraction. It aims to transform the way researchers, students, and educators interact with academic content, making knowledge more accessible and easier to retain.

**Mission**: To make academic knowledge more accessible, comprehensible, and memorable through the power of artificial intelligence.

---

## ✨ Features

### 🤖 AI-Powered Document Intelligence
- **Smart Summarization**: Automatically extract key concepts, findings, and conclusions
- **Personalized Flashcard Generation**: Convert long documents into bite-sized learning material
- **Context-Aware AI Chat**: Ask questions about your documents and get precise answers

### 📄 Document Management
- Upload and organize PDFs, Word documents, and research papers
- Automatic metadata extraction (authors, publication dates, keywords)
- Search across your entire document library with semantic search

### 📚 Learning Enhancement
- Interactive flashcards with spaced repetition
- Knowledge tracking to monitor progress
- Citation management for academic writing
- Gamified learning with streaks and achievements

### 🏆 Student Leaderboard
- Top students ranked by research streaks
- Special visual recognition for top performers
- Real-time updates to foster healthy competition

### 👨‍💻 User Experience
- Clean, modern interface with light/dark mode
- Mobile-optimized for learning on-the-go
- Guided onboarding for new users
- Companion app for learning on the go

### 🏫 Institutional Tools
- Custom branding options for institutions
- Analytics dashboard for tracking student engagement 
- User management and reporting
- Research collaboration portals

---

## 🛠 Tech Stack

MindGrove is built with modern, robust technologies to ensure performance, scalability, and developer experience:

### Frontend
- **React 18** with TypeScript for UI
- **Tailwind CSS** and **shadcn/ui** for styling
- **Framer Motion** for animations
- **Tanstack Query** for data fetching and state management
- **Recharts** for data visualization

### Backend & Services
- **Supabase** for authentication, database, and storage
- **OpenRouter API** for document understanding and generation
- **PDF.js** for document rendering and text extraction
- **Edge Functions** for serverless backend operations

---

## 📂 Project Structure

```
mindgrove/
├── public/                 # Static assets
│   ├── document-icons/     # Icons for document types
│   ├── mindgrove.png       # App logo
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── animations/     # Animation components
│   │   ├── chat/           # AI chat interface components
│   │   ├── common/         # Shared UI elements
│   │   ├── dashboard/      # Dashboard components
│   │   ├── document/       # Document viewer components
│   │   ├── flashcards/     # Flashcard components
│   │   ├── gamification/   # Streaks and rewards components
│   │   ├── landing/        # Landing page components
│   │   ├── layout/         # Layout components (headers, nav, etc.)
│   │   ├── onboarding/     # User onboarding components
│   │   ├── profile/        # User profile components
│   │   ├── theme/          # Theme components
│   │   └── ui/             # shadcn/ui components
│   ├── hooks/              # Custom React hooks
│   ├── integrations/       # External service integrations
│   │   └── supabase/       # Supabase client setup
│   ├── pages/              # Application pages/routes
│   ├── store/              # Global state management
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Utility functions
└── config files            # Various configuration files
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm/yarn
- Supabase account for backend services
- OpenRouter API key for AI features

### Setup Steps

1. Clone the repository:
```bash
git clone https://github.com/yourusername/mindgrove.git
cd mindgrove
```

2. Install dependencies:
```bash
npm install
# or
yarn
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your API keys and configuration
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

5. Build for production:
```bash
npm run build
# or
yarn build
```

---

## 👥 User Types

### Student Users
- Document uploading and management
- AI-powered summaries and flashcards
- Learning streaks and gamification
- Mobile companion app
- Participation in leaderboards

### Institutional Users
- All student features
- Advanced analytics dashboard
- Research collaboration portals
- Custom branding options
- Automated report generation

---

## 🔌 API & Integration

MindGrove integrates with several powerful APIs:

### Supabase
- Authentication, user management, and document storage
- Database for user profiles, document metadata, and flashcards
- Edge functions for serverless operations

### OpenRouter API
- Used for document summarization, flashcard generation, and contextual chat

### PDF Processing
- PDF.js for client-side text extraction
- OCR capabilities for scanned documents

---

## 🌐 Deployment

MindGrove is deployed using:

- Frontend: Vercel/Netlify for static site hosting
- Backend: Supabase Cloud for database, auth, and storage
- Edge Functions: Supabase Edge Functions for serverless backend logic

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.
