# GigConnect — Freelance Marketplace Backend

A backend REST API for a freelance marketplace where clients can post jobs and freelancers can create gigs, apply for jobs, and communicate with clients.

## Project Overview

GigConnect is built using Node.js, Express.js, and MongoDB. It provides authentication, gig management, job management, job applications, search, and real-time messaging.

### Main Features

- User registration and login
- JWT authentication
- Firebase Authentication integration
- Role-based access: Client / Freelancer
- Freelancer gig management
- Client job posting
- Job applications
- Gig search
- Real-time messaging using Socket.IO
- MongoDB database
- API validation middleware
- Render deployment

## Technologies Used

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT
- bcryptjs
- Firebase Admin SDK
- Socket.IO
- Multer
- Thunder Client
- Render
- GitHub

## Project Structure

```text
BackendFinalProject/
│
├── server.js
├── routes.js
├── models.js
├── middleware.js
├── package.json
├── package-lock.json
└── .gitignore
```

### server.js

Handles:

- Express server
- MongoDB connection
- CORS
- Socket.IO
- Server startup

### routes.js

Contains API routes for:

- Authentication
- Gigs
- Jobs
- Messages
- Search

### models.js

Contains Mongoose models:

- User
- Gig
- Job
- Message

### middleware.js

Contains:

- JWT authentication
- Validation
- Role authorization
- Logger
- Multer
- Firebase Admin configuration

## Authentication

GigConnect uses JWT authentication.

After successful login, the server returns a JWT token.

Protected requests use:

```text
Authorization: Bearer <token>
```

Passwords are hashed using bcrypt before being stored.

Firebase Authentication is also integrated for Firebase-based authentication.

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/firebase` | Firebase authentication |

### Gigs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/gigs` | Get all gigs |
| GET | `/api/gigs/:id` | Get one gig |
| POST | `/api/gigs` | Create gig |
| PUT | `/api/gigs/:id` | Update gig |
| DELETE | `/api/gigs/:id` | Delete gig |
| GET | `/api/gigs/search?keyword=logo-design` | Search gigs |

### Jobs

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/jobs` | Create job |
| GET | `/api/jobs` | Get jobs |
| POST | `/api/jobs/:id/apply` | Apply for a job |

### Messages

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/messages` | Send message |
| GET | `/api/messages/:conversationId` | Get conversation |

## Database

MongoDB Atlas stores the main application data.

### Collections

```text
users
gigs
jobs
messages
```

Firebase is used for authentication integration, while MongoDB is the main application database.

## Real-Time Messaging

Socket.IO is used for real-time messaging.

Message flow:

```text
User
  ↓
POST /api/messages
  ↓
MongoDB
  ↓
Socket.IO
  ↓
Conversation Room
  ↓
Other User
```

The `newMessage` event allows messages to be delivered in real time.

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/vedpatil1208-art/BackendFinalProject.git
```

### 2. Enter the project

```bash
cd BackendFinalProject
```

### 3. Install dependencies

```bash
npm install
```

### 4. Create `.env`

```env
PORT=4000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
FIREBASE_SERVICE_ACCOUNT=your_firebase_service_account_json
```

Never upload `.env` or `serviceAccountKey.json` to GitHub.

### 5. Start the server

```bash
node server.js
```

The server runs on:

```text
http://localhost:4000
```

## Live Deployment

The backend is deployed on Render.

Live API:

https://backendfinalproject-3-lhoo.onrender.com

Example:

```text
GET /api/gigs
```

Full URL:

```text
https://backendfinalproject-3-lhoo.onrender.com/api/gigs
```

## Testing

The backend was tested using Thunder Client.

Tested functionality includes:

- Registration — `201 Created`
- Login — `200 OK`
- Create Gig — `201 Created`
- Get Gigs — `200 OK`
- Search Gigs — `200 OK`
- Get Single Gig — `200 OK`
- Update Gig — `200 OK`
- Delete Gig — `200 OK`
- Create Job — `201 Created`
- Get Jobs — `200 OK`
- Apply for Job
- Send Message — `201 Created`
- Get Messages — `200 OK`

## Security

- Passwords are hashed using bcrypt.
- JWT protects private routes.
- Role-based authorization prevents unauthorized operations.
- Firebase Admin verifies Firebase ID tokens.
- Environment variables are used for sensitive credentials.
- `.env` and Firebase service-account credentials are excluded from Git.

## Author

**Ved Patil**

B.Tech Computer Science Engineering  
ITM Skills University  
Cohort: Larry Page


## Project Status

**Completed and Deployed**

The GigConnect backend has been tested locally and on the deployed Render server.
