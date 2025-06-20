# Personal Tracker

## What does this app do?
Personal Tracker is a full-stack web application for tracking expenses, budgets, and generating smart financial reports and suggestions. It features:
- User authentication
- Expense and budget management
- Dashboard with charts
- Monthly reports (powered by a Python microservice)
- Smart suggestions (Python AI)

## How to run the app

### 1. Backend (Node.js/Express)
- Go to the `backend` folder:
  ```sh
  cd backend
  ```
- Install dependencies:
  ```sh
  npm install
  ```
- Copy `.env.example` to `.env` and fill in your secrets:
  ```sh
  cp .env.example .env
  # or manually create .env
  ```
- Start the backend:
  ```sh
  npm run dev
  # or
  npm start
  ```

### 2. Python Service (Flask)
- Go to the `python-service` folder:
  ```sh
  cd python-service
  ```
- (Recommended) Create and activate a virtual environment:
  ```sh
  python -m venv venv
  source venv/bin/activate  # On Windows: venv\Scripts\activate
  ```
- Install dependencies:
  ```sh
  pip install -r requirements.txt
  ```
- Start the Python service:
  ```sh
  python app.py
  ```

### 3. Frontend (React + Vite)
- Go to the `frontend2` folder:
  ```sh
  cd frontend2
  ```
- Install dependencies:
  ```sh
  npm install
  ```
- Start the frontend:
  ```sh
  npm run dev
  ```
- The app will be available at `http://localhost:5173` by default.

## Test Login Credentials
- Email: `user1@example.com`  Password: `password123`
- Email: `user2@example.com`  Password: `password456`
- Email: `admin@example.com`  Password: `adminpass`

## Live Deployed Site
- [Add your deployed site link here]

## Extra Features
- Python microservice for AI-powered suggestions and report generation
- Modern React frontend with protected routes
- MongoDB and PostgreSQL integration

## Environment Variables
- See `.env.example` in each service folder for required environment variables.
- **Never commit your real secrets!** 