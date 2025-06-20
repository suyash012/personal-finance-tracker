const express = require('express');
const Expense = require('../models/Expense');
const auth = require('../middleware/auth');
const axios = require('axios');

const router = express.Router();

// Get smart suggestions from Python service
router.get('/', auth, async (req, res) => {
  try {
    const last30 = new Date();
    last30.setDate(last30.getDate() - 30);
    const expenses = await Expense.find({
      user: req.user,
      date: { $gte: last30 }
    });
    // Send to Python service
    const response = await axios.post(process.env.PYTHON_SERVICE_URL + '/suggestions', {
      expenses: expenses.map(e => ({
        amount: e.amount,
        category: e.category,
        date: e.date,
        paymentMethod: e.paymentMethod,
        notes: e.notes || ''
      }))
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ message: 'Could not get suggestions.' });
  }
});

module.exports = router; 