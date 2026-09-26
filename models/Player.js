const mongoose = require('mongoose');
const { Schema } = mongoose;

const POSITIONS = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'];

// Player is the "secondary entity collection".
// - team: one-to-many (a Team has many Players)
// - games: many-to-many (a Player plays in many Games, a Game has many Players)
const playerSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Player name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [60, 'Name cannot exceed 60 characters'],
    },
    position: {
      type: String,
      required: [true, 'Position is required'],
      enum: {
        values: POSITIONS,
        message: 'Position must be one of: ' + POSITIONS.join(', '),
      },
    },
    jerseyNumber: {
      type: Number,
      required: [true, 'Jersey number is required'],
      min: [1, 'Jersey number must be at least 1'],
      max: [99, 'Jersey number cannot exceed 99'],
    },
    nationality: {
      type: String,
      required: [true, 'Nationality is required'],
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required'],
    },
    photoUrl: {
      type: String,
      trim: true,
      default: '',
    },
    goals: {
      type: Number,
      default: 0,
      min: [0, 'Goals cannot be negative'],
    },
    rating: {
      type: Number,
      min: [1, 'Rating must be between 1 and 5'],
      max: [5, 'Rating must be between 1 and 5'],
      default: 3,
    },
    team: {
      type: Schema.Types.ObjectId,
      ref: 'Team',
      required: [true, 'A player must belong to a team'],
    },
    games: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Game',
      },
    ],
  },
  { timestamps: true }
);

playerSchema.index({ team: 1, jerseyNumber: 1 }, { unique: true });

module.exports = mongoose.model('Player', playerSchema);
module.exports.POSITIONS = POSITIONS;
