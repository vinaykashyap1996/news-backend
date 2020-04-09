const mongoose = require("mongoose");

const newsSchema = mongoose.Schema({
  id: String,
  url: { type: String },
  category: String,
  source: String,
  headline: { type: String, unique: true },
  body: String,
  publish_date: String,
  lang: String,
  factchecker_label: String,
  normalised_score: String,
  headline_lang: String,
  normalised_label: String,
  image: String
});

const news = mongoose.model("news", newsSchema);
module.exports = {
  newsModel: news,
  newsSchema: newsSchema
};
