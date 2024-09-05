const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

// Create an Express application
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Atlas connection
const uri = 'mongodb+srv://6969misc:pass1269@cluster0.c6fgh.mongodb.net/mydatbase?retryWrites=true&w=majority';
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

// Define a schema and model for the votes
const voteSchema = new mongoose.Schema({
  rollNo: { type: String, required: true, unique: true },
  option: { type: String, required: true }
});
const Vote = mongoose.model('Vote', voteSchema);

// Define a schema and model for the options
const optionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  votes: { type: Number, default: 0 }
});
const Option = mongoose.model('Option', optionSchema);

// Initialize options (run this once to set up initial options in the database)
const initializeOptions = async () => {
  const options = ['Adil', 'Anaswara', 'Prithviraj'];
  for (const name of options) {
    await Option.findOneAndUpdate({ name }, { name }, { upsert: true });
  }
};
initializeOptions();

// API to cast a vote
app.post('/vote', async (req, res) => {
  const { rollNo, option } = req.body;

  if (!rollNo || !option) {
    return res.status(400).json({ error: 'Roll number and option are required' });
  }

  // Check if the roll number has already voted
  const existingVote = await Vote.findOne({ rollNo });
  if (existingVote) {
    return res.status(400).json({ error: 'You have already voted' });
  }

  // Cast the vote
  const vote = new Vote({ rollNo, option });
  await vote.save();

  // Update the vote count for the selected option
  await Option.findOneAndUpdate({ name: option }, { $inc: { votes: 1 } });

  res.status(200).json({ message: 'Vote recorded successfully' });
});

// API to get the results
app.get('/results', async (req, res) => {
  const options = await Option.find({});
  res.status(200).json(options);
});

// API to get allowed roll numbers
app.get('/allowed-rollnos', (req, res) => {
  const allowedRollNos = [
    '241CV221', '241CV222', '241CV223', '241CV224', '241CV225', '241CV226', 
    '241CV227', '241CV228', '241CV229', '241CV230', '241CV231', '241CV232',
    // Add all other roll numbers here
    '241MT040'
  ];
  res.status(200).json({ allowedRollNos });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
