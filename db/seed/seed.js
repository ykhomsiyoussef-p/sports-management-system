require('dotenv').config();
const connectDB = require('../connection');
const mongoose = require('mongoose');

const Team = require('../../models/Team');
const Coach = require('../../models/Coach');
const Player = require('../../models/Player');
const Game = require('../../models/Game');
const User = require('../../models/User');

const TEAM_DATA = [
  { name: 'Casablanca Lions', city: 'Casablanca', foundedYear: 1998, primaryColor: '#dc2626' },
  { name: 'Rabat Eagles', city: 'Rabat', foundedYear: 2001, primaryColor: '#2563eb' },
  { name: 'Marrakech Falcons', city: 'Marrakech', foundedYear: 1995, primaryColor: '#f59e0b' },
  { name: 'Tangier Sharks', city: 'Tangier', foundedYear: 2004, primaryColor: '#0ea5e9' },
  { name: 'Fes Wolves', city: 'Fes', foundedYear: 1990, primaryColor: '#64748b' },
  { name: 'Agadir Panthers', city: 'Agadir', foundedYear: 2010, primaryColor: '#16a34a' },
  { name: 'Oujda Tigers', city: 'Oujda', foundedYear: 1988, primaryColor: '#ea580c' },
  { name: 'Meknes Hawks', city: 'Meknes', foundedYear: 2006, primaryColor: '#7c3aed' },
];

const COACH_DATA = [
  { name: 'Karim Benzaidi', nationality: 'Morocco', experienceYears: 15 },
  { name: 'Youssef El Amrani', nationality: 'Morocco', experienceYears: 9 },
  { name: 'Hicham Zerouali', nationality: 'Morocco', experienceYears: 12 },
  { name: 'Carlos Mendes', nationality: 'Portugal', experienceYears: 20 },
  { name: 'Jean Dubois', nationality: 'France', experienceYears: 7 },
  { name: 'Ahmed Tazi', nationality: 'Morocco', experienceYears: 11 },
  { name: 'Marco Rossi', nationality: 'Italy', experienceYears: 18 },
  { name: 'Rachid Idrissi', nationality: 'Morocco', experienceYears: 6 },
];

const FIRST_NAMES = ['Omar', 'Yassine', 'Mehdi', 'Anas', 'Sofiane', 'Reda', 'Imad', 'Bilal', 'Adam', 'Nabil', 'Walid', 'Zakaria', 'Hamza', 'Amine', 'Taha', 'Younes'];
const LAST_NAMES = ['Bouazza', 'El Fassi', 'Chraibi', 'Alaoui', 'Bennani', 'Idrissi', 'Saidi', 'Mansouri', 'Belhaj', 'Ouali', 'Ghali', 'Tahiri', 'Naciri', 'Berrada', 'Lahlou', 'Kabbaj'];
const POSITIONS = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'];
const NATIONALITIES = ['Morocco', 'France', 'Spain', 'Senegal', 'Egypt', 'Ivory Coast', 'Portugal', 'Algeria'];
const STADIUMS = ['Stade Mohammed V', 'Complexe Moulay Abdellah', 'Stade Adrar', 'Stade Ibn Batouta', 'Stade Municipal', "Stade d'Honneur"];
const STATUSES = ['Scheduled', 'Live', 'Finished', 'Cancelled'];

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDateWithinYear(daysOffsetRange) {
  const now = Date.now();
  const offsetDays = Math.floor(Math.random() * daysOffsetRange) - daysOffsetRange / 2;
  return new Date(now + offsetDays * 24 * 60 * 60 * 1000);
}

async function seed() {
  await connectDB();
  console.log('Clearing existing data...');
  await Promise.all([
    Team.deleteMany({}),
    Coach.deleteMany({}),
    Player.deleteMany({}),
    Game.deleteMany({}),
    User.deleteMany({}),
  ]);

  console.log('Creating the admin account...');
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD || 'ChangeMe123!';
  const admin = new User({ username: adminUsername, role: 'admin' });
  await admin.setPassword(adminPassword);
  await admin.save();
  console.log(`Admin account ready -> username: "${adminUsername}", password: "${adminPassword}"`);
  console.log('(Set ADMIN_USERNAME / ADMIN_PASSWORD in your .env to customize this.)');

  console.log('Seeding teams...');
  const teams = await Team.insertMany(TEAM_DATA);

  console.log('Seeding coaches and linking to teams...');
  const coaches = [];
  for (let i = 0; i < COACH_DATA.length; i++) {
    const coach = await Coach.create({ ...COACH_DATA[i], team: teams[i]._id });
    coaches.push(coach);
    await Team.findByIdAndUpdate(teams[i]._id, { coach: coach._id });
  }

  console.log('Seeding players (3 per team, ~24 total)...');
  const players = [];
  for (const team of teams) {
    const usedJerseyNumbers = new Set();
    for (let i = 0; i < 3; i++) {
      let jerseyNumber;
      do {
        jerseyNumber = Math.floor(Math.random() * 99) + 1;
      } while (usedJerseyNumbers.has(jerseyNumber));
      usedJerseyNumbers.add(jerseyNumber);

      const player = await Player.create({
        name: `${randomFrom(FIRST_NAMES)} ${randomFrom(LAST_NAMES)}`,
        position: POSITIONS[i % POSITIONS.length],
        jerseyNumber,
        nationality: randomFrom(NATIONALITIES),
        dateOfBirth: new Date(1994 + Math.floor(Math.random() * 12), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        goals: Math.floor(Math.random() * 15),
        rating: Math.floor(Math.random() * 5) + 1,
        team: team._id,
      });
      players.push(player);
    }
  }

  console.log('Seeding games between teams...');
  const games = [];
  for (let i = 0; i < 14; i++) {
    const homeTeam = randomFrom(teams);
    let awayTeam = randomFrom(teams);
    while (String(awayTeam._id) === String(homeTeam._id)) {
      awayTeam = randomFrom(teams);
    }

    const status = i < 8 ? 'Finished' : randomFrom(STATUSES);
    const homeScore = status === 'Finished' ? Math.floor(Math.random() * 5) : 0;
    const awayScore = status === 'Finished' ? Math.floor(Math.random() * 5) : 0;

    // Lineup: pick a few players from each of the two participating teams.
    const homeRoster = players.filter((p) => String(p.team) === String(homeTeam._id));
    const awayRoster = players.filter((p) => String(p.team) === String(awayTeam._id));
    const lineup = [...homeRoster.slice(0, 2), ...awayRoster.slice(0, 2)].map((p) => p._id);

    const game = await Game.create({
      homeTeam: homeTeam._id,
      awayTeam: awayTeam._id,
      date: randomDateWithinYear(60),
      stadium: randomFrom(STADIUMS),
      status,
      homeScore,
      awayScore,
      players: lineup,
    });
    games.push(game);

    // Keep Player.games in sync (many-to-many back-reference).
    await Player.updateMany({ _id: { $in: lineup } }, { $addToSet: { games: game._id } });
  }

  console.log('--------------------------------------------------');
  console.log(`Seeded ${teams.length} teams, ${coaches.length} coaches, ${players.length} players, ${games.length} games.`);
  console.log(`Admin login -> username: "${adminUsername}" / password: "${adminPassword}"`);
  console.log('--------------------------------------------------');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
