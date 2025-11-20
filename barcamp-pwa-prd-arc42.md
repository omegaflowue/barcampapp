# Barcamp Manager PWA - Product Requirements Document

**Nach arc42-Architekturtemplate**

Version: 1.0  
Datum: 20. November 2025  
Status: Entwurf

---

## 1. Einführung und Ziele

### 1.1 Aufgabenstellung

Die Barcamp Manager PWA ist eine Progressive Web Application zur vollständigen Organisation und Durchführung von Barcamps. Sie ermöglicht es Teilnehmenden, Sessions vorzuschlagen, ihre Interessen zu bekunden und dem Veranstalter, optimale Session-Zeitpläne zu erstellen, die Teilnehmerwünschen maximal entsprechen.

**Kernproblem:** Bei Barcamps mit vielen parallelen Sessions ist es schwierig, einen Zeitplan zu erstellen, der möglichst vielen Teilnehmenden erlaubt, an ihren Wunsch-Sessions teilzunehmen.

**Lösung:** Eine kollaborative PWA mit Echtzeit-Voting und intelligenter Session-Planung.

### 1.2 Qualitätsziele

| Priorität | Qualitätsziel | Szenario |
|-----------|---------------|----------|
| 1 | **Verfügbarkeit** | Die App funktioniert auch bei schlechter Netzwerkverbindung durch Progressive Web App-Technologie |
| 2 | **Benutzerfreundlichkeit** | Neue Teilnehmende können innerhalb von 30 Sekunden eine Session erstellen |
| 3 | **Echtzeit-Synchronisation** | Votes und Session-Updates sind innerhalb von 2 Sekunden für alle sichtbar |
| 4 | **Skalierbarkeit** | Unterstützt Barcamps mit bis zu 500 Teilnehmenden gleichzeitig |
| 5 | **Gerätekompatibilität** | Funktioniert auf Smartphones, Tablets und Desktop-Monitoren |

### 1.3 Stakeholder

| Rolle | Kontakt | Erwartungshaltung |
|-------|---------|-------------------|
| **Barcamp-Veranstalter** | Admin-Nutzer | Einfache Event-Verwaltung, Übersicht aller Sessions, optimale Zeitplanung |
| **Session-Gebende** | Teilnehmende | Schnelles Einreichen von Sessions, Infrastruktur-Anforderungen angeben |
| **Teilnehmende** | Besucher | Übersicht aller Sessions, Voting für interessante Sessions |
| **Technische Leitung** | Vor-Ort-Team | Übersicht über Infrastruktur-Anforderungen pro Raum |

---

## 2. Randbedingungen

### 2.1 Technische Randbedingungen

| Randbedingung | Erläuterung |
|---------------|-------------|
| **Progressive Web App** | Muss als PWA implementiert werden (installierbar, offline-fähig, responsive) |
| **Plattformunabhängig** | Läuft in allen modernen Browsern (Chrome, Firefox, Safari, Edge) |
| **Keine native App** | Keine App-Store-Installation erforderlich |
| **Echtzeit-Updates** | WebSocket oder Server-Sent Events für Live-Synchronisation |
| **Responsives Design** | Mobile-First-Ansatz, skaliert bis zu großen Monitoren |

### 2.2 Organisatorische Randbedingungen

| Randbedingung | Erläuterung |
|---------------|-------------|
| **Open Source** | Empfohlene Lizenzierung als Open-Source-Projekt |
| **Datenschutz** | DSGVO-konform, minimale Datenspeicherung |
| **Keine Login-Pflicht für Teilnehmende** | Niedrige Einstiegshürde durch optionale Authentifizierung |

### 2.3 Konventionen

- **Barrierefreiheit:** WCAG 2.1 Level AA
- **Mehrsprachigkeit:** Mindestens Deutsch und Englisch
- **Code-Qualität:** ESLint, TypeScript, Testabdeckung >80%

---

## 3. Kontextabgrenzung

### 3.1 Fachlicher Kontext

```
┌─────────────────┐
│  Teilnehmende   │
│  (Session-      │
│   Gebende)      │
└────────┬────────┘
         │
         │ Session erstellen
         │ Infrastruktur wählen
         │ Votes abgeben
         │
         ▼
┌─────────────────────────────┐
│   Barcamp Manager PWA       │
│                             │
│  - Session-Verwaltung       │
│  - Voting-System            │
│  - Zeitplan-Optimierung     │
│  - Monitor-Display          │
└──────────┬──────────────────┘
           │
           │ Admin-Zugriff
           │ Monitor-Steuerung
           │ Zeitplan erstellen
           │
           ▼
    ┌──────────────┐
    │ Veranstalter │
    │   (Admin)    │
    └──────────────┘
```

**Kommunikationsbeziehungen:**

| Partner | Input | Output |
|---------|-------|--------|
| **Teilnehmende** | Session-Vorschläge, Infrastruktur-Anforderungen, Votes | Session-Übersicht, Zeitplan, Live-Updates |
| **Veranstalter** | Event-Konfiguration, Raum-Setup, Zeitslot-Freigabe | Optimierungsvorschläge, Konflikt-Warnungen, Monitor-Ansicht |
| **Monitor/Beamer** | - | Live-Display der aktuellen Sessions mit allen Details |

### 3.2 Technischer Kontext

```
┌──────────────┐
│   Browser    │
│  (PWA Client)│
└──────┬───────┘
       │ HTTPS
       │ WebSocket
       ▼
┌─────────────────┐
│  Web Server     │
│  (Node.js/Deno) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Datenbank     │
│ (PostgreSQL/    │
│  SQLite)        │
└─────────────────┘
```

**Technologie-Stack:**

- **Frontend:** React/Vue.js + PWA-APIs (Service Worker, Cache API)
- **Backend:** Node.js/Deno mit WebSocket-Support
- **Datenbank:** PostgreSQL oder SQLite für kleinere Events
- **Echtzeit:** WebSocket oder Server-Sent Events
- **Hosting:** Cloud-Platform (Vercel, Netlify) oder Self-Hosted

---

## 4. Lösungsstrategie

### 4.1 Technologieentscheidungen

| Entscheidung | Begründung |
|--------------|------------|
| **Progressive Web App** | Plattformunabhängig, keine Installation nötig, offline-fähig |
| **WebSocket-Verbindung** | Echtzeit-Updates für Votes und Sessions ohne Page-Reload |
| **Service Worker** | Offline-Fähigkeit, schnelle Ladezeiten durch Caching |
| **Responsive Design** | Ein Codebase für alle Geräte (Handy bis Monitor) |
| **Constraint Satisfaction** | Algorithmus zur optimalen Session-Planung basierend auf Votes |

### 4.2 Top-Level-Zerlegung

**Schichtenmodell:**

1. **Präsentationsschicht:** PWA-Client (React/Vue)
2. **Geschäftslogikschicht:** REST-API + WebSocket-Server
3. **Datenschicht:** Datenbank + Cache

### 4.3 Entscheidungsrelevante Qualitätsziele

**Benutzerfreundlichkeit:** Mobile-First-Design, intuitive Bedienung  
**Performance:** Optimistisches UI-Update, Service Worker Caching  
**Verfügbarkeit:** Offline-Fähigkeit für Kernfunktionen  

---

## 5. Bausteinsicht

### 5.1 Whitebox Gesamtsystem

```
┌─────────────────────────────────────────────┐
│         Barcamp Manager PWA                 │
├─────────────────────────────────────────────┤
│                                             │
│  ┌──────────────┐  ┌──────────────┐       │
│  │  PWA Client  │  │ Admin Client │       │
│  └──────┬───────┘  └──────┬───────┘       │
│         │                 │                 │
│         └─────────┬───────┘                 │
│                   │                         │
│         ┌─────────▼─────────┐              │
│         │   API Gateway     │              │
│         └─────────┬─────────┘              │
│                   │                         │
│         ┌─────────┴─────────┐              │
│         │                   │              │
│    ┌────▼─────┐      ┌──────▼──────┐      │
│    │ Session  │      │   Voting    │      │
│    │ Manager  │      │   Engine    │      │
│    └────┬─────┘      └──────┬──────┘      │
│         │                   │              │
│         └─────────┬─────────┘              │
│                   │                         │
│         ┌─────────▼─────────┐              │
│         │    Scheduler      │              │
│         │  (Optimierung)    │              │
│         └─────────┬─────────┘              │
│                   │                         │
│         ┌─────────▼─────────┐              │
│         │   Data Layer      │              │
│         └───────────────────┘              │
│                                             │
└─────────────────────────────────────────────┘
```

### 5.2 Ebene 1 - Hauptkomponenten

#### 5.2.1 PWA Client

**Zweck:** Benutzeroberfläche für Teilnehmende

**Verantwortlichkeiten:**
- Session-Erstellung und -Bearbeitung
- Voting-Interface
- Anzeige des Zeitplans
- Offline-Funktionalität

**Schnittstellen:**
- REST-API für CRUD-Operationen
- WebSocket für Echtzeit-Updates

**Technologien:**
- React/Vue.js
- Service Worker
- IndexedDB für lokale Datenspeicherung

#### 5.2.2 Admin Client

**Zweck:** Verwaltungsoberfläche und Monitor-Display

**Verantwortlichkeiten:**
- Event-Konfiguration (Räume, Zeitslots)
- Monitor-Vollbildansicht für Sessionvorstellungen
- Freigabe und Optimierung des Zeitplans
- Übersicht Infrastruktur-Anforderungen

**Schnittstellen:**
- Admin-REST-API (mit Authentifizierung)
- WebSocket für Live-Monitor

#### 5.2.3 Session Manager

**Zweck:** Verwaltung aller Sessions

**Verantwortlichkeiten:**
- CRUD-Operationen für Sessions
- Infrastruktur-Requirements tracking
- Session-Status-Management
- Validierung von Session-Daten

**Datenmodell:**
```typescript
interface Session {
  id: string;
  title: string;
  description: string;
  presenter: string;
  duration: number; // Minuten
  infrastructure: Infrastructure[];
  voteCount: number;
  scheduledSlot?: TimeSlot;
}

interface Infrastructure {
  type: 'BEAMER' | 'FLIPCHART' | 'WHITEBOARD' | 'MODERATION_KIT';
  required: boolean;
}
```

#### 5.2.4 Voting Engine

**Zweck:** Verarbeitung von Teilnehmer-Votes

**Verantwortlichkeiten:**
- Vote-Erfassung und -Aggregation
- Echtzeit-Broadcasting von Vote-Änderungen
- Verhinderung von Mehrfach-Votes (optional per Session/User)

**Algorithmus:**
- Simple Counter pro Session
- Optional: Weighted Voting (Teilnehmende können Prioritäten setzen)

#### 5.2.5 Scheduler (Optimierungs-Engine)

**Zweck:** Optimale Zeitplanerstellung

**Verantwortlichkeiten:**
- Constraint-basierte Optimierung
- Maximierung der Teilnehmerzufriedenheit
- Berücksichtigung von Raum-Kapazitäten und Infrastruktur

**Algorithmus-Ansatz:**
```
Zielfunktion: 
  Maximiere Σ (Votes für Session × Teilnahme-Möglichkeit)

Nebenbedingungen:
  - Eine Session pro Zeitslot und Raum
  - Infrastruktur-Verfügbarkeit pro Raum
  - Mindest-/Maximal-Teilnehmerzahl pro Session
  - Keine parallelen Sessions mit hoher Vote-Überschneidung
```

**Technologien:**
- Constraint Satisfaction Problem (CSP) Solver
- Heuristische Algorithmen (z.B. Simulated Annealing)
- Greedy-Algorithmus als Fallback

---

## 6. Laufzeitsicht

### 6.1 Session-Erstellung (Standard-Flow)

```
Teilnehmer    PWA Client    API Gateway    Session Manager    WebSocket    Andere Clients
    |             |              |                |               |               |
    |---Session---|              |                |               |               |
    |  erstellen  |              |                |               |               |
    |             |              |                |               |               |
    |             |--POST /api---|                |               |               |
    |             | /sessions    |                |               |               |
    |             |              |                |               |               |
    |             |              |--validate----->|               |               |
    |             |              |                |               |               |
    |             |              |<--save DB------|               |               |
    |             |              |                |               |               |
    |             |<---201-------|                |               |               |
    |             | Created      |                |               |               |
    |             |              |                |               |               |
    |             |              |--broadcast-----|-------------->|               |
    |             |              |                |               |---update----->|
    |<--Session---|              |                |               |               |
    |   anzeigen  |              |                |               |               |
```

**Schritte:**
1. Teilnehmer füllt Session-Formular aus (Titel, Beschreibung, Infrastruktur)
2. PWA Client validiert Eingaben lokal
3. POST-Request an API Gateway
4. Session Manager speichert Session in Datenbank
5. WebSocket broadcast an alle verbundenen Clients
6. Alle Clients aktualisieren ihre Session-Liste in Echtzeit

### 6.2 Voting-Prozess

```
Teilnehmer    PWA Client    Voting Engine    WebSocket    Monitor
    |             |              |               |            |
    |---Vote------|              |               |            |
    | abgeben für |              |               |            |
    | Session X   |              |               |            |
    |             |              |               |            |
    |             |--POST /api---|               |            |
    |             | /votes       |               |            |
    |             |              |               |            |
    |             |              |--increment--->|            |
    |             |              |  voteCount    |            |
    |             |              |               |            |
    |             |<---OK--------|               |            |
    |             |              |               |            |
    |             |              |--broadcast----|            |
    |             |              |  new count    |            |
    |             |              |               |---update-->|
    |             |              |               |  Session X |
    |             |              |               | Votes: 23  |
```

**Optimistisches UI-Update:**
- Client zeigt sofort neue Vote-Zahl an
- Bei Fehler: Rollback und Error-Anzeige

### 6.3 Monitor-Display während Sessionvorstellung

```
Session-       Admin         API           WebSocket      Monitor
Gebender      Client        Gateway                       Display
    |            |             |                |            |
    |            |--Request----|                |            |
    |            | "Show       |                |            |
    |            | Session X"  |                |            |
    |            |             |                |            |
    |            |             |--broadcast-----|            |
    |            |             |  session data  |            |
    |            |             |                |            |
    |            |             |                |---render-->|
    |            |             |                |            |
    |            |             |                |  Session X |
    |            |             |                |  [BEAMER]  |
    |            |             |                |  [FLIPCHART]|
    |            |             |                |            |
    |--präsentiert--|          |                |            |
    |  Session      |          |                |            |
    |               |          |                |            |
Teilnehmer voten per App...   |                |            |
    |               |          |                |            |
    |               |          |----votes-------|            |
    |               |          |   update       |            |
    |               |          |                |---update-->|
    |               |          |                |  Votes: 42 |
```

**Monitor-Features:**
- Vollbild-Ansicht
- Große, lesbare Schrift
- Live-Vote-Counter
- Infrastruktur-Icons prominent
- Timer für Session-Vorstellung

### 6.4 Zeitplan-Optimierung

```
Admin       Admin Client    Scheduler      Session Manager    Database
  |              |              |                  |              |
  |--Klick-------|              |                  |              |
  | "Optimiere"  |              |                  |              |
  |              |              |                  |              |
  |              |--POST /api---|                  |              |
  |              | /schedule/   |                  |              |
  |              | optimize     |                  |              |
  |              |              |                  |              |
  |              |              |--load sessions-->|              |
  |              |              |  with votes      |              |
  |              |              |                  |              |
  |              |              |                  |--query------>|
  |              |              |                  |              |
  |              |              |<--sessions-------|              |
  |              |              |  + votes         |              |
  |              |              |                  |              |
  |              |              |--run CSP-------->|              |
  |              |              |  algorithm       |              |
  |              |              |                  |              |
  |              |              |<--optimal--------|              |
  |              |              |  schedule        |              |
  |              |              |                  |              |
  |              |<--schedule---|                  |              |
  |              |  proposal    |                  |              |
  |              |              |                  |              |
  |<--Anzeige----|              |                  |              |
  | mit Konflikten              |                  |              |
  | und Metriken |              |                  |              |
  |              |              |                  |              |
  |--Approve-----|              |                  |              |
  |              |              |                  |              |
  |              |--publish-----|----------------->|------------->|
  |              | schedule     |                  |              |
```

**Optimierungs-Kriterien:**
1. **Hauptziel:** Maximale Anzahl erfüllter Votes
2. **Nebenziele:**
   - Minimierung von Vote-Konflikten (User wollen in >1 Session gleichzeitig)
   - Gleichmäßige Raum-Auslastung
   - Infrastruktur-Verfügbarkeit
3. **Hard Constraints:**
   - Raumkapazität nicht überschreiten
   - Infrastruktur muss verfügbar sein
   - Keine Session-Überlappungen

---

## 7. Verteilungssicht

### 7.1 Infrastruktur-Übersicht

```
┌─────────────────────────────────────────────────┐
│              Internet / LAN                     │
└────────────────┬────────────────────────────────┘
                 │
         ┌───────┴────────┐
         │                │
    ┌────▼─────┐    ┌─────▼────┐
    │  CDN     │    │  Cloud   │
    │ (Static) │    │  Server  │
    └──────────┘    └─────┬────┘
                          │
                    ┌─────┴─────┐
                    │           │
              ┌─────▼────┐  ┌───▼──────┐
              │ Web/API  │  │ Database │
              │ Server   │  │          │
              └──────────┘  └──────────┘
                    │
         ┌──────────┴──────────┐
         │                     │
    ┌────▼─────┐         ┌────▼─────┐
    │ Handy 1  │   ...   │ Monitor  │
    │ (PWA)    │         │ (PWA)    │
    └──────────┘         └──────────┘
```

### 7.2 Deployment-Szenarien

#### Szenario 1: Cloud-Hosting (Empfohlen)

**Komponenten:**
- **CDN:** Statische Assets (HTML, CSS, JS) via Cloudflare/Vercel
- **Backend:** Node.js auf Cloud-Platform (Render, Railway, Fly.io)
- **Datenbank:** Managed PostgreSQL (Supabase, Neon)
- **WebSocket:** Integriert im Backend oder via Pusher/Ably

**Vorteile:**
- Hohe Verfügbarkeit
- Skalierbarkeit
- Einfaches Deployment

#### Szenario 2: Self-Hosted (On-Premise)

**Komponenten:**
- **Server:** Linux-Server im lokalen Netzwerk
- **Docker Container:** Web-Server + Datenbank
- **Lokales WLAN:** Alle Geräte im gleichen Netz

**Vorteile:**
- Keine Internetabhängigkeit
- Datenschutz (alles lokal)
- Keine laufenden Kosten

**Nachteile:**
- Eigene Server-Administration nötig
- Eingeschränkte Skalierbarkeit

---

## 8. Konzepte

### 8.1 Fachliche Modelle

#### Session-Lifecycle

```
┌─────────┐
│ Created │  (Session eingereicht)
└────┬────┘
     │
     ▼
┌─────────┐
│ Voting  │  (Teilnehmende voten)
└────┬────┘
     │
     ▼
┌───────────┐
│ Scheduled │  (Zeitslot zugewiesen)
└─────┬─────┘
      │
      ▼
┌────────────┐
│ In Progress│  (Session läuft)
└─────┬──────┘
      │
      ▼
┌───────────┐
│ Completed │
└───────────┘
```

#### Event-Lifecycle

```
┌────────────┐
│ Preparation│  (Admin richtet Event ein)
└──────┬─────┘
       │
       ▼
┌──────────────┐
│ Open for     │  (Teilnehmende reichen Sessions ein)
│ Submissions  │
└──────┬───────┘
       │
       ▼
┌──────────┐
│ Voting   │  (Teilnehmende voten)
└────┬─────┘
     │
     ▼
┌─────────────┐
│ Scheduling  │  (Admin optimiert Zeitplan)
└──────┬──────┘
       │
       ▼
┌──────────┐
│ Running  │  (Barcamp findet statt)
└────┬─────┘
     │
     ▼
┌──────────┐
│ Archived │
└──────────┘
```

### 8.2 Sicherheitskonzept

#### Authentifizierung

**Admin-Zugang:**
- Login mit Username/Passwort
- JWT-Token für API-Zugriff
- Session-Timeout nach Inaktivität

**Teilnehmende:**
- **Option 1:** Keine Authentifizierung (niedrige Einstiegshürde)
- **Option 2:** Magic-Link per E-Mail
- **Option 3:** OAuth (Google, GitHub)

#### Autorisierung

| Rolle | Berechtigungen |
|-------|----------------|
| **Admin** | Event-Verwaltung, Zeitplan-Freigabe, Monitor-Steuerung, alle Sessions bearbeiten |
| **Eingeloggte Teilnehmende** | Eigene Sessions bearbeiten, Voting, Zeitplan ansehen |
| **Anonyme Teilnehmende** | Sessions ansehen, Voting (mit Einschränkungen) |

#### Datenschutz

- **Minimaldaten:** Nur notwendige Daten erfassen
- **Keine Tracking-Tools** ohne explizite Zustimmung
- **Löschkonzept:** Sessions und Votes können nach Event gelöscht werden
- **DSGVO-Compliance:** Datenschutzerklärung, Cookie-Banner (falls nötig)

### 8.3 Offline-Konzept

**Service Worker Strategie:**

1. **Cache-First für statische Assets:**
   - HTML, CSS, JavaScript
   - Bilder, Icons

2. **Network-First für dynamische Daten:**
   - Session-Liste
   - Votes
   - Zeitplan

3. **Offline-Fallback:**
   - Gespeicherte Session-Daten werden angezeigt
   - Neue Sessions werden in IndexedDB gespeichert
   - Bei Reconnect: Automatische Synchronisation

**IndexedDB-Schema:**
```javascript
{
  sessions: [
    { id, title, description, ..., synced: false }
  ],
  votes: [
    { sessionId, userId, timestamp, synced: false }
  ],
  pendingActions: [
    { type: 'CREATE_SESSION', data: {...}, timestamp }
  ]
}
```

### 8.4 Benutzungsoberfläche

#### Mobile View (Teilnehmende)

**Home-Screen:**
- Tab-Navigation: "Sessions" | "Zeitplan" | "Meine Sessions"
- FAB (Floating Action Button): "+ Session erstellen"

**Session-Erstellung:**
```
┌─────────────────────────────┐
│ ← Neue Session              │
├─────────────────────────────┤
│                             │
│ Titel                       │
│ ┌─────────────────────────┐ │
│ │                         │ │
│ └─────────────────────────┘ │
│                             │
│ Beschreibung                │
│ ┌─────────────────────────┐ │
│ │                         │ │
│ │                         │ │
│ └─────────────────────────┘ │
│                             │
│ Dauer                       │
│ ○ 30 Min  ● 45 Min  ○ 60   │
│                             │
│ Benötigte Infrastruktur     │
│ ☑ Beamer                    │
│ ☐ Flipchart                 │
│ ☐ Whiteboard                │
│ ☐ Moderationskoffer         │
│                             │
│ ┌─────────────────────────┐ │
│ │   Session einreichen    │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

**Session-Liste mit Voting:**
```
┌─────────────────────────────┐
│ Alle Sessions               │
│ [Suche...]                  │
├─────────────────────────────┤
│ ┌─────────────────────────┐ │
│ │ ♥ 42  KI in der Bildung │ │
│ │       Sarah M. · 45 min │ │
│ │       🎥 Beamer         │ │
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ ♡ 23  Agile Methoden    │ │
│ │       Tom K. · 30 min   │ │
│ │       📊 Flipchart      │ │
│ └─────────────────────────┘ │
│ ...                         │
└─────────────────────────────┘
```

#### Monitor View (Admin/Beamer)

**Vollbild-Session-Vorstellung:**
```
┌─────────────────────────────────────────────┐
│                                             │
│                                             │
│    KI-GESTÜTZTE BILDUNGSTOOLS              │
│                                             │
│    Sarah Müller                             │
│                                             │
│    Dauer: 45 Minuten                        │
│                                             │
│    Benötigte Infrastruktur:                 │
│    🎥 Beamer     📊 Flipchart              │
│                                             │
│                                             │
│    ♥ 42 Stimmen                            │
│    └─────────────────────┘                 │
│    [████████████░░░░░░░]  70% Interesse    │
│                                             │
└─────────────────────────────────────────────┘
```

**Admin-Dashboard:**
```
┌─────────────────────────────────────────────┐
│ Barcamp Dashboard                           │
├─────────────────────────────────────────────┤
│ Event: DevCamp 2025 · 12.12.2025           │
│                                             │
│ Status: ⚫ Voting läuft                     │
│                                             │
│ ┌─────────────┐  ┌─────────────┐          │
│ │  24         │  │  156        │          │
│ │  Sessions   │  │  Votes      │          │
│ └─────────────┘  └─────────────┘          │
│                                             │
│ ┌───────────────────────────────────────┐  │
│ │ [⚡ Zeitplan optimieren]              │  │
│ └───────────────────────────────────────┘  │
│                                             │
│ Infrastruktur-Übersicht:                   │
│ • Beamer: 8 Sessions                       │
│ • Flipchart: 5 Sessions                    │
│ • Whiteboard: 3 Sessions                   │
│                                             │
│ Top-Sessions:                               │
│ 1. KI in der Bildung (42 Votes) 🎥        │
│ 2. Agile Methoden (38 Votes) 📊          │
│ 3. Blockchain Basics (35 Votes)            │
└─────────────────────────────────────────────┘
```

### 8.5 Internationalisierung

**Unterstützte Sprachen:**
- Deutsch (Standard)
- Englisch

**i18n-Konzept:**
- JSON-Dateien für Übersetzungen
- Browser-Sprache als Standard
- Manuelle Sprachwahl möglich

---

## 9. Architekturentscheidungen

### ADR-001: Progressive Web App statt Native App

**Status:** Akzeptiert

**Kontext:**  
Entscheidung zwischen nativer App (iOS/Android) und PWA

**Entscheidung:**  
PWA wird gewählt

**Begründung:**
- Ein Codebase für alle Plattformen
- Keine App-Store-Freigabe nötig
- Sofortiger Zugang via URL/QR-Code
- Offline-Fähigkeit durch Service Worker
- Einfacheres Deployment und Updates

**Konsequenzen:**
- ✅ Plattformunabhängig
- ✅ Niedrige Einstiegshürde
- ✅ Schnellere Entwicklung
- ❌ Eingeschränkter Zugriff auf native APIs
- ❌ Push-Notifications je nach Browser eingeschränkt

---

### ADR-002: Constraint Satisfaction für Zeitplan-Optimierung

**Status:** Akzeptiert

**Kontext:**  
Auswahl des Optimierungsalgorithmus für Session-Planung

**Entscheidung:**  
CSP (Constraint Satisfaction Problem) mit heuristischen Ansätzen

**Begründung:**
- Problem lässt sich gut als CSP modellieren
- Flexibel für verschiedene Constraints
- Gute Balance zwischen Optimalität und Performance
- Fallback auf Greedy-Algorithmus bei großen Events

**Alternativen:**
- Manuelle Planung: Zu zeitaufwendig, fehleranfällig
- Genetische Algorithmen: Zu komplex für Use Case
- Einfacher Greedy: Zu ungenaue Ergebnisse

**Konsequenzen:**
- ✅ Optimale oder nahezu optimale Lösungen
- ✅ Transparente Regeln
- ❌ Rechenaufwand steigt mit Event-Größe
- ❌ Komplexe Implementierung

---

### ADR-003: WebSocket für Echtzeit-Updates

**Status:** Akzeptiert

**Kontext:**  
Auswahl der Technologie für Echtzeit-Synchronisation

**Entscheidung:**  
WebSocket mit Fallback auf Server-Sent Events

**Begründung:**
- Bidirektionale Kommunikation
- Niedrige Latenz
- Standardisiert und gut unterstützt
- Effizienter als Polling

**Alternativen:**
- Polling: Zu hohe Server-Last
- Server-Sent Events: Nur unidirektional
- Firebase/Pusher: Vendor Lock-in, Kosten

**Konsequenzen:**
- ✅ Echtzeit-Updates für alle Clients
- ✅ Geringer Overhead
- ❌ Zusätzliche Server-Komplexität
- ❌ Reconnection-Logik nötig

---

## 10. Qualitätsanforderungen

### 10.1 Qualitätsbaum

```
Qualität
├── Funktionalität
│   ├── Session-Verwaltung (Priorität: Hoch)
│   ├── Voting-System (Priorität: Hoch)
│   └── Zeitplan-Optimierung (Priorität: Mittel)
│
├── Zuverlässigkeit
│   ├── Verfügbarkeit 99%+ (Priorität: Hoch)
│   ├── Offline-Fähigkeit (Priorität: Hoch)
│   └── Fehlertoleranz (Priorität: Mittel)
│
├── Benutzbarkeit
│   ├── Intuitive Bedienung (Priorität: Hoch)
│   ├── Mobile-First (Priorität: Hoch)
│   └── Barrierefreiheit (Priorität: Mittel)
│
├── Effizienz
│   ├── Antwortzeit <2s (Priorität: Hoch)
│   ├── Echtzeit-Updates <2s (Priorität: Mittel)
│   └── Optimierung-Laufzeit <10s (Priorität: Niedrig)
│
├── Wartbarkeit
│   ├── Modularer Aufbau (Priorität: Hoch)
│   ├── Testabdeckung >80% (Priorität: Mittel)
│   └── Dokumentation (Priorität: Mittel)
│
└── Portabilität
    ├── Browser-Kompatibilität (Priorität: Hoch)
    ├── Responsive Design (Priorität: Hoch)
    └── PWA-Standards (Priorität: Hoch)
```

### 10.2 Qualitätsszenarien

#### Szenario 1: Offline-Nutzung

**Qualitätsmerkmal:** Verfügbarkeit

**Szenario:**  
Ein Teilnehmer erstellt eine Session während er keine Internetverbindung hat (z.B. in Tiefgarage).

**Stimulus:**  
Teilnehmer füllt Session-Formular aus und klickt "Erstellen"

**Reaktion:**
1. PWA speichert Session lokal in IndexedDB
2. UI zeigt "Session wird synchronisiert sobald Verbindung besteht"
3. Bei Reconnect: Automatischer Upload
4. Success-Feedback nach erfolgreicher Synchronisation

**Messbare Kriterien:**
- Session-Erstellung funktioniert offline: 100%
- Synchronisation binnen 5 Sekunden nach Reconnect: >95%

---

#### Szenario 2: Echtzeit-Voting auf Monitor

**Qualitätsmerkmal:** Effizienz, Zuverlässigkeit

**Szenario:**  
Während Sessionvorstellung voten 20 Teilnehmende gleichzeitig für die Session.

**Stimulus:**  
20 Vote-Requests innerhalb von 2 Sekunden

**Reaktion:**
1. Votes werden aggregiert
2. WebSocket broadcast an alle Clients
3. Monitor-Display aktualisiert Vote-Counter

**Messbare Kriterien:**
- Monitor zeigt finalen Vote-Count <2 Sekunden nach letztem Vote: >99%
- Keine Vote-Verluste: 100%
- Server-Response-Time <100ms: >95%

---

#### Szenario 3: Zeitplan-Optimierung für großes Event

**Qualitätsmerkmal:** Effizienz, Funktionalität

**Szenario:**  
Barcamp mit 50 Sessions, 5 Räumen, 6 Zeitslots, 200 Teilnehmende

**Stimulus:**  
Admin klickt "Zeitplan optimieren"

**Reaktion:**
1. Scheduler lädt alle Sessions und Votes
2. CSP-Algorithmus berechnet optimalen Zeitplan
3. Ergebnis-Darstellung mit Metriken

**Messbare Kriterien:**
- Berechnung dauert <10 Sekunden: >90%
- Mindestens 80% aller Votes können berücksichtigt werden
- Keine Hard-Constraint-Verletzungen (Raum-Kapazität, Infrastruktur)

---

#### Szenario 4: Skalierbarkeit bei vielen gleichzeitigen Nutzern

**Qualitätsmerkmal:** Effizienz, Zuverlässigkeit

**Szenario:**  
500 Teilnehmende greifen gleichzeitig auf die Session-Liste zu

**Stimulus:**  
500 GET-Requests innerhalb von 30 Sekunden

**Reaktion:**
1. CDN liefert statische Assets aus
2. API-Server antwortet auf Requests
3. Datenbank liefert Session-Daten

**Messbare Kriterien:**
- Response-Time 95th percentile <1 Sekunde
- Keine 5xx-Fehler
- WebSocket-Verbindungen bleiben stabil

---

## 11. Risiken und technische Schulden

### 11.1 Risiken

| Risiko | Wahrscheinlichkeit | Auswirkung | Maßnahmen |
|--------|-------------------|------------|-----------|
| **Browser-Kompatibilität** | Mittel | Hoch | Progressive Enhancement, Feature-Detection, Polyfills |
| **Offline-Sync-Konflikte** | Mittel | Mittel | Konfliktlösungs-Strategie, Last-Write-Wins mit Warnung |
| **Schlechte Optimierungsergebnisse** | Niedrig | Hoch | Multiple Algorithmen zur Auswahl, manuelle Override-Möglichkeit |
| **Skalierungsprobleme** | Niedrig | Hoch | Load-Testing, Horizontal Scaling vorbereiten |
| **WebSocket-Verbindungsabbrüche** | Mittel | Mittel | Automatisches Reconnect, Fallback auf Polling |

### 11.2 Technische Schulden

**Bekannte Vereinfachungen:**

1. **Einfaches Voting-System:**
   - Initial: 1 Vote = 1 Stimme pro Session
   - TODO: Prioritäten-Voting (Teilnehmende verteilen Punkte)

2. **Basis-Optimierungsalgorithmus:**
   - Initial: Greedy-Ansatz
   - TODO: Fortgeschrittener CSP-Solver

3. **Keine Konfliktauflösung bei Offline-Edits:**
   - Initial: Last-Write-Wins
   - TODO: Merge-Strategie mit User-Input

4. **Keine Analytics:**
   - Initial: Keine Tracking-/Analytics-Features
   - TODO: DSGVO-konforme Analyse von Nutzungsmustern

---

## 12. Glossar

| Begriff | Definition |
|---------|------------|
| **Barcamp** | Offene Konferenz mit selbstorganisierten Sessions ("Unkonferenz") |
| **Session** | Workshop oder Vortrag bei einem Barcamp |
| **Session-Gebende** | Person, die eine Session anbietet |
| **Sessionvorstellung** | Pitch einer Session vor allen Teilnehmenden (meist morgens) |
| **Voting** | Abstimmung über Interesse an einer Session |
| **Zeitslot** | Zeitfenster für Sessions (z.B. 10:00-10:45 Uhr) |
| **Infrastruktur** | Technische Ausstattung (Beamer, Flipchart, etc.) |
| **Monitor-Display** | Großbildschirm-Ansicht für Sessionvorstellungen |
| **CSP** | Constraint Satisfaction Problem - Optimierungsproblem mit Nebenbedingungen |
| **PWA** | Progressive Web App - Web-App mit App-ähnlichen Features |
| **Service Worker** | JavaScript-Worker für Offline-Funktionalität und Caching |
| **WebSocket** | Protokoll für bidirektionale Echtzeit-Kommunikation |
| **Hard Constraint** | Zwingende Bedingung, die nicht verletzt werden darf |
| **Soft Constraint** | Wünschenswerte Bedingung, die optimiert wird |

---

## Anhang A: User Stories

### Epic 1: Session-Verwaltung

**US-001: Session erstellen**  
Als Teilnehmende möchte ich schnell eine Session vorschlagen können, damit ich mein Wissen teilen kann.

Akzeptanzkriterien:
- Formular mit Pflichtfeldern: Titel, Beschreibung
- Optionale Angabe: Dauer (30/45/60 Min), Infrastruktur
- Session erscheint sofort in der Session-Liste
- Offline-Erstellung wird nach Reconnect synchronisiert

---

**US-002: Infrastruktur-Anforderungen angeben**  
Als Session-Gebende möchte ich angeben können, welche technische Ausstattung ich benötige.

Akzeptanzkriterien:
- Checkboxen für: Beamer, Flipchart, Whiteboard, Moderationskoffer
- Auswahl wird in Session-Details angezeigt
- Admin sieht Übersicht aller Infrastruktur-Anforderungen

---

**US-003: Session bearbeiten**  
Als Session-Gebende möchte ich meine Session nachträglich ändern können.

Akzeptanzkriterien:
- "Bearbeiten"-Button in Session-Details
- Änderungen werden in Echtzeit synchronisiert
- Versionierung: Änderungshistorie einsehbar (optional)

---

### Epic 2: Voting

**US-004: Für Session voten**  
Als Teilnehmende möchte ich für Sessions voten, damit mein Interesse berücksichtigt wird.

Akzeptanzkriterien:
- "♥"-Button bei jeder Session
- Vote-Count wird in Echtzeit aktualisiert
- Eigene Votes sind hervorgehoben
- Votes können zurückgenommen werden

---

**US-005: Voting auf Monitor anzeigen**  
Als Veranstalter möchte ich während der Sessionvorstellung live sehen, wie viele Votes eine Session bekommt.

Akzeptanzkriterien:
- Großer Vote-Counter auf Monitor-Display
- Echtzeit-Updates ohne Page-Reload
- Visueller Indikator für "beliebte" Sessions (z.B. Balken)

---

### Epic 3: Zeitplan-Optimierung

**US-006: Zeitplan automatisch optimieren**  
Als Veranstalter möchte ich einen optimalen Zeitplan generieren lassen, damit möglichst viele Teilnehmende in ihre Wunsch-Sessions kommen.

Akzeptanzkriterien:
- Button "Zeitplan optimieren" im Admin-Dashboard
- Berechnung zeigt Fortschritt-Indikator
- Ergebnis zeigt: Zuordnung Session → Raum → Zeitslot
- Metriken: % erfüllter Votes, Konflikte, Raum-Auslastung

---

**US-007: Zeitplan manuell anpassen**  
Als Veranstalter möchte ich den generierten Zeitplan manuell anpassen können.

Akzeptanzkriterien:
- Drag & Drop von Sessions auf Zeitslots
- Warnung bei Konflikten (Infrastruktur, Kapazität)
- Änderungen sind sofort für alle sichtbar

---

### Epic 4: Monitor-Display

**US-008: Session auf Monitor präsentieren**  
Als Veranstalter möchte ich eine Session auf dem Beamer zeigen, damit alle Details sehen können.

Akzeptanzkriterien:
- Vollbild-Ansicht mit großer Schrift
- Anzeige: Titel, Beschreibung, Session-Gebende, Dauer, Infrastruktur, Votes
- "Nächste Session"-Button für schnellen Wechsel

---

**US-009: Live-Voting auf Monitor**  
Als Veranstalter möchte ich während der Sessionvorstellung sehen, wie das Voting läuft.

Akzeptanzkriterien:
- Vote-Counter aktualisiert sich in Echtzeit
- Optionaler "Voting-Countdown" (z.B. 2 Minuten)
- Visuelle Highlights bei vielen Votes

---

### Epic 5: Admin-Funktionen

**US-010: Event einrichten**  
Als Veranstalter möchte ich ein neues Barcamp anlegen und konfigurieren.

Akzeptanzkriterien:
- Formular: Event-Name, Datum, Anzahl Räume, Zeitslots
- Raum-Details: Name, Kapazität, verfügbare Infrastruktur
- Event-Link generieren zum Teilen

---

**US-011: Event-Phasen steuern**  
Als Veranstalter möchte ich den Ablauf des Barcamps steuern (Submission → Voting → Running).

Akzeptanzkriterien:
- Phasen-Switcher im Admin-Dashboard
- In "Submission": Teilnehmende können Sessions erstellen
- In "Voting": Teilnehmende können nur noch voten
- In "Running": Zeitplan ist fixiert, keine Änderungen

---

## Anhang B: Datenmodell

### Entity-Relationship-Diagramm

```
┌─────────────┐         ┌─────────────┐
│   Event     │         │    Room     │
├─────────────┤         ├─────────────┤
│ id          │1       *│ id          │
│ name        ├─────────┤ event_id    │
│ date        │         │ name        │
│ status      │         │ capacity    │
└─────────────┘         │ infrastructure[]
                        └─────────────┘
       │
       │1
       │
       │*
┌─────────────┐         ┌─────────────┐
│  Session    │*       *│  TimeSlot   │
├─────────────┤─────────├─────────────┤
│ id          │         │ id          │
│ event_id    │         │ event_id    │
│ title       │         │ start_time  │
│ description │         │ end_time    │
│ presenter   │         └─────────────┘
│ duration    │
│ infrastructure[]      ┌─────────────┐
│ vote_count  │*       1│  Schedule   │
│ created_at  ├─────────├─────────────┤
└─────────────┘         │ session_id  │
       │                │ room_id     │
       │1               │ timeslot_id │
       │                └─────────────┘
       │*
┌─────────────┐
│    Vote     │
├─────────────┤
│ id          │
│ session_id  │
│ user_id (opt)│
│ timestamp   │
└─────────────┘
```

### Datenbank-Schema (PostgreSQL)

```sql
-- Events
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'PREPARATION',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Rooms
CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    capacity INTEGER NOT NULL,
    infrastructure JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Time Slots
CREATE TABLE time_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Sessions
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    presenter VARCHAR(255),
    duration INTEGER DEFAULT 45, -- Minuten
    infrastructure JSONB DEFAULT '[]',
    vote_count INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'CREATED',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Votes
CREATE TABLE votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    user_id VARCHAR(255), -- Optional, falls User-Tracking gewünscht
    timestamp TIMESTAMP DEFAULT NOW(),
    UNIQUE(session_id, user_id) -- Verhindert Mehrfach-Votes
);

-- Schedule (Zuordnung Session → Room → TimeSlot)
CREATE TABLE schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
    time_slot_id UUID REFERENCES time_slots(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(room_id, time_slot_id), -- Ein Raum pro Zeitslot
    UNIQUE(session_id) -- Eine Session nur einmal eingeplant
);

-- Indexes für Performance
CREATE INDEX idx_sessions_event ON sessions(event_id);
CREATE INDEX idx_votes_session ON votes(session_id);
CREATE INDEX idx_schedules_session ON schedules(session_id);
```

---

## Anhang C: API-Spezifikation (Auszug)

### REST-Endpoints

#### Sessions

**GET /api/events/:eventId/sessions**  
Liefert alle Sessions eines Events

Response:
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "KI in der Bildung",
    "description": "Wie KI den Unterricht verändert...",
    "presenter": "Sarah Müller",
    "duration": 45,
    "infrastructure": ["BEAMER", "FLIPCHART"],
    "voteCount": 42,
    "scheduledSlot": {
      "roomId": "...",
      "timeSlotId": "...",
      "startTime": "2025-12-12T10:00:00Z"
    }
  }
]
```

---

**POST /api/events/:eventId/sessions**  
Erstellt eine neue Session

Request:
```json
{
  "title": "Blockchain Basics",
  "description": "Einführung in Blockchain-Technologie",
  "presenter": "Tom Klein",
  "duration": 30,
  "infrastructure": ["BEAMER"]
}
```

Response: `201 Created` + Session-Objekt

---

**PUT /api/sessions/:id**  
Aktualisiert eine Session

---

**DELETE /api/sessions/:id**  
Löscht eine Session

---

#### Voting

**POST /api/sessions/:id/vote**  
Gibt einen Vote für eine Session ab

Request:
```json
{
  "userId": "optional-user-id"
}
```

Response: `200 OK` + aktueller Vote-Count

---

**DELETE /api/sessions/:id/vote**  
Entfernt einen Vote

---

#### Scheduling

**POST /api/events/:eventId/schedule/optimize**  
Startet Zeitplan-Optimierung

Response:
```json
{
  "status": "success",
  "schedule": [
    {
      "sessionId": "...",
      "roomId": "...",
      "timeSlotId": "...",
      "startTime": "2025-12-12T10:00:00Z"
    }
  ],
  "metrics": {
    "voteSatisfaction": 0.85,
    "conflicts": 3,
    "roomUtilization": 0.92
  }
}
```

---

**POST /api/events/:eventId/schedule/publish**  
Veröffentlicht den Zeitplan

---

### WebSocket-Events

**Client → Server:**

- `session:created` - Neue Session wurde erstellt
- `session:updated` - Session wurde geändert
- `vote:added` - Vote wurde abgegeben
- `vote:removed` - Vote wurde entfernt

**Server → Client:**

- `session:new` - Broadcast neue Session an alle
- `session:changed` - Broadcast Änderung
- `votes:updated` - Neue Vote-Counts
- `schedule:published` - Zeitplan wurde veröffentlicht

---

## Zusammenfassung

Dieses PRD definiert eine **Progressive Web App zur vollständigen Organisation von Barcamps**. Kern-Features sind:

✅ **Session-Management** mit Infrastruktur-Anforderungen  
✅ **Live-Voting-System** mit Echtzeit-Updates  
✅ **Monitor-Display** für Sessionvorstellungen  
✅ **Intelligente Zeitplan-Optimierung** basierend auf Votes  
✅ **Offline-Fähigkeit** durch PWA-Technologie  
✅ **Skalierbar** für Barcamps bis 500 Teilnehmende  

Die Architektur folgt **arc42-Standards** und bietet eine solide Basis für Entwicklung und Wartung. Nächste Schritte: Technologie-Stack finalisieren, MVP-Features priorisieren, Entwicklung starten.

---

**Ende des Dokuments**
