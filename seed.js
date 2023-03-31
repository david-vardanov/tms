const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/user');
const db = require('./config/db');
require('dotenv').config();

const connectDB = async () => {
  await db.connect();
  console.log('Connected to MongoDB');
  
  // Hash the password before saving the user to the database
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('asdasd', salt);

  // Create a seed user with superadmin role and a hashed password
  const user = new User({
    username: 'admin',
    email: 'admin@example.com',
    password: hashedPassword,
    role: 'admin'
  });

  try {
    await user.save();
    console.log(user);
    console.log('Seed user created successfully');
  } catch (error) {
    console.log(error);
  }

  mongoose.connection.close();
}

connectDB().catch(console.error);