const Player = require('../models/Player');
const Team = require('../models/Team');
const Game = require('../models/Game');
const { POSITIONS } = require('../models/Player');

const ITEMS_PER_PAGE = 6;

async function index(req, res, next) {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const search = (req.query.search || '').trim();
    const teamFilter = req.query.team || '';

    const filter = {};
    if (search) filter.name = { $regex: search, $options: 'i' };
    if (teamFilter) filter.team = teamFilter;

    const [players, totalCount, teams] = await Promise.all([
      Player.find(filter)
        .populate('team')
        .sort({ name: 1 })
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE),
      Player.countDocuments(filter),
      Team.find().sort({ name: 1 }),
    ]);

    res.render('players/index', {
      title: 'Players',
      players,
      page,
      totalPages: Math.max(Math.ceil(totalCount / ITEMS_PER_PAGE), 1),
      search,
      teams,
      teamFilter,
    });
  } catch (err) {
    next(err);
  }
}

async function newForm(req, res, next) {
  try {
    const teams = await Team.find().sort({ name: 1 });
    res.render('players/form', {
      title: 'Add Player',
      player: req.flash('formData')[0] || {},
      teams,
      positions: POSITIONS,
      formAction: '/players',
    });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { name, position, jerseyNumber, nationality, dateOfBirth, photoUrl, goals, rating, team } = req.body;
    const player = await Player.create({
      name,
      position,
      jerseyNumber,
      nationality,
      dateOfBirth,
      photoUrl,
      goals: goals || 0,
      rating: rating || undefined,
      team,
    });

    req.flash('success', `Player "${player.name}" added successfully.`);
    res.redirect('/players');
  } catch (err) {
    next(err);
  }
}

async function show(req, res, next) {
  try {
    const player = await Player.findById(req.params.id).populate('team').populate({
      path: 'games',
      populate: { path: 'homeTeam awayTeam' },
    });
    if (!player) {
      req.flash('error', 'Player not found.');
      return res.redirect('/players');
    }
    res.render('players/show', { title: player.name, player });
  } catch (err) {
    next(err);
  }
}

async function editForm(req, res, next) {
  try {
    const [player, teams] = await Promise.all([
      Player.findById(req.params.id),
      Team.find().sort({ name: 1 }),
    ]);
    if (!player) {
      req.flash('error', 'Player not found.');
      return res.redirect('/players');
    }
    res.render('players/form', {
      title: 'Edit Player',
      player,
      teams,
      positions: POSITIONS,
      formAction: `/players/${player._id}?_method=PUT`,
    });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { name, position, jerseyNumber, nationality, dateOfBirth, photoUrl, goals, rating, team } = req.body;
    const player = await Player.findByIdAndUpdate(
      req.params.id,
      { name, position, jerseyNumber, nationality, dateOfBirth, photoUrl, goals, rating, team },
      { new: true, runValidators: true }
    );
    if (!player) {
      req.flash('error', 'Player not found.');
      return res.redirect('/players');
    }
    req.flash('success', `Player "${player.name}" updated successfully.`);
    res.redirect(`/players/${player._id}`);
  } catch (err) {
    next(err);
  }
}

async function destroy(req, res, next) {
  try {
    const player = await Player.findById(req.params.id);
    if (!player) {
      req.flash('error', 'Player not found.');
      return res.redirect('/players');
    }

    // Cascade: remove this player from any game lineups that include them.
    await Game.updateMany({ players: player._id }, { $pull: { players: player._id } });
    await player.deleteOne();

    req.flash('success', `Player "${player.name}" deleted.`);
    res.redirect('/players');
  } catch (err) {
    next(err);
  }
}

module.exports = { index, newForm, create, show, editForm, update, destroy };
