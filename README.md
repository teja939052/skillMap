# Skill Map — SIH 26044

**A centralized platform connecting students, colleges, faculty, and companies for skill mapping, internships, and placements.**

---

## The Problem

Right now, everyone is disconnected:

| Person | Says | But doesn't know |
|--------|------|-----------------|
| **Student** | "I want a software job." | What skills companies want, which skills I have, which I'm missing, which internship suits me |
| **Company** | "We need 20 backend interns." | Which college students are good, who actually has the required skills, who to shortlist |
| **College** | "Our students need placements." | What companies currently want, what students are weak at, which training to conduct |
| **Professor** | "I want industry projects for my students." | Where to find those opportunities |

The SIH problem statement (26044) explicitly calls for a **centralized Academia–Industry Collaboration Portal** that solves exactly this.

---

## The Solution

Skill Map puts students, colleges, teachers, and companies in **one place** so they can find each other and work together.

### How it works — the full loop

```
COMPANY
"We need Python + SQL + Docker for a backend internship"
         │
         ▼
   ┌─────────────┐
   │   SKILL MAP  │
   └─────────────┘
      ▲     ▲     ▲
      │     │     │
   STUDENT COLLEGE FACULTY
```

**1. Student signs up**
- Enters what they know: Python, SQL, React
- Enters what they want: Backend Developer
- Takes a short skill test
- Skill Map shows: "You're good at Python ✓, need to learn Docker ⚠️"

**2. Company posts an internship**
- Enters required skills: Python, SQL, REST APIs, Docker
- Skill Map scans all students and finds the best matches:
  - Rahul — 91% match (has all 4 skills)
  - Priya — 87% match (missing Docker)
  - Arjun — 82% match (missing REST APIs, Docker)
- Company sees exactly *why* each student matched

**3. College sees the big picture**
- Dashboard shows: "Only 30% of our CSE students know Docker, but 78% of companies are asking for it"
- College creates a Docker workshop
- 100 students complete it
- Before: 32% knew Docker → After: 76% knew Docker
- **47 more students now qualify** for that internship

**4. Faculty connects with industry**
- Professor sees: "Company X has a real-world AI project"
- Professor brings it to students
- Students build the project with industry guidance
- Everyone wins: students get experience, company gets work done, professor gets collaboration

---

## What You Can Do on Skill Map

### As a Student
- Build your **skill profile** through tests and assessments
- See your **skill gaps** compared to what companies want
- Discover **internships and projects** matched to your skills
- **Apply** directly through the platform
- Track your **progress** over time

### As a College
- See **what skills** your students have — and what they're missing
- See **what companies** are actually looking for
- Create **training, workshops, and interventions** to close gaps
- Track whether training **actually improves** student skills
- View **placement outcomes** and curriculum alignment

### As a Company
- **Post internships, jobs, projects, and training** opportunities
- Define required skills for each role
- Get **matched candidates** ranked by fit percentage
- See **why** each candidate matched (transparent scoring)
- Shortlist and connect with students directly

### As a Faculty Member
- See **industry projects and collaborations** available
- Bring **real-world projects** into the classroom
- **Verify** student skills and evidence
- Connect with **industry mentors** for students

---

## The Killer Demo (30 seconds)

> **Judge**: "What does your platform actually do?"

> **You**: "Watch this."

1. Company posts a backend internship: needs Python, SQL, Docker, REST APIs
2. Skill Map scans 1,000 students → only **18% currently qualify**
3. College dashboard shows Docker is the #1 missing skill
4. College runs a Docker workshop → 100 students complete it
5. Before: 32% knew Docker → After: 76% knew Docker
6. **47 more students now qualify** — company sees them immediately

That's the loop. **Company need → College sees gap → Students improve → Company finds qualified candidates.**

---

## Impact

| Metric | Before Skill Map | After Skill Map |
|--------|-----------------|-----------------|
| Students ready for a given internship | 18% | 47%+ |
| Time for company to find right candidates | Weeks | Minutes |
| College visibility into skill gaps | Manual surveys | Real-time dashboard |
| Faculty-industry collaboration | Ad-hoc | Structured & continuous |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React + TypeScript + Vite + Tailwind CSS |
| **Backend** | Node.js + Express + TypeScript + MongoDB |
| **Real-time** | BullMQ + Redis |
| **Auth** | JWT + Google OAuth 2.0 |
| **Validation** | Zod (shared contracts) |
| **Deployment** | Docker, ready for cloud |

---

## Getting Started

### Prerequisites
- Node.js 20+
- MongoDB (local or Atlas)
- Redis

### Setup

```bash
# Install dependencies
npm install

# Start backend + frontend together
npm run dev

# Backend: http://localhost:4000
# Frontend: http://localhost:5173
```

### Build

```bash
npm run build
```

---

## Project Structure

```
skill-map/
├── frontend/          # React web app
│   └── src/
│       ├── pages/     # Student, College, Company, Faculty pages
│       ├── components/# Reusable UI components
│       ├── hooks/     # Data fetching & auth
│       └── routes/    # React Router setup
├── backend/           # Express API server
│   └── src/
│       ├── modules/   # Feature modules (identity, competency, opportunity...)
│       ├── shared/    # Database, auth, HTTP middleware
│       └── index.ts   # Server entry point
├── shared/            # Code shared between frontend & backend
│   ├── contracts/     # Zod schemas (types validated at runtime)
│   ├── config/        # Shared constants
│   └── utils/         # Helper functions
└── infra/             # Docker Compose, Terraform, Nginx
```

---

## What Makes This Different

Most placement portals are just **resume databases**. Skill Map is different because:

1. **Skills are verified**, not just claimed — faculty verify evidence, companies see proof
2. **Colleges see the full picture** — not just "how many placed" but "what skills are missing"
3. **It's a loop, not a one-way street** — company need → training → skill improvement → placement → repeat
4. **Faculty get industry access** — projects, training, research collaboration, all in one place

---

## SIH Problem Statement

**SIH 26044**: Portal for Academia - Industry collaboration for Skill Mapping, Internships and Placement

> "A centralized one-stop platform for students, industries and academicians, with institutions monitoring student development and placements."

Skill Map directly implements this problem statement with a working prototype covering all four user roles.

---

## License

Prestige Build — SIH 2026
