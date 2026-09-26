# 🏆 Sports Management System

A full-stack CRUD web application built with **Express.js**, **MongoDB**, and **Mongoose**, for managing a sports league: teams, coaches, players, and games.

## Features

- Full CRUD for Teams, Coaches, Players, and Games
- Server-side pagination (6 items per page)
- Search (by name/stadium) and filtering (players by team)
- Many-to-many relationships via Mongoose `ObjectId` references (Games ↔ Players)
- One-to-many / one-to-one relationships (Team ↔ Players, Team ↔ Coach)
- Cascade-style deletion (deleting a team removes its players/games and unlinks its coach)
- Form validation (`express-validator`) with flash error messages
- Flash messages for success/error feedback (`connect-flash`)
- Responsive design with Tailwind CSS, including a mobile dropdown nav
- Dashboard with aggregate statistics and Chart.js visualizations
- Database seed script with realistic sample data (8 teams, 8 coaches, 24 players, 14 games)

## Project Structure

```
sports-management/
├── middleware/
│   ├── errorHandler.js      # 404 / 500 / Mongoose error handling
│   └── validators.js        # express-validator rules per entity
├── routes/                  # One router per resource (RESTful)
├── controllers/             # Business logic for each resource
├── models/                  # Mongoose schemas: Team, Coach, Player, Game
├── db/
│   ├── connection.js
│   └── seed/seed.js         # Sample data generator
├── views/                   # EJS templates
│   ├── partials/            # header, navbar, footer, flash messages, pagination
│   ├── teams/ players/ coaches/ games/
│   ├── dashboard.ejs
│   └── errors/
├── public/
│   ├── css/style.css
│   └── js/main.js
└── app.js                   # App entry point
```

## Database Schema

### Team
| Field | Type | Notes |
|---|---|---|
| name | String | required, unique |
| city | String | required |
| foundedYear | Number | optional |
| primaryColor | String (hex) | used for dashboard chart colors |
| logoUrl | String | optional |
| coach | ObjectId → Coach | one-to-one |
| players (virtual) | [ObjectId → Player] | populated via `Player.team` |

### Coach
| Field | Type | Notes |
|---|---|---|
| name | String | required |
| nationality | String | required |
| experienceYears | Number | required |
| photoUrl | String | optional |
| team | ObjectId → Team | one-to-one |

### Player (secondary entity collection)
| Field | Type | Notes |
|---|---|---|
| name | String | required |
| position | String enum | Goalkeeper / Defender / Midfielder / Forward |
| jerseyNumber | Number | 1-99, unique per team |
| nationality | String | required |
| dateOfBirth | Date | required |
| goals | Number | default 0 |
| rating | Number | 1-5 |
| team | ObjectId → Team | required, one-to-many |
| games | [ObjectId → Game] | many-to-many back-reference |

### Game (primary entity collection)
| Field | Type | Notes |
|---|---|---|
| homeTeam / awayTeam | ObjectId → Team | required, must differ |
| date | Date | required |
| stadium | String | required |
| status | String enum | Scheduled / Live / Finished / Cancelled |
| homeScore / awayScore | Number | default 0 |
| players | [ObjectId → Player] | many-to-many lineup |

### Relationships summary
- **Team ↔ Coach**: one-to-one
- **Team → Players**: one-to-many
- **Game ↔ Players**: many-to-many (a game has many players; a player appears in many games)
- **Cascade deletes**: deleting a Team deletes its Players and Games, and unlinks its Coach. Deleting a Coach only unlinks the Team. Deleting a Player/Game removes it from the other side's array.

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` with your own MongoDB connection string and session secret. Never commit your real `.env` file.

3. **Make sure MongoDB is running** (locally via `mongod`, or use a connection string from MongoDB Atlas in `.env`).

4. **Seed the database with sample data**
   ```bash
   npm run seed
   ```

5. **Start the app**
   ```bash
   npm start
   # or, for auto-reload during development:
   npm run dev
   ```

6. Open **http://localhost:3000** in your browser. You'll be redirected to the dashboard.

## Notes

- Forms use `method-override` so plain HTML forms can send `PUT`/`DELETE` requests.
- Tailwind CSS is loaded via the Play CDN (no build step required) — fine for this project's scope, but a production app would typically compile Tailwind ahead of time.
- Chart.js is loaded via CDN and rendered client-side using data serialized from the dashboard controller's aggregation queries.
