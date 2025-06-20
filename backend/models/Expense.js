const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  date: { type: Date, required: true },
  paymentMethod: { type: String, required: true },
  notes: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);

if (require.main === module) {
  const User = require('./User');
  const expenses = [
    { email: 'user1@example.com', amount: 1200, category: 'Food', date: new Date(), paymentMethod: 'UPI', notes: 'Lunch' },
    { email: 'user1@example.com', amount: 5000, category: 'Rent', date: new Date(), paymentMethod: 'Credit Card', notes: '' },
    { email: 'user2@example.com', amount: 800, category: 'Shopping', date: new Date(), paymentMethod: 'Cash', notes: 'Clothes' },
    { email: 'admin@example.com', amount: 2000, category: 'Travel', date: new Date(), paymentMethod: 'UPI', notes: 'Taxi' },
  ];
  mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(async () => {
      for (const e of expenses) {
        const user = await User.findOne({ email: e.email });
        if (user) {
          await module.exports.create({
            user: user._id,
            amount: e.amount,
            category: e.category,
            date: e.date,
            paymentMethod: e.paymentMethod,
            notes: e.notes,
          });
        }
      }
      console.log('Dummy expenses inserted');
      process.exit(0);
    })
    .catch(err => { console.error(err); process.exit(1); });
} 