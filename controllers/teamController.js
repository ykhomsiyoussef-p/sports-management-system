const Team = require('../models/Team');
const Coach = require('../models/Coach');
const Player = require('../models/Player');
const Game = require('../models/Game');

const ITEMS_PER_PAGE = 6;

// GET /teams  — list with search + pagination
async function index(req, res, next) {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const search = (req.query.search || '').trim();

    const filter = search
      ? { name: { $regex: search, $options: 'i' } }
      : {};

    const [teams, totalCount] = await Promise.all([
      Team.find(filter)
        .populate('coach')
        .sort({ name: 1 })
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE),
      Team.countDocuments(filter),
    ]);

    const totalPages = Math.max(Math.ceil(totalCount / ITEMS_PER_PAGE), 1);

    res.render('teams/index', {
      title: 'Teams',
      teams,
      page,
      totalPages,
      search,
    });
  } catch (err) {
    next(err);
  }
}

// GET /teams/new
async function newForm(req, res, next) {
  try {
    const coaches = await Coach.find({ team: null }).sort({ name: 1 });
    res.render('teams/form', {
      title: 'Add Team',
      team: req.flash('formData')[0] || {},
      coaches,
      formAction: '/teams',
      method: 'POST',
    });
  } catch (err) {
    next(err);
  }
}

// POST /teams
async function create(req, res, next) {
  try {
    const { name, city, foundedYear, primaryColor, logoUrl, coach } = req.body;
    const team = await Team.create({
      name,
      city,
      foundedYear: foundedYear || undefined,
      primaryColor: primaryColor || undefined,
      logoUrl,
      coach: coach || null,
    });

    // Keep the one-to-one Team <-> Coach relationship in sync.
    if (coach) {
      await Coach.findByIdAndUpdate(coach, { team: team._id });
    }

    req.flash('success', `Team "${team.name}" created successfully.`);
    res.redirect('/teams');
  } catch (err) {
    next(err);
  }
}

// GET /teams/:id
async function show(req, res, next) {
  try {
    const team = await Team.findById(req.params.id).populate('coach').populate('players');
    if (!team) {
      req.flash('error', 'Team not found.');
      return res.redirect('/teams');
    }

    const games = await Game.find({
      $or: [{ homeTeam: team._id }, { awayTeam: team._id }],
    })
      .populate('homeTeam awayTeam')
      .sort({ date: -1 })
      .limit(10);

    res.render('teams/show', { title: team.name, team, games });
  } catch (err) {
    next(err);
  }
}

// GET /teams/:id/edit
async function editForm(req, res, next) {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      req.flash('error', 'Team not found.');
      return res.redirect('/teams');
    }
    // Coaches available: unassigned ones + this team's current coach
    const coaches = await Coach.find({
      $or: [{ team: null }, { team: team._id }],
    }).sort({ name: 1 });

    res.render('teams/form', {
      title: 'Edit Team',
      team,
      coaches,
      formAction: `/teams/${team._id}?_method=PUT`,
      method: 'POST',
    });
  } catch (err) {
    next(err);
  }
}

// PUT /teams/:id
async function update(req, res, next) {
  try {
    const { name, city, foundedYear, primaryColor, logoUrl, coach } = req.body;
    const team = await Team.findById(req.params.id);
    if (!team) {
      req.flash('error', 'Team not found.');
      return res.redirect('/teams');
    }

    const previousCoachId = team.coach ? String(team.coach) : null;
    const newCoachId = coach || null;

    team.name = name;
    team.city = city;
    team.foundedYear = foundedYear || undefined;
    team.primaryColor = primaryColor || team.primaryColor;
    team.logoUrl = logoUrl;
    team.coach = newCoachId;
    await team.save();

    // Sync the Coach side of the one-to-one relationship.
    if (previousCoachId && previousCoachId !== newCoachId) {
      await Coach.findByIdAndUpdate(previousCoachId, { team: null });
    }
    if (newCoachId) {
      await Coach.findByIdAndUpdate(newCoachId, { team: team._id });
    }

    req.flash('success', `Team "${team.name}" updated successfully.`);
    res.redirect(`/teams/${team._id}`);
  } catch (err) {
    next(err);
  }
}

// DELETE /teams/:id — cascade-style deletion
async function destroy(req, res, next) {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      req.flash('error', 'Team not found.');
      return res.redirect('/teams');
    }

    // Cascade: unlink the coach, delete the team's players,
    // and delete any games that involved this team.
    await Promise.all([
      Coach.updateMany({ team: team._id }, { team: null }),
      Player.deleteMany({ team: team._id }),
      Game.deleteMany({ $or: [{ homeTeam: team._id }, { awayTeam: team._id }] }),
    ]);
    await team.deleteOne();

    req.flash('success', `Team "${team.name}" and its related players/games were deleted.`);
    res.redirect('/teams');
  } catch (err) {
    next(err);
  }
}

module.exports = { index, newForm, create, show, editForm, update, destroy };
