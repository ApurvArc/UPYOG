# UPYOG Property Tax Analytics Dashboard

**NUDM Intern Assessment 2026**

A Property Tax Analytics Dashboard for the UPYOG multi-tenant platform — built with React + Vite, featuring live KPI cards, animated charts, AI-powered chat, and a fully responsive dark/light UI across 10 Indian city tenants.

---

## Features

- **4 Animated KPI Cards** — Total Registered, Approved, Rejected, and Collection (animated count-up, updates on city filter)
- **Tenant Filter** — 10-city chip filter + "All Cities" global view
- **3-Tab City Comparison Chart** — Collection bar, Approved/Rejected/Pending grouped bar, and Total per city (Recharts)
- **Animated Donut Chart** — Property type breakdown (Residential, Commercial, Industrial, Agricultural, Mixed Use)
- **Property Ledger** — Paginated table with search, city, status, type, and sort filters
- **Insights Page** — 3 AI-generated city signals, 3-tab distribution chart, city-wise summary table with approval rate bars
- **AI Chat Assistant** — Natural-language Q&A on the dataset; Mistral primary, Groq (LLaMA-3.3) fallback; click-outside to close
- **Dark / Light Theme** — Persistent toggle, true-black dark palette
- **No Backend Required** — All 1,000 records loaded directly from `properties.json` in React

---

## Tech Stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Framework | React 18 + Vite                         |
| Styling   | Tailwind CSS v3 (custom dark theme)     |
| Charts    | Recharts                                |
| Animation | Framer Motion                           |
| Icons     | Lucide React                            |
| AI        | Mistral AI (`mistral-small-latest`) with Groq (`llama-3.3-70b-versatile`) fallback |
| Data      | Local `properties.json` — 1,000 records |

---

## Project Structure

```
NUDM/
├── public/
│   └── favicon.png            # UPYOG logo favicon
├── src/
│   ├── assets/
│   │   ├── properties.json    # 1,000 property records (loaded directly)
│   │   └── upyog-logo.png     # UPYOG brand logo
│   ├── components/
│   │   ├── SideNav.jsx        # Sidebar navigation
│   │   ├── TopBar.jsx         # Header with search, theme, notifications
│   │   └── ChatAssistant.jsx  # Floating AI chat panel
│   ├── configs/
│   │   └── navigationConfig.js
│   ├── context/
│   │   └── AppContext.jsx     # Global state, KPIs, filters, signals
│   ├── pages/
│   │   ├── dashboard/         # Dashboard.jsx — KPI cards, charts, recent
│   │   ├── properties/        # Properties.jsx — full property ledger
│   │   ├── insights/          # Insights.jsx — signals, charts, city table
│   │   └── settings/          # Settings.jsx — profile, theme
│   ├── App.jsx                # Route definitions
│   ├── main.jsx               # Entry point
│   └── index.css              # Tailwind + theme CSS variables
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── .env                       # API keys (not committed)
├── .env.example               # API keys template
├── package.json
├── .gitignore
└── README.md
```

---

## Setup

### Prerequisites
- Node.js v18+
- Free API keys: [Mistral](https://console.mistral.ai) and/or [Groq](https://console.groq.com)

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd NUDM
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create `.env` in the project root:
```env
VITE_MISTRAL_API_KEY=your_mistral_key_here
VITE_GROQ_API_KEY=your_groq_key_here
```
> The app uses Mistral as primary AI and falls back to Groq automatically if Mistral fails.

### 4. Start the app
```bash
npm run dev
```

Open **http://localhost:5173**

> No backend server needed — the app runs entirely in the browser.

---

## Pages

| Route | Page | Description |
|---|---|---|
| `/dashboard` | Dashboard | KPI cards, city comparison chart, donut, recent properties |
| `/properties` | Property Ledger | Filterable, searchable, paginated table of all 1,000 records |
| `/insights` | Analytics | City signals, distribution charts, city summary table |
| `/settings` | Settings | Profile edit, dark/light theme toggle |

---

## AI Chat — Sample Questions

- *"Which city has the highest total collection?"*
- *"How many properties are pending in Mumbai?"*
- *"What is the approval rate in Delhi?"*
- *"Which city has the most rejected properties?"*
- *"Compare total registrations between Pune and Jaipur."*

---

## Data

- **1,000 property records** across **10 cities** (tenants): Ahmedabad, Bengaluru, Chennai, Delhi, Hyderabad, Jaipur, Kolkata, Lucknow, Mumbai, Pune
- Fields: `property_id`, `tenant`, `owner_name`, `property_type`, `ward`, `area_sqft`, `status`, `annual_tax_inr`, `collection_inr`, `registration_date`, `floor_count`, `address`
- Statuses: **Approved** (610) · **Pending** (205) · **Rejected** (185)

---

## Security Note

- API keys stored in `.env` — listed in `.gitignore`, never committed to GitHub
- AI calls are made directly from the browser using `VITE_` prefixed environment variables

---

*NUDM Intern Assessment 2026 — UPYOG Multi-Tenant Platform*
