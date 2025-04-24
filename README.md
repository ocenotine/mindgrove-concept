# MindGrove - AI-Powered Academic Research Assistant  
**Transformative Learning & Research Through AI**  

---

## Table of Contents  
1. [Project Overview](#-project-overview)  
2. [Features](#-features)  
3. [Tech Stack](#-tech-stack)  
4. [Installation](#-installation)  
5. [Development Setup](#-development-setup)  
6. [Deployment](#-deployment)  
7. [API Documentation](#-api-documentation)  
8. [Contributing](#-contributing)  


---

## Project Overview  
**MindGrove** is an intelligent web application designed to revolutionize academic research and learning. It leverages AI to provide:  
- **Automated summarization & Q&A** for research papers  
- **Collaborative tools** like shared annotations and study groups  
- **Gamified learning** with streaks, badges, and leaderboards  
- **Institutional customization** for universities and schools  

**Project Structure**
MindGrove/
├── client/ # React Frontend
│ ├── public/
│ │ ├── animations/ # Lottie/GSAP JSONs
│ │ │ ├── streak.json # Lottie animation for streaks
│ │ │ └── loading.json # Loading animation
│ │ ├── fonts/
│ │ │ ├── Inter.woff2 # Custom font
│ │ │ └── MindGrove.woff # Brand font
│ │ └── assets/
│ │ ├── logo.svg # Default logo
│ │ └── icons/ # SVG icons
│ ├── src/
│ │ ├── components/
│ │ │ ├── common/
│ │ │ │ ├── Button.tsx # Reusable button
│ │ │ │ └── Card.tsx # Animated card
│ │ │ ├── dashboard/
│ │ │ │ ├── StreakCounter.tsx # Animated streak UI
│ │ │ │ └── ProgressChart.tsx # Chart.js wrapper
│ │ │ └── animations/
│ │ │ ├── FadeIn.tsx # Fade-in transition
│ │ │ └── SlideUp.tsx # Slide-up effect
│ │ ├── features/
│ │ │ ├── auth/
│ │ │ │ ├── Login.tsx # Auth0 login flow
│ │ │ │ └── Signup.tsx # Animated signup form
│ │ │ ├── document/
│ │ │ │ ├── PDFUploader.tsx # Drag-and-drop UI
│ │ │ │ └── SummaryView.tsx # AI summary display
│ │ │ └── gamification/
│ │ │ ├── Badges.tsx # Badge unlock animations
│ │ │ └── Leaderboard.tsx # Live leaderboard
│ │ ├── hooks/
│ │ │ ├── useAuth.ts # Auth0 hook
│ │ │ └── useAnimation.ts # GSAP animations
│ │ ├── store/
│ │ │ └── authStore.ts # Zustand state
│ │ ├── styles/
│ │ │ ├── globals.css # Tailwind/CSS
│ │ │ └── theme.ts # MUI theme config
│ │ ├── App.tsx # Router setup
│ │ └── main.tsx # App entry
│ └── package.json # Frontend deps
│
├── server/ # NestJS Backend
│ ├── src/
│ │ ├── auth/
│ │ │ ├── auth.controller.ts # Auth0 endpoints
│ │ │ └── auth.service.ts # JWT validation
│ │ ├── document/
│ │ │ ├── document.controller.ts # PDF processing API
│ │ │ └── document.service.ts # AI integration
│ │ └── main.ts # Server bootstrap
│ └── package.json # Backend deps
│
├── ai/ # Python AI Services
│ ├── summarization/
│ │ ├── model.py # Hugging Face summarization
│ │ └── requirements.txt # Python dependencies
│ ├── qa/
│ │ └── qa_model.py # Fine-tuned Q&A model
│ └── flashcards/
│ └── generator.py # NLP flashcard logic
│
├── database/ # PostgreSQL
│ ├── migrations/
│ │ └── 001_init_tables.sql # Schema setup
│ └── seeds/
│ └── test_data.sql # Mock data
│
└── infra/ # DevOps
├── docker/
│ ├── Dockerfile.client # Frontend image
│ └── Dockerfile.server # Backend image
└── ci-cd/
└── deploy.yml # GitHub Actions workflow


**Target Users**: Students, Researchers, Educators and Institutions  

---

## Features  
### 1. AI-Powered Tools  
| Feature                | Description                                                                 |
|------------------------|-----------------------------------------------------------------------------|
| PDF Summarization      | Extract key insights from research papers using Hugging Face models         |
| Smart Q&A              | Ask questions about uploaded documents (fine-tuned GPT/BERT)                |
| Flashcard Generator    | Auto-generate flashcards from documents (spaCy/NLTK)                        |

### 2. Collaboration & Gamification  
| Feature                | Description                                                                 |
|------------------------|-----------------------------------------------------------------------------|
| Shared Annotations     | Highlight and comment with real-time sync (like Google Docs)                |
| Study Groups           | AI-moderated discussion groups                                              |
| Streaks & Badges       | Daily login rewards with Lottie animations                                  |

### 3. Institutional Features  
| Feature                | Description                                                                 |
|------------------------|-----------------------------------------------------------------------------|
| Custom Branding        | Universities can add logos, colors and subdomains                         |
| Role-Based Access      | Admins, teachers and students have tailored dashboards                    |
| Analytics Dashboard    | Track engagement and research trends                                       |

---

## Tech Stack  
### Frontend  
- **Framework**: React.js (TypeScript)  
- **UI Library**: Material-UI + Tailwind CSS  
- **Animations**: Framer Motion, GSAP, Lottie  
- **State Management**: Zustand  
- **Data Visualization**: Chart.js  

### Backend  
- **Framework**: NestJS  
- **Authentication**: Auth0  
- **Database**: PostgreSQL  
- **Search**: Elasticsearch  

### AI/ML  
- **Summarization/Q&A**: Hugging Face Transformers  
- **Flashcards**: spaCy/NLTK  
- **Recommendations**: Scikit-learn  

### DevOps  
- **Containerization**: Docker + Kubernetes  
- **CI/CD**: GitHub Actions  

---

##  Installation  
### Prerequisites  
- Node.js (v18+)  
- Python (v3.10+)  
- PostgreSQL (v14+)  
- Docker (optional)  


