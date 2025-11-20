# Barcamp Manager PWA

Eine Progressive Web Application zur vollständigen Organisation und Durchführung von Barcamps.

## Features

✅ **Session-Management** - Teilnehmende können Sessions vorschlagen und bearbeiten
✅ **Live-Voting-System** - Echtzeit-Abstimmungen mit WebSocket-Synchronisation
✅ **Monitor-Display** - Vollbild-Ansicht für Sessionvorstellungen
✅ **Intelligente Zeitplan-Optimierung** - Algorithmus-basierte Planung nach Votes
✅ **Offline-Fähigkeit** - Funktioniert auch ohne Internetverbindung (PWA)
✅ **Mehrsprachig** - Deutsch und Englisch
✅ **Responsive Design** - Optimiert für Mobile, Tablet und Desktop
✅ **Admin-Dashboard** - Umfassende Verwaltungs- und Analyse-Features

## Tech Stack

### Backend
- **Node.js** + **Express** + **TypeScript**
- **PostgreSQL** - Datenbank
- **WebSocket** - Echtzeit-Updates
- **pg** - PostgreSQL-Client

### Frontend
- **Vue.js 3** + **TypeScript** + **Vite**
- **Pinia** - State Management
- **Vue Router** - Routing
- **Vue I18n** - Internationalisierung
- **Axios** - HTTP-Client
- **PWA Plugin** - Service Worker & Manifest

## Voraussetzungen

- Node.js (v18 oder höher)
- PostgreSQL (v15 oder höher)
- npm oder yarn
- Docker (optional, für PostgreSQL)

## Installation

### 1. Repository klonen

```bash
git clone <repository-url>
cd barcampapp
```

### 2. Datenbank starten (mit Docker)

```bash
docker-compose up -d
```

Die PostgreSQL-Datenbank läuft dann auf `localhost:5432` mit:
- **Database:** barcamp
- **User:** barcamp
- **Password:** barcamp_dev_password

### 3. Backend einrichten

```bash
cd backend
npm install

# Umgebungsvariablen einrichten
cp .env.example .env
# .env anpassen falls nötig

# Datenbank-Migrationen ausführen
npm run db:migrate

# Testdaten einfügen (optional)
npm run db:seed
```

### 4. Frontend einrichten

```bash
cd ../frontend
npm install
```

## Entwicklung

### Backend starten

```bash
cd backend
npm run dev
```

Der Backend-Server läuft auf:
- **HTTP API:** http://localhost:3000
- **WebSocket:** ws://localhost:3001

### Frontend starten

```bash
cd frontend
npm run dev
```

Die Anwendung ist erreichbar unter: **http://localhost:5173**

## Produktions-Build

### Backend

```bash
cd backend
npm run build
npm start
```

### Frontend

```bash
cd frontend
npm run build
# Die Build-Dateien befinden sich in dist/
```

Für Hosting empfohlen:
- **Backend:** Render, Railway, Fly.io
- **Frontend:** Vercel, Netlify, Cloudflare Pages
- **Datenbank:** Supabase, Neon, Railway

## API-Endpoints

### Events
- `GET /api/events` - Alle Events abrufen
- `GET /api/events/:id` - Event abrufen
- `POST /api/events` - Event erstellen
- `PATCH /api/events/:id/status` - Event-Status ändern

### Sessions
- `GET /api/events/:eventId/sessions` - Alle Sessions eines Events
- `POST /api/events/:eventId/sessions` - Session erstellen
- `PUT /api/sessions/:id` - Session aktualisieren
- `DELETE /api/sessions/:id` - Session löschen

### Voting
- `POST /api/sessions/:id/vote` - Vote abgeben
- `DELETE /api/sessions/:id/vote` - Vote entfernen

### Schedule
- `POST /api/events/:eventId/schedule/optimize` - Zeitplan optimieren
- `POST /api/events/:eventId/schedule/publish` - Zeitplan veröffentlichen
- `DELETE /api/events/:eventId/schedule` - Zeitplan löschen

### Rooms & Time Slots
- `GET /api/events/:eventId/rooms` - Räume abrufen
- `POST /api/events/:eventId/rooms` - Raum erstellen
- `GET /api/events/:eventId/time-slots` - Zeitslots abrufen
- `POST /api/events/:eventId/time-slots` - Zeitslot erstellen

## WebSocket-Events

Der WebSocket-Server sendet folgende Events:

- `session:new` - Neue Session erstellt
- `session:updated` - Session aktualisiert
- `session:deleted` - Session gelöscht
- `votes:updated` - Vote-Count aktualisiert
- `schedule:published` - Zeitplan veröffentlicht
- `event:status_changed` - Event-Status geändert

## Verwendung

### 1. Event erstellen (Admin)

1. Navigiere zu `/admin`
2. Erstelle ein Event mit Datum und Name
3. Füge Räume hinzu (Name, Kapazität, Infrastruktur)
4. Füge Zeitslots hinzu (Start- und Endzeit)

### 2. Sessions einreichen (Teilnehmende)

1. Navigiere zu `/sessions`
2. Klicke auf "+" Button
3. Fülle Formular aus:
   - Titel
   - Beschreibung
   - Vortragende
   - Dauer (30/45/60 Min)
   - Benötigte Infrastruktur
4. Session einreichen

### 3. Voting (Teilnehmende)

1. Navigiere zu `/sessions`
2. Klicke auf das Herz-Symbol bei interessanten Sessions
3. Votes werden in Echtzeit synchronisiert

### 4. Zeitplan optimieren (Admin)

1. Navigiere zu `/admin`
2. Klicke auf "Zeitplan optimieren"
3. Prüfe Metriken (Zufriedenheit, Konflikte, Auslastung)
4. Veröffentliche den Zeitplan

### 5. Monitor-Display (Sessionvorstellung)

1. Navigiere zu `/monitor`
2. Wähle Session aus der Liste
3. Zeige Vollbild-Ansicht auf Beamer
4. Teilnehmende können währenddessen voten
5. Votes werden live aktualisiert

## Projektstruktur

```
barcampapp/
├── backend/
│   ├── src/
│   │   ├── config/          # Konfiguration (Datenbank)
│   │   ├── controllers/     # Request-Handler
│   │   ├── db/              # Migrationen & Seeds
│   │   ├── routes/          # API-Routen
│   │   ├── services/        # Business-Logik
│   │   ├── types/           # TypeScript-Typen
│   │   └── index.ts         # Einstiegspunkt
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── public/              # Statische Assets
│   ├── src/
│   │   ├── assets/          # CSS, Bilder
│   │   ├── components/      # Vue-Komponenten
│   │   ├── i18n/            # Übersetzungen
│   │   ├── router/          # Vue Router
│   │   ├── services/        # API & WebSocket
│   │   ├── stores/          # Pinia Stores
│   │   ├── types/           # TypeScript-Typen
│   │   ├── views/           # Vue-Views
│   │   ├── App.vue          # Root-Komponente
│   │   └── main.ts          # Einstiegspunkt
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml       # PostgreSQL Container
└── README.md
```

## Datenbank-Schema

![Database Schema](docs/schema.png)

Haupttabellen:
- `events` - Barcamp-Events
- `sessions` - Vorgeschlagene Sessions
- `votes` - Teilnehmer-Votes
- `rooms` - Verfügbare Räume
- `time_slots` - Zeitfenster
- `schedules` - Zuordnung Session → Raum → Zeitslot

## Optimierungsalgorithmus

Der Zeitplan-Optimierer verwendet einen **Greedy-Algorithmus**:

1. Sessions nach Vote-Count sortieren (absteigend)
2. Für jede Session:
   - Finde passenden Raum mit verfügbarer Infrastruktur
   - Finde freien Zeitslot
   - Weise Session zu

Ziele:
- **Maximiere** Anzahl erfüllter Votes
- **Minimiere** Konflikte (nicht eingeplante Sessions)
- **Optimiere** Raum-Auslastung

Für größere Events kann ein fortgeschrittener CSP-Solver implementiert werden.

## PWA-Features

Die App ist als Progressive Web App implementiert:

- ✅ **Installierbar** - "Zum Homescreen hinzufügen"
- ✅ **Offline-fähig** - Service Worker cacht Assets
- ✅ **Responsive** - Mobile-First-Design
- ✅ **Fast** - Vite-Optimierung, Code-Splitting

## Umgebungsvariablen

### Backend (.env)

```env
PORT=3000
WS_PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=barcamp
DB_USER=barcamp
DB_PASSWORD=barcamp_dev_password
JWT_SECRET=your-secret-key
CORS_ORIGINS=http://localhost:5173
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=ws://localhost:3001
```

## Lizenz

MIT

## Kontakt

Bei Fragen oder Problemen, bitte ein Issue erstellen.

---

**Entwickelt gemäß arc42-Architekturtemplate**
