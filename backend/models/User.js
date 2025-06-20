const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);

if (require.main === module) {
  mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(async () => {
      const users = [
        { email: 'user1@example.com', password: 'password123' },
        { email: 'user2@example.com', password: 'password456' },
        { email: 'admin@example.com', password: 'adminpass' },
      ];
      for (const u of users) {
        const hashed = await bcrypt.hash(u.password, 10);
        await module.exports.create({ email: u.email, password: hashed });
      }
      console.log('Dummy users inserted');
      process.exit(0);
    })
    .catch(err => { console.error(err); process.exit(1); });
}

 