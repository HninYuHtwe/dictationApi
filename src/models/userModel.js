const mongoose = require('mongoose');
const baseModel = require('./baseModel');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Please add  Username'],
      unique: [true, 'username already exist'],
    },
    displayName: {
      type: String,
      required: [true, 'Please add  Display Name'],
    },
    email: {
      type: String,
      required: false,
    },
    password: {
      type: String,
      required: [true, 'Please add Password'],
    },
    role: {
      type: String,
      required: true,
      enum: ['admin', 'student'],
      default: 'admin',
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

class userModel extends baseModel {
  constructor() {
    super('User', userSchema);
  }
}

module.exports = userModel;
