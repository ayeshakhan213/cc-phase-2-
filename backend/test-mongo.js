require('dotenv').config();
const mongoose = require('mongoose');

console.log('Testing MongoDB Connection...');
console.log('Connection String:', process.env.MONGODB_URI);

mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
})
  .then(() => {
    console.log('✅ MongoDB Connected Successfully!');
    process.exit(0);
  })
  .catch((err) => {
    console.log('❌ MongoDB Connection Error:', err.message);
    console.log('\nTroubleshooting:');
    console.log('1. Verify username: glamuser');
    console.log('2. Verify password: glamuser');
    console.log('3. Check IP whitelist in MongoDB Atlas (needs 0.0.0.0/0 or your IP)');
    console.log('4. Verify cluster name: glamcartdb');
    console.log('5. User permissions: Should have Atlas Admin or higher');
    process.exit(1);
  });
