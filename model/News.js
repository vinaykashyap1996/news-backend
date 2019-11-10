const mongoose=require('mongoose');

const newsSchema = mongoose.Schema({
    url:String,
    source:String,
    claim:String,
    claim_url:String,
    label:String,
    date:Date,
    author:String
});

const news = mongoose.model("news", newsSchema);
module.exports = {
  newsModel: news,
  newsSchema: this.newsModel
};