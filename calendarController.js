const CalendarEvent = require('../models/CalendarEvent');

// POST /api/calendar  (HR admin - add holiday/event)
exports.createEvent = async (req, res) => {
  const event = await CalendarEvent.create({ ...req.body, createdBy: req.user._id });
  res.status(201).json(event);
};

// GET /api/calendar?month=&year=
exports.getEvents = async (req, res) => {
  const { month, year } = req.query;
  const filter = {};

  if (month && year) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);
    filter.date = { $gte: start, $lte: end };
  }

  const events = await CalendarEvent.find(filter).sort({ date: 1 });
  res.json(events);
};

// PUT /api/calendar/:id
exports.updateEvent = async (req, res) => {
  const event = await CalendarEvent.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!event) return res.status(404).json({ message: 'Event not found' });
  res.json(event);
};

// DELETE /api/calendar/:id
exports.deleteEvent = async (req, res) => {
  const event = await CalendarEvent.findByIdAndDelete(req.params.id);
  if (!event) return res.status(404).json({ message: 'Event not found' });
  res.json({ message: 'Event deleted' });
};
