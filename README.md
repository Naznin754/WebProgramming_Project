# 🍽️ Restaurant OS – Waitstaff Portal

> *"Anyone can cook."* Now anyone can serve, too. 🐀👨‍🍳

Inspired by *Ratatouille*: a busy kitchen only works when the front of house runs as smoothly as the stove. This project is the front-of-house side of that idea, a web portal where waiters pick a table, take an order, track it from the kitchen to the table, clock in and out, and manage their profile.

It is a full-stack app: a multi-page HTML/CSS/JS frontend served by a **Node.js + Express** REST API, with data stored in a **SQLite** file that is created and seeded automatically on first run. No database server is needed.

---

## ✅ What has been done

- Designed the Waitstaff Portal UI (dark theme, orange accent) with 8 connected pages
- Built a REST API with Express covering tables, menu, orders, attendance, profile and stats
- Added a persistent SQLite database (`restaurant.db`) that creates its own schema and seed data on first launch
- Connected every page to the API through a shared `api.js` client, so data survives page reloads and server restarts
- Implemented the full order flow: pick a table → choose menu items → submit → track status
- Implemented clock in / clock out with shift history
- Made the server serve the frontend too, so the whole app runs from one command on one port

## ✨ Features

| Area | What it does |
| --- | --- |
| **Tables** | Grid and list views of 24 tables with live status: free, occupied or reserved |
| **New order** | Browse the menu by category, search by name, set quantities and per-item notes |
| **Orders** | Filter orders by status (in kitchen, ready, delivered) and mark them ready or served |
| **Attendance** | Clock in / clock out, with a history of past shifts |
| **Profile** | View and edit staff profile details |
| **Stats** | Table counts (total, occupied, reserved, available) and average daily orders |

## 🧰 Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | HTML, CSS, vanilla JavaScript |
| Backend | Node.js, Express, CORS, dotenv |
| Database | SQLite via Node's built-in `node:sqlite` module |

---

## ⚙️ How it works

```
Browser (HTML pages)
   │  fetch() calls through public/js/api.js
   ▼
Express server (server.js)  ──►  db.js (dbService)  ──►  restaurant.db (SQLite file)
   │
   └── also serves the HTML pages and static files
```

1. **Start-up.** `server.js` loads `db.js`, which opens `restaurant.db` (creating it if missing), creates all tables with `CREATE TABLE IF NOT EXISTS`, and inserts seed data into any table that is empty.
2. **Serving the frontend.** Express serves the HTML files from the project folder, and `/` opens `orders.html`.
3. **API calls.** Each page uses `API` helpers in `public/js/api.js` to call `/api/...` endpoints. When a page is opened straight from disk (`file://`), it points at `http://localhost:3000/api` instead.
4. **Data layer.** Route handlers in `server.js` are thin. All queries live in the `dbService` object in `db.js`.
5. **Navigation.** `public/js/nav.js` wires up the sidebar links and highlights the active page.

### Order flow

1. A waiter opens **Tables** and picks a table.
2. On **New Order** they add menu items, quantities and notes.
3. Submitting calls `POST /api/orders`. The server creates the order with status `in_kitchen`, saves the items, and marks the table `occupied`.
4. On **Orders**, the order can move from `in_kitchen` → `ready` → `served`.

### Seed data (created on first run)

- 24 tables with mixed capacities and some pre-set occupied/reserved statuses
- 8 menu items across Sushi, Mains, Small Plates and Beverages
- 4 sample orders, 4 past attendance records, a default shift and a default profile

### Database tables

`tables` · `menu_items` · `orders` · `order_items` · `attendance` · `current_shift` · `profile`

---

## 📁 Project Structure

```
.
├── server.js            # Express app, static hosting, REST routes
├── db.js                # SQLite setup, schema, seed data, dbService queries
├── package.json
├── .env.example         # Environment template (only PORT is used)
├── public/js/
│   ├── api.js           # Frontend API client
│   └── nav.js           # Sidebar navigation
├── orders.html          # My Orders (home page)
├── tables.html          # Tables overview
├── table_grid.html      # Table grid view
├── select_table.html    # Table selection
├── neworder.html        # Create a new order
├── order_submit.html    # Order confirmation
├── attendance.html      # Clock in / out
├── profile.html         # Staff profile
├── restaurant.sql       # Legacy PostgreSQL schema (not used at runtime)
└── init-db.js           # Legacy PostgreSQL initializer (not used at runtime)
```

---

## 🚀 Running it on another machine

### 1. Install the prerequisites

- **Git** (only if cloning from GitHub)
- **Node.js 22.13 or newer** (Node 24 LTS also works). Download from [nodejs.org](https://nodejs.org/).

  The app uses Node's built-in `node:sqlite` module, so an older Node will fail at start-up. Check your version:

  ```bash
  node -v
  ```

### 2. Get the code

```bash
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>
```

Or unzip the project and open a terminal inside the folder that contains `server.js`.

### 3. Install dependencies

```bash
npm install
```

`node_modules` is not included in the repo, so this step is required on every new machine.

### 4. (Optional) Configure the port

The app runs on port 3000 by default. To change it:

```bash
# macOS / Linux
cp .env.example .env

# Windows (Command Prompt)
copy .env.example .env
```

Then edit `PORT` in `.env`. The PostgreSQL lines in that file are not used and can be ignored.

### 5. Start the server

```bash
npm start
```

You should see:

```
🚀 Restaurant OS Backend Server running at http://localhost:3000
💾 SQLite persistent database connected: restaurant.db
```

A Node warning saying SQLite is experimental is normal.

For development with auto-restart on file changes:

```bash
npm run dev
```

### 6. Open it

Go to **http://localhost:3000** in your browser.

### Using it from a phone or another computer on the same Wi-Fi

The server listens on all network interfaces, so other devices can open `http://<host-machine-ip>:3000`. Find the host's IP with `ipconfig` (Windows) or `ip a` / `ifconfig` (Linux/macOS), and allow port 3000 through the firewall if the page doesn't load.

### Troubleshooting

| Problem | Fix |
| --- | --- |
| `Cannot find module 'node:sqlite'` or `ERR_UNKNOWN_BUILTIN_MODULE` | Node is too old. Install Node 22.13+ |
| `Cannot find module 'express'` | Run `npm install` |
| `EADDRINUSE: address already in use` | Another program uses the port. Change `PORT` in `.env` |
| `'cd' ... not recognized` or path errors on Windows | Wrap folder names with spaces in quotes: `cd "My Folder"` |
| Want fresh sample data | Stop the server, delete `restaurant.db`, start again |

---

## 🔌 API Reference

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/tables` | List tables with status counts |
| PATCH | `/api/tables/:id/status` | Set a table to `free`, `occupied` or `reserved` |
| GET | `/api/menu?category=&search=` | List approved menu items |
| GET | `/api/orders?filter=` | List orders (`ready`, `delivered`, `in_kitchen`) |
| GET | `/api/orders/:id` | Get one order by id or order number |
| POST | `/api/orders` | Create an order `{ tableNumber, items, notes }` |
| PATCH | `/api/orders/:id/status` | Update order status |
| GET | `/api/attendance/current` | Current shift and history |
| POST | `/api/attendance/clock-in` | Clock in |
| POST | `/api/attendance/clock-out` | Clock out and save to history |
| GET | `/api/profile` | Get profile |
| PUT | `/api/profile` | Update profile |
| GET | `/api/stats` | Table and order statistics |

All responses look like `{ "success": true, ... }` or `{ "success": false, "message": "..." }`.

---

## ⚠️ Known limitations

- **No login yet.** There is a single built-in staff member and one shared profile.
- **Clock-out hours are a placeholder.** Every saved shift is recorded as `8h 00m` instead of the real elapsed time.
- **Waiter id is hard-coded** on new orders.
- **Legacy PostgreSQL files.** `restaurant.sql` and `init-db.js` come from an earlier PostgreSQL version and are not used now. The `pg` package is still required by `db.js` until that import is removed.
- `node:sqlite` is marked experimental by Node, so its behavior may change in future versions.

## 🛣️ Roadmap

- Login and roles (admin, waiter, chef)
- Real shift-duration calculation on clock-out
- Kitchen display screen for chefs
- Billing and payment flow
- Remove the legacy PostgreSQL files

## 📄 License

Add a license of your choice (for example MIT) before publishing.
