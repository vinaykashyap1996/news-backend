const mongoose = require("mongoose");

const newsSchema = mongoose.Schema({
  id: { type: String, unique: true },
  url: { type: String, unique: true },
  category: String,
  source: String,
  headline: String,
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
  newsSchema: this.newsModel
};
