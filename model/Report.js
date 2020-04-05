const mongoose = require("mongoose");

const reportSchema = mongoose.Schema({
  newsId: { type: String },
  userId: { type: String },
  feedback: { type: String }
});

const reports = mongoose.model("reports", reportSchema);
module.exports = {
  reportsModel: reports,
  reportsSchema: this.reportsModel
};
