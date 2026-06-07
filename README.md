    # 🥗 CalTrack AI

CalTrack AI is a full-stack AI-powered nutrition tracking platform that helps users log meals effortlessly using natural language. Instead of manually searching for foods and entering macros, users can simply describe what they ate, and the AI automatically extracts food items, estimates nutritional values, and updates daily calorie and macro goals.

Built with React, TypeScript, Node.js, MongoDB, and AI-powered food analysis, CalTrack provides a modern and intuitive approach to health and nutrition tracking.

---

### 🚀 Features

### 🤖 AI Meal Logging

Simply type what you ate:

> "2 eggs, 3 rotis and a bowl of dal"

The AI will:

* Identify food items
* Estimate serving sizes
* Calculate calories
* Calculate protein, carbs, and fats
* Automatically add entries to your food log

---

### 📊 Nutrition Dashboard

Track your daily progress through a clean and modern dashboard.

Features include:

* Daily calorie tracking
* Protein tracking
* Carbohydrate tracking
* Fat tracking
* Personalized nutrition targets
* Meal-wise breakdowns

---

### 📈 Progress Analytics

Monitor your nutrition journey with:

* Daily consumption history
* Calorie trends
* Macro distribution
* Goal completion percentages
* Historical food logs

---

### 🍛 Indian Food Optimized

The application includes support for common Indian foods and meal patterns, allowing more accurate calorie estimation compared to generic nutrition trackers.

Examples:

* Roti
* Dal
* Paneer dishes
* Rice-based meals
* Indian breakfast items
* Traditional home-cooked foods

---

### 👤 User Authentication

Secure account management with:

* User registration
* Login system
* JWT authentication
* Protected routes
* Personalized nutrition profiles

---

### ⚙️ Personalized Goals

Users can configure:

* Daily calorie targets
* Protein goals
* Carb goals
* Fat goals
* Weight information

The dashboard automatically adjusts progress calculations based on user-specific targets.

---

## 🏗️ Tech Stack

### Frontend

* React 19
* TypeScript
* Vite
* Tailwind CSS
* React Router
* Axios
* Radix UI
* Lucide React

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication

### AI & Nutrition Engine

* Google Gemini API
* OpenAI SDK
* Groq SDK
* Custom food estimation service
* Nutrition calculation engine

---

## 📂 Project Structure

```bash
calorie-main/
│
├── client/
│   └── front/
│       ├── src/
│       │   ├── pages/
│       │   ├── components/
│       │   ├── context/
│       │   └── utils/
│
├── server/
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── services/
│   ├── middleware/
│   └── config/
│
└── README.md
```

---

## 🔥 Core Pages

### Landing Page

Modern marketing page introducing CalTrack AI and its capabilities.

### Dashboard

Central hub for:

* Daily calorie tracking
* Macro tracking
* AI meal logging
* Progress monitoring

### Progress Page

Visualizes nutrition goals and long-term progress.

### Meal History

Browse and manage previously logged meals.

### Authentication

Secure login and registration experience.

---

## 🛠️ Installation

### Clone Repository

```bash
git clone https://github.com/Vedantt56/calorie.git
cd calorie
```

### Frontend Setup

```bash
cd client/front
npm install
npm run dev
```

### Backend Setup

```bash
cd server
npm install
npm start
```

### Environment Variables

Create a `.env` file inside the server directory:

```env
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_api_key
OPENAI_API_KEY=your_api_key
GROQ_API_KEY=your_api_key
```

---

## 🎯 Why CalTrack AI?

Most calorie tracking apps require tedious manual entry and food searches. CalTrack AI removes that friction by allowing users to log meals naturally while leveraging AI to perform nutrition analysis automatically.

The result is a faster, smarter, and more user-friendly nutrition tracking experience.

---

## 👨‍💻 Author

### Vedant Vaibhav

Built as a full-stack AI project focused on simplifying nutrition tracking through natural language processing and intelligent food estimation.

If you found this project useful, consider giving it a ⭐ on GitHub.
