const Team = require('../models/Team');
const Player = require('../models/Player');
const Coach = require('../models/Coach');
const Game = require('../models/Game');

async function index(req, res, next) {
  try {
    const [teamCount, playerCount, coachCount, gameCount] = await Promise.all([
      Team.countDocuments(),
      Player.countDocuments(),
      Coach.countDocuments(),
      Game.countDocuments(),
    ]);

    // Aggregate: number of players grouped by position.
    const playersByPosition = await Player.aggregate([
      { $group: { _id: '$position', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Aggregate: number of games grouped by status.
    const gamesByStatus = await Game.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Top 5 goal scorers.
    const topScorers = await Player.find()
      .populate('team')
      .sort({ goals: -1 })
      .limit(5);

    // Aggregate: total goals scored by each team (home + away combined).
    const goalsByTeam = await Game.aggregate([
      {
        $facet: {
          home: [
            { $group: { _id: '$homeTeam', goals: { $sum: '$homeScore' } } },
          ],
          away: [
            { $group: { _id: '$awayTeam', goals: { $sum: '$awayScore' } } },
          ],
        },
      },
    ]);

    // Merge home + away goal totals per team in plain JS (simpler than a
    // $unionWith pipeline, and just as correct for this data size).
    const goalsMap = {};
    const combineGoals = (arr) => {
      (arr || []).forEach(({ _id, goals }) => {
        const key = String(_id);
        goalsMap[key] = (goalsMap[key] || 0) + goals;
      });
    };
    combineGoals(goalsByTeam[0]?.home);
    combineGoals(goalsByTeam[0]?.away);

    const teams = await Team.find();
    const teamGoalsChart = teams
      .map((team) => ({
        name: team.name,
        color: team.primaryColor,
        goals: goalsMap[String(team._id)] || 0,
      }))
      .sort((a, b) => b.goals - a.goals);

    // Aggregate: average player rating per team.
    const avgRatingByTeam = await Player.aggregate([
      { $group: { _id: '$team', avgRating: { $avg: '$rating' } } },
    ]);

    const recentGames = await Game.find()
      .populate('homeTeam awayTeam')
      .sort({ date: -1 })
      .limit(5);

    res.render('dashboard', {
      title: 'Dashboard',
      stats: { teamCount, playerCount, coachCount, gameCount },
      playersByPosition,
      gamesByStatus,
      topScorers,
      teamGoalsChart,
      avgRatingByTeam,
      recentGames,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { index };
