require('dotenv').config();

const express = require('express');
const path = require('path');
const morgan = require('morgan');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');

const connectDB = require('./db/connection');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const indexRoutes = require('./routes/index');
const teamRoutes = require('./routes/teams');
const coachRoutes = require('./routes/coaches');
const playerRoutes = require('./routes/players');
const gameRoutes = require('./routes/games');
const dashboardRoutes = require('./routes/dashboard');

const app = express();

// --- Database ---
connectDB();

// --- View engine ---
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// --- Core middleware ---
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method')); // lets HTML forms send PUT/DELETE via ?_method=
app.use(express.static(path.join(__dirname, 'public')));

// --- Sessions + flash messages ---
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev_secret_change_me',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 }, // 1 hour
  })
);
app.use(flash());

// Make flash messages (and the current path, for nav highlighting)
// available in every EJS template without passing them manually.
app.use((req, res, next) => {
  res.locals.successMessages = req.flash('success');
  res.locals.errorMessages = req.flash('error');
  res.locals.currentPath = req.path;
  next();
});

// --- Routes ---
app.use('/', indexRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/teams', teamRoutes);
app.use('/coaches', coachRoutes);
app.use('/players', playerRoutes);
app.use('/games', gameRoutes);

// --- 404 + error handling (must be last) ---
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Sports Management System running at http://localhost:${PORT}`);
});

module.exports = app;
