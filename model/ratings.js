const mongoose = require("mongoose");

const ratingSchema = mongoose.Schema({
  userId: String,
  newsId: String,
  belivibalityIndex: Number,
  priorknowledge: Number,
  readingTime: String,
  articleNo: Number,
  comment: String,
  flag: { type: Boolean, default: false }
});

const ratings = mongoose.model("ratings", ratingSchema);
module.exports = {
  ratingModel: ratings,
  ratingSchema: ratingSchema
};
