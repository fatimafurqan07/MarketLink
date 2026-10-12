# MarketLink — eGreen Basket
### Hyperlocal Mandi Pre-Order & Physical Stall Collection Platform

MarketLink is a production-grade, hyperlocal digital marketplace connecting smallholder farmers directly with household consumers and market patrons. Instead of speculative delivery or middleman markups (Arthi system), MarketLink coordinates **Rs. 0 advance pre-orders** with physical inspection at the farmer's Mandi stall and direct cash settlement upon collection.

---

## 🌟 MarketLink — Additional Features Beyond SRS Baseline

This section details the enhancements and high-impact features implemented on top of the baseline Software Requirements Specification (SRS), along with their practical rationale:

### 1. Multi-Language Support (English ⇄ Urdu)
* **What:** Full app-wide language toggle with RTL (Right-to-Left) layout support and authentic Urdu typography (Noto Sans Arabic font).
* **Why:** Local farmers and buyers in Pakistan are often more comfortable in Urdu; improves accessibility, inclusivity, and usability for non-English-speaking users.

### 2. Multi-Country Support
* **What:** Country-aware configuration (Pakistan / India / USA) — dynamic local currency (`PKR` / `INR` / `USD`), regional national ID formats (CNIC `42101-xxxxxxx-x` / Aadhaar `xxxx-xxxx-xxxx` / Business Registration ID), localized mandi terminology, and country-specific sample markets. First-time visitors are welcomed with a country selector modal.
* **Why:** Makes the platform scalable beyond one country and demonstrates real-world localization and internationalization handling.

### 3. Cascading Location Selector (Country → Province/State → City)
* **What:** Real geographic dropdown data powered by comprehensive location datasets so farmers and buyers select their exact jurisdiction, featuring nearest-market fallback using geospatial distance calculations (Haversine formula) if no market exists in their exact city.
* **Why:** Improves data accuracy and matches real-world address selection instead of prone-to-error free-text location entry.

### 4. PDF Invoice / Receipt Generation
* **What:** Buyers and vendors can instantly generate and download client-side formatted PDF receipts for any completed or verified order (itemized breakdown, quantities, stall number, timestamps, and total).
* **Why:** Gives customers an authentic proof-of-purchase document for accounting and record-keeping, matching modern e-commerce standards.

### 5. WhatsApp Order Sharing
* **What:** One-tap sharing of order summaries directly via WhatsApp using native `wa.me` deep links (no paid 3rd-party API required).
* **Why:** WhatsApp is the predominant everyday communication channel locally; allows buyers to easily share pickup details with family members or drivers, and enables farmers to confirm reservations rapidly.

### 6. Price Trend Analytics (Charts)
* **What:** Interactive visual price-trend and market fluctuation graphs for produce items using Recharts.
* **Why:** Empowers buyers and farmers to understand seasonal pricing patterns over time and make data-driven buying and harvesting decisions.

### 7. Farmer Weather Widget
* **What:** Live local weather display on the farmer dashboard with temperature, humidity, wind speed, and precipitation alerts using the free Open-Meteo API (no API key required).
* **Why:** Weather conditions directly dictate harvesting, drying, transport, and Mandi arrival times — an indispensable, practical utility for agricultural producers.

### 8. Admin Excel/CSV Export
* **What:** Administrators can export comprehensive audit reports, order ledgers, and registered user lists directly to standard Excel/CSV format.
* **Why:** Facilitates offline analysis, governmental reporting, tax compliance, and sharing with cooperatives or regulatory stakeholders.

### 9. Interactive Map for Market Locations
* **What:** Live interactive geospatial map showing Mandi markets and stall locations using Leaflet with Esri World Street Map tiles (free, open, no proprietary API keys required).
* **Why:** Lets patrons and growers visually identify the nearest Mandi hub, gate entrances, and parking points rather than navigating static text addresses.

### 10. Background Video Hero Section
* **What:** Homepage hero section featuring a high-definition, looping visual background of authentic farm-fresh markets.
* **Why:** Establishes a professional, modern, and engaging first impression for visitors, communicating the vibrancy of direct-from-farm produce.

---

## 📋 Core SRS Baseline Architecture

MarketLink fulfills all core SRS functional requirements:
1. **Three-Tier Role-Based Access Control (RBAC):**
   * **SuperAdmin (`admin`):** Platform governance, farmer verification approvals, stall assignment, market creation, user suspension, and global audit metrics.
   * **Farmer / Grower (`farmer`):** Harvest inventory management, daily crop stock updates, cutoff window configuration, QR stall scanner, and customer code verification.
   * **Customer / Patron (`customer`):** Produce browsing, smart filters, Rs. 0 reservation passes, order history, favorite growers, and digital passes.
2. **4-Digit Verification Codes & QR Pickup Passes:** Cryptographically verified handshakes ensuring stock is only deducted when the customer inspects produce and hands over cash.
3. **Agro-Copilot:** Multilingual AI assistant powered by `@google/genai` (Gemini Pro) answering queries regarding Mandi rates, seasonality, crop preservation, and stall logistics.
4. **Persistent Real Database:** Connected to MongoDB with Mongoose schemas for Users, Markets, Products, Orders, Categories, Reviews, Favorites, Announcements, and Notifications.

---

## 🔑 Demo Login Credentials

The database auto-seeds these verified accounts on launch:

| Role | Name | Email | Password |
| :--- | :--- | :--- | :--- |
| **SuperAdmin** | Zavi Admin | `zavi@marketlink.com` | `1111` |
| **Farmer** | Shanti Farmer | `shanti@marketlink.com` | `2222` |
| **Customer** | SL Customer | `sl@marketlink.com` | `0000` |

---

## 🛠️ Technology Stack

* **Frontend:** React 18, TypeScript, Tailwind CSS, Lucide Icons, Recharts, Leaflet, jsPDF
* **Backend:** Express.js, TypeScript (`tsx`), JSON Web Tokens (JWT), Bcrypt.js
* **Database:** MongoDB & Mongoose ORM
* **Intelligence:** Google GenAI SDK (`@google/genai`)
* **Localization:** Noto Sans Arabic, custom RTL layout engine, Country-State-City geodata

---

## 🚀 Running Locally

1. **Clone repository & install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   Create `.env` (or copy from `.env.example`):
   ```env
   PORT=3000
   JWT_SECRET=your_secure_jwt_secret
   GEMINI_API_KEY=your_gemini_api_key
   MONGODB_URI=mongodb://localhost:27017/marketlink
   ```

3. **Start the application:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.
