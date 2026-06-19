require('dotenv').config();
const mongoose = require('mongoose');
 
const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');
 
  try {
    await mongoose.connection.collection('sites').drop();
    console.log('Dropped old sites collection');
  } catch (e) {
    console.log('sites collection does not exist - OK');
  }
 
  try {
    await mongoose.connection.collection('accounts').drop();
    console.log('Dropped old accounts collection');
  } catch (e) {
    console.log('accounts collection does not exist - OK');
  }
 
  await mongoose.disconnect();
  console.log('Done! Now restart your server.');
};
 
run().catch(console.error);