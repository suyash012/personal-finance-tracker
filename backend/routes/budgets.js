const express = require('express');
const Budget = require('../models/Budget');
const Expense = require('../models/Expense');
const auth = require('../middleware/auth');

const router = express.Router();

// Create or update budget for a category
router.post('/', auth, async (req, res) => {
  try {
    const { category, limit } = req.body;
    let budget = await Budget.findOneAndUpdate(
      { user: req.user, category },
      { limit },
      { new: true, upsert: true }
    );
    res.status(201).json(budget);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Get all budgets for user
router.get('/', auth, async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user });
    res.json(budgets);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Delete a budget
router.delete('/:id', auth, async (req, res) => {
  try {
    const budget = await Budget.findOneAndDelete({ _id: req.params.id, user: req.user });
    if (!budget) return res.status(404).json({ message: 'Budget not found.' });
    res.json({ message: 'Budget deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Check budget status for a category (alerts)
router.get('/status/:category', auth, async (req, res) => {
  try {
    const { category } = req.params;
    const budget = await Budget.findOne({ user: req.user, category });
    if (!budget) return res.json({ status: 'no-budget' });
    // Calculate total spent in this category this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0,0,0,0);
    const totalSpent = await Expense.aggregate([
      { $match: {
          user: budget.user,
          category,
          date: { $gte: startOfMonth }
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const spent = totalSpent[0]?.total || 0;
    let alert = null;
    if (spent >= budget.limit) alert = 'over';
    else if (spent >= 0.8 * budget.limit) alert = 'warning';
    res.json({ spent, limit: budget.limit, alert });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router; 