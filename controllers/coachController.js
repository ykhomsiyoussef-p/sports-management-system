const Coach = require('../models/Coach');
const Team = require('../models/Team');

const ITEMS_PER_PAGE = 6;

async function index(req, res, next) {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const search = (req.query.search || '').trim();
    const filter = search ? { name: { $regex: search, $options: 'i' } } : {};

    const [coaches, totalCount] = await Promise.all([
      Coach.find(filter)
        .populate('team')
        .sort({ name: 1 })
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE),
      Coach.countDocuments(filter),
    ]);

    res.render('coaches/index', {
      title: 'Coaches',
      coaches,
      page,
      totalPages: Math.max(Math.ceil(totalCount / ITEMS_PER_PAGE), 1),
      search,
    });
  } catch (err) {
    next(err);
  }
}

async function newForm(req, res, next) {
  try {
    const teams = await Team.find({ coach: null }).sort({ name: 1 });
    res.render('coaches/form', {
      title: 'Add Coach',
      coach: req.flash('formData')[0] || {},
      teams,
      formAction: '/coaches',
    });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { name, nationality, experienceYears, photoUrl, team } = req.body;
    const coach = await Coach.create({
      name,
      nationality,
      experienceYears,
      photoUrl,
      team: team || null,
    });

    if (team) {
      await Team.findByIdAndUpdate(team, { coach: coach._id });
    }

    req.flash('success', `Coach "${coach.name}" added successfully.`);
    res.redirect('/coaches');
  } catch (err) {
    next(err);
  }
}

async function editForm(req, res, next) {
  try {
    const coach = await Coach.findById(req.params.id);
    if (!coach) {
      req.flash('error', 'Coach not found.');
      return res.redirect('/coaches');
    }
    const teams = await Team.find({
      $or: [{ coach: null }, { coach: coach._id }],
    }).sort({ name: 1 });

    res.render('coaches/form', {
      title: 'Edit Coach',
      coach,
      teams,
      formAction: `/coaches/${coach._id}?_method=PUT`,
    });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { name, nationality, experienceYears, photoUrl, team } = req.body;
    const coach = await Coach.findById(req.params.id);
    if (!coach) {
      req.flash('error', 'Coach not found.');
      return res.redirect('/coaches');
    }

    const previousTeamId = coach.team ? String(coach.team) : null;
    const newTeamId = team || null;

    coach.name = name;
    coach.nationality = nationality;
    coach.experienceYears = experienceYears;
    coach.photoUrl = photoUrl;
    coach.team = newTeamId;
    await coach.save();

    if (previousTeamId && previousTeamId !== newTeamId) {
      await Team.findByIdAndUpdate(previousTeamId, { coach: null });
    }
    if (newTeamId) {
      await Team.findByIdAndUpdate(newTeamId, { coach: coach._id });
    }

    req.flash('success', `Coach "${coach.name}" updated successfully.`);
    res.redirect('/coaches');
  } catch (err) {
    next(err);
  }
}

async function destroy(req, res, next) {
  try {
    const coach = await Coach.findById(req.params.id);
    if (!coach) {
      req.flash('error', 'Coach not found.');
      return res.redirect('/coaches');
    }

    // Cascade: unlink from the team, but do not delete the team itself.
    if (coach.team) {
      await Team.findByIdAndUpdate(coach.team, { coach: null });
    }
    await coach.deleteOne();

    req.flash('success', `Coach "${coach.name}" deleted.`);
    res.redirect('/coaches');
  } catch (err) {
    next(err);
  }
}

module.exports = { index, newForm, create, editForm, update, destroy };
