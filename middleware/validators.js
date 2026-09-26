const { body, validationResult } = require('express-validator');
const { POSITIONS } = require('../models/Player');
const { STATUSES } = require('../models/Game');

// Generic middleware: runs after the express-validator chains below,
// collects any errors, flashes them, and redirects back to the form
// instead of letting a bad request reach the database.
function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg);
    req.flash('error', messages.join(' | '));
    req.flash('formData', req.body);
    return res.redirect('back');
  }
  next();
}

const teamValidationRules = [
  body('name').trim().notEmpty().withMessage('Team name is required')
    .isLength({ min: 2, max: 60 }).withMessage('Team name must be 2-60 characters'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('foundedYear').optional({ checkFalsy: true }).isInt({ min: 1850, max: new Date().getFullYear() })
    .withMessage('Founded year must be a valid year'),
  body('primaryColor').optional({ checkFalsy: true }).matches(/^#([0-9A-Fa-f]{3}){1,2}$/)
    .withMessage('Primary color must be a valid hex code, e.g. #2563eb'),
];

const coachValidationRules = [
  body('name').trim().notEmpty().withMessage('Coach name is required')
    .isLength({ min: 2, max: 60 }).withMessage('Name must be 2-60 characters'),
  body('nationality').trim().notEmpty().withMessage('Nationality is required'),
  body('experienceYears').notEmpty().withMessage('Years of experience is required')
    .isInt({ min: 0, max: 60 }).withMessage('Experience must be between 0 and 60 years'),
];

const playerValidationRules = [
  body('name').trim().notEmpty().withMessage('Player name is required')
    .isLength({ min: 2, max: 60 }).withMessage('Name must be 2-60 characters'),
  body('position').trim().notEmpty().withMessage('Position is required')
    .isIn(POSITIONS).withMessage('Position must be one of: ' + POSITIONS.join(', ')),
  body('jerseyNumber').notEmpty().withMessage('Jersey number is required')
    .isInt({ min: 1, max: 99 }).withMessage('Jersey number must be between 1 and 99'),
  body('nationality').trim().notEmpty().withMessage('Nationality is required'),
  body('dateOfBirth').notEmpty().withMessage('Date of birth is required')
    .isISO8601().withMessage('Date of birth must be a valid date'),
  body('team').notEmpty().withMessage('Team is required')
    .isMongoId().withMessage('Invalid team selected'),
  body('rating').optional({ checkFalsy: true }).isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
];

const gameValidationRules = [
  body('homeTeam').notEmpty().withMessage('Home team is required')
    .isMongoId().withMessage('Invalid home team selected'),
  body('awayTeam').notEmpty().withMessage('Away team is required')
    .isMongoId().withMessage('Invalid away team selected')
    .custom((value, { req }) => value !== req.body.homeTeam)
    .withMessage('Home team and away team must be different'),
  body('date').notEmpty().withMessage('Game date is required')
    .isISO8601().withMessage('Game date must be a valid date'),
  body('stadium').trim().notEmpty().withMessage('Stadium name is required'),
  body('status').optional({ checkFalsy: true }).isIn(STATUSES)
    .withMessage('Status must be one of: ' + STATUSES.join(', ')),
  body('homeScore').optional({ checkFalsy: true }).isInt({ min: 0 })
    .withMessage('Home score cannot be negative'),
  body('awayScore').optional({ checkFalsy: true }).isInt({ min: 0 })
    .withMessage('Away score cannot be negative'),
];

module.exports = {
  handleValidationErrors,
  teamValidationRules,
  coachValidationRules,
  playerValidationRules,
  gameValidationRules,
};
