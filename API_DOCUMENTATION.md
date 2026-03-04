# Zelan Bakery & Cake API Documentation

**Base URL:** `/api`

**Version:** 1.0.0

---

## Table of Contents

1. [Authentication](#authentication)
2. [Categories](#categories)
3. [Menu Items](#menu-items)
4. [Specials](#specials)
5. [FAQs](#faqs)
6. [Statistics](#statistics)

---

## Response Format

All API responses follow this standard format:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

---

## Authentication

Authentication uses JWT (JSON Web Token). Protected endpoints require the `Authorization` header:

```
Authorization: Bearer <token>
```

### POST /api/auth/login

Login to obtain access token.

**Access:** Public

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| username | string | Yes | User's username |
| password | string | Yes | User's password |

**Example Request:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "admin",
      "name": "Administrator",
      "role": "admin"
    }
  }
}
```

**Error Responses:**
- `400` - Username and password are required
- `401` - Invalid username or password

---

### GET /api/auth/verify

Verify if a token is valid.

**Access:** Public

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "admin",
      "name": "Administrator",
      "role": "admin"
    }
  }
}
```

**Error Responses:**
- `401` - No token provided / Invalid token / Token expired / User not found or inactive

---

### POST /api/auth/refresh

Refresh an expired token (within 30 days).

**Access:** Public

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "admin",
      "name": "Administrator",
      "role": "admin"
    }
  }
}
```

**Error Responses:**
- `401` - No token provided / Token too old, please login again / User not found or inactive

---

### POST /api/auth/change-password

Change the authenticated user's password.

**Access:** Protected (requires authentication)

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| currentPassword | string | Yes | Current password |
| newPassword | string | Yes | New password (min 6 characters) |

**Example Request:**
```json
{
  "currentPassword": "admin123",
  "newPassword": "newSecurePassword"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Error Responses:**
- `400` - Current password and new password are required / New password must be at least 6 characters
- `401` - Current password is incorrect
- `404` - User not found

---

## Categories

### GET /api/categories

Get all active categories.

**Access:** Public

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Bakery",
      "slug": "bakery",
      "description": "Roti dan kue fresh setiap hari",
      "display_order": 1,
      "is_active": true,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### GET /api/categories/:id

Get a single category by ID.

**Access:** Public

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | integer | Category ID |

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Bakery",
    "slug": "bakery",
    "description": "Roti dan kue fresh setiap hari",
    "display_order": 1,
    "is_active": true,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `404` - Category not found

---

### POST /api/categories

Create a new category.

**Access:** Protected

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Category name (unique) |
| description | string | No | Category description |
| display_order | integer | No | Display order (default: 0) |

**Example Request:**
```json
{
  "name": "Cakes",
  "description": "Kue ulang tahun dan kue spesial",
  "display_order": 4
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Category created successfully",
  "data": {
    "id": 4,
    "name": "Cakes",
    "slug": "cakes",
    "description": "Kue ulang tahun dan kue spesial",
    "display_order": 4,
    "is_active": true,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `400` - Category name is required / Category with this name already exists

---

### PUT /api/categories/:id

Update an existing category.

**Access:** Protected

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | integer | Category ID |

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | No | Category name |
| description | string | No | Category description |
| display_order | integer | No | Display order |
| is_active | boolean | No | Active status |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Category updated successfully",
  "data": { ... }
}
```

**Error Responses:**
- `400` - No fields to update
- `404` - Category not found

---

### DELETE /api/categories/:id

Delete a category.

**Access:** Protected

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | integer | Category ID |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Category deleted successfully"
}
```

**Error Responses:**
- `400` - Cannot delete category with existing menu items
- `404` - Category not found

---

## Menu Items

### GET /api/menu

Get all menu items with optional filters.

**Access:** Public

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| category | string/integer | Filter by category ID or slug |
| featured | string | Filter featured items (`true`) |
| available | string | Include unavailable items (`false`) |
| search | string | Search in name and description |

**Example Request:**
```
GET /api/menu?category=bakery&featured=true
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "category_id": 1,
      "name": "Brownies",
      "slug": "brownies",
      "description": "Brownies cokelat premium yang fudgy dan rich.",
      "voice_description": "Brownies. Brownies cokelat premium...",
      "voice_file": "uploads/voice/brownies.mp3",
      "image_url": "uploads/images/brownies.jpg",
      "price": "40000.00",
      "price_display": "40K",
      "tag": "Best Seller",
      "is_featured": true,
      "is_available": true,
      "display_order": 3,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z",
      "category_name": "Bakery",
      "category_slug": "bakery"
    }
  ]
}
```

---

### GET /api/menu/by-category

Get all menu items grouped by category.

**Access:** Public

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Bakery",
      "slug": "bakery",
      "description": "Roti dan kue fresh setiap hari",
      "display_order": 1,
      "is_active": true,
      "items": [
        {
          "id": 1,
          "name": "Brownies",
          ...
        }
      ]
    }
  ]
}
```

---

### GET /api/menu/:id

Get a single menu item by ID.

**Access:** Public

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | integer | Menu item ID |

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "category_id": 1,
    "name": "Brownies",
    "slug": "brownies",
    ...
    "category_name": "Bakery",
    "category_slug": "bakery"
  }
}
```

**Error Responses:**
- `404` - Menu item not found

---

### POST /api/menu

Create a new menu item.

**Access:** Protected

**Content-Type:** `multipart/form-data`

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| category_id | integer | Yes | Category ID |
| name | string | Yes | Item name (unique) |
| description | string | Yes | Item description |
| price | decimal | Yes | Item price |
| voice_description | string | No | Voice description text |
| voice_file | file | No | Voice audio file |
| image_file | file | No | Image file |
| image_url | string | No | Image URL (if not uploading file) |
| price_display | string | No | Display price (e.g., "40K") |
| tag | string | No | Tag (e.g., "Best Seller") |
| is_featured | boolean | No | Featured status (default: false) |
| is_available | boolean | No | Availability status (default: true) |
| display_order | integer | No | Display order (default: 0) |

**Success Response (201):**
```json
{
  "success": true,
  "message": "Menu item created successfully",
  "data": { ... }
}
```

**Error Responses:**
- `400` - Category, name, description, and price are required / Menu item with this name already exists

---

### PUT /api/menu/:id

Update an existing menu item.

**Access:** Protected

**Content-Type:** `multipart/form-data`

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | integer | Menu item ID |

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| category_id | integer | No | Category ID |
| name | string | No | Item name |
| description | string | No | Item description |
| price | decimal | No | Item price |
| voice_description | string | No | Voice description text |
| voice_file | file | No | New voice audio file |
| image_file | file | No | New image file |
| image_url | string | No | New image URL |
| price_display | string | No | Display price |
| tag | string | No | Tag |
| is_featured | boolean | No | Featured status |
| is_available | boolean | No | Availability status |
| display_order | integer | No | Display order |
| remove_voice_file | string | No | Set to "true" to remove voice file |
| remove_image_file | string | No | Set to "true" to remove image |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Menu item updated successfully",
  "data": { ... }
}
```

**Error Responses:**
- `404` - Menu item not found

---

### DELETE /api/menu/:id

Delete a menu item.

**Access:** Protected

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | integer | Menu item ID |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Menu item deleted successfully"
}
```

**Error Responses:**
- `404` - Menu item not found

---

### POST /api/menu/:id/voice

Upload voice file for an existing menu item.

**Access:** Protected

**Content-Type:** `multipart/form-data`

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | integer | Menu item ID |

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| voice_file | file | Yes | Voice audio file |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Voice file uploaded successfully",
  "data": { ... }
}
```

**Error Responses:**
- `400` - No voice file uploaded
- `404` - Menu item not found

---

## Specials

### GET /api/specials

Get all active specials.

**Access:** Public

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| active | string | Set to "false" to include inactive specials |

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Promo Hampers",
      "description": "Paket hampers spesial untuk hari raya...",
      "time_period": "Sepanjang Tahun",
      "icon": "gift",
      "is_active": true,
      "display_order": 1,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### GET /api/specials/:id

Get a single special by ID.

**Access:** Public

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | integer | Special ID |

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Promo Hampers",
    ...
  }
}
```

**Error Responses:**
- `404` - Special not found

---

### POST /api/specials

Create a new special.

**Access:** Protected

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | Yes | Special title |
| description | string | Yes | Special description |
| time_period | string | No | Time period |
| icon | string | No | Icon name (default: "clock") |
| display_order | integer | No | Display order (default: 0) |

**Example Request:**
```json
{
  "title": "Weekend Promo",
  "description": "Diskon 10% untuk semua produk",
  "time_period": "Sabtu - Minggu",
  "icon": "percent"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Special created successfully",
  "data": { ... }
}
```

**Error Responses:**
- `400` - Title and description are required

---

### PUT /api/specials/:id

Update an existing special.

**Access:** Protected

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | integer | Special ID |

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | No | Special title |
| description | string | No | Special description |
| time_period | string | No | Time period |
| icon | string | No | Icon name |
| is_active | boolean | No | Active status |
| display_order | integer | No | Display order |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Special updated successfully",
  "data": { ... }
}
```

**Error Responses:**
- `400` - No fields to update
- `404` - Special not found

---

### DELETE /api/specials/:id

Delete a special.

**Access:** Protected

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | integer | Special ID |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Special deleted successfully"
}
```

**Error Responses:**
- `404` - Special not found

---

## FAQs

### GET /api/faqs

Get all active FAQs.

**Access:** Public

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| active | string | Set to "false" to include inactive FAQs |

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "question": "Bagaimana cara memesan kue?",
      "answer": "Anda bisa memesan melalui WhatsApp kami...",
      "display_order": 1,
      "is_active": true,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### GET /api/faqs/:id

Get a single FAQ by ID.

**Access:** Public

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | integer | FAQ ID |

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "question": "Bagaimana cara memesan kue?",
    ...
  }
}
```

**Error Responses:**
- `404` - FAQ not found

---

### POST /api/faqs

Create a new FAQ.

**Access:** Protected

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| question | string | Yes | FAQ question |
| answer | string | Yes | FAQ answer |
| display_order | integer | No | Display order (default: 0) |

**Example Request:**
```json
{
  "question": "Apakah ada minimum order?",
  "answer": "Tidak ada minimum order untuk produk reguler."
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "FAQ created successfully",
  "data": { ... }
}
```

**Error Responses:**
- `400` - Question and answer are required

---

### PUT /api/faqs/:id

Update an existing FAQ.

**Access:** Protected

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | integer | FAQ ID |

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| question | string | No | FAQ question |
| answer | string | No | FAQ answer |
| is_active | boolean | No | Active status |
| display_order | integer | No | Display order |

**Success Response (200):**
```json
{
  "success": true,
  "message": "FAQ updated successfully",
  "data": { ... }
}
```

**Error Responses:**
- `400` - No fields to update
- `404` - FAQ not found

---

### DELETE /api/faqs/:id

Delete a FAQ.

**Access:** Protected

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | integer | FAQ ID |

**Success Response (200):**
```json
{
  "success": true,
  "message": "FAQ deleted successfully"
}
```

**Error Responses:**
- `404` - FAQ not found

---

## Statistics

### GET /api/stats

Get dashboard statistics.

**Access:** Protected

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "totalItems": 20,
    "totalCategories": 3,
    "featuredItems": 5,
    "voiceEnabled": 10,
    "activeSpecials": 4
  }
}
```

---

## Data Models

### User
| Field | Type | Description |
|-------|------|-------------|
| id | integer | Primary key |
| username | string | Unique username |
| password | string | Hashed password |
| name | string | Display name |
| role | enum | 'admin' or 'staff' |
| is_active | boolean | Account status |
| last_login | timestamp | Last login time |
| created_at | timestamp | Creation time |
| updated_at | timestamp | Last update time |

### Category
| Field | Type | Description |
|-------|------|-------------|
| id | integer | Primary key |
| name | string | Category name (unique) |
| slug | string | URL-friendly name (unique) |
| description | text | Category description |
| display_order | integer | Sort order |
| is_active | boolean | Active status |
| created_at | timestamp | Creation time |
| updated_at | timestamp | Last update time |

### Menu Item
| Field | Type | Description |
|-------|------|-------------|
| id | integer | Primary key |
| category_id | integer | Foreign key to categories |
| name | string | Item name |
| slug | string | URL-friendly name (unique) |
| description | text | Item description |
| voice_description | text | Voice narration text |
| voice_file | string | Path to voice audio file |
| image_url | string | Path/URL to image |
| price | decimal | Item price |
| price_display | string | Formatted price display |
| tag | string | Tag (e.g., "Best Seller") |
| is_featured | boolean | Featured status |
| is_available | boolean | Availability status |
| display_order | integer | Sort order |
| created_at | timestamp | Creation time |
| updated_at | timestamp | Last update time |

### Special
| Field | Type | Description |
|-------|------|-------------|
| id | integer | Primary key |
| title | string | Special title |
| description | text | Special description |
| time_period | string | Time period info |
| icon | string | Icon name |
| is_active | boolean | Active status |
| display_order | integer | Sort order |
| created_at | timestamp | Creation time |
| updated_at | timestamp | Last update time |

### FAQ
| Field | Type | Description |
|-------|------|-------------|
| id | integer | Primary key |
| question | string | FAQ question |
| answer | text | FAQ answer |
| display_order | integer | Sort order |
| is_active | boolean | Active status |
| created_at | timestamp | Creation time |
| updated_at | timestamp | Last update time |

---

## HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid request data |
| 401 | Unauthorized - Authentication required or failed |
| 404 | Not Found - Resource not found |
| 500 | Internal Server Error - Server error |
