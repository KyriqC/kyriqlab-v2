const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  coverImage: { type: String }, // URL to a screenshot/image
  pdfUrl: { type: String, required: true }, // URL to the uploaded PDF
  date: { type: Date, default: Date.now },
  published: { type: Boolean, default: false }, // Draft mode vs Public
  
  // Future-proofing for comments
  comments: [{
    user: String,
    text: String,
    date: { type: Date, default: Date.now }
  }]
});

module.exports = mongoose.model('Report', ReportSchema);
