const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const expensesRoutes = require('./expenses');
const budgetsRoutes = require('./budgets');
const dashboardRoutes = require('./dashboard');
const suggestionsRoutes = require('./suggestions');
const reportsRoutes = require('./reports');

router.use('/auth', authRoutes);
router.use('/expenses', expensesRoutes);
router.use('/budgets', budgetsRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/suggestions', suggestionsRoutes);
router.use('/reports', reportsRoutes);

// Placeholder route
router.get('/', (req, res) => {
  res.json({ message: 'API Home' });
});

module.exports = router; 