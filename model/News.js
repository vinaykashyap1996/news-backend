const mongoose = require("mongoose");

const newsSchema = mongoose.Schema({
  url: { type: String, unique: true },
  group: String,
  category: String,
  source: String,
  title: { type: String, unique: true },
  publishedDate: String,
  lang: { type: String, default: "en" },
  content: String
});

const news = mongoose.model("news", newsSchema);
module.exports = {
  newsModel: news,
  newsSchema: newsSchema
};
