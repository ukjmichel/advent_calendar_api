const Case = require('../models/cases'); // MongoDB model for cases

/**
 * Create cases for a given calendarId.
 * @param {string} calendarId - The UUID of the calendar (from MySQL).
 * @returns {Promise<object>} - The created cases document.
 */
async function createCases(calendarId) {
  if (!calendarId) {
    throw new Error('calendarId is required');
  }

  try {
    // Generate 24 cases
    const casesArray = Array.from({ length: 24 }, (_, i) => ({
      number: i + 1,
      state: 'empty',
      filePath: '',
      message: `Default message for case ${i + 1}`,
    }));

    // Create the cases document in MongoDB
    const newCases = await Case.create({
      calendarId,
      cases: casesArray,
    });

    return newCases;
  } catch (err) {
    console.error('Error creating cases:', err);
    throw new Error('Failed to create cases');
  }
}

/**
 * Fetch cases by calendarId.
 * @param {string} calendarId - The UUID of the calendar (from MySQL).
 * @returns {Promise<object>} - The cases document.
 */
async function getCasesByCalendarId(calendarId) {
  if (!calendarId) {
    throw new Error('calendarId is required');
  }

  try {
    const cases = await Case.findOne({ calendarId });
    if (!cases) {
      throw new Error(
        `Cases not found for the given calendar ID: ${calendarId}`
      );
    }
    return cases;
  } catch (err) {
    console.error('Error fetching cases:', err);
    throw new Error('Failed to fetch cases');
  }
}

/**
 * Update a specific case in a calendar.
 * @param {string} calendarId - The UUID of the calendar (from MySQL).
 * @param {number} caseNumber - The number of the case to update (1-24).
 * @param {object} updates - The fields to update (e.g., state, filePath, message).
 * @returns {Promise<object>} - The updated cases document.
 */
async function updateCase(calendarId, caseNumber, updates) {
  if (
    !calendarId ||
    typeof caseNumber !== 'number' ||
    caseNumber < 1 ||
    caseNumber > 24
  ) {
    throw new Error('Valid calendarId and caseNumber are required');
  }

  if (!updates || typeof updates !== 'object') {
    throw new Error('Updates must be a valid object');
  }

  try {
    const cases = await Case.findOneAndUpdate(
      { calendarId, 'cases.number': caseNumber },
      { $set: { 'cases.$': { number: caseNumber, ...updates } } }, // Update the specific case
      { new: true } // Return the updated document
    );

    if (!cases) {
      throw new Error(
        `Case ${caseNumber} not found for calendar ID: ${calendarId}`
      );
    }

    return cases;
  } catch (err) {
    console.error('Error updating case:', err);
    throw new Error('Failed to update case');
  }
}

async function openCase(calendarId, caseNumber) {
  if (
    !calendarId ||
    typeof caseNumber !== 'number' ||
    caseNumber < 1 ||
    caseNumber > 24
  ) {
    throw new Error('Valid calendarId and caseNumber are required');
  }

  try {
    // Update the specific case's state to 'opened'
    const updatedCaseDocument = await Case.findOneAndUpdate(
      { calendarId, 'cases.number': caseNumber }, // Find the document with the specific calendarId and case number
      { $set: { 'cases.$.state': 'opened' } }, // Update only the state field for the specific case
      { new: true } // Return the updated document
    );

    if (!updatedCaseDocument) {
      throw new Error(
        `Case ${caseNumber} not found for calendar ID: ${calendarId}`
      );
    }

    return updatedCaseDocument;
  } catch (err) {
    console.error('Error updating case:', err);
    throw new Error('Failed to update case');
  }
}

module.exports = {
  createCases,
  getCasesByCalendarId,
  updateCase,
  openCase,
};
