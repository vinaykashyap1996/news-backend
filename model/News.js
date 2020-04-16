const mongoose = require("mongoose");

const newsSchema = mongoose.Schema({
  url: { type: String, unique: true },
  // collection: String,
  category: String,
  source: String,
  title: { type: String, unique: true },
  publish_date: String,
  lang: { type: String, default: "en" },
  text: String
});

const news = mongoose.model("news", newsSchema);
module.exports = {
  newsModel: news,
  newsSchema: newsSchema
};
