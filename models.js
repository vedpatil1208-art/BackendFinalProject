const mongoose = require('mongoose');

const User = mongoose.model('User', new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['client', 'freelancer'], default: 'client' }
}));

const Gig = mongoose.model('Gig', new mongoose.Schema({
  freelancer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  image: String
}));

const Job = mongoose.model('Job', new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: { type: String, required: true },
  description: { type: String, required: true },
  budget: { type: Number, required: true },
  applicants: [{
    freelancer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    proposal: String
  }]
}));

const Message = mongoose.model('Message', new mongoose.Schema({
  conversationId: String,
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  text: { type: String, required: true }
}, { timestamps: true }));

module.exports = { User, Gig, Job, Message };