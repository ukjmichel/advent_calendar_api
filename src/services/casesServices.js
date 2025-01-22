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
    const casesArray = Array.from({ length: 24 }, (_, i) => ({
      number: i + 1,
      state: 'empty',
      filePath: '',
      message: `Default message for case ${i + 1}`,
    }));

    const newCases = await Case.create({ calendarId, cases: casesArray });
    return newCases;
  } catch (err) {
    console.error('Error creating cases:', err);
    throw new Error('Failed to create cases');
  }
}

/**
 * Fetch all cases by calendarId.
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
      throw new Error(`No cases found for calendar ID: ${calendarId}`);
    }
    return cases;
  } catch (err) {
    console.error('Error fetching cases:', err);
    throw new Error('Failed to fetch cases');
  }
}

/**
 * Fetch a specific case by calendarId and caseNumber.
 * @param {string} calendarId - The UUID of the calendar (from MySQL).
 * @param {number} caseNumber - The number of the case to fetch (1-24).
 * @returns {Promise<object>} - The specific case.
 */
async function getCase(calendarId, caseNumber) {
  if (!calendarId) {
    throw new Error('calendarId is required');
  }

  if (typeof caseNumber !== 'number' || caseNumber < 1 || caseNumber > 24) {
    throw new Error('caseNumber must be a valid number between 1 and 24');
  }

  try {
    const casesDocument = await Case.findOne({ calendarId });
    if (!casesDocument) {
      throw new Error(`No cases found for calendar ID: ${calendarId}`);
    }

    const specificCase = casesDocument.cases.find(
      (c) => c.number === caseNumber
    );
    if (!specificCase) {
      throw new Error(
        `Case ${caseNumber} not found for calendar ID: ${calendarId}`
      );
    }

    return specificCase;
  } catch (err) {
    console.error('Error fetching case:', err);
    throw new Error('Failed to fetch case');
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
  if (!calendarId) {
    throw new Error('calendarId is required');
  }

  if (typeof caseNumber !== 'number' || caseNumber < 1 || caseNumber > 24) {
    throw new Error('caseNumber must be a valid number between 1 and 24');
  }

  if (!updates || typeof updates !== 'object') {
    throw new Error('Updates must be a valid object');
  }

  try {
    // Build the update object dynamically
    const updateFields = {};
    for (const [key, value] of Object.entries(updates)) {
      updateFields[`cases.$.${key}`] = value; // Set each field explicitly
    }

    const updatedDocument = await Case.findOneAndUpdate(
      { calendarId, 'cases.number': caseNumber },
      { $set: updateFields }, // Only update the specified fields
      { new: true }
    );

    if (!updatedDocument) {
      throw new Error(
        `Case ${caseNumber} not found for calendar ID: ${calendarId}`
      );
    }

    return updatedDocument;
  } catch (err) {
    console.error('Error updating case:', err);
    throw new Error('Failed to update case');
  }
}

/**
 * Open a specific case in a calendar (change state to "opened").
 * @param {string} calendarId - The UUID of the calendar (from MySQL).
 * @param {number} caseNumber - The number of the case to open (1-24).
 * @returns {Promise<object>} - The updated cases document.
 */
async function openCase(calendarId, caseNumber) {
  if (!calendarId) {
    throw new Error('calendarId is required');
  }

  if (typeof caseNumber !== 'number' || caseNumber < 1 || caseNumber > 24) {
    throw new Error('caseNumber must be a valid number between 1 and 24');
  }

  try {
    const updatedDocument = await Case.findOneAndUpdate(
      { calendarId, 'cases.number': caseNumber },
      { $set: { 'cases.$.state': 'opened' } },
      { new: true }
    );

    if (!updatedDocument) {
      throw new Error(
        `Case ${caseNumber} not found for calendar ID: ${calendarId}`
      );
    }

    return updatedDocument;
  } catch (err) {
    console.error('Error opening case:', err);
    throw new Error('Failed to open case');
  }
}

module.exports = {
  createCases,
  getCasesByCalendarId,
  getCase,
  updateCase,
  openCase,
};
