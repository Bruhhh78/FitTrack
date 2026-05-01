# 🏋️ FitTrack - Weight Loss Management App

A comprehensive full-stack weight loss management application with batch-based programs, daily meal tracking, body measurements, streak management, and Razorpay payment integration.

## 🚀 Features

### User Features
- **Google & JWT Authentication** - Secure login with Google OAuth or email/password
- **Browse & Purchase Batches** - Weight loss programs with Razorpay checkout
- **Body Measurements** - Track Face, Neck, Chest, Arms, Belly, Hips, Thighs
- **Photo Progress** - Upload left, right, and center body photos via Cloudinary
- **Meal Tracking** - Log breakfast, lunch, dinner with photo uploads
- **Streak Management** - Daily consistency tracking with challenge-based streaks
- **Program Content** - Access PDFs, diet plans, exercise plans, meeting links

### Admin Features
- **Batch Management** - Create 3-month or 21-day programs
- **Challenge System** - Create 7-day challenges within batches
- **Enrollment Monitoring** - View enrolled users per batch
- **User Progress** - View user uploaded images and measurements

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| Frontend | React 18 + Vite |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Auth | Google OAuth 2.0 + JWT |
| Payments | Razorpay |
| Images | Cloudinary |
| Styling | CSS (Teal Green Theme + Dark Mode) |

## 📦 Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Cloudinary Account
- Razorpay Account
- Google Cloud Console (OAuth credentials)

### 1. Clone & Install

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Environment Variables

Copy `.env.example` to `server/.env` and fill in your credentials:

```bash
cp .env.example server/.env
```

### 3. Run the App

```bash
# Terminal 1 - Start server
cd server
npm run dev

# Terminal 2 - Start client
cd client
npm run dev
```

### 4. Access
- **Client**: http://localhost:5173
- **Server**: http://localhost:5000

## 📁 Project Structure

```
weight-loss-app/
├── client/                  # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # Auth & Theme context
│   │   ├── pages/           # Page components
│   │   │   └── admin/       # Admin pages
│   │   ├── utils/           # API helpers
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── server/                  # Node.js Backend
│   ├── config/              # DB, Cloudinary, Passport config
│   ├── controllers/         # Route handlers
│   ├── middleware/           # Auth & upload middleware
│   ├── models/              # Mongoose models
│   ├── routes/              # Express routes
│   ├── server.js
│   └── package.json
├── .env.example
└── README.md
```

## 🎨 Theme
- **Primary Color**: Teal Green (#0D9488)
- **Dark Mode**: Full dark mode support with system preference detection

## 📄 License
MIT
