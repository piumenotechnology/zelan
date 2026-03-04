# Zelan Bakery & Cake - Database Documentation

## Table of Contents

1. [Entity Relationship Diagram (ERD)](#1-entity-relationship-diagram-erd)
2. [Data Flow Diagram (DFD)](#2-data-flow-diagram-dfd)
3. [Table Schema](#3-table-schema)
4. [API Endpoints Reference](#4-api-endpoints-reference)

---

## 1. Entity Relationship Diagram (ERD)

### 1.1 ERD Diagram

```mermaid
erDiagram
    USERS {
        int id PK "AUTO_INCREMENT"
        varchar username UK "NOT NULL, VARCHAR(50)"
        varchar password "NOT NULL, VARCHAR(255)"
        varchar name "NOT NULL, VARCHAR(100)"
        enum role "DEFAULT 'staff' (admin, staff)"
        boolean is_active "DEFAULT TRUE"
        timestamp last_login "NULLABLE"
        timestamp created_at "DEFAULT CURRENT_TIMESTAMP"
        timestamp updated_at "AUTO UPDATE"
    }

    CATEGORIES {
        int id PK "AUTO_INCREMENT"
        varchar name UK "NOT NULL, VARCHAR(100)"
        varchar slug UK "NOT NULL, VARCHAR(100)"
        text description "NULLABLE"
        int display_order "DEFAULT 0"
        boolean is_active "DEFAULT TRUE"
        timestamp created_at "DEFAULT CURRENT_TIMESTAMP"
        timestamp updated_at "AUTO UPDATE"
    }

    MENU_ITEMS {
        int id PK "AUTO_INCREMENT"
        int category_id FK "NOT NULL"
        varchar name "NOT NULL, VARCHAR(200)"
        varchar slug UK "NOT NULL, VARCHAR(200)"
        text description "NOT NULL"
        text voice_description "NULLABLE"
        varchar voice_file "NULLABLE, VARCHAR(500)"
        decimal price "NOT NULL, DECIMAL(10,2)"
        varchar price_display "NULLABLE, VARCHAR(50)"
        varchar tag "NULLABLE, VARCHAR(100)"
        boolean is_featured "DEFAULT FALSE"
        boolean is_available "DEFAULT TRUE"
        int display_order "DEFAULT 0"
        timestamp created_at "DEFAULT CURRENT_TIMESTAMP"
        timestamp updated_at "AUTO UPDATE"
    }

    MENU_IMAGES {
        int id PK "AUTO_INCREMENT"
        int menu_id FK "NOT NULL"
        varchar image_url "NOT NULL, VARCHAR(255)"
        boolean is_main "DEFAULT FALSE"
        int sort_order "DEFAULT 0"
        timestamp created_at "DEFAULT CURRENT_TIMESTAMP"
    }

    RESTAURANT_INFO {
        int id PK "AUTO_INCREMENT"
        varchar setting_key UK "NOT NULL, VARCHAR(100)"
        text setting_value "NULLABLE"
        timestamp created_at "DEFAULT CURRENT_TIMESTAMP"
        timestamp updated_at "AUTO UPDATE"
    }

    SPECIALS {
        int id PK "AUTO_INCREMENT"
        varchar title "NOT NULL, VARCHAR(200)"
        text description "NOT NULL"
        varchar time_period "NULLABLE, VARCHAR(200)"
        varchar icon "DEFAULT 'clock', VARCHAR(50)"
        boolean is_active "DEFAULT TRUE"
        int display_order "DEFAULT 0"
        timestamp created_at "DEFAULT CURRENT_TIMESTAMP"
        timestamp updated_at "AUTO UPDATE"
    }

    FAQS {
        int id PK "AUTO_INCREMENT"
        varchar question "NOT NULL, VARCHAR(500)"
        text answer "NOT NULL"
        int display_order "DEFAULT 0"
        boolean is_active "DEFAULT TRUE"
        timestamp created_at "DEFAULT CURRENT_TIMESTAMP"
        timestamp updated_at "AUTO UPDATE"
    }

    CATEGORIES ||--o{ MENU_ITEMS : "has many"
    MENU_ITEMS ||--o{ MENU_IMAGES : "has many"
```

### 1.2 Relationship Summary

| Relationship | Type | Description | On Delete |
|---|---|---|---|
| `categories` -> `menu_items` | One-to-Many | One category has many menu items | RESTRICT |
| `menu_items` -> `menu_images` | One-to-Many | One menu item has many images | CASCADE |

### 1.3 Standalone Tables

| Table | Description |
|---|---|
| `users` | Authentication & authorization (no FK relations) |
| `restaurant_info` | Key-value store for restaurant settings |
| `specials` | Promotional offers & special events |
| `faqs` | Frequently asked questions |

---

## 2. Data Flow Diagram (DFD)

### 2.1 DFD Level 0 (Context Diagram)

```mermaid
flowchart LR
    Pengunjung["Pengunjung"]
    Admin["Admin"]

    Pengunjung -->|Data_permintaan_menu| P0(("P0\nSistem\nZelan Bakery"))
    P0 -->|Info_menu| Pengunjung
    P0 -->|Info_restoran| Pengunjung

    Admin -->|Data_login_admin| P0
    P0 -->|Info_login_admin| Admin
    Admin -->|Data_produk| P0
    P0 -->|Info_data_produk| Admin
    Admin -->|Data_konten| P0
    P0 -->|Info_data_konten| Admin
```

### 2.2 DFD Level 1

```mermaid
flowchart TB
    Pengunjung["Pengunjung"]
    Admin["Admin"]

    P1(("P1\nLogin"))
    P2(("P2\nKelola\nKategori"))
    P3(("P3\nKelola\nMenu"))
    P4(("P4\nKelola\nKonten"))

    User[/"D1 User"/]
    Kategori[/"D2 Kategori"/]
    Menu[/"D3 Menu"/]
    Gambar[/"D4 Gambar Menu"/]
    Spesial[/"D5 Spesial"/]
    FAQ[/"D6 FAQ"/]

    Admin -->|Data_login_admin| P1
    P1 -->|Info_login_admin| Admin

    P1 -->|Data_login_admin| User
    User -->|Data_login_admin| P1

    Admin -->|Data_kategori| P2
    P2 -->|Info_data_kategori| Admin
    Pengunjung -->|Data_permintaan_kategori| P2
    P2 -->|Info_kategori| Pengunjung

    P2 -->|Data_kategori| Kategori
    Kategori -->|Data_kategori| P2

    Admin -->|Data_produk| P3
    P3 -->|Info_data_produk| Admin
    Pengunjung -->|Data_permintaan_menu| P3
    P3 -->|Info_menu| Pengunjung

    P3 -->|Data_produk| Menu
    Menu -->|Data_produk| P3
    P3 -->|Data_gambar| Gambar
    Gambar -->|Data_gambar| P3

    Admin -->|Data_konten| P4
    P4 -->|Info_data_konten| Admin
    Pengunjung -->|Data_permintaan_konten| P4
    P4 -->|Info_konten| Pengunjung

    P4 -->|Data_spesial| Spesial
    Spesial -->|Data_spesial| P4
    P4 -->|Data_faq| FAQ
    FAQ -->|Data_faq| P4
```

### 2.3 DFD Level 2 - Proses 1 (Login)

```mermaid
flowchart LR
    Admin["Admin"]

    P1_1(("P1.1\nValidasi\nLogin"))
    P1_2(("P1.2\nGenerate\nToken"))
    P1_3(("P1.3\nUbah\nPassword"))

    User[/"D1 User"/]

    Admin -->|Data_login_admin| P1_1
    P1_1 -->|Data_login_admin| User
    User -->|Data_login_admin| P1_1
    P1_1 -->|Data_user| P1_2
    P1_2 -->|Info_login_admin| Admin

    Admin -->|Data_password_baru| P1_3
    P1_3 -->|Data_password| User
    P1_3 -->|Info_ubah_password| Admin
```

### 2.4 DFD Level 2 - Proses 3 (Kelola Menu)

```mermaid
flowchart TB
    Pengunjung["Pengunjung"]
    Admin["Admin"]

    P3_1(("P3.1\nLihat\nMenu"))
    P3_2(("P3.2\nTambah\nMenu"))
    P3_3(("P3.3\nEdit\nMenu"))
    P3_4(("P3.4\nHapus\nMenu"))
    P3_5(("P3.5\nKelola\nGambar"))

    Menu[/"D3 Menu"/]
    Gambar[/"D4 Gambar Menu"/]

    Pengunjung -->|Data_permintaan_menu| P3_1
    P3_1 -->|Info_menu| Pengunjung
    P3_1 -->|Data_produk| Menu
    Menu -->|Data_produk| P3_1
    P3_1 -->|Data_gambar| Gambar
    Gambar -->|Data_gambar| P3_1

    Admin -->|Data_produk_baru| P3_2
    P3_2 -->|Data_produk| Menu
    P3_2 -->|Info_data_produk| Admin

    Admin -->|Data_produk_update| P3_3
    P3_3 -->|Data_produk| Menu
    P3_3 -->|Info_data_produk| Admin

    Admin -->|Data_hapus_produk| P3_4
    P3_4 -->|Data_produk| Menu
    P3_4 -->|Data_gambar| Gambar
    P3_4 -->|Info_data_produk| Admin

    Admin -->|Data_gambar_baru| P3_5
    P3_5 -->|Data_gambar| Gambar
    P3_5 -->|Info_data_gambar| Admin
```

---

## 3. Table Schema

### 3.1 Table: `users`

> Stores admin and staff accounts for authentication.

| # | Column | Type | Constraints | Default | Description |
|---|--------|------|-------------|---------|-------------|
| 1 | `id` | INT | PK, AUTO_INCREMENT | - | Unique identifier |
| 2 | `username` | VARCHAR(50) | NOT NULL, UNIQUE | - | Login username |
| 3 | `password` | VARCHAR(255) | NOT NULL | - | Bcrypt hashed password |
| 4 | `name` | VARCHAR(100) | NOT NULL | - | Display name |
| 5 | `role` | ENUM('admin','staff') | - | 'staff' | User role |
| 6 | `is_active` | TINYINT(1) | - | TRUE | Account status |
| 7 | `last_login` | TIMESTAMP | NULLABLE | NULL | Last login timestamp |
| 8 | `created_at` | TIMESTAMP | - | CURRENT_TIMESTAMP | Record creation time |
| 9 | `updated_at` | TIMESTAMP | ON UPDATE | CURRENT_TIMESTAMP | Last modification time |

**Indexes:**
| Index Name | Type | Column(s) |
|---|---|---|
| PRIMARY | Primary Key | `id` |
| username | Unique | `username` |

---

### 3.2 Table: `categories`

> Menu categories for organizing products (e.g., Bakery, Cookies, Pastry).

| # | Column | Type | Constraints | Default | Description |
|---|--------|------|-------------|---------|-------------|
| 1 | `id` | INT | PK, AUTO_INCREMENT | - | Unique identifier |
| 2 | `name` | VARCHAR(100) | NOT NULL, UNIQUE | - | Category name |
| 3 | `slug` | VARCHAR(100) | NOT NULL, UNIQUE | - | URL-friendly identifier |
| 4 | `description` | TEXT | NULLABLE | NULL | Category description |
| 5 | `display_order` | INT | - | 0 | Sort order for display |
| 6 | `is_active` | TINYINT(1) | - | TRUE | Visibility status |
| 7 | `created_at` | TIMESTAMP | - | CURRENT_TIMESTAMP | Record creation time |
| 8 | `updated_at` | TIMESTAMP | ON UPDATE | CURRENT_TIMESTAMP | Last modification time |

**Indexes:**
| Index Name | Type | Column(s) |
|---|---|---|
| PRIMARY | Primary Key | `id` |
| name | Unique | `name` |
| slug | Unique | `slug` |

---

### 3.3 Table: `menu_items`

> Individual menu products with pricing, descriptions, and voice support.

| # | Column | Type | Constraints | Default | Description |
|---|--------|------|-------------|---------|-------------|
| 1 | `id` | INT | PK, AUTO_INCREMENT | - | Unique identifier |
| 2 | `category_id` | INT | FK, NOT NULL | - | Reference to categories |
| 3 | `name` | VARCHAR(200) | NOT NULL | - | Product name |
| 4 | `slug` | VARCHAR(200) | NOT NULL, UNIQUE | - | URL-friendly identifier |
| 5 | `description` | TEXT | NOT NULL | - | Short description |
| 6 | `voice_description` | TEXT | NULLABLE | NULL | Text for voice narration |
| 7 | `voice_file` | VARCHAR(500) | NULLABLE | NULL | Path to voice audio file |
| 8 | `price` | DECIMAL(10,2) | NOT NULL | - | Price in IDR |
| 9 | `price_display` | VARCHAR(50) | NULLABLE | NULL | Formatted price (e.g., "25K") |
| 10 | `tag` | VARCHAR(100) | NULLABLE | NULL | Label tag (e.g., "Best Seller") |
| 11 | `is_featured` | TINYINT(1) | - | FALSE | Featured product flag |
| 12 | `is_available` | TINYINT(1) | - | TRUE | Availability status |
| 13 | `display_order` | INT | - | 0 | Sort order within category |
| 14 | `created_at` | TIMESTAMP | - | CURRENT_TIMESTAMP | Record creation time |
| 15 | `updated_at` | TIMESTAMP | ON UPDATE | CURRENT_TIMESTAMP | Last modification time |

**Indexes:**
| Index Name | Type | Column(s) |
|---|---|---|
| PRIMARY | Primary Key | `id` |
| slug | Unique | `slug` |
| idx_category | Index | `category_id` |
| idx_available | Index | `is_available` |
| idx_featured | Index | `is_featured` |

**Foreign Keys:**
| Column | References | On Delete |
|---|---|---|
| `category_id` | `categories(id)` | RESTRICT |

---

### 3.4 Table: `menu_images`

> Multiple images per menu item with main image designation.

| # | Column | Type | Constraints | Default | Description |
|---|--------|------|-------------|---------|-------------|
| 1 | `id` | INT | PK, AUTO_INCREMENT | - | Unique identifier |
| 2 | `menu_id` | INT | FK, NOT NULL | - | Reference to menu_items |
| 3 | `image_url` | VARCHAR(255) | NOT NULL | - | Image file path |
| 4 | `is_main` | TINYINT(1) | - | FALSE | Main/primary image flag |
| 5 | `sort_order` | INT | - | 0 | Display order |
| 6 | `created_at` | TIMESTAMP | - | CURRENT_TIMESTAMP | Upload timestamp |

**Indexes:**
| Index Name | Type | Column(s) |
|---|---|---|
| PRIMARY | Primary Key | `id` |
| idx_menu_id | Index | `menu_id` |

**Foreign Keys:**
| Column | References | On Delete |
|---|---|---|
| `menu_id` | `menu_items(id)` | CASCADE |

---

### 3.5 Table: `restaurant_info`

> Key-value store for restaurant configuration and contact info.

| # | Column | Type | Constraints | Default | Description |
|---|--------|------|-------------|---------|-------------|
| 1 | `id` | INT | PK, AUTO_INCREMENT | - | Unique identifier |
| 2 | `setting_key` | VARCHAR(100) | NOT NULL, UNIQUE | - | Setting name |
| 3 | `setting_value` | TEXT | NULLABLE | NULL | Setting value |
| 4 | `created_at` | TIMESTAMP | - | CURRENT_TIMESTAMP | Record creation time |
| 5 | `updated_at` | TIMESTAMP | ON UPDATE | CURRENT_TIMESTAMP | Last modification time |

**Indexes:**
| Index Name | Type | Column(s) |
|---|---|---|
| PRIMARY | Primary Key | `id` |
| setting_key | Unique | `setting_key` |

**Current Settings:**
| Key | Example Value |
|---|---|
| `name` | Zelan Bakery & Cake |
| `tagline` | Freshly Baked with Love |
| `about` | (Company description) |
| `address` | Jl. Bung Tomo VII No. 5, ... |
| `phone` | 0895385455669 |
| `whatsapp` | 62895385455669 |
| `email` | zelanbakeryncake@gmail.com |
| `instagram` | https://www.instagram.com/zelanbakeryncake |
| `tiktok` | https://www.tiktok.com/@zelanbakeryncake |
| `hours` | 08:00 - 20:00 |
| `founded` | 19 Juni 2023 |
| `founders` | Lana Aristya & Zen |

---

### 3.6 Table: `specials`

> Promotional offers and special events.

| # | Column | Type | Constraints | Default | Description |
|---|--------|------|-------------|---------|-------------|
| 1 | `id` | INT | PK, AUTO_INCREMENT | - | Unique identifier |
| 2 | `title` | VARCHAR(200) | NOT NULL | - | Special offer title |
| 3 | `description` | TEXT | NOT NULL | - | Offer description |
| 4 | `time_period` | VARCHAR(200) | NULLABLE | NULL | Validity period text |
| 5 | `icon` | VARCHAR(50) | - | 'clock' | Icon identifier |
| 6 | `is_active` | TINYINT(1) | - | TRUE | Active status |
| 7 | `display_order` | INT | - | 0 | Sort order |
| 8 | `created_at` | TIMESTAMP | - | CURRENT_TIMESTAMP | Record creation time |
| 9 | `updated_at` | TIMESTAMP | ON UPDATE | CURRENT_TIMESTAMP | Last modification time |

**Indexes:**
| Index Name | Type | Column(s) |
|---|---|---|
| PRIMARY | Primary Key | `id` |

---

### 3.7 Table: `faqs`

> Frequently asked questions displayed on the website.

| # | Column | Type | Constraints | Default | Description |
|---|--------|------|-------------|---------|-------------|
| 1 | `id` | INT | PK, AUTO_INCREMENT | - | Unique identifier |
| 2 | `question` | VARCHAR(500) | NOT NULL | - | FAQ question text |
| 3 | `answer` | TEXT | NOT NULL | - | FAQ answer text |
| 4 | `display_order` | INT | - | 0 | Sort order |
| 5 | `is_active` | TINYINT(1) | - | TRUE | Visibility status |
| 6 | `created_at` | TIMESTAMP | - | CURRENT_TIMESTAMP | Record creation time |
| 7 | `updated_at` | TIMESTAMP | ON UPDATE | CURRENT_TIMESTAMP | Last modification time |

**Indexes:**
| Index Name | Type | Column(s) |
|---|---|---|
| PRIMARY | Primary Key | `id` |

---

## 4. API Endpoints Reference

### 4.1 Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | Public | User login |
| GET | `/api/auth/verify` | Public | Verify JWT token |
| POST | `/api/auth/refresh` | Public | Refresh JWT token |
| POST | `/api/auth/register` | Admin | Register new user |
| PUT | `/api/auth/change-password` | Auth | Change password |

### 4.2 Categories

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/categories` | Public | List all categories |
| GET | `/api/categories/:id` | Public | Get category by ID |
| POST | `/api/categories` | Auth | Create category |
| PUT | `/api/categories/:id` | Auth | Update category |
| DELETE | `/api/categories/:id` | Auth | Delete category |

### 4.3 Menu Items

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/menu` | Public | List all menu items |
| GET | `/api/menu/by-category` | Public | Get menu grouped by category |
| GET | `/api/menu/:id` | Public | Get menu item by ID |
| POST | `/api/menu` | Auth | Create menu item (with file upload) |
| PUT | `/api/menu/:id` | Auth | Update menu item (with file upload) |
| DELETE | `/api/menu/:id` | Auth | Delete menu item |
| POST | `/api/menu/:id/voice` | Auth | Upload voice file |

### 4.4 Menu Images

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/menu/:id/images` | Public | Get images for menu item |
| POST | `/api/menu/:id/images` | Auth | Upload image for menu item |
| DELETE | `/api/menu/:id/images/:imageId` | Auth | Delete specific image |
| PATCH | `/api/menu/:id/images/:imageId/main` | Auth | Set image as main |

### 4.5 Specials

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/specials` | Public | List all specials |
| GET | `/api/specials/:id` | Public | Get special by ID |
| POST | `/api/specials` | Auth | Create special |
| PUT | `/api/specials/:id` | Auth | Update special |
| DELETE | `/api/specials/:id` | Auth | Delete special |

### 4.6 FAQs

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/faqs` | Public | List all FAQs |
| GET | `/api/faqs/:id` | Public | Get FAQ by ID |
| POST | `/api/faqs` | Auth | Create FAQ |
| PUT | `/api/faqs/:id` | Auth | Update FAQ |
| DELETE | `/api/faqs/:id` | Auth | Delete FAQ |

### 4.7 Dashboard

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/stats` | Auth | Get dashboard statistics |
| GET | `/health` | Public | Health check |

---

## Technical Details

- **Database Engine:** MySQL 8.0 with InnoDB
- **Character Set:** utf8mb4 (Unicode support for Indonesian text)
- **Collation:** utf8mb4_unicode_ci
- **Connection Library:** mysql2/promise (connection pool)
- **Authentication:** JWT (JSON Web Tokens) + bcrypt password hashing
- **File Storage:** Local filesystem (`uploads/images/`, `uploads/voice/`)

---

*Generated on: February 2026*
*Database: zelan_bakery_db*
