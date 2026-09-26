// Catches any error passed via next(err) from a controller and
// turns it into a flash message + redirect, or a rendered 404/500 page.

function notFoundHandler(req, res) {
  res.status(404).render('errors/404', {
    title: 'Page Not Found',
  });
}

function errorHandler(err, req, res, next) {
  console.error(err.stack);

  // Mongoose validation errors -> collect readable messages
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    req.flash('error', messages.join(' | '));
    return res.redirect('back');
  }

  // Invalid ObjectId cast (e.g. /teams/not-a-real-id)
  if (err.name === 'CastError') {
    req.flash('error', 'The requested item could not be found.');
    return res.redirect('/');
  }

  // Duplicate key error (unique index violation)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {}).join(', ');
    req.flash('error', `A record with that ${field} already exists.`);
    return res.redirect('back');
  }

  res.status(500).render('errors/500', {
    title: 'Something Went Wrong',
    error: process.env.NODE_ENV === 'development' ? err : null,
  });
}

module.exports = { notFoundHandler, errorHandler };
