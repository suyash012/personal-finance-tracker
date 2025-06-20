const express = require('express');
const Expense = require('../models/Expense');
const Budget = require('../models/Budget');
const auth = require('../middleware/auth');
const axios = require('axios');

const router = express.Router();

// Generate and return monthly report using Python service
router.post('/generate', auth, async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const expenses = await Expense.find({ user: req.user, date: { $gte: startOfMonth } });
    const budgets = await Budget.find({ user: req.user });
    // Call Python service
    const response = await axios.post(process.env.PYTHON_SERVICE_URL + '/report', {
      expenses,
      budgets
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ message: 'Could not generate report.' });
  }
});

// Get last 3 months' reports (optional: you can keep this or update to use Python service for each month)
router.get('/', auth, async (req, res) => {
  try {
    // For demo, just generate the current month's report using Python service
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const expenses = await Expense.find({ user: req.user, date: { $gte: startOfMonth } });
    const budgets = await Budget.find({ user: req.user });
    const response = await axios.post(process.env.PYTHON_SERVICE_URL + '/report', {
      expenses,
      budgets
    });
    // Return as an array for frontend compatibility
    res.json([{ month: `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2, '0')}`, ...response.data }]);
  } catch (err) {
    res.status(500).json({ message: 'Could not fetch reports.' });
  }
});

module.exports = router; 