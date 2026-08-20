# SIH 2026 Team Finder 🚀

The **Smart India Hackathon (SIH) 2026 Team Finder** is a centralized platform designed to connect ambitious college students looking to build teams or find available spots for SIH 2026. 

By eliminating the chaotic WhatsApp groups and scattered spreadsheets, this platform provides a clean, premium, and private way to discover and recruit the missing members for your dream hackathon team.

## ✨ Features

- **Dynamic Theme Adapting**: Built with a stunning modern UI featuring seamless Light & Dark modes, glassmorphism, and responsive design.
- **Privacy First**: Phone numbers are kept strictly hidden until a Team Leader explicitly accepts a Seeker's join request.
- **Create Your Team**: Post your project idea, problem statement, required skills, and seat availability to immediately start receiving requests.
- **Join as a Seeker**: Students without teams can post a robust seeker profile listing their skills, department, and bio for leaders to discover them.
- **Approval System**: A built-in dashboard for Team Leaders to review incoming requests and accept or reject candidates.

## 🛠 Tech Stack

- **Frontend**: React, Vite
- **Styling**: Vanilla CSS (CSS Variables, Flexbox, CSS Grid)
- **Database & Auth**: Supabase (PostgreSQL)
- **Security**: PostgreSQL Row Level Security (RLS) policies

## 🚀 Getting Started

### 1. Prerequisites
Make sure you have Node.js and npm installed on your machine.

### 2. Installation
Clone the repository and install dependencies:
```bash
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the root of the project and add your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Running the Development Server
Start the Vite development server:
```bash
npm run dev
```

### 5. Supabase Setup
The database schema and strict Row Level Security (RLS) policies are defined in the `supabase/migrations/` folder. Apply them directly in your Supabase SQL editor or run `npx supabase db push` if you have linked your project locally.

## 🎨 UI/UX Design

The application uses a highly customized, robust CSS system rooted in `src/index.css`. The design leverages CSS variables (`--bg`, `--surface`, `--accent`) to effortlessly switch themes and ensure contrast standards across mobile and desktop.

## 📄 License
This project was built for the Smart India Hackathon and is tailored to the internal use of Suryodaya College of Engineering & Technology.
