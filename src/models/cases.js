const mongoose = require('mongoose');

// Define the case schema
const caseSchema = new mongoose.Schema({
  calendarId: { type: String, required: true }, // Foreign key referencing MySQL calendar.id
  cases: {
    type: [
      {
        number: { type: Number, required: true, min: 1, max: 24 }, // Case number (1-24)
        state: {
          type: String,
          enum: ['open', 'closed', 'empty'],
          default: 'closed',
        }, // State of the case
        filePath: { type: String, required: false }, // Optional file path
        message: { type: String, required: false }, // Optional message
      },
    ],
    validate: {
      validator: function (array) {
        return array.length === 24; // Ensure the array always contains exactly 24 elements
      },
      message: 'The cases array must contain exactly 24 elements',
    },
  },
});

// Create and export the Case model
module.exports = mongoose.model('Case', caseSchema);
