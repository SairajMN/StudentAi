# 🎓 StudentAI Placement Agent

<div align="center">

![StudentAI Logo](https://img.shields.io/badge/StudentAI-Placement_Agent-blue?style=for-the-badge&logo=robot)
![React](https://img.shields.io/badge/React-18.3-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=flat-square&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5.4-purple?style=flat-square&logo=vite)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3.4-cyan?style=flat-square&logo=tailwindcss)

**🚀 An AI-Powered Job Search Assistant That Finds, Scores, and Helps You Apply to Jobs Automatically**

[Features](#-features) • [How It Works](#-how-it-works) • [Installation](#-installation) • [Usage](#-usage) • [Architecture](#-architecture)

</div>

---

## 📖 What is StudentAI? (For Beginners!)

Imagine having a **smart robot friend** 🤖 that helps you find jobs! Here's what it does in simple terms:

1. **📝 You tell it about yourself** - Your name, skills, and what job you want
2. **🔍 It searches the internet** - Looking for jobs that match you
3. **🧠 AI thinks about each job** - Decides how good a match it is (score 0-100)
4. **📧 It writes emails for you** - Ready to send to companies
5. **📚 It helps you prepare** - For interviews with practice questions

> 💡 **Think of it like this**: It's like having a personal career assistant that works 24/7 and never gets tired!

---

## 🎯 Features

```mermaid
mindmap
  root((StudentAI))
    📄 Resume Upload
      PDF Support
      DOCX Support
      Text Input
    🔍 Job Search
      Adzuna API
      Real Jobs
      Multiple Locations
    🧠 AI Analysis
      Match Scoring
      Skill Matching
      Career Guidance
    📧 Email Generation
      Tailored Content
      Professional Tone
      Ready to Send
    📚 Interview Prep
      Technical Questions
      HR Questions
      Practice Mode
```

| Feature                | Description                        | Why It's Useful                    |
| ---------------------- | ---------------------------------- | ---------------------------------- |
| 📄 **Resume Upload**   | Upload PDF, DOCX, or paste text    | AI reads your skills automatically |
| 🔍 **Job Search**      | Searches real jobs from Adzuna API | Finds actual job listings          |
| 🧠 **AI Scoring**      | Scores each job 0-100              | Know which jobs are best for you   |
| 📧 **Email Drafts**    | Creates personalized emails        | Save time applying to jobs         |
| 📚 **Interview Prep**  | Generates Q&A for interviews       | Practice before the real thing     |
| 🎯 **Career Guidance** | AI advice for your career          | Get personalized tips              |
| 💬 **AI Chatbot**      | 24/7 chat assistant via n8n        | Get instant help anytime           |

---

## 🔄 How It Works

Here's the complete journey from "I want a job" to "I'm ready to apply":

```mermaid
flowchart TD
    A[🏠 Start: User Opens App] --> B[📝 Fill Your Details]
    B --> C[📄 Upload Resume]
    C --> D[💼 Choose Target Role]
    D --> E[📍 Set Location]
    E --> F[🚀 Click 'Start Agent']

    F --> G[🔍 Fetch Jobs from Adzuna API]
    G --> H[🧠 AI Analyzes Each Job]
    H --> I[📊 Calculate Match Score 0-100]
    I --> J[✨ Generate Career Guidance]

    J --> K[📋 View Job Results]
    K --> L{Happy with results?}

    L -->|Yes| M[📧 Generate Email]
    L -->|No| N[🔄 Try Different Search]

    M --> O[📤 Send Application]
    O --> P[📚 Practice Interview]
    P --> Q[🎉 Get Hired!]

    N --> D

    style A fill:#4CAF50,color:white
    style Q fill:#FFD700,color:black
    style F fill:#2196F3,color:white
    style H fill:#9C27B0,color:white
```

### Step-by-Step Explanation:

| Step | What Happens              | Technical Detail                                 |
| ---- | ------------------------- | ------------------------------------------------ |
| 1️⃣   | **You enter your info**   | Name, email, skills, target role                 |
| 2️⃣   | **App searches for jobs** | Calls Adzuna API with your criteria              |
| 3️⃣   | **AI analyzes jobs**      | Uses Open Router AI (Llama 3.1) to score matches |
| 4️⃣   | **Results appear**        | Jobs sorted by match score                       |
| 5️⃣   | **You choose to apply**   | Generate email, practice interview               |

---

## 🏗️ Architecture

### System Architecture Diagram

```mermaid
graph TB
    subgraph "👤 User Interface"
        UI[React Frontend]
        Hero[🏠 Hero Section]
        Dash[📊 Dashboard]
        Results[📋 Job Results]
        Email[📧 Email Modal]
        Quiz[📚 Quiz Modal]
    end

    subgraph "🔌 External APIs"
        Adzuna[🔍 Adzuna Job API]
        AI[🧠 Open Router AI]
        Gmail[📧 Gmail API]
    end

    subgraph "📦 Core Modules"
        API[lib/api.ts]
        Utils[lib/utils.ts]
        Docs[lib/documentUtils.ts]
    end

    UI --> API
    API --> Adzuna
    API --> AI
    API --> Gmail

    Hero --> Dash
    Dash --> Results
    Results --> Email
    Results --> Quiz

    style UI fill:#61DAFB,color:black
    style Adzuna fill:#FF6B00,color:white
    style AI fill:#9C27B0,color:white
    style API fill:#4CAF50,color:white
```

### Component Flow Diagram

```mermaid
sequenceDiagram
    participant U as 👤 User
    participant H as 🏠 HeroSection
    participant D as 📊 Dashboard
    participant A as 🔌 API Layer
    participant Ad as 🔍 Adzuna API
    participant AI as 🧠 Open Router AI
    participant JR as 📋 JobResults
    participant EM as 📧 EmailModal

    U->>H: Click "Start Job Hunt"
    H->>D: Navigate to Dashboard

    U->>D: Fill form & click "Start Agent"
    D->>A: searchJobsWithAI(role, location, skills)

    A->>Ad: fetchAdzunaJobs(role, location)
    Ad-->>A: Return raw job listings

    A->>AI: analyzeJobsWithAI(jobs, skills, role)
    AI-->>A: Return scored jobs + guidance

    A-->>D: Return PlacementResponse
    D->>JR: Navigate to Results

    U->>JR: Click email icon on a job
    JR->>EM: Open EmailModal with job data

    U->>EM: Review & send email
    EM-->>U: Email sent! ✅
```

---

## 🛠️ Tech Stack

```mermaid
graph LR
    subgraph "Frontend"
        React[React 18]
        TS[TypeScript]
        Vite[Vite]
        Tailwind[Tailwind CSS]
        Shadcn[shadcn/ui]
    end

    subgraph "State & Data"
        RQ[React Query]
        RR[React Router]
        Zod[Zod Validation]
    end

    subgraph "UI & Animation"
        Framer[Framer Motion]
        Lucide[Lucide Icons]
        Recharts[Recharts]
    end

    subgraph "Document Processing"
        Mammoth[Mammoth - DOCX]
        PDFJS[PDF.js - PDF]
        Docx[docx - Generate]
        jsPDF[jsPDF - Generate PDF]
    end

    subgraph "External Services"
        Adzuna[Adzuna Jobs API]
        OpenRouter[Open Router AI]
    end

    React --> TS
    Vite --> React
    Tailwind --> Shadcn
    Framer --> React
```

### Technology Explained (For Beginners!)

| Technology            | What It Is                                 | Why We Use It                       |
| --------------------- | ------------------------------------------ | ----------------------------------- |
| ⚛️ **React**          | A JavaScript library for building websites | Makes creating interactive UIs easy |
| 📘 **TypeScript**     | JavaScript with type safety                | Catches bugs before they happen     |
| ⚡ **Vite**           | A build tool                               | Makes development super fast        |
| 🎨 **Tailwind CSS**   | Utility-first CSS framework                | Style websites quickly              |
| 🧩 **shadcn/ui**      | Pre-built UI components                    | Beautiful buttons, forms, etc.      |
| 🔄 **React Query**    | Data fetching library                      | Handles API calls smoothly          |
| 🎬 **Framer Motion**  | Animation library                          | Makes things move beautifully       |
| 📄 **Mammoth/PDF.js** | Document readers                           | Read your resume files              |
| 🔍 **Adzuna API**     | Job search service                         | Finds real job listings             |
| 🧠 **Open Router AI** | AI service                                 | Analyzes and scores jobs            |

---

## 📁 Project Structure

```
studentai/
├── 📄 index.html              # Main HTML file
├── 📄 package.json            # Project dependencies
├── 📄 vite.config.ts          # Vite configuration
├── 📄 tailwind.config.ts      # Tailwind CSS config
├── 📄 tsconfig.json           # TypeScript config
│
├── 📂 public/                 # Static assets
│   ├── placeholder.svg
│   └── robots.txt
│
└── 📂 src/                    # Source code
    ├── 📄 App.tsx             # Main app component
    ├── 📄 main.tsx            # Entry point
    │
    ├── 📂 pages/              # Page components
    │   ├── Index.tsx          # Home page
    │   └── NotFound.tsx       # 404 page
    │
    ├── 📂 components/         # UI Components
    │   ├── HeroSection.tsx    # Landing hero
    │   ├── Dashboard.tsx      # Main dashboard
    │   ├── JobResults.tsx     # Job listings
    │   ├── EmailModal.tsx     # Email composer
    │   ├── QuizModal.tsx      # Interview prep
    │   ├── FileUpload.tsx     # Resume uploader
    │   ├── Navbar.tsx         # Navigation bar
    │   ├── ChatBot.tsx        # AI chat assistant
    │   └── ui/                # shadcn components
    │
    ├── 📂 lib/                # Utilities
    │   ├── api.ts             # API functions
    │   ├── utils.ts           # Helper functions
    │   └── documentUtils.ts   # Document processing
    │
    └── 📂 hooks/              # Custom React hooks
        ├── use-mobile.tsx
        └── use-toast.ts
```

---

## 🚀 Installation

### Prerequisites

Before you start, make sure you have these installed:

| Tool       | Version | Check Command    |
| ---------- | ------- | ---------------- |
| 📦 Node.js | 18+     | `node --version` |
| 📦 npm/bun | Latest  | `npm --version`  |

### Step 1: Clone the Repository

```bash
# Clone the project
git clone https://github.com/SairajMN/StudentAi.git

# Go into the project folder
cd StudentAi
```

### Step 2: Install Dependencies

```bash
# Using npm
npm install

# OR using bun (faster!)
bun install
```

### Step 3: Start the Development Server

```bash
# Using npm
npm run dev

# OR using bun
bun run dev
```

### Step 4: Open in Browser

🎉 **Success!** Open your browser and go to:

```
http://localhost:5173
```

---

## 📖 Usage Guide

### 🎬 Quick Start (5 Minutes!)

```mermaid
flowchart LR
    A[1. Open App] --> B[2. Click Start]
    B --> C[3. Enter Details]
    C --> D[4. Select Role]
    D --> E[5. Click Start Agent]
    E --> F[6. View Results!]

    style A fill:#4CAF50,color:white
    style F fill:#FFD700,color:black
```

### Detailed Steps:

#### Step 1: 🏠 Landing Page

- Open the app at `http://localhost:5173`
- You'll see a beautiful hero section
- Click **"Start Job Hunt"** button

#### Step 2: 📊 Dashboard

Fill in your details:

| Field       | Example                       | Required?   |
| ----------- | ----------------------------- | ----------- |
| Full Name   | "John Doe"                    | Optional    |
| Email       | "john@email.com"              | Optional    |
| Skills      | "React, TypeScript, Node.js"  | Optional    |
| Resume      | Upload PDF/DOCX or paste text | Optional    |
| Target Role | Select from dropdown          | ✅ Required |
| Location    | "Bangalore" or "Remote"       | Optional    |

#### Step 3: 🚀 Start the Agent

- Click **"Start Agent"** button
- Watch the pipeline animate through steps:
  1. 🔍 Fetch Jobs
  2. 🧠 AI Analysis
  3. 📊 Score Match
  4. ✅ Done

#### Step 4: 📋 View Results

- See job cards with match scores
- Each card shows:
  - Job title & company
  - Location & salary
  - Match score (0-100)
  - Why it matched
  - Skills to highlight

#### Step 5: 📧 Apply to Jobs

- Click the **📧 email icon** on any job card
- Review the AI-generated email
- Click **"Open in Gmail"** to send

#### Step 6: 📚 Practice Interviews

- Click the **🧠 brain icon** on any job card
- Practice technical & HR questions
- Get ideal answers to study

---

## 🔌 API Integration

### Data Flow Diagram

```mermaid
flowchart TB
    subgraph "Your App"
        UI[User Interface]
        API[API Layer lib/api.ts]
    end

    subgraph "External Services"
        Adzuna[🔍 Adzuna API<br/>Real Job Listings]
        OpenRouter[🧠 Open Router AI<br/>Llama 3.1 Model]
    end

    UI -->|1. Search Request| API
    API -->|2. Fetch Jobs| Adzuna
    Adzuna -->|3. Raw Jobs| API
    API -->|4. Analyze Jobs| OpenRouter
    OpenRouter -->|5. Scored Jobs| API
    API -->|6. Results| UI

    style Adzuna fill:#FF6B00,color:white
    style OpenRouter fill:#9C27B0,color:white
    style API fill:#4CAF50,color:white
```

### API Functions

| Function              | Purpose           | Input                  | Output          |
| --------------------- | ----------------- | ---------------------- | --------------- |
| `searchJobsWithAI()`  | Main job search   | role, location, skills | Jobs + Guidance |
| `fetchAdzunaJobs()`   | Fetch from Adzuna | role, location         | Raw jobs        |
| `analyzeJobsWithAI()` | AI scoring        | jobs, skills           | Scored jobs     |
| `sendEmailViaGmail()` | Send emails       | to, subject, body      | Success status  |

---

## 🎨 UI Components

### Component Hierarchy

```mermaid
graph TD
    App[App.tsx] --> Router[BrowserRouter]
    Router --> Index[Index.tsx]
    Router --> NotFound[NotFound.tsx]

    Index --> Navbar[Navbar]
    Index --> Hero[HeroSection]
    Index --> Dashboard[Dashboard]
    Index --> Results[JobResults]
    Index --> Activity[ActivityLog]

    Dashboard --> FileUpload[FileUpload]
    Results --> EmailModal[EmailModal]
    Results --> QuizModal[QuizModal]
    Router --> ChatBot[💬 ChatBot]

    style App fill:#61DAFB,color:black
    style Hero fill:#4CAF50,color:white
    style Dashboard fill:#2196F3,color:white
    style Results fill:#FF9800,color:white
    style ChatBot fill:#9C27B0,color:white
```

### Key Components Explained:

| Component          | File              | Purpose                               |
| ------------------ | ----------------- | ------------------------------------- |
| 🏠 **HeroSection** | `HeroSection.tsx` | Landing page with animated background |
| 📊 **Dashboard**   | `Dashboard.tsx`   | Main form + pipeline visualization    |
| 📋 **JobResults**  | `JobResults.tsx`  | Display scored job cards              |
| 📧 **EmailModal**  | `EmailModal.tsx`  | Compose & send emails                 |
| 📚 **QuizModal**   | `QuizModal.tsx`   | Interview practice questions          |
| 📄 **FileUpload**  | `FileUpload.tsx`  | Drag & drop resume upload             |
| 💬 **ChatBot**     | `ChatBot.tsx`     | 24/7 AI chat assistant                |

---

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run E2E tests with Playwright
npx playwright test
```

---

## 📦 Build for Production

```bash
# Build the project
npm run build

# Preview the build
npm run preview
```

The built files will be in the `dist/` folder.

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. 🍴 Fork the repository
2. 🌿 Create a feature branch: `git checkout -b feature/amazing-feature`
3. 💻 Make your changes
4. ✅ Run tests: `npm run test`
5. 📝 Commit: `git commit -m 'Add amazing feature'`
6. 🚀 Push: `git push origin feature/amazing-feature`
7. 🎉 Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- 🎨 **shadcn/ui** - Beautiful UI components
- 🔍 **Adzuna** - Job search API
- 🧠 **Open Router** - AI model access
- ⚛️ **React Team** - Amazing framework
- 🎬 **Framer Motion** - Smooth animations
---

<div align="center">

### 🌟 Star this repo if you found it helpful!

**Built with ❤️ for students looking for their dream jobs**

[⬆ Back to Top](#-studentai-placement-agent)

</div>
