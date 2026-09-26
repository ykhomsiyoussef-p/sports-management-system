const Game = require('../models/Game');
const Team = require('../models/Team');
const Player = require('../models/Player');
const { STATUSES } = require('../models/Game');

const ITEMS_PER_PAGE = 6;

async function index(req, res, next) {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const search = (req.query.search || '').trim();

    let filter = {};
    if (search) {
      // Search by stadium name, or by matching team names.
      const matchingTeams = await Team.find({ name: { $regex: search, $options: 'i' } }).select('_id');
      const teamIds = matchingTeams.map((t) => t._id);
      filter = {
        $or: [
          { stadium: { $regex: search, $options: 'i' } },
          { homeTeam: { $in: teamIds } },
          { awayTeam: { $in: teamIds } },
        ],
      };
    }

    const [games, totalCount] = await Promise.all([
      Game.find(filter)
        .populate('homeTeam awayTeam')
        .sort({ date: -1 })
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE),
      Game.countDocuments(filter),
    ]);

    res.render('games/index', {
      title: 'Games',
      games,
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
    const teams = await Team.find().sort({ name: 1 });
    res.render('games/form', {
      title: 'Schedule Game',
      game: req.flash('formData')[0] || {},
      teams,
      players: [],
      statuses: STATUSES,
      formAction: '/games',
    });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { homeTeam, awayTeam, date, stadium, status, homeScore, awayScore } = req.body;
    let players = req.body.players || [];
    if (!Array.isArray(players)) players = [players];

    const game = await Game.create({
      homeTeam,
      awayTeam,
      date,
      stadium,
      status: status || 'Scheduled',
      homeScore: homeScore || 0,
      awayScore: awayScore || 0,
      players,
    });

    // Keep the many-to-many back-reference (Player.games) in sync.
    if (players.length) {
      await Player.updateMany({ _id: { $in: players } }, { $addToSet: { games: game._id } });
    }

    req.flash('success', 'Game scheduled successfully.');
    res.redirect('/games');
  } catch (err) {
    next(err);
  }
}

async function show(req, res, next) {
  try {
    const game = await Game.findById(req.params.id)
      .populate('homeTeam awayTeam')
      .populate({ path: 'players', populate: { path: 'team' } });
    if (!game) {
      req.flash('error', 'Game not found.');
      return res.redirect('/games');
    }
    res.render('games/show', { title: 'Game Details', game });
  } catch (err) {
    next(err);
  }
}

async function editForm(req, res, next) {
  try {
    const [game, teams] = await Promise.all([Game.findById(req.params.id), Team.find().sort({ name: 1 })]);
    if (!game) {
      req.flash('error', 'Game not found.');
      return res.redirect('/games');
    }
    // Only offer players from the two teams playing this game.
    const players = await Player.find({
      team: { $in: [game.homeTeam, game.awayTeam] },
    }).populate('team');

    res.render('games/form', {
      title: 'Edit Game',
      game,
      teams,
      players,
      statuses: STATUSES,
      formAction: `/games/${game._id}?_method=PUT`,
    });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { homeTeam, awayTeam, date, stadium, status, homeScore, awayScore } = req.body;
    let players = req.body.players || [];
    if (!Array.isArray(players)) players = [players];

    const game = await Game.findById(req.params.id);
    if (!game) {
      req.flash('error', 'Game not found.');
      return res.redirect('/games');
    }

    const previousPlayerIds = game.players.map(String);

    game.homeTeam = homeTeam;
    game.awayTeam = awayTeam;
    game.date = date;
    game.stadium = stadium;
    game.status = status || game.status;
    game.homeScore = homeScore || 0;
    game.awayScore = awayScore || 0;
    game.players = players;
    await game.save();

    // Sync Player.games on both sides of the many-to-many relationship:
    // remove the game from players no longer in the lineup, add it for new ones.
    const removed = previousPlayerIds.filter((id) => !players.includes(id));
    const added = players.filter((id) => !previousPlayerIds.includes(id));
    await Promise.all([
      Player.updateMany({ _id: { $in: removed } }, { $pull: { games: game._id } }),
      Player.updateMany({ _id: { $in: added } }, { $addToSet: { games: game._id } }),
    ]);

    req.flash('success', 'Game updated successfully.');
    res.redirect(`/games/${game._id}`);
  } catch (err) {
    next(err);
  }
}

async function destroy(req, res, next) {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) {
      req.flash('error', 'Game not found.');
      return res.redirect('/games');
    }

    // Cascade: remove this game from every player's games array.
    await Player.updateMany({ games: game._id }, { $pull: { games: game._id } });
    await game.deleteOne();

    req.flash('success', 'Game deleted.');
    res.redirect('/games');
  } catch (err) {
    next(err);
  }
}

module.exports = { index, newForm, create, show, editForm, update, destroy };
