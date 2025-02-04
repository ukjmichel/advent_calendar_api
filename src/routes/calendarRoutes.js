// src/routes/calendarRoutes.js

const express = require('express');
const calendarController = require('../controllers/calendarControllers');
const auth = require('../middlewares/authMiddleware');
const router = express.Router();

// Retrieve all calendars
router.get('/', calendarController.getAllCalendars);

// Retrieve calendars by sender
router.get('/sended', calendarController.getCalendarsBySender);

// Retrieve calendars by receiver
router.get('/received', calendarController.getCalendarsByReceiver);

// Create a new calendar (and generate cases)
router.post('/', calendarController.createCalendar);

// Retrieve cases for a specific calendar
router.get('/:calendar_id/cases', calendarController.getCasesByCalendarId);

// Retrieve a specific case
router.get('/:calendar_id/cases/:case_number', calendarController.getCase);

// Update a specific case
router.patch('/:calendar_id/cases/:case_number', calendarController.updateCase);

// Update a calendar by ID
router.patch('/:calendar_id', calendarController.updateCalendar);

// Delete a calendar by ID
router.delete('/:calendar_id', calendarController.deleteCalendar);

// Retrieve a calendar by ID
router.get('/:calendar_id', calendarController.getCalendarById);

module.exports = router;
