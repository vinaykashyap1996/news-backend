const mongoose = require("mongoose");

const ratingSchema = mongoose.Schema({
  userId: String,
  newsId: String,
  belivibalityIndex: Number,
  priorknowledge: Number,
  readingTime: Number,
  Flag: Boolean
});

const ratings = mongoose.model("ratings", ratingSchema);
module.exports = {
  ratingModel: ratings,
  ratingSchema: ratingSchema
};
