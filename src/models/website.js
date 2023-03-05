const mongoose = require("mongoose");

const websiteSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  domain: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  dataPoints: [
    {
      date: {
        type: String,
        required: true,
      },
      visitsCount: {
        type: String,
        required: true,
      },
    },
  ],
});

const Website = mongoose.model("Website", websiteSchema);

module.exports = { Website };
