const mongoose = require('mongoose');
const { Schema } = mongoose;

// A Coach belongs to at most one Team at a time (one-to-one with Team).
const coachSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Coach name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [60, 'Name cannot exceed 60 characters'],
    },
    nationality: {
      type: String,
      required: [true, 'Nationality is required'],
      trim: true,
    },
    experienceYears: {
      type: Number,
      required: [true, 'Years of experience is required'],
      min: [0, 'Experience cannot be negative'],
      max: [60, 'That is an unrealistic amount of experience'],
    },
    photoUrl: {
      type: String,
      trim: true,
      default: '',
    },
    team: {
      type: Schema.Types.ObjectId,
      ref: 'Team',
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Coach', coachSchema);
