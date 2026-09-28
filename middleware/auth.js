const User = require('../models/User');

// Loads the logged-in user (if any) from the session on every request and
// exposes it to EJS templates as `currentUser`. Runs before the login-wall
// so login/register pages also know whether someone is already logged in.
async function loadCurrentUser(req, res, next) {
  try {
    if (req.session && req.session.userId) {
      const user = await User.findById(req.session.userId);
      req.currentUser = user || null;
    } else {
      req.currentUser = null;
    }
    res.locals.currentUser = req.currentUser;
    next();
  } catch (err) {
    next(err);
  }
}

// Blocks access to the whole app unless the person is logged in.
// Login, register, and static assets are left open (see app.js).
function requireLogin(req, res, next) {
  if (!req.currentUser) {
    req.flash('error', 'Please log in to access the platform.');
    return res.redirect('/login');
  }
  next();
}

// Blocks create/update/delete actions for anyone who isn't an admin.
function requireAdmin(req, res, next) {
  if (!req.currentUser || req.currentUser.role !== 'admin') {
    req.flash('error', 'You do not have permission to make changes. Viewer accounts are read-only.');
    return res.redirect('back');
  }
  next();
}

module.exports = { loadCurrentUser, requireLogin, requireAdmin };
