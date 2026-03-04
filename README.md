# Zelan Bakery & Cake Backend

A RESTful API backend for Zelan Bakery & Cake, featuring menu management, categories, specials, FAQs, and voice description support.

## Features

- **Authentication** - JWT-based authentication with token refresh
- **Menu Management** - Full CRUD for menu items with image and voice file uploads
- **Categories** - Organize menu items by categories
- **Specials** - Manage promotional offers and specials
- **FAQs** - Frequently asked questions management
- **Voice Support** - Upload voice descriptions for menu items (accessibility feature)
- **File Uploads** - Support for images and audio files

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MySQL
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcryptjs
- **File Upload:** Multer
- **Environment:** dotenv

## Prerequisites

- Node.js (v16 or higher)
- MySQL Server (v5.7 or higher)
- npm or yarn

## Project Structure

```
backend/
├── config/
│   ├── database.js      # Database connection pool
│   └── upload.js        # Multer file upload configuration
├── controllers/
│   ├── authController.js
│   ├── categoriesController.js
│   ├── faqsController.js
│   ├── menuItemsController.js
│   └── specialsController.js
├── database/
│   └── schema.sql       # Database schema and seed data
├── middleware/
│   └── auth.js          # Authentication middleware
├── routes/
│   └── api.js           # API route definitions
├── scripts/
│   └── setup-admin.js   # Admin user setup script
├── uploads/
│   ├── images/          # Uploaded images
│   └── voice/           # Uploaded voice files
├── .env                 # Environment variables (not in git)
├── .env.example         # Environment template
├── package.json
└── server.js            # Application entry point
```

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd restaurant-app/backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example environment file and update the values:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=zelan_bakery_db

# Server Configuration
PORT=3000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Upload Configuration
MAX_FILE_SIZE=10485760

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
```

### 4. Set up the database

Create the database and tables by running the schema file:

```bash
mysql -u root -p < database/schema.sql
```

Or import via MySQL Workbench or phpMyAdmin.

### 5. Set up admin user (optional)

The schema includes a default admin user, or run:

```bash
npm run setup-admin
```

### 6. Start the server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start at `http://localhost:3000`

## API Documentation

See [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for complete API reference.

### Quick Reference

| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `/api/auth/login` | POST | User login | No |
| `/api/auth/verify` | GET | Verify token | No |
| `/api/auth/refresh` | POST | Refresh token | No |
| `/api/auth/change-password` | POST | Change password | Yes |
| `/api/categories` | GET | List categories | No |
| `/api/categories/:id` | GET | Get category | No |
| `/api/categories` | POST | Create category | Yes |
| `/api/categories/:id` | PUT | Update category | Yes |
| `/api/categories/:id` | DELETE | Delete category | Yes |
| `/api/menu` | GET | List menu items | No |
| `/api/menu/by-category` | GET | Menu grouped by category | No |
| `/api/menu/:id` | GET | Get menu item | No |
| `/api/menu` | POST | Create menu item | Yes |
| `/api/menu/:id` | PUT | Update menu item | Yes |
| `/api/menu/:id` | DELETE | Delete menu item | Yes |
| `/api/menu/:id/voice` | POST | Upload voice file | Yes |
| `/api/specials` | GET | List specials | No |
| `/api/specials/:id` | GET | Get special | No |
| `/api/specials` | POST | Create special | Yes |
| `/api/specials/:id` | PUT | Update special | Yes |
| `/api/specials/:id` | DELETE | Delete special | Yes |
| `/api/faqs` | GET | List FAQs | No |
| `/api/faqs/:id` | GET | Get FAQ | No |
| `/api/faqs` | POST | Create FAQ | Yes |
| `/api/faqs/:id` | PUT | Update FAQ | Yes |
| `/api/faqs/:id` | DELETE | Delete FAQ | Yes |
| `/api/stats` | GET | Dashboard stats | Yes |
| `/health` | GET | Health check | No |

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | MySQL host | `localhost` |
| `DB_PORT` | MySQL port | `3306` |
| `DB_USER` | MySQL username | `root` |
| `DB_PASSWORD` | MySQL password | `` |
| `DB_NAME` | Database name | `restaurant_db` |
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment mode | `development` |
| `FRONTEND_URL` | Frontend URL for CORS | `*` |
| `MAX_FILE_SIZE` | Max upload size (bytes) | `10485760` (10MB) |
| `JWT_SECRET` | JWT signing secret | (required in production) |
| `JWT_EXPIRES_IN` | JWT expiration time | `7d` |

## Default Credentials

```
Username: admin
Password: admin123
```

**Important:** Change the default password after first login!

## File Upload Limits

- **Max file size:** 10MB (configurable)
- **Allowed image types:** JPG, PNG, GIF, WebP
- **Allowed audio types:** MP3, WAV, OGG, WebM, AAC, M4A

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start server in production mode |
| `npm run dev` | Start server with nodemon (auto-reload) |
| `npm run setup-admin` | Set up or reset admin user |

## Error Handling

All errors return a standard JSON response:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (development only)"
}
```

## Health Check

Check if the server is running:

```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## License

Private - Zelan Bakery & Cake
