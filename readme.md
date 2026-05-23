# Project name
 DevPulse API

 # Project overview 
 A RESTful Issue Tracking API built with Express.js, TypeScript, and PostgreSQL.  
This system allows contributors and maintainers to create, manage, update, and track software issues efficiently.


## Live URL

https://assignment-2-sigma-nine.vercel.app


## Features

- User Authentication with JWT
- Role-based Authorization
- Create / Update / Delete Issues
- Public Issue Listing with Filtering & Sorting
- PostgreSQL Database Integration
- TypeScript Support
- Reusable Middleware & Response Handler


## Tech Stack

- Node.js
- Express.js
- TypeScript
- PostgreSQL
- JWT
- bcrypt
- tsup
- Vercel



## Setup Instructions

### 1. Clone the repository
git clone <repo-link>

### 2 install dependency 
npm i 
### 3 create .env file 
PORT=5000
DB_STRING=your_database_url
ACCESS_TOKEN_KEY=your_secret

### Run development server
npm run dev






---

# API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/signup | Register User |
| POST | /api/auth/login | Login User |
| POST | /api/issues | Create Issue |
| GET | /api/issues | Get All Issues |
| GET | /api/issues/:id | Get Single Issue |
| PATCH | /api/issues/:id | Update Issue |
| DELETE | /api/issues/:id | Delete Issue |




## Database Schema

### Users Table

- id
- name
- email
- password
- role
- created_at
-updated_at

### Issues Table

- id
- title
- description
- type
- status
- reporter_id
- created_at
- updated_at


## Author
Mehad Hossen