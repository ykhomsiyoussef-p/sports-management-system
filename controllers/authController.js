const User = require('../models/User');

function loginForm(req, res) {
  if (req.currentUser) return res.redirect('/dashboard');
  res.render('auth/login', { title: 'Log In' });
}

async function login(req, res, next) {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user || !(await user.checkPassword(password))) {
      req.flash('error', 'Invalid username or password.');
      return res.redirect('/login');
    }

    req.session.userId = user._id;
    req.flash('success', `Welcome back, ${user.username}!`);
    res.redirect('/dashboard');
  } catch (err) {
    next(err);
  }
}

function registerForm(req, res) {
  if (req.currentUser) return res.redirect('/dashboard');
  res.render('auth/register', { title: 'Create Account' });
}

async function register(req, res, next) {
  try {
    const { username, password } = req.body;

    const existing = await User.findOne({ username });
    if (existing) {
      req.flash('error', 'That username is already taken.');
      return res.redirect('/register');
    }

    // Self-registered accounts are always "viewer" (read-only).
    // Only an existing admin can promote someone to admin, directly in the database.
    const user = new User({ username, role: 'viewer' });
    await user.setPassword(password);
    await user.save();

    req.session.userId = user._id;
    req.flash('success', `Account created! You're logged in as a viewer (read-only).`);
    res.redirect('/dashboard');
  } catch (err) {
    next(err);
  }
}

function logout(req, res, next) {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.redirect('/login');
  });
}

module.exports = { loginForm, login, registerForm, register, logout };
