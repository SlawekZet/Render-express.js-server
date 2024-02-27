const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    genByUser: {
      type: String,
      required: true,
    },
    originalUrl: {
      type: String,
      required: true,
    },
    shortenedUrlPath: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Url', userSchema);
