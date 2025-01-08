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
    res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    });
  }
});

// GET calendars by senderId
router.get('/sender', async (req, res) => {
  const senderId = req.user.id;

  try {
    const query = 'SELECT * FROM calendars WHERE senderId = ?';
    const [rows] = await db.execute(query, [senderId]);

    res.status(200).json({
      message: 'Calendars retrieved successfully by sender',
      data: rows,
    });
  } catch (error) {
    console.error('Error retrieving calendars by sender:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    });
  }
});

// GET calendars by receiver
router.get('/receiver', async (req, res) => {
  const receiverId = req.user.id;

  try {
    const query = `
      SELECT *
      FROM users
      INNER JOIN calendars ON users.email = calendars.receiver
      WHERE users.id = ?`;

    const [rows] = await db.execute(query, [receiverId]);

    if (rows.length === 0) {
      return res.status(404).json({
        message: 'No calendars found for the given receiver ID',
      });
    }

    res.status(200).json({
      message: 'Calendars retrieved successfully by receiver',
      data: rows,
    });
  } catch (error) {
    console.error('Error retrieving calendars by receiver:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    });
  }
});

// Calendar creation route
router.post('/', async (req, res) => {
  const { senderId, receiver, message, image_path } = req.body;

  if (!senderId || !receiver || !message) {
    return res
      .status(400)
      .json({ message: 'senderId, receiver, and message are required' });
  }

  try {
    const query =
      'INSERT INTO calendars (senderId, receiver, message, image_path) VALUES (?, ?, ?, ?)';
    const [result] = await db.execute(query, [
      senderId,
      receiver,
      message,
      image_path || null,
    ]);

    const fetchIdQuery =
      'SELECT id FROM calendars WHERE senderId = ? AND receiver = ? AND message = ? ORDER BY created_at DESC LIMIT 1';
    const [rows] = await db.execute(fetchIdQuery, [
      senderId,
      receiver,
      message,
    ]);
    const calendarId = rows[0]?.id;

    if (!calendarId) {
      throw new Error('Failed to retrieve calendar ID');
    }

    const caseDocument = await createCases(calendarId);

    res.status(201).json({
      message: 'Calendar and cases added successfully',
      data: {
        id: calendarId,
        senderId,
        receiver,
        message,
        image_path: image_path || null,
        cases: caseDocument,
      },
    });
  } catch (error) {
    console.error('Error adding calendar and cases:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    });
  }
});

// GET cases by calendar ID
router.get('/cases/:calendar_id', async (req, res) => {
  const calendarId = req.params.calendar_id;

  try {
    const cases = await getCasesByCalendarId(calendarId);
    if (!cases) {
      return res.status(404).json({
        message: 'Cases not found for the given calendar ID',
      });
    }
    res.status(200).json({
      message: 'Cases retrieved successfully',
      data: cases,
    });
  } catch (error) {
    console.error('Error retrieving cases:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    });
  }
});

// Update a specific case
router.patch('/cases/:calendar_id/:case_number', async (req, res) => {
  const calendarId = req.params.calendar_id;
  const caseNumber = parseInt(req.params.case_number, 10);
  const updates = req.body;

  if (!calendarId || isNaN(caseNumber) || caseNumber < 1 || caseNumber > 24) {
    return res.status(400).json({
      message: 'Valid calendar ID and case number are required',
    });
  }

  try {
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
      message: 'Internal server error',
      error: error.message,
    });
  }
});

// Open a specific case
router.post('/cases/:calendar_id/:case_number', async (req, res) => {
  const calendarId = req.params.calendar_id;
  const caseNumber = parseInt(req.params.case_number, 10);

  if (!calendarId || isNaN(caseNumber)) {
    return res.status(400).json({
      message: 'Valid calendar ID and case number are required',
    });
  }

  try {
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
    console.error('Error opening case:', error);
    res.status(500).json({
      message: 'Internal server error',
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
    res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    });
  }
});

// GET calendar by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: 'Calendar ID is required' });
  }

  try {
    const query = 'SELECT * FROM calendars WHERE id = ?';
    const [rows] = await db.execute(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Calendar not found' });
    }

    res.status(200).json({
      message: 'Calendar retrieved successfully',
      data: rows[0],
    });
  } catch (error) {
    console.error('Error retrieving calendar:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    });
  }
});

module.exports = router;
