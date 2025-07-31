const mongoose = require('mongoose');
const baseModel = require('./baseModel');
const { Schema } = mongoose;

const pageInfoSchema = new Schema({
  pageNumber: {
    type: Number,
    required: true,
  },
  audioFiles: [
    {
      url: String,
      name: String,
      size: Number,
      duration: Number,
    },
  ],
});

const exerciseSchema = new Schema(
  {
    grade: {
      type: String,
      required: true,
    },
    series: {
      type: String,
      required: true,
    },
    pdfUrl: {
      type: String,
      required: true,
    },
    totalPages: {
      type: Number,
      required: true,
    },
    missingWords: {
      type: [String],
      required: true,
    },
    pageInfos: {
      type: [pageInfoSchema],
      required: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

class exerciseModel extends baseModel {
  constructor() {
    super('Exercise', exerciseSchema);
  }
}

module.exports = exerciseModel;
