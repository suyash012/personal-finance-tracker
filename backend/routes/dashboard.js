const express = require('express');
const Expense = require('../models/Expense');
const auth = require('../middleware/auth');

const router = express.Router();

// Get dashboard summary
router.get('/summary', auth, async (req, res) => {
  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0,0,0,0);
    const expenses = await Expense.find({
      user: req.user,
      date: { $gte: startOfMonth }
    });
    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
    // Top category
    const categoryTotals = {};
    expenses.forEach(e => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });
    const topCategory = Object.entries(categoryTotals).sort((a,b) => b[1]-a[1])[0]?.[0] || null;
    // Top 3 payment methods
    const paymentTotals = {};
    expenses.forEach(e => {
      paymentTotals[e.paymentMethod] = (paymentTotals[e.paymentMethod] || 0) + 1;
    });
    const topPaymentMethods = Object.entries(paymentTotals)
      .sort((a,b) => b[1]-a[1])
      .slice(0,3)
      .map(([method]) => method);
    res.json({ totalSpent, topCategory, topPaymentMethods });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Pie chart: category-wise spending
router.get('/pie', auth, async (req, res) => {
  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0,0,0,0);
    const expenses = await Expense.find({
      user: req.user,
      date: { $gte: startOfMonth }
    });
    const data = {};
    expenses.forEach(e => {
      data[e.category] = (data[e.category] || 0) + e.amount;
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Line graph: spending over time (by day)
router.get('/line', auth, async (req, res) => {
  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0,0,0,0);
    const expenses = await Expense.find({
      user: req.user,
      date: { $gte: startOfMonth }
    });
    const daily = {};
    expenses.forEach(e => {
      const day = e.date.toISOString().slice(0,10);
      daily[day] = (daily[day] || 0) + e.amount;
    });
    res.json(daily);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router; 