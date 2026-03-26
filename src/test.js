// PlaceAI Agent - Test File
// Demonstrates the PlaceAI Agent with sample data

import { executePipeline } from './agents/placeAI.js';
import dotenv from 'dotenv';

dotenv.config();

// Sample Resume
const sampleResume = `
JOHN DOE
Software Engineer
Email: john.doe@email.com | Phone: (555) 123-4567 | LinkedIn: linkedin.com/in/johndoe

SUMMARY
Passionate software engineer with 3 years of experience in full-stack development. 
Proficient in JavaScript, TypeScript, React, Node.js, and Python. 
Strong problem-solving skills and experience in agile environments.

EXPERIENCE

Software Engineer | TechStart Inc. | Jan 2022 - Present
- Developed and maintained React-based web applications serving 50,000+ users
- Built RESTful APIs using Node.js and Express, improving response times by 40%
- Implemented CI/CD pipelines using GitHub Actions and Docker
- Collaborated with cross-functional teams in an Agile/Scrum environment
- Mentored 2 junior developers on best practices

Junior Developer | WebSolutions LLC | Jun 2020 - Dec 2021
- Created responsive web interfaces using HTML, CSS, and JavaScript
- Integrated third-party APIs including Stripe and Google Maps
- Participated in code reviews and maintained 90% test coverage
- Optimized database queries reducing load times by 25%

PROJECTS

E-Commerce Platform | Personal Project
- Built a full-stack e-commerce app using React, Node.js, and MongoDB
- Implemented user authentication with JWT and OAuth
- Deployed on AWS using EC2, S3, and CloudFront

Task Management App | Team Project
- Led a team of 3 to build a Trello-like task management application
- Used React for frontend and Python/Django for backend
- Implemented real-time updates using WebSockets

EDUCATION

Bachelor of Science in Computer Science
State University | Graduated May 2020
GPA: 3.7/4.0

SKILLS
- Languages: JavaScript, TypeScript, Python, Java, SQL
- Frontend: React, Redux, HTML5, CSS3, Tailwind CSS
- Backend: Node.js, Express, Django, Flask
- Databases: PostgreSQL, MongoDB, Redis
- Tools: Git, Docker, AWS, Jenkins, Jira
- Soft Skills: Team leadership, Communication, Problem-solving

CERTIFICATIONS
- AWS Certified Developer - Associate (2023)
- MongoDB Certified Developer (2022)
`;

// Sample Job Posting
const sampleJob = {
  company: "InnovateTech Solutions",
  role: "Full Stack Developer",
  description: `
We are looking for a talented Full Stack Developer to join our growing team. 
You will work on building scalable web applications using modern technologies.

Responsibilities:
- Design and develop web applications using React and Node.js
- Build and maintain RESTful APIs and microservices
- Collaborate with product and design teams
- Write clean, maintainable, and well-tested code
- Participate in code reviews and architectural discussions
- Mentor junior team members

What we offer:
- Competitive salary and equity
- Flexible work arrangements
- Professional development opportunities
- Health insurance and wellness programs
  `,
  requirements: `
Required Skills:
- 2+ years of experience in full-stack development
- Strong proficiency in JavaScript and TypeScript
- Experience with React.js and Node.js
- Knowledge of SQL and NoSQL databases
- Familiarity with Git and CI/CD practices
- Good communication skills

Preferred Skills:
- Experience with cloud services (AWS, GCP, or Azure)
- Knowledge of Docker and containerization
- Experience with Agile/Scrum methodologies
- Understanding of microservices architecture
  `,
  hr_email: "careers@innovatetech.com"
};

// Test Input
const testInput = {
  resume: sampleResume,
  candidate_name: "John Doe",
  target_role: "Full Stack Developer",
  location: "San Francisco, CA",
  job: sampleJob
};

/**
 * Run the test
 */
async function runTest() {
  console.log('========================================');
  console.log('   PlaceAI Agent - Test Execution');
  console.log('========================================\n');

  console.log('📋 Test Input:');
  console.log(`   Candidate: ${testInput.candidate_name}`);
  console.log(`   Target Role: ${testInput.target_role}`);
  console.log(`   Company: ${testInput.job.company}`);
  console.log(`   Position: ${testInput.job.role}\n`);

  try {
    const result = await executePipeline(testInput);
    
    console.log('\n========================================');
    console.log('   TEST RESULTS');
    console.log('========================================\n');
    
    // Display Analysis
    console.log('📊 CANDIDATE ANALYSIS:');
    console.log(`   Skills: ${result.analysis.skills.slice(0, 8).join(', ')}...`);
    console.log(`   Experience Level: ${result.analysis.experience_level}`);
    console.log(`   Strengths: ${result.analysis.strengths.join(', ')}`);
    console.log(`   Weaknesses: ${result.analysis.weaknesses.join(', ')}\n`);
    
    // Display Job Analysis
    console.log('💼 JOB ANALYSIS:');
    console.log(`   Required Skills: ${result.job_analysis.required_skills.join(', ')}`);
    console.log(`   Expectations: ${result.job_analysis.expectations.slice(0, 3).join('; ')}\n`);
    
    // Display Score
    console.log('🎯 MATCH SCORE:');
    console.log(`   Score: ${result.score}/10`);
    console.log(`   Decision: ${result.apply}`);
    console.log(`   Reason: ${result.reason}\n`);
    
    // Display Email (if generated)
    if (result.email.subject) {
      console.log('📧 GENERATED EMAIL:');
      console.log(`   Subject: ${result.email.subject}`);
      console.log(`   Body Preview: ${result.email.body.substring(0, 200)}...\n`);
    }
    
    // Display Interview Questions (if generated)
    if (result.interview.technical.length > 0) {
      console.log('🎤 INTERVIEW PREPARATION:');
      console.log(`   Technical Questions: ${result.interview.technical.length}`);
      console.log(`   HR Questions: ${result.interview.hr.length}`);
      console.log(`   Sample Technical Q: ${result.interview.technical[0]?.question}\n`);
    }
    
    console.log('========================================');
    console.log('   ✅ TEST COMPLETED SUCCESSFULLY');
    console.log('========================================\n');
    
    // Output full JSON
    console.log('📄 FULL JSON OUTPUT:');
    console.log(JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error(error.stack);
  }
}

// Run the test
runTest();