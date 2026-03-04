-- =============================================
-- Zelan Bakery & Cake Database Schema
-- =============================================

CREATE DATABASE IF NOT EXISTS zelan_bakery_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE zelan_bakery_db;

-- =============================================
-- Users Table (for Admin Login)
-- =============================================
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role ENUM('admin', 'staff') DEFAULT 'staff',
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =============================================
-- Categories Table
-- =============================================
CREATE TABLE IF NOT EXISTS categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =============================================
-- Menu Items Table
-- =============================================
CREATE TABLE IF NOT EXISTS menu_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    category_id INT NOT NULL,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    voice_description TEXT,
    voice_file VARCHAR(500),
    price DECIMAL(10, 2) NOT NULL,
    price_display VARCHAR(50),
    tag VARCHAR(100),
    is_featured BOOLEAN DEFAULT FALSE,
    is_available BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
    INDEX idx_category (category_id),
    INDEX idx_available (is_available),
    INDEX idx_featured (is_featured)
);

-- =============================================
-- Menu Images Table
-- =============================================
CREATE TABLE IF NOT EXISTS menu_images (
    id INT PRIMARY KEY AUTO_INCREMENT,
    menu_id INT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    is_main BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (menu_id) REFERENCES menu_items(id) ON DELETE CASCADE,
    INDEX idx_menu_id (menu_id)
);

-- =============================================
-- Restaurant Info Table
-- =============================================
CREATE TABLE IF NOT EXISTS restaurant_info (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =============================================
-- Specials Table
-- =============================================
CREATE TABLE IF NOT EXISTS specials (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    time_period VARCHAR(200),
    icon VARCHAR(50) DEFAULT 'clock',
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =============================================
-- FAQs Table
-- =============================================
CREATE TABLE IF NOT EXISTS faqs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    question VARCHAR(500) NOT NULL,
    answer TEXT NOT NULL,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =============================================
-- Insert Categories: Bakery, Cookies, Pastry
-- =============================================
INSERT INTO categories (name, slug, description, display_order) VALUES
('Bakery', 'bakery', 'Roti dan kue fresh setiap hari', 1),
('Cookies', 'cookies', 'Kue kering premium pilihan', 2),
('Pastry', 'pastry', 'Pastry lezat dengan resep terbaik', 3)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- =============================================
-- Insert Bakery Items (8 items)
-- =============================================
INSERT INTO menu_items (category_id, name, slug, description, voice_description, voice_file, price, price_display, tag, is_featured, display_order) VALUES
(1, 'Floss Roll', 'floss-roll',
 'Floss roll dengan roti lembut berpadu dengan isian abon ayam yang gurih dan melimpah. ',
 'Floss roll dengan roti lembut berpadu dengan isian abon ayam yang gurih dan melimpah. Dipadukan dengan saus khas yang creamy untuk menciptakan rasa yang seimbang. Menjadi pilihan camilan maupun sajian praktis untuk berbagai momen. Pesan sekarang, dan hadirkan keistimewaan dari Zelan Bakery n Cake.',
 'uploads/voice/f3c40ee3-d439-48ec-b448-a89b7cc15bc8.aac',
 25000, '25K', 'best', FALSE, 1),

(1, 'Bolu Marmer', 'bolu-marmer',
 'Bolu klasik dengan motif marmer yang cantik.',
 'Bolu marmer lembut dengan tekstur yang super moist. Tersedia dalam dua varian favorit, original dengan cita rasa klasik, dan pandan dengan aroma wangi yang khas. Terdapat pilihan topping keju, meses cokelat, atau kombinasi keduanya. Pesan sekarang, dan hadirkan keistimewaan dari Zelan Bakery n Cake',
 'uploads/voice/b65e62b2-c9e8-46ed-bdf3-c53f251fd012.aac',
 35000, '35K', NULL, FALSE, 2),

(1, 'Brownies', 'brownies',
 'Brownies cokelat premium yang fudgy dan rich.',
 'Brownies panggang dengan sensasi cokelat yang intens dan tekstur luar yang crispy  memanjakan di setiap gigitan. Dipanggang hingga matang sempurna untuk menghadirkan aroma cokelat yang khas dan rasa yang kaya. Dilengkapi pilihan taburan keju, choco chips, almond, dan oreo yang menambah kenikmatan di setiap sajian. Pesan sekarang, dan hadirkan keistimewaan dari Zelan Bakery n Cake.',
 'uploads/voice/b4d4a7d7-fff9-4faf-8948-f12491c041e8.aac',
 55000, '55K', 'Best Seller', FALSE, 3),

(1, 'Donat Kentang', 'donat-kentang',
 'Donat lembut dengan campuran kentang.',
 'Donat kentang dengan tekstur empuk dan ringan, dibuat dari kentang pilihan untuk menghasilkan rasa yang pas dan aroma yang menggoda. Digoreng hingga keemasan dan disajikan dengan beragam topping yang menambah kenikmatan di setiap gigitan. Pesan sekarang, dan hadirkan keistimewaan dari Zelan Bakery n Cake.',
 'uploads/voice/65bc788b-debe-4384-bfac-4ee97fae7830.aac',
 40000, '40K', NULL, FALSE, 4),

(1, 'Donut Labu', 'donut-labu',
 'Donat sehat dengan labu kuning.',
 'Donat labu dengan cita rasa khas yang ringan dan aroma hangat yang menggoda. Teksturnya empuk dengan sentuhan manis alami, dibuat dari labu pilihan dan diolah hingga matang sempurna. Cocok dinikmati kapan saja sebagai camilan favorit keluarga. Pesan sekarang, dan hadirkan keistimewaan dari Zelan Bakery n Cake.',
 'uploads/voice/8297db4f-790c-451d-86c3-4600f2c7f21c.aac',
 55000, '55K', NULL, FALSE, 5),

(1, 'Lapis Kukus Tugu Bali', 'lapis-kukus-tugu-bali',
 'Kue lapis kukus khas Bali yang legit.',
 'Lapis kukus dengan susunan yang berlapis lapis, menghadirkan perpaduan rasa yang nikmat di setiap potongan. Tersedia dalam tiga pilihan rasa: Black Forest dengan sentuhan cokelat yang kaya, Choco Pandan dengan perpaduan aroma pandan cokelat, dan Talas dengan rasa lembut yang unik.Pesan sekarang, dan hadirkan keistimewaan dari Zelan Bakery n Cake',
 'uploads/voice/566f10e4-641b-4d8f-8743-6ced2bb3b61f.aac',
 40000, '40K', 'Khas Bali', FALSE, 6),

(1, 'Lapis Surabaya', 'lapis-surabaya',
 'Kue lapis Surabaya premium tiga lapis.',
 'Lapis Surabaya dengan karakter rasa yang kaya, dilengkapi isian selai stroberi yang segar dan aromatik. Kombinasi ini menghadirkan keseimbangan rasa yang pas, ringan namun berkesan. Pesan sekarang, dan hadirkan keistimewaan dari Zelan Bakery n Cake.',
 'uploads/voice/cecb4018-00ad-4c8e-bd85-f77ba29fc10c.aac',
 80000, '80K', 'best', FALSE, 7),

(1, 'Roti Unyil', 'roti-unyil',
 'Roti mini aneka rasa yang menggemaskan.',
 'Roti unyil dipanggang fresh untuk menghadirkan aroma dan rasa yang memikat. Menghadirkan pengalaman mencicipi banyak rasa dalam satu sajian. Pesan sekarang, dan hadirkan keistimewaan dari Zelan Bakery n Cake.',
 'uploads/voice/8c437327-1d2e-40a9-8359-7697263cc4c7.aac',
 45000, '45K', 'best', FALSE, 8)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- =============================================
-- Insert Cookies Items (8 items)
-- =============================================
INSERT INTO menu_items (category_id, name, slug, description, voice_description, voice_file, price, price_display, tag, is_featured, display_order) VALUES
(2, 'Kastengel', 'kastengel',
 'Kue keju premium yang gurih dan renyah.',
 'Kastengel dengan tekstur renyah dan taburan keju premium yang melimpah, menghadirkan rasa gurih yang kaya sejak gigitan pertama. Dipanggang hingga keemasan untuk aroma yang spesial. Pesan sekarang, dan hadirkan keistimewaan dari Zelan Bakery n Cake.',
 'uploads/voice/75e3db85-bb5f-4a42-8e80-9374b51e4f52.aac',
 115000, '115K', 'Premium', FALSE, 1),

(2, 'Kembang Goyang', 'kembang-goyang',
 'Kue tradisional berbentuk bunga yang renyah.',
 'Kue tradisional dengan bentuk bunga yang cantik dan tekstur renyah yang khas. Digoreng hingga keemasan untuk menghadirkan rasa manis yang unik. Pilihan camilan yang selalu dinikmati di berbagai suasana. Pesan sekarang, dan hadirkan keistimewaan dari Zelan Bakery n Cake.',
 'uploads/voice/e0ae669d-f9c4-4b67-a928-4aa621cdee47.aac',
 13000, '13K', 'Tradisional', FALSE, 2),

(2, 'Mako Wijen', 'mako-wijen',
 'Kue kering dengan taburan wijen gurih.',
 'Roti unyil dipanggang fresh untuk menghadirkan aroma dan rasa yang memikat. Menghadirkan pengalaman mencicipi banyak rasa dalam satu sajian. Pesan sekarang, dan hadirkan keistimewaan dari Zelan Bakery n Cake.',
 'uploads/voice/953a7cd3-5f5b-43d5-80af-c0e8d8afea79.aac',
 14000, '14K', NULL, FALSE, 3),

(2, 'Nastar', 'nastar',
 'Nastar klasik dengan selai nanas homemade.',
 'Nastar dengan tekstur renyah di luar dan isian selai nanas pilihan yang legit. Perpaduan rasa manis dan asam yang seimbang menghadirkan sensasi nikmat di setiap gigitan. Sajian klasik yang selalu menjadi favorit di berbagai momen. Pesan sekarang, dan hadirkan keistimewaan dari Zelan Bakery n Cake.',
 'uploads/voice/71a91ab6-8c52-43ee-8080-5e5bbb324299.aac',
 155000, '115K', 'Favorit', FALSE, 4),

(2, 'Putri Salju', 'putri-salju',
 'Kue putri salju yang lembut dengan taburan gula halus.',
 'Kue kering dibalut gula halus, menghadirkan rasa manis ringan yang langsung terasa di lidah. Setiap potongannya memberi sensasi lumer yang hangat. Sajian istimewa yang selalu berhasil mencuri perhatian di setiap momen. Pesan sekarang, dan hadirkan keistimewaan dari Zelan Bakery n Cake.',
 'uploads/voice/d1d410ef-502e-4ebb-b6e2-747b273b5fa2.aac',
 115000, '115K / Box', NULL, FALSE, 5),

(2, 'Semprong Lipat', 'semprong-lipat',
 'Kue semprong renyah yang dilipat cantik.',
 'Semprong lipat dibuat tipis dan dilipat dengan presisi, kemudian dipanggang hingga kering sempurna sampai menghasilkan tekstur yang renyah. Aroma butter yang harum berpadu dengan rasa manis lembut, menciptakan camilan klasik yang memanjakan lidah. Pesan sekarang, dan hadirkan keistimewaan dari Zelan Bakery n Cake.',
 'uploads/voice/fdffd073-8014-46b0-abc4-2f3ebc3b6422.aac',
 14000, '14K/Box(6pcs)', NULL, FALSE, 6),

(2, 'Sagu Keju', 'sagu-keju',
 'Kue sagu keju yang lumer di mulut.',
 'Kue sagu keju dengan gigitan ringan yang langsung menyatu di mulut, menghadirkan rasa gurih dari keju berkualitas. Dibuat dengan komposisi yang pas untuk menghasilkan sensasi makan yang tidak berat namun tetap memuaskan. Pesan sekarang, dan hadirkan keistimewaan dari Zelan Bakery n Cake',
 'uploads/voice/418bb331-8f08-4ce8-930f-f4ece1b5f65e.aac',
 115000, '115K', NULL, FALSE, 7),

(2, 'Thumbprint', 'thumbprint',
 'Kue thumbprint dengan selai premium.',
 'Kue kering renyah dengan isian selai stroberi segar yang manis dan harum di setiap gigitan. Camilan praktis yang pas untuk dinikmati kapan saja. Pesan sekarang, dan hadirkan keistimewaan dari Zelan Bakery n Cake.',
 'uploads/voice/b0061de5-a83a-4e3e-b847-86d758f6b841.aac',
 70000, '70K', NULL, FALSE, 8)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- =============================================
-- Insert Pastry Items (4 items)
-- =============================================
INSERT INTO menu_items (category_id, name, slug, description, voice_description, voice_file, price, price_display, tag, is_featured, display_order) VALUES
(3, 'Kue Sus', 'kue-sus',
 'Kue sus dengan vla vanilla yang creamy.',
 'Kue sus dengan kulit yang renyah dipadukan isian krim vanila lembut yang meleleh di mulut. Memberikan kombinasi manis yang seimbang dan aroma menggoda di setiap potongan. Camilan elegan yang pas untuk dinikmati sendiri atau dibagikan saat momen spesial. Pesan sekarang, dan hadirkan keistimewaan dari Zelan Bakery n Cake',
 'uploads/voice/d8f2ef4b-038c-4cff-b02c-bf29f5ddcd5c.aac',
 15000, '15K', NULL, FALSE, 1),

(3, 'Bolen Klasik', 'bolen-klasik',
 'Bolen pisang atau keju dengan kulit berlapis.',
 'Bolen klasik dengan pastry tipis dan lapisan renyah, dipadukan dengan isian manis pilihan seperti pisang, cokelat lembut, atau keju gurih. Setiap gigitan menghadirkan aroma panggang yang harum dan rasa yang seimbang, menciptakan pengalaman camilan klasik yang selalu dinanti. Pesan sekarang, dan hadirkan keistimewaan dari Zelan Bakery n Cake.',
 'uploads/voice/19cc8f63-7e37-4f44-b415-f23964360fb0.aac',
 8000, '8K', 'Signature', FALSE, 2),

(3, 'Bolen Lilit', 'bolen-lilit',
 'Bolen dengan bentuk lilit yang unik.',
 'Bolen lilit dengan pastry yang digulung berlapis-lapis, menciptakan tekstur renyah di luar dan lembut di setiap lapisan. Camilan istimewa yang menarik perhatian, cocok dinikmati kapan saja. Pesan sekarang, dan hadirkan keistimewaan dari Zelan Bakery n Cake.',
 'uploads/voice/ec79d00d-a7ad-487b-9f6e-3057bfd255dd.aac',
 45000, '45K', NULL, FALSE, 3),

(3, 'Pia', 'pia',
 'Pia dengan berbagai isian premium.',
 'Pia premium dengan kulit tipis dan lembut, dipenuhi isian kaya rasa yang meleleh di mulut. Tersedia dalam dua varian rasa: cokelat yang manis legit, dan keju gurih yang creamy. Pesan sekarang, dan hadirkan keistimewaan dari Zelan Bakery n Cake.',
 'uploads/voice/5b1dc825-5ec6-4091-9f5a-adcce97fcd5d.aac',
 15000, '15K', 'best', FALSE, 4)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- =============================================
-- Insert Zelan Bakery Info
-- =============================================
INSERT INTO restaurant_info (setting_key, setting_value) VALUES
('name', 'Zelan Bakery & Cake'),
('tagline', 'Freshly Baked with Love'),
('about', 'Zelan Bakery and Cake lahir dari kecintaan terhadap dunia baking dan keinginan untuk menghadirkan produk berkualitas yang dapat dinikmati bersama keluarga. Didirikan pada 19 Juni 2023 oleh Lana Aristya dan Zen, Zelan hadir di Bali dengan komitmen pada rasa, kualitas, dan kehangatan dalam setiap produk.'),
('address', 'Jl. Bung Tomo VII No. 5, Pemecutan Kaja, Denpasar Utara, Bali'),
('phone', '0895385455669'),
('whatsapp', '62895385455669'),
('email', 'zelanbakeryncake@gmail.com'),
('instagram', 'https://www.instagram.com/zelanbakeryncake'),
('tiktok', 'https://www.tiktok.com/@zelanbakeryncake'),
('hours', '08:00 - 20:00'),
('founded', '19 Juni 2023'),
('founders', 'Lana Aristya & Zen')
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);

-- =============================================
-- Insert Default Specials for Bakery
-- =============================================
INSERT INTO specials (title, description, time_period, icon, display_order) VALUES
('Promo Hampers', 'Paket hampers spesial untuk hari raya dan momen istimewa. Custom sesuai keinginan!', 'Sepanjang Tahun', 'gift', 1),
('Fresh from Oven', 'Roti dan pastry fresh setiap pagi. Pre-order untuk memastikan ketersediaan!', 'Setiap Hari', 'clock', 2),
('Paket Arisan', 'Diskon spesial untuk pesanan arisan dan acara kantor. Hubungi kami untuk info!', 'Min. Order 50pcs', 'users', 3),
('Custom Cake', 'Terima pesanan kue ulang tahun dan kue custom untuk acara spesial Anda.', 'H-3 Pemesanan', 'cake', 4)
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- =============================================
-- Insert Default FAQs
-- =============================================
INSERT INTO faqs (question, answer, display_order) VALUES
('Apa itu Zelan Bakey and Cake?', 'Zelan Bakery and Cake merupakan salah satu brand terpercaya masyarakat Bali yang menyajikan beragam pilihan roti dan kue berkualitas tinggi serta diproduksi secara segar dan sempurna.', 1),
('Apakah Zelan Bakery melayani pengiriman ke luar kota?', 'Saat ini kami melayani pengiriman untuk wilayah Denpasar dan sekitarnya guna menjaga kesegaran dan kualitas produk kami tetap optimal saat sampai di tangan pelanggan.', 2),
('Bagaimana cara menyimpan produk pastry agar tetap renyah?', 'Kami merekomendasikan penyimpanan dalam wadah kedap udara di suhu ruang untuk konsumsi hari yang sama, atau disimpan di lemari es dan dipanaskan kembali menggunakan oven selama 2-3 menit sebelum dinikmati.', 3),
('Bagaimana jika produk yang saya terima mengalami kerusakan saat pengiriman?', 'Kami menjamin keamanan pengemasan; namun, jika terjadi kerusakan, harap segera mengambil foto produk dan menghubungi kami dalam waktu maksimal 1 jam setelah produk diterima untuk proses penggantian.', 4)
ON DUPLICATE KEY UPDATE question = VALUES(question);

-- =============================================
-- Insert Default Admin User
-- Password: admin123 (hashed with bcrypt)
-- IMPORTANT: Run 'npm run setup-admin' after database setup
-- Or change password after first login!
-- =============================================
-- The hash below is for password: admin123
INSERT INTO users (username, password, name, role) VALUES
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMye.IYH.1l8.E1fqLWvS3.dJ5HqF5cqV5O', 'Administrator', 'admin')
ON DUPLICATE KEY UPDATE username = VALUES(username);
