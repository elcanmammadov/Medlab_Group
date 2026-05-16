# Medlab Medical Group - Backend API

Complete backend system for the Medlab Medical Group healthcare corporate website.

## Tech Stack

- **Node.js** (Express.js)
- **MongoDB** (Mongoose)
- **JWT Authentication**
- **REST API**
- **Admin Panel**

## Project Structure

```
/server
├── /admin              # Admin panel frontend
│   └── index.html      # Dashboard UI
├── /config             # Configuration
│   └── db.js           # MongoDB connection
├── /controllers        # Route controllers
│   ├── authController.js
│   ├── companyController.js
│   ├── branchController.js
│   ├── leadershipController.js
│   ├── mediaController.js
│   └── contactController.js
├── /middleware         # Custom middleware
│   ├── auth.js         # JWT authentication
│   ├── errorHandler.js # Error handling
│   └── upload.js       # File upload (multer)
├── /models             # Mongoose models
│   ├── Admin.js
│   ├── Company.js
│   ├── Branch.js
│   ├── Leadership.js
│   ├── Media.js
│   └── Contact.js
├── /routes             # API routes
│   ├── auth.js
│   ├── companies.js
│   ├── branches.js
│   ├── leadership.js
│   ├── media.js
│   └── contact.js
├── /uploads            # Uploaded files
├── .env                # Environment variables
├── server.js           # Entry point
└── seed.js             # Database seeder
```

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   
   Edit `.env` file:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/medlab-medical
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   JWT_EXPIRE=7d
   NODE_ENV=development
   ```

3. **Seed the database (creates admin user + sample data):**
   ```bash
   npm run seed
   ```

4. **Start the server:**
   ```bash
   # Development mode with auto-restart
   npm run dev

   # Production mode
   npm start
   ```

## Default Admin Credentials

After seeding:
- **Email:** admin@medlab.az
- **Password:** admin123

## API Endpoints

### Authentication
```
POST   /api/auth/login          - Admin login
GET    /api/auth/me             - Get current admin (Protected)
```

### Companies
```
GET    /api/companies           - Get all companies
GET    /api/companies/:id       - Get single company
POST   /api/companies           - Create company (Protected)
PUT    /api/companies/:id       - Update company (Protected)
DELETE /api/companies/:id       - Delete company (Protected)
```

### Branches
```
GET    /api/branches            - Get all branches
GET    /api/branches/:id        - Get single branch
GET    /api/branches?company=X  - Filter by company
GET    /api/branches?search=X   - Search branches
POST   /api/branches            - Create branch (Protected)
PUT    /api/branches/:id        - Update branch (Protected)
DELETE /api/branches/:id        - Delete branch (Protected)
```

### Leadership
```
GET    /api/leadership          - Get all leaders
GET    /api/leadership/:id      - Get single leader
POST   /api/leadership          - Create leader (Protected)
PUT    /api/leadership/:id      - Update leader (Protected)
DELETE /api/leadership/:id      - Delete leader (Protected)
```

### Media
```
GET    /api/media               - Get all media (with pagination)
GET    /api/media?page=1&limit=10 - Paginated results
GET    /api/media?search=X      - Search media
GET    /api/media/:id           - Get single media
POST   /api/media               - Create media (Protected)
PUT    /api/media/:id           - Update media (Protected)
DELETE /api/media/:id           - Delete media (Protected)
```

### Contact
```
POST   /api/contact             - Submit contact form (Public)
GET    /api/contact             - Get all messages (Protected)
GET    /api/contact/:id         - Get single message (Protected)
DELETE /api/contact/:id         - Delete message (Protected)
```

### File Upload
```
All POST/PUT endpoints accept file uploads:
- Companies: logo (single file)
- Branches: images (multiple, max 5)
- Leadership: photo (single file)
- Media: image (single file)

Supported formats: jpeg, jpg, png, gif, webp
Max file size: 5MB
```

## Authentication

Protected routes require JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

Get token by logging in via `POST /api/auth/login`

## Admin Panel

Access the admin dashboard at:
```
http://localhost:5000/admin
```

Features:
- Login/Logout
- Dashboard with statistics
- CRUD operations for all modules
- File upload support
- Responsive design

## Multilingual Support

All content models support three languages:
- **AZ** - Azerbaijani
- **RU** - Russian
- **EN** - English

Fields like `name`, `description`, `title`, `content`, `position`, `bio`, and `address` are stored as objects with language keys.

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input validation
- File type validation for uploads
- File size limits (5MB)
- CORS enabled
- Error handling middleware

## Extra Features

- **Pagination:** Media endpoint supports `page` and `limit` query params
- **Search:** Branches and Media support text search
- **Filter:** Branches can be filtered by company ID
- **Auto-timestamps:** All models track createdAt and updatedAt

## Production Checklist

- [ ] Change `JWT_SECRET` in `.env`
- [ ] Set `NODE_ENV=production`
- [ ] Use MongoDB Atlas or production database
- [ ] Enable HTTPS
- [ ] Set up rate limiting
- [ ] Add logging service
- [ ] Configure CORS origins
- [ ] Set up backup strategy
- [ ] Monitor with error tracking

## License

ISC
