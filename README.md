# 💰 Personal Finance Tracker

A full-stack web application that helps users manage their personal finances by tracking income, expenses, categories, budgets, and financial notifications.

The system provides users with a simple dashboard where they can monitor their financial activity and understand how their income is being spent.

## 🌐 Live Application

**Personal Finance Tracker:**

https://personal-finance-frontend-r5yg.onrender.com/register

Users can create an account, log in, and start managing their finances.

## 📌 Project Overview

Personal Finance Tracker is designed to help individuals organize and monitor their financial activities in one place.

The application allows users to:

* Create an account
* Log in securely
* Record income
* Record expenses
* Create and manage expense categories
* Create budgets
* Monitor spending
* Receive financial notifications
* View financial information through a dashboard

The application uses a React frontend, Django REST Framework backend, and PostgreSQL database.

---

# ✨ Features

## 🔐 Authentication

* User registration
* User login
* JWT authentication
* Protected pages
* Secure password handling
* Logout functionality

## 💵 Income Management

Users can:

* Add income
* View income
* Track available money
* Monitor financial activity

## 💸 Expense Management

Users can:

* Add expenses
* Select expense categories
* View transactions
* Track spending
* Monitor remaining money

## 🗂️ Category Management

Users can:

* Create categories
* View categories
* Organize expenses by category
* Manage expense classifications

## 🎯 Budget Management

Users can:

* Create budgets
* Set spending limits
* Assign budgets to categories
* Monitor spending against budget limits

## 🔔 Notifications

The system can notify users about important financial events such as budget-related conditions.

## 📊 Dashboard

The dashboard provides an overview of the user's financial activity, including:

* Income
* Expenses
* Available balance
* Budgets
* Categories
* Financial activity

---

# 🛠️ Technology Stack

## Frontend

* React
* JavaScript
* React Router
* HTML
* CSS
* Vite

## Backend

* Python
* Django
* Django REST Framework
* Django REST Framework Simple JWT
* drf-spectacular

## Database

* PostgreSQL

## Deployment

* GitHub
* Render

## Other Technologies

* CORS
* Gunicorn
* WhiteNoise
* `dj-database-url`
* `python-decouple`
* `psycopg2-binary`

---

# 🏗️ System Architecture

```text
                    USER
                     │
                     ▼
          ┌────────────────────┐
          │   React Frontend   │
          │      (Vite)        │
          └─────────┬──────────┘
                    │
                    │ REST API
                    ▼
          ┌────────────────────┐
          │   Django Backend   │
          │   Django REST API  │
          └─────────┬──────────┘
                    │
                    │
                    ▼
          ┌────────────────────┐
          │     PostgreSQL     │
          │      Database      │
          └────────────────────┘
```

---

# 📁 Project Structure

```text
personal_finance/
│
├── backend/
│   │
│   ├── config/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── wsgi.py
│   │   └── asgi.py
│   │
│   ├── accounts/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── migrations/
│   │
│   ├── finance/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── migrations/
│   │
│   ├── manage.py
│   ├── requirements.txt
│   └── ...
│
├── frontend/
│   │
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── services/
│   │   └── ...
│   │
│   ├── package.json
│   └── ...
│
└── README.md
```

---

# 🗄️ Database

The application uses PostgreSQL in production.

The main financial entities include:

```text
User
 │
 ├── Transactions
 │       │
 │       └── Category
 │
 ├── Budgets
 │       │
 │       └── Category
 │
 └── Notifications
```

### Main entities

| Entity       | Purpose                           |
| ------------ | --------------------------------- |
| User         | Stores application users          |
| Category     | Organizes expenses                |
| Transaction  | Stores income and expense records |
| Budget       | Stores spending limits            |
| Notification | Stores financial notifications    |

---

# 🔑 Authentication

The application uses JWT authentication.

Authentication flow:

```text
User
 │
 ▼
Login
 │
 ▼
Django Authentication API
 │
 ▼
JWT Access Token
 │
 ▼
Frontend stores authentication state
 │
 ▼
Protected API requests
```

Protected pages require the user to be authenticated.

---

# 🔌 API

The Django backend exposes REST API endpoints.

Main API areas include:

```text
/api/accounts/
/api/finance/
```

Examples include:

```text
POST   /api/accounts/register/
POST   /api/accounts/login/
GET    /api/accounts/profile/

GET    /api/finance/transactions/
POST   /api/finance/transactions/

GET    /api/finance/categories/
POST   /api/finance/categories/

GET    /api/finance/budgets/
POST   /api/finance/budgets/
```

The exact available endpoints can be inspected from the Django API documentation when enabled.

---

# 🚀 Installation

## 1. Clone the repository

```bash
git clone https://github.com/Betelhem-Sefiw/personal_finance_tracker.git
```

Move into the project:

```bash
cd personal_finance_tracker
```

---

# 🐍 Backend Setup

Move into the backend:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate it on Windows PowerShell:

```powershell
.\venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
python -m pip install -r requirements.txt
```

---

# ⚙️ Environment Variables

Create a `.env` file inside the backend directory.

Example:

```env
SECRET_KEY=your-secret-key
DEBUG=True

DATABASE_URL=your-database-url

CORS_ALLOWED_ORIGINS=http://localhost:5173
```

For production, use your production database URL and production frontend URL.

### Important

Never commit `.env` to GitHub.

Add it to `.gitignore`:

```text
.env
venv/
__pycache__/
*.pyc
```

---

# 🗃️ Database Migration

Run:

```bash
python manage.py makemigrations
```

Then:

```bash
python manage.py migrate
```

---

# ▶️ Run Backend

Start Django:

```bash
python manage.py runserver
```

The backend will normally be available at:

```text
http://127.0.0.1:8000/
```

---

# ⚛️ Frontend Setup

Open another terminal and move into the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173/
```

---

# 🌍 Production Deployment

The project is deployed using Render.

## Backend

Root directory:

```text
backend
```

Build command:

```bash
pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate
```

Start command:

```bash
gunicorn config.wsgi:application
```

## Frontend

The frontend is deployed separately through Render and communicates with the Django backend through the REST API.

---

# 🔐 Production Configuration

The Django backend uses:

```python
ALLOWED_HOSTS = [
    "localhost",
    "127.0.0.1",
    "personal-finance-tracker-tx13.onrender.com",
]
```

Production CORS:

```python
CORS_ALLOW_ALL_ORIGINS = False

CORS_ALLOWED_ORIGINS = [
    "https://personal-finance-frontend-r5yg.onrender.com",
]
```

---

# 🧪 Testing

Before deployment, verify:

```bash
python manage.py check
```

Expected result:

```text
System check identified no issues (0 silenced).
```

Also test:

* Registration
* Login
* Logout
* Adding income
* Adding expenses
* Categories
* Budgets
* Notifications
* Dashboard
* Protected routes

---

# 📱 Production Testing

The deployed application should be tested from:

* Desktop browser
* Mobile browser
* Incognito/private browser
* Different user accounts

This helps verify authentication, API communication, and CORS configuration.

---

# 🔄 Git Workflow

After making changes:

```bash
git add .
```

Commit:

```bash
git commit -m "Describe your changes"
```

Push:

```bash
git push origin main
```

Render can then automatically deploy the updated code.

---

# 🔒 Security

The following security practices are used:

* JWT authentication
* Password hashing through Django
* Protected API endpoints
* CORS restrictions
* Environment variables for secrets
* HTTPS in production
* PostgreSQL for production data

Never publish:

```text
SECRET_KEY
DATABASE_URL
JWT secrets
API keys
passwords
.env files
```

---

# 🚧 Future Improvements

Possible future improvements include:

* Financial charts and graphs
* Monthly financial reports
* Export transactions to CSV/PDF
* Advanced budget analytics
* Recurring transactions
* Email notifications
* Password reset
* Profile customization
* Dark mode
* Mobile application
* Financial goal tracking
* More detailed spending analytics

---

# 👩‍💻 Author

**Betelhem Sefiw**

Software Engineering Student

Personal Finance Tracker — 2026

---

# 📄 License

This project is intended for educational and personal development purposes.

A formal open-source license can be added later if the project is intended for public reuse.

---

# ⭐ Project Status

```text
Frontend:       ✅ Deployed
Backend:        ✅ Deployed
Database:       ✅ PostgreSQL
Authentication: ✅ JWT
API:            ✅ REST API
Deployment:     ✅ Render
Status:         ✅ Working
```

## 🌐 Live Project

**Register / Start using the application:**

https://personal-finance-frontend-r5yg.onrender.com/register
