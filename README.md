# Fitsync

A web app where users join fitness challenges, track progress, and compete with friends in real time.

## 🏆 Overview

Fitsync is a social fitness challenge platform that brings friends and gym communities together through gamified fitness competitions. Users can create challenges, log workouts, track progress with real-time leaderboards, and compete for points and streaks.

### Key Features

- **Real-time Leaderboards**: Live updates via WebSockets showing current rankings
- **Gamified Progress Tracking**: Points system, streaks, and achievement badges
- **Social Challenges**: Create and join fitness challenges with friends
- **Workout Logging**: Track various workout types and progress
- **Responsive Design**: Beautiful UI that works on all devices

## 🛠️ Tech Stack

### Frontend
- **Next.js** - React framework for server-side rendering and routing
- **TailwindCSS** - Utility-first CSS framework for styling

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web application framework
- **Socket.io** - Real-time bidirectional communication

### Database & Authentication
- **PostgreSQL** - Relational database (hosted on Supabase)
- **Supabase Auth** - Authentication and user management

### Deployment
- **Vercel** - Frontend deployment
- **Render** - Backend deployment

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL database (Supabase account)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/fitsync.git
   cd fitsync
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   cd frontend
   npm install

   # Install backend dependencies
   cd ../backend
   npm install
   ```

3. **Environment Setup**
   
   Create `.env.local` in the frontend directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```

   Create `.env` in the backend directory:
   ```env
   DATABASE_URL=your_postgresql_connection_string
   JWT_SECRET=your_jwt_secret
   CORS_ORIGIN=http://localhost:3000
   ```

4. **Database Setup**
   - Set up a PostgreSQL database on Supabase
   - Run the database migrations (see `/backend/migrations`)

5. **Start the development servers**
   ```bash
   # Start backend server
   cd backend
   npm run dev

   # Start frontend server (in a new terminal)
   cd frontend
   npm run dev
   ```

6. **Open your browser**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📋 Implementation Roadmap

### Week 1: Foundation
- [x] Set up full-stack app (Next.js + Node.js + PostgreSQL)
- [x] Implement user authentication and profile management
- [x] CRUD operations for challenges and joining/leaving challenges
- [x] Basic workout logging per user

### Week 2: Advanced Features
- [x] Integrate real-time leaderboard via WebSockets
- [x] Implement gamification (points, streaks, badges)
- [x] Build challenge dashboard with charts/leaderboard
- [x] Deploy MVP and test multi-user challenge participation
- [x] Polish UI and add responsive design

## 🎯 Use Cases

- **Friend Groups**: Create fitness challenges among friends to stay motivated
- **Gym Communities**: Organize competitions within gym communities
- **Workplace Wellness**: Company fitness challenges for employee engagement
- **Fitness Classes**: Track progress and compete with classmates

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Challenges
- `GET /api/challenges` - List all challenges
- `POST /api/challenges` - Create new challenge
- `GET /api/challenges/:id` - Get challenge details
- `POST /api/challenges/:id/join` - Join a challenge
- `DELETE /api/challenges/:id/leave` - Leave a challenge

### Workouts
- `POST /api/workouts` - Log a workout
- `GET /api/workouts` - Get user workouts
- `GET /api/workouts/challenge/:id` - Get challenge workouts

### Leaderboard
- `GET /api/leaderboard/:challengeId` - Get challenge leaderboard
- WebSocket: `leaderboard-update` - Real-time leaderboard updates

## 🏗️ Project Structure

```
fitsync/
├── frontend/                 # Next.js frontend application
│   ├── components/          # React components
│   ├── pages/              # Next.js pages
│   ├── styles/             # TailwindCSS styles
│   └── utils/              # Utility functions
├── backend/                 # Node.js backend application
│   ├── controllers/        # Route controllers
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   └── socket/             # WebSocket handlers
└── docs/                   # Documentation
```

## 🚀 Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Backend (Render)
1. Connect your GitHub repository to Render
2. Set environment variables in Render dashboard
3. Configure build command: `npm install && npm run build`
4. Set start command: `npm start`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Developer**: [Your Name]
- **Project**: Social Fitness Challenge Platform

## 📊 Resume Highlights

- Built a multi-user fitness challenge platform with real-time leaderboards and gamified progress tracking
- Implemented WebSocket-based real-time updates to display live user rankings and streaks
- Deployed full-stack MVP using Next.js, Node.js, PostgreSQL, and Supabase auth

## 🔗 Links

- [Live Demo](https://fitsync.vercel.app)
- [API Documentation](https://fitsync-api.onrender.com/docs)
- [Issue Tracker](https://github.com/yourusername/fitsync/issues)

---

Made with ❤️ for the fitness community
