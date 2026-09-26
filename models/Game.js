const mongoose = require('mongoose');
const { Schema } = mongoose;

const STATUSES = ['Scheduled', 'Live', 'Finished', 'Cancelled'];

// Game is the "primary entity collection".
// - homeTeam / awayTeam: many-to-one with Team
// - players: many-to-many with Player (the match lineup)
const gameSchema = new Schema(
  {
    homeTeam: {
      type: Schema.Types.ObjectId,
      ref: 'Team',
      required: [true, 'Home team is required'],
    },
    awayTeam: {
      type: Schema.Types.ObjectId,
      ref: 'Team',
      required: [true, 'Away team is required'],
      validate: {
        validator: function (value) {
          // Guards against a team playing itself. Works for both
          // .save() (this.homeTeam) and findOneAndUpdate via runValidators.
          const home = this.homeTeam || (this.getUpdate && this.getUpdate().homeTeam);
          return String(value) !== String(home);
        },
        message: 'Home team and away team must be different',
      },
    },
    date: {
      type: Date,
      required: [true, 'Game date is required'],
    },
    stadium: {
      type: String,
      required: [true, 'Stadium name is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: STATUSES,
      default: 'Scheduled',
    },
    homeScore: {
      type: Number,
      default: 0,
      min: [0, 'Score cannot be negative'],
    },
    awayScore: {
      type: Number,
      default: 0,
      min: [0, 'Score cannot be negative'],
    },
    players: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Player',
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Game', gameSchema);
module.exports.STATUSES = STATUSES;
