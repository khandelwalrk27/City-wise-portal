# CityWise Jaipur - Next-Gen Civic Issue Reporting & Resolution Platform

CityWise is a connected full-stack civic resolution platform built specifically for **Nagar Nigam Greater & Heritage Jaipur**. It powers transparent civic complaint lifecycle management through automated GeoJSON point-in-polygon ward routing, department authority assignment, real-time Socket.IO notifications, side-by-side resolution proof inspection, and mandatory citizen verification.

---

## 🏛️ Jaipur Municipal Region & Official Data Integration

CityWise integrates official ward parshad representative dataset from **Nagar Nigam Greater Jaipur (पं. दीनदयाल उपाध्याय भवन, लालकोठी, टोंक रोड जयपुर)** across all 5 municipal zones:
- **Vidhyadhar Nagar Zone (Wards 1–42)** (e.g. Ward 1 Smt Dhapa Devi, Ward 15 Dr Meenakshi Sharma)
- **Jhotwara Zone (Wards 43–64)** (e.g. Ward 43 Smt Archana Sharma, Ward 60 Smt Sheel Dhabai)
- **Sanganer Zone (Wards 65–103)** (e.g. Ward 70 Shri Ramavtar Gupta, Ward 87 Mayor Smt Saumya Gurjar)
- **Bagru Zone (Wards 104–124)** (e.g. Ward 104 Shri Arun Sharma, Ward 120 Shri Chhoturam Meena)
- **Malviya Nagar Zone (Wards 125–150)** (e.g. Ward 125 Shri Ramprasad Sharma, Ward 142 Shri Himanshu Jain)

---

## ⚡ Complete Resolution Workflow

```
REPORT
  ↓
GEOLOCATE (Interactive Leaflet Map)
  ↓
IDENTIFY WARD (Point-in-Polygon GeoJSON Engine)
  ↓
ASSIGN AUTHORITY (Department Lookup: PWD Roads, PHED Water, Sanitation)
  ↓
ACT (Authority Status: IN_PROGRESS)
  ↓
SUBMIT RESOLUTION (Authority Uploads Photo/Video Proof)
  ↓
CITIZEN VERIFY (Citizen Approves or Reopens with Remarks)
  ↓
CLOSE (Verified Resolution)
```

---

## 💻 Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, React Router v6, React Leaflet (OpenStreetMap), Recharts, Socket.IO Client, Axios, Lucide Icons.
- **Backend**: Node.js, Express.js, SQLite, Socket.IO Server, JWT, bcryptjs, Multer, Turf.js (`@turf/boolean-point-in-polygon`).
- **Data & Testing**: GeoJSON Ward Polygons (`data/wards.geojson`), Native Node.js Test Runner (`node --test`).

---

## 📁 Project Structure

```
CityWIse/
│
├── frontend/
│   ├── src/
│   │   ├── components/     # Navbar, Footer, MapPicker, StatusBadge, IssueTimeline, ResolutionEvidenceViewer
│   │   ├── context/        # AuthContext, SocketContext
│   │   ├── pages/          # Landing, About, Community, PublicMap, Login, Register, Dashboards, Admin
│   │   └── services/       # Axios API client
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── backend/
│   ├── database/           # citywise.sqlite
│   ├── uploads/            # Uploaded photos & videos
│   ├── src/
│   │   ├── config/         # DB schema & tables
│   │   ├── middleware/     # Auth JWT, RBAC, Multer upload
│   │   ├── routes/         # Auth, Wards, Authorities, Categories, Issues, Incidents, Notifications, Analytics, AI, Seed
│   │   ├── services/       # Ward GeoJSON detection, Authority routing, Status Machine, Duplicate Grouping, AI Advisory
│   │   └── seed/           # Jaipur Parshad demo seeder
│   ├── server.js
│   └── package.json
│
├── data/
│   └── wards.geojson       # Official Jaipur municipal ward polygons & Parshad details
│
├── tests/
│   └── citywise.test.js    # Integration test suite
│
├── docker-compose.yml
├── README.md
├── .env.example
└── .gitignore
```

---

## 🔑 Demo Login Accounts

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Citizen** | `citizen@citywise.org` | `password123` | Rajesh Sharma (Jaipur Resident) |
| **PWD Roads Officer** | `roads@citywise.org` | `password123` | Engineer Vikram Singh |
| **PHED Water Officer** | `water@citywise.org` | `password123` | Officer Sunita Meena |
| **Nagar Nigam Sanitation** | `sanitation@citywise.org` | `password123` | Inspector Mohan Lal |
| **System Admin** | `admin@citywise.org` | `admin123` | Nagar Nigam Master Control |

---

## 🚀 Running Locally (Windows Instructions)

### 1. Backend Server Setup
```bash
cd backend
npm install
npm run seed     # Seeds SQLite database with Jaipur Parshads and issues
npm start        # Runs Express & Socket.IO server on http://localhost:5000
```

### 2. Frontend Application Setup (Open a second terminal)
```bash
cd frontend
npm install
npm run dev      # Runs Vite dev server on http://localhost:3000
```

---

## 🐳 Docker Deployment

To build and run the entire application using Docker:

```bash
docker compose up --build
```
Access Frontend at `http://localhost:3000` and Backend API at `http://localhost:5000`.

---

## 🧪 Testing

Run the automated integration test suite:

```bash
node --test tests/citywise.test.js
```
Tests cover:
- SQLite schema initialization
- GeoJSON Point-in-polygon ward detection
- Ward-to-Authority department lookup
- Status machine transition validation
- Duplicate issue spatial grouping
