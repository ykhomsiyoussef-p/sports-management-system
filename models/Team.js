const mongoose = require('mongoose');
const { Schema } = mongoose;

// A Team is the hub of the app: it has one Coach (one-to-one),
// many Players (one-to-many) and appears in many Games (many-to-many,
// modeled through the Game collection's homeTeam/awayTeam fields).
const teamSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Team name is required'],
      trim: true,
      unique: true,
      minlength: [2, 'Team name must be at least 2 characters long'],
      maxlength: [60, 'Team name cannot exceed 60 characters'],
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    foundedYear: {
      type: Number,
      min: [1850, 'Founded year seems too far in the past'],
      max: [new Date().getFullYear(), 'Founded year cannot be in the future'],
    },
    primaryColor: {
      type: String,
      default: '#2563eb', // Tailwind's blue-600, used for badges/charts
      match: [/^#([0-9A-Fa-f]{3}){1,2}$/, 'Primary color must be a valid hex code'],
    },
    logoUrl: {
      type: String,
      trim: true,
      default: '',
    },
    coach: {
      type: Schema.Types.ObjectId,
      ref: 'Coach',
      default: null,
    },
  },
  { timestamps: true }
);

// Virtual: lets us do Team.find().populate('players') without
// storing a duplicated array of player ids on the Team document itself.
teamSchema.virtual('players', {
  ref: 'Player',
  localField: '_id',
  foreignField: 'team',
});

teamSchema.set('toObject', { virtuals: true });
teamSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Team', teamSchema);
