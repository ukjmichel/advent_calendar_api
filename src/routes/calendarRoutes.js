const express = require('express');
const { db } = require('../../db'); // Import the database connection
const router = express.Router();
const {
  createCases,
  getCasesByCalendarId,
  openCase,
  updateCase,
} = require('../services/casesServices');

// GET all calendars
router.get('/', async (req, res) => {
  try {
    const query = 'SELECT * FROM calendars';
    const [rows] = await db.execute(query);

    res
      .status(200)
      .json({ message: 'All calendars retrieved successfully', data: rows });
  } catch (error) {
    console.error('Error retrieving all calendars:', error);
    res
      .status(500)
      .json({ message: 'Failed to retrieve calendars', error: error.message });
  }
});

// GET calendars by sender
router.get('/sender/:sender', async (req, res) => {
  const { sender } = req.params;

  try {
    const query = 'SELECT * FROM calendars WHERE sender = ?';
    const [rows] = await db.execute(query, [sender]);

    res.status(200).json({
      message: 'Calendars retrieved successfully by sender',
      data: rows,
    });
  } catch (error) {
    console.error('Error retrieving calendars by sender:', error);
    res.status(500).json({
      message: 'Failed to retrieve calendars by sender',
      error: error.message,
    });
  }
});

// GET calendars by receiver
router.get('/receiver/:receiver', async (req, res) => {
  const { receiver } = req.params;

  try {
    const query = 'SELECT * FROM calendars WHERE receiver = ?';
    const [rows] = await db.execute(query, [receiver]);

    res.status(200).json({
      message: 'Calendars retrieved successfully by receiver',
      data: rows,
    });
  } catch (error) {
    console.error('Error retrieving calendars by receiver:', error);
    res.status(500).json({
      message: 'Failed to retrieve calendars by receiver',
      error: error.message,
    });
  }
});

// Calendar creation route
// Calendar creation route
router.post('/', async (req, res) => {
  const { sender, receiver, message, image_path } = req.body;

  if (!sender || !receiver || !message) {
    return res
      .status(400)
      .json({ message: 'sender, receiver, and message are required' });
  }

  try {
    // Step 1: Insert calendar into MySQL
    const query =
      'INSERT INTO calendars (id, sender, receiver, message, image_path) VALUES (UUID(), ?, ?, ?, ?)';
    const [result] = await db.execute(query, [
      sender,
      receiver,
      message,
      image_path || null, // Use null if no image_path is provided
    ]);

    // Step 2: Retrieve the generated UUID
    const fetchIdQuery =
      'SELECT id FROM calendars WHERE sender = ? AND receiver = ? AND message = ? ORDER BY created_at DESC LIMIT 1';
    const [rows] = await db.execute(fetchIdQuery, [sender, receiver, message]);
    const calendarId = rows[0]?.id;

    if (!calendarId) {
      throw new Error('Failed to retrieve calendar ID');
    }

    // Step 3: Delegate case creation to the service
    const caseDocument = await createCases(calendarId);

    res.status(201).json({
      message: 'Calendar and cases added successfully',
      data: {
        id: calendarId,
        sender,
        receiver,
        message,
        image_path: image_path || null,
        cases: caseDocument,
      },
    });
  } catch (error) {
    console.error('Error adding calendar and cases:', error);
    res.status(500).json({
      message: 'Failed to add calendar and cases',
      error: error.message,
    });
  }
});

router.get('/cases/:calendar_id', async (req, res) => {
  const calendarId = req.params.calendar_id; // Extract calendar ID from URL

  try {
    const cases = await getCasesByCalendarId(calendarId); // Fetch cases from service
    if (!cases) {
      return res
        .status(404)
        .json({ message: 'Cases not found for the given calendar ID' });
    }
    res.status(200).json({
      message: 'Cases retrieved successfully',
      data: cases,
    });
  } catch (error) {
    console.error('Error retrieving cases:', error);
    res
      .status(500)
      .json({ message: 'Failed to retrieve cases', error: error.message });
  }
});

router.patch('/cases/:calendar_id/:case_number', async (req, res) => {
  const calendarId = req.params.calendar_id; // Extract calendar ID from URL
  const caseNumber = parseInt(req.params.case_number, 10); // Convert case number to an integer
  const updates = req.body; // Extract fields to update from the request body

  if (!calendarId || isNaN(caseNumber) || caseNumber < 1 || caseNumber > 24) {
    return res.status(400).json({
      message: 'Valid calendar ID and case number are required',
    });
  }

  try {
    // Call a service to update the specific case
    const updatedCaseDocument = await updateCase(
      calendarId,
      caseNumber,
      updates
    );

    if (!updatedCaseDocument) {
      return res.status(404).json({
        message: `Case ${caseNumber} not found for calendar ID: ${calendarId}`,
      });
    }

    res.status(200).json({
      message: `Case ${caseNumber} updated successfully`,
      data: updatedCaseDocument,
    });
  } catch (error) {
    console.error('Error updating case:', error);
    res.status(500).json({
      message: 'Failed to update case',
      error: error.message,
    });
  }
});

router.post('/cases/:calendar_id/:case_number', async (req, res) => {
  const calendarId = req.params.calendar_id; // Extract calendar ID from URL
  const caseNumber = parseInt(req.params.case_number, 10); // Convert case number to a number

  if (!calendarId || isNaN(caseNumber)) {
    return res.status(400).json({
      message: 'Valid calendar ID and case number are required',
    });
  }

  try {
    // Call the service function to open the case
    const updatedCaseDocument = await openCase(calendarId, caseNumber);

    if (!updatedCaseDocument) {
      return res.status(404).json({
        message: `Case ${caseNumber} not found for calendar ID: ${calendarId}`,
      });
    }

    res.status(200).json({
      message: `Case ${caseNumber} opened successfully`,
      data: updatedCaseDocument,
    });
  } catch (error) {
    console.error('Error updating case:', error);
    res.status(500).json({
      message: 'Failed to open the case',
      error: error.message,
    });
  }
});

// DELETE a calendar by ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: 'Calendar ID is required' });
  }

  try {
    const query = 'DELETE FROM calendars WHERE id = ?';
    const [result] = await db.execute(query, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Calendar not found' });
    }

    res.status(200).json({ message: 'Calendar deleted successfully', id });
  } catch (error) {
    console.error('Error deleting calendar:', error);
    res
      .status(500)
      .json({ message: 'Failed to delete calendar', error: error.message });
  }
});

//GET calendar by id
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: 'Calendar ID is required' });
  }

  try {
    // Query the database for the calendar with the given ID
    const query = 'SELECT * FROM calendars WHERE id = ?';
    const [rows] = await db.execute(query, [id]);

    // Check if a calendar with the given ID exists
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Calendar not found' });
    }

    // Respond with the calendar data
    return res.status(200).json({
      message: 'Calendar retrieved successfully',
      data: rows[0],
    });
  } catch (error) {
    console.error('Error retrieving calendar:', error);
    return res.status(500).json({
      message: 'Failed to retrieve calendar',
      error: error.message,
    });
  }
});

module.exports = router;
