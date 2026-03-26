# PlaceAI Agent 🚀

**Autonomous AI Placement Agent** - An intelligent job application automation system that analyzes resumes, matches candidates with jobs, and generates tailored application materials.

## 🎯 Overview

PlaceAI Agent is a decision-making system that acts as a highly intelligent, execution-focused career assistant. It automates the entire job application pipeline from resume analysis to interview preparation.

### Key Capabilities

- 📄 **Resume Analysis** - Deep extraction of skills, experience, and strengths
- 💼 **Job Understanding** - Analyzes requirements and hidden expectations
- 🎯 **Match Scoring** - AI-powered candidate-job fit scoring (1-10)
- ✅ **Apply Decision** - Strict, logical yes/no recommendations
- 📝 **Resume Optimization** - ATS-friendly resume tailoring
- 📧 **Email Generation** - High-conversion application emails
- 🎤 **Interview Prep** - Technical and HR questions with ideal answers

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/placeai-agent.git
cd placeai-agent

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env and add your OpenAI API key
```

## ⚙️ Configuration

Create a `.env` file with the following variables:

```env
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o
MAX_TOKENS=4096
TEMPERATURE=0.7

# Agent Settings
MINIMUM_SCORE_TO_APPLY=6
MAX_EMAIL_WORDS=180
MIN_EMAIL_WORDS=120
```

## 🚀 Usage

### Single Job Processing

```bash
echo '{
  "resume": "Your full resume text...",
  "candidate_name": "John Doe",
  "target_role": "Software Engineer",
  "location": "San Francisco, CA",
  "job": {
    "company": "Tech Corp",
    "role": "Senior Software Engineer",
    "description": "Job description...",
    "requirements": "Job requirements...",
    "hr_email": "hr@techcorp.com"
  }
}' | node src/index.js
```

### Batch Processing (Multiple Jobs)

```bash
echo '{
  "resume": "Your full resume text...",
  "candidate_name": "John Doe",
  "target_role": "Software Engineer",
  "location": "San Francisco, CA",
  "jobs": [
    { "company": "Company A", "role": "Role A", "description": "...", "requirements": "..." },
    { "company": "Company B", "role": "Role B", "description": "...", "requirements": "..." }
  ]
}' | node src/index.js
```

### Run Test with Sample Data

```bash
npm test
```

## 📥 Input Format

```json
{
  "resume": "Full resume text...",
  "candidate_name": "John Doe",
  "target_role": "Software Engineer",
  "location": "San Francisco, CA",
  "job": {
    "company": "Tech Corp",
    "role": "Senior Software Engineer",
    "description": "Job description...",
    "requirements": "Job requirements...",
    "hr_email": "hr@techcorp.com"
  }
}
```

## 📤 Output Format

```json
{
  "analysis": {
    "skills": ["JavaScript", "React", "Node.js"],
    "experience_level": "mid",
    "strengths": ["Full-stack development", "Problem-solving"],
    "weaknesses": ["Limited cloud experience"],
    "missing_skills": ["Kubernetes"]
  },
  "job_analysis": {
    "required_skills": ["React", "Node.js", "TypeScript"],
    "expectations": ["Build web applications", "Lead team"]
  },
  "score": 8,
  "apply": "YES",
  "reason": "Strong match - meets most requirements",
  "optimized_resume": "Tailored resume text...",
  "email": {
    "subject": "Application for Senior Software Engineer",
    "body": "Personalized email body..."
  },
  "interview": {
    "technical": [
      {
        "question": "Explain React hooks...",
        "answer": "Ideal answer...",
        "difficulty": "Medium"
      }
    ],
    "hr": [
      {
        "question": "Why this company?",
        "answer": "Ideal answer..."
      }
    ]
  }
}
```

## 🏗️ Architecture

```
src/
├── agents/
│   └── placeAI.js          # Main orchestration pipeline
├── modules/
│   ├── resumeAnalyzer.js   # Resume analysis
│   ├── jobAnalyzer.js      # Job requirements analysis
│   ├── matchScorer.js      # Match scoring & decisions
│   ├── resumeOptimizer.js  # Resume optimization
│   ├── emailGenerator.js   # Email generation
│   └── interviewPrep.js    # Interview preparation
├── services/
│   └── openai.js           # OpenAI API service
├── utils/
│   └── prompts.js          # AI prompts
├── index.js                # Entry point
└── test.js                 # Test file
```

## 🔄 Pipeline Steps

1. **Resume Analysis** - Extract skills, experience, strengths
2. **Job Analysis** - Parse requirements and expectations
3. **Match Scoring** - Calculate fit score (1-10)
4. **Apply Decision** - YES/NO based on score threshold
5. **Resume Optimization** - Tailor resume for ATS
6. **Email Generation** - Create compelling application email
7. **Interview Preparation** - Generate Q&A for interviews

## 📊 Scoring Logic

| Score | Meaning           | Decision       |
| ----- | ----------------- | -------------- |
| 9-10  | Exceptional match | APPLY ✅       |
| 7-8   | Strong match      | APPLY ✅       |
| 5-6   | Partial match     | APPLY ⚠️       |
| <5    | Poor match        | DON'T APPLY ❌ |

## 🔌 Integration with n8n

PlaceAI Agent outputs structured JSON, making it perfect for automation pipelines:

```javascript
// In n8n Execute Command node
const result = JSON.parse(execution.data);

if (result.apply === "YES") {
  // Send email using result.email
  // Save optimized resume
  // Schedule interview prep
}
```

## 🛠️ Development

```bash
# Run in development mode with auto-reload
npm run dev

# Run tests
npm test
```

## 📝 License

MIT License - See LICENSE file for details.

## 🤝 Contributing

Contributions welcome! Please read CONTRIBUTING.md first.

---

**Built with ❤️ for job seekers everywhere**
