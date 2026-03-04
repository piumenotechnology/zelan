# Zelan Bakery & Cake - Database Documentation

## Overview

This document describes the database schema for the Zelan Bakery & Cake application. The database uses MySQL with UTF-8 character encoding to support Indonesian language content.

## Database Configuration

- **Database Name:** `zelan_bakery_db`
- **Character Set:** `utf8mb4`
- **Collation:** `utf8mb4_unicode_ci`
- **Engine:** InnoDB (default)

## Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────────┐
│     users       │       │     categories      │
├─────────────────┤       ├─────────────────────┤
│ id (PK)         │       │ id (PK)             │
│ username        │       │ name                │
│ password        │       │ slug                │
│ name            │       │ description         │
│ role            │       │ display_order       │
│ is_active       │       │ is_active           │
│ last_login      │       │ created_at          │
│ created_at      │       │ updated_at          │
│ updated_at      │       └─────────┬───────────┘
└─────────────────┘                 │
                                    │ 1:N
                                    ▼
┌─────────────────┐       ┌─────────────────────┐
│    specials     │       │    menu_items       │
├─────────────────┤       ├─────────────────────┤
│ id (PK)         │       │ id (PK)             │
│ title           │       │ category_id (FK)    │◄──┘
│ description     │       │ name                │
│ time_period     │       │ slug                │
│ icon            │       │ description         │
│ is_active       │       │ voice_description   │
│ display_order   │       │ voice_file          │
│ created_at      │       │ image_url           │
│ updated_at      │       │ price               │
└─────────────────┘       │ price_display       │
                          │ tag                 │
┌─────────────────┐       │ is_featured         │
│      faqs       │       │ is_available        │
├─────────────────┤       │ display_order       │
│ id (PK)         │       │ created_at          │
│ question        │       │ updated_at          │
│ answer          │       └─────────────────────┘
│ display_order   │
│ is_active       │       ┌─────────────────────┐
│ created_at      │       │  restaurant_info    │
│ updated_at      │       ├─────────────────────┤
└─────────────────┘       │ id (PK)             │
                          │ setting_key         │
                          │ setting_value       │
                          │ created_at          │
                          │ updated_at          │
                          └─────────────────────┘
```

## Tables

### 1. users

Stores admin and staff user accounts for the CMS.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PK, AUTO_INCREMENT | Unique identifier |
| `username` | VARCHAR(50) | NOT NULL, UNIQUE | Login username |
| `password` | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| `name` | VARCHAR(100) | NOT NULL | Display name |
| `role` | ENUM('admin', 'staff') | DEFAULT 'staff' | User role |
| `is_active` | BOOLEAN | DEFAULT TRUE | Account status |
| `last_login` | TIMESTAMP | NULL | Last login timestamp |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation time |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Last update time |

**Indexes:**
- PRIMARY KEY (`id`)
- UNIQUE (`username`)

**Notes:**
- Passwords are hashed using bcrypt with 10 rounds
- Default admin credentials: `admin` / `admin123`

---

### 2. categories

Organizes menu items into categories (Bakery, Cookies, Pastry, etc.).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PK, AUTO_INCREMENT | Unique identifier |
| `name` | VARCHAR(100) | NOT NULL, UNIQUE | Category name |
| `slug` | VARCHAR(100) | NOT NULL, UNIQUE | URL-friendly identifier |
| `description` | TEXT | NULL | Category description |
| `display_order` | INT | DEFAULT 0 | Sort order |
| `is_active` | BOOLEAN | DEFAULT TRUE | Active status |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation time |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Last update time |

**Indexes:**
- PRIMARY KEY (`id`)
- UNIQUE (`name`)
- UNIQUE (`slug`)

**Default Data:**
| ID | Name | Slug | Description |
|----|------|------|-------------|
| 1 | Bakery | bakery | Roti dan kue fresh setiap hari |
| 2 | Cookies | cookies | Kue kering premium pilihan |
| 3 | Pastry | pastry | Pastry lezat dengan resep terbaik |

---

### 3. menu_items

Stores all menu items with details, pricing, and media files.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PK, AUTO_INCREMENT | Unique identifier |
| `category_id` | INT | FK, NOT NULL | Reference to categories |
| `name` | VARCHAR(200) | NOT NULL | Item name |
| `slug` | VARCHAR(200) | NOT NULL, UNIQUE | URL-friendly identifier |
| `description` | TEXT | NOT NULL | Item description |
| `voice_description` | TEXT | NULL | Text for voice narration |
| `voice_file` | VARCHAR(500) | NULL | Path to voice audio file |
| `image_url` | VARCHAR(500) | NULL | Path/URL to image |
| `price` | DECIMAL(10,2) | NOT NULL | Item price in IDR |
| `price_display` | VARCHAR(50) | NULL | Formatted price (e.g., "40K") |
| `tag` | VARCHAR(100) | NULL | Tag label (e.g., "Best Seller") |
| `is_featured` | BOOLEAN | DEFAULT FALSE | Featured on homepage |
| `is_available` | BOOLEAN | DEFAULT TRUE | Currently available |
| `display_order` | INT | DEFAULT 0 | Sort order within category |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation time |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Last update time |

**Indexes:**
- PRIMARY KEY (`id`)
- UNIQUE (`slug`)
- INDEX `idx_category` (`category_id`)
- INDEX `idx_available` (`is_available`)
- INDEX `idx_featured` (`is_featured`)

**Foreign Keys:**
- `category_id` REFERENCES `categories(id)` ON DELETE RESTRICT

**Notes:**
- `voice_file` stores relative path: `uploads/voice/filename.mp3`
- `image_url` can be relative path or external URL
- Price is stored in Indonesian Rupiah (IDR)
- ON DELETE RESTRICT prevents deleting categories with menu items

---

### 4. specials

Stores promotional offers and special announcements.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PK, AUTO_INCREMENT | Unique identifier |
| `title` | VARCHAR(200) | NOT NULL | Special title |
| `description` | TEXT | NOT NULL | Special description |
| `time_period` | VARCHAR(200) | NULL | Time/date information |
| `icon` | VARCHAR(50) | DEFAULT 'clock' | Icon name for display |
| `is_active` | BOOLEAN | DEFAULT TRUE | Active status |
| `display_order` | INT | DEFAULT 0 | Sort order |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation time |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Last update time |

**Indexes:**
- PRIMARY KEY (`id`)

**Default Data:**
| Title | Time Period | Icon |
|-------|-------------|------|
| Promo Hampers | Sepanjang Tahun | gift |
| Fresh from Oven | Setiap Hari | clock |
| Paket Arisan | Min. Order 50pcs | users |
| Custom Cake | H-3 Pemesanan | cake |

---

### 5. faqs

Stores frequently asked questions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PK, AUTO_INCREMENT | Unique identifier |
| `question` | VARCHAR(500) | NOT NULL | FAQ question |
| `answer` | TEXT | NOT NULL | FAQ answer |
| `display_order` | INT | DEFAULT 0 | Sort order |
| `is_active` | BOOLEAN | DEFAULT TRUE | Active status |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation time |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Last update time |

**Indexes:**
- PRIMARY KEY (`id`)

---

### 6. restaurant_info

Key-value store for restaurant settings and information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PK, AUTO_INCREMENT | Unique identifier |
| `setting_key` | VARCHAR(100) | NOT NULL, UNIQUE | Setting name |
| `setting_value` | TEXT | NULL | Setting value |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation time |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Last update time |

**Indexes:**
- PRIMARY KEY (`id`)
- UNIQUE (`setting_key`)

**Default Settings:**
| Key | Description |
|-----|-------------|
| `name` | Restaurant name |
| `tagline` | Restaurant tagline |
| `about` | About description |
| `address` | Physical address |
| `phone` | Phone number |
| `whatsapp` | WhatsApp number |
| `email` | Email address |
| `instagram` | Instagram URL |
| `tiktok` | TikTok URL |
| `hours` | Operating hours |
| `founded` | Founded date |
| `founders` | Founder names |

---

## Relationships

### categories → menu_items (One-to-Many)
- One category can have many menu items
- Each menu item belongs to exactly one category
- Deletion of a category is restricted if it has menu items

```sql
FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
```

---

## Common Queries

### Get all menu items with category info
```sql
SELECT
    m.*,
    c.name as category_name,
    c.slug as category_slug
FROM menu_items m
LEFT JOIN categories c ON m.category_id = c.id
WHERE m.is_available = TRUE
ORDER BY m.display_order ASC;
```

### Get menu items grouped by category
```sql
SELECT
    c.id as category_id,
    c.name as category_name,
    m.*
FROM categories c
LEFT JOIN menu_items m ON c.id = m.category_id
WHERE c.is_active = TRUE AND m.is_available = TRUE
ORDER BY c.display_order ASC, m.display_order ASC;
```

### Get featured items
```sql
SELECT * FROM menu_items
WHERE is_featured = TRUE AND is_available = TRUE
ORDER BY display_order ASC;
```

### Get dashboard statistics
```sql
SELECT
    (SELECT COUNT(*) FROM menu_items) as total_items,
    (SELECT COUNT(*) FROM categories WHERE is_active = TRUE) as total_categories,
    (SELECT COUNT(*) FROM menu_items WHERE is_featured = TRUE) as featured_items,
    (SELECT COUNT(*) FROM menu_items WHERE voice_file IS NOT NULL) as voice_enabled,
    (SELECT COUNT(*) FROM specials WHERE is_active = TRUE) as active_specials;
```

### Search menu items
```sql
SELECT * FROM menu_items
WHERE (name LIKE '%search%' OR description LIKE '%search%')
AND is_available = TRUE
ORDER BY display_order ASC;
```

---

## Database Setup

### Create Database
```sql
CREATE DATABASE IF NOT EXISTS zelan_bakery_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE zelan_bakery_db;
```

### Run Schema
```bash
mysql -u root -p zelan_bakery_db < database/schema.sql
```

### Backup Database
```bash
mysqldump -u root -p zelan_bakery_db > backup_$(date +%Y%m%d).sql
```

### Restore Database
```bash
mysql -u root -p zelan_bakery_db < backup_20240101.sql
```

---

## Data Types Reference

| MySQL Type | Usage |
|------------|-------|
| `INT` | IDs, counts, order numbers |
| `VARCHAR(n)` | Short text (names, slugs, etc.) |
| `TEXT` | Long text (descriptions, answers) |
| `DECIMAL(10,2)` | Prices (up to 99,999,999.99) |
| `BOOLEAN` | Flags (is_active, is_featured, etc.) |
| `TIMESTAMP` | Dates and times |
| `ENUM` | Fixed options (role: admin/staff) |

---

## Performance Considerations

1. **Indexed columns** for frequent queries:
   - `category_id` on menu_items
   - `is_available` on menu_items
   - `is_featured` on menu_items

2. **Connection pooling** is enabled in the application with:
   - Max 10 connections
   - Keep-alive enabled

3. **Consider adding indexes** if performance issues arise:
   ```sql
   -- For name searches
   CREATE INDEX idx_menu_name ON menu_items(name);

   -- For slug lookups
   CREATE INDEX idx_category_slug ON categories(slug);
   ```

---

## Migration Notes

When making schema changes:

1. Always backup before changes
2. Use ALTER TABLE for modifications
3. Test on development first
4. Update schema.sql for new installations

Example migration:
```sql
-- Add new column
ALTER TABLE menu_items ADD COLUMN calories INT NULL AFTER price_display;

-- Modify column
ALTER TABLE menu_items MODIFY COLUMN tag VARCHAR(150);

-- Add index
CREATE INDEX idx_new ON table_name(column_name);
```
