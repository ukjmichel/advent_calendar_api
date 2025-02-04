// src/controllers/calendarController.js

const { db } = require('../../db'); // Adjust the path as needed
const {
  createCases,
  getCasesByCalendarId: serviceGetCasesByCalendarId,
  openCase,
  updateCase: serviceUpdateCase,
  getCase: serviceGetCase,
} = require('../services/casesServices');

/**
 * Get all calendars.
 */
const getAllCalendars = async (req, res) => {
  try {
    const query = 'SELECT * FROM calendars';
    const [rows] = await db.execute(query);
    return res.status(200).json({
      message: 'All calendars retrieved successfully',
      data: rows,
    });
  } catch (error) {
    console.error('Error retrieving all calendars:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    });
  }
};

/**
 * Get calendars by sender.
 */
const getCalendarsBySender = async (req, res) => {
  const senderId = req.user.id;

  try {
    const query = 'SELECT * FROM calendars WHERE senderId = ?';
    const [rows] = await db.execute(query, [senderId]);
    return res.status(200).json({
      message: 'Calendars retrieved successfully by sender',
      data: rows,
    });
  } catch (error) {
    console.error('Error retrieving calendars by sender:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    });
  }
};

/**
 * Get calendars by receiver.
 */
const getCalendarsByReceiver = async (req, res) => {
  const receiverId = req.user.id;

  try {
    const query = `
      SELECT *
      FROM users
      INNER JOIN calendars ON users.email = calendars.receiver
      WHERE users.id = ? AND calendars.available = true
    `;
    const [rows] = await db.execute(query, [receiverId]);

    if (rows.length === 0) {
      return res.status(404).json({
        message: 'No calendars found for the given receiver ID',
      });
    }

    return res.status(200).json({
      message: 'Calendars retrieved successfully by receiver',
      data: rows,
    });
  } catch (error) {
    console.error('Error retrieving calendars by receiver:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    });
  }
};

/**
 * Create a new calendar and generate its cases.
 */
const createCalendar = async (req, res) => {
  const { senderId, receiver, message, image_path } = req.body;

  if (!senderId || !receiver) {
    return res.status(400).json({
      message: 'senderId, receiver, and message are required',
    });
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

    const fetchIdQuery = `
      SELECT id 
      FROM calendars 
      WHERE senderId = ? AND receiver = ? AND message = ? 
      ORDER BY created_at DESC 
      LIMIT 1
    `;
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

    return res.status(201).json({
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
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    });
  }
};

/**
 * Get cases for a specific calendar.
 */
const getCasesByCalendarId = async (req, res) => {
  const calendarId = req.params.calendar_id;

  try {
    const cases = await serviceGetCasesByCalendarId(calendarId);
    if (!cases) {
      return res.status(404).json({
        message: 'Cases not found for the given calendar ID',
      });
    }
    return res.status(200).json({
      message: 'Cases retrieved successfully',
      data: cases,
    });
  } catch (error) {
    console.error('Error retrieving cases:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    });
  }
};

/**
 * Get a specific case from a calendar.
 */
const getCase = async (req, res) => {
  const calendarId = req.params.calendar_id;
  const caseNumber = parseInt(req.params.case_number, 10);

  if (!calendarId || isNaN(caseNumber) || caseNumber < 1 || caseNumber > 24) {
    return res.status(400).json({
      message: 'Valid calendar ID and case number are required',
    });
  }

  try {
    const specificCase = await serviceGetCase(calendarId, caseNumber);
    if (!specificCase) {
      return res.status(404).json({
        message: `Case ${caseNumber} not found for calendar ID: ${calendarId}`,
      });
    }
    return res.status(200).json({
      message: `Case ${caseNumber} found`,
      data: specificCase,
    });
  } catch (error) {
    console.error('Error fetching case:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    });
  }
};

/**
 * Update a specific case.
 */
const updateCase = async (req, res) => {
  const calendarId = req.params.calendar_id;
  const caseNumber = parseInt(req.params.case_number, 10);
  const updates = req.body;

  if (!calendarId || isNaN(caseNumber) || caseNumber < 1 || caseNumber > 24) {
    return res.status(400).json({
      message: 'Valid calendar ID and case number are required',
    });
  }

  try {
    const updatedCaseDocument = await serviceUpdateCase(
      calendarId,
      caseNumber,
      updates
    );

    if (!updatedCaseDocument) {
      return res.status(404).json({
        message: `Case ${caseNumber} not found for calendar ID: ${calendarId}`,
      });
    }

    return res.status(200).json({
      message: `Case ${caseNumber} updated successfully`,
      data: updatedCaseDocument,
    });
  } catch (error) {
    console.error('Error updating case:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    });
  }
};

/**
 * Delete a calendar by ID.
 */
const deleteCalendar = async (req, res) => {
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

    return res
      .status(200)
      .json({ message: 'Calendar deleted successfully', id });
  } catch (error) {
    console.error('Error deleting calendar:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    });
  }
};

/**
 * Get a calendar by ID.
 */
const getCalendarById = async (req, res) => {
  const { calendar_id } = req.params;
  if (!calendar_id) {
    return res.status(400).json({ message: 'Calendar ID is required' });
  }

  try {
    const query = 'SELECT * FROM calendars WHERE id = ?';
    const [rows] = await db.execute(query, [calendar_id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Calendar not found' });
    }

    return res.status(200).json({
      message: 'Calendar retrieved successfully',
      data: rows[0],
    });
  } catch (error) {
    console.error('Error retrieving calendar:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    });
  }
};

/**
 * Update a calendar.
 *
 * Allowed update fields: receiver, message, image_path, available.
 */
const updateCalendar = async (req, res) => {
  const calendarId = req.params.calendar_id;
  const updates = req.body;
  console.log(updates);

  if (!calendarId) {
    return res.status(400).json({ message: 'Calendar ID is required' });
  }

  // Only allow updating these fields
  const allowedFields = ['receiver', 'message', 'image_path', 'available'];
  const fields = [];
  const values = [];

  allowedFields.forEach((field) => {
    if (updates.hasOwnProperty(field)) {
      fields.push(`${field} = ?`);
      values.push(updates[field]);
    }
  });

  if (fields.length === 0) {
    return res
      .status(400)
      .json({ message: 'No valid fields provided for update.' });
  }

  const updateQuery = `UPDATE calendars SET ${fields.join(', ')} WHERE id = ?`;
  values.push(calendarId);

  try {
    const [result] = await db.execute(updateQuery, values);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Calendar not found' });
    }
    // Optionally, fetch the updated calendar
    const [rows] = await db.execute('SELECT * FROM calendars WHERE id = ?', [
      calendarId,
    ]);
    return res.status(200).json({
      message: 'Calendar updated successfully',
      data: rows[0],
    });
  } catch (error) {
    console.error('Error updating calendar:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// Export all controller functions at the bottom
module.exports = {
  getAllCalendars,
  getCalendarsBySender,
  getCalendarsByReceiver,
  createCalendar,
  getCasesByCalendarId,
  getCase,
  updateCase,
  deleteCalendar,
  getCalendarById,
  updateCalendar,
};
