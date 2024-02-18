const express = require('express');
const connectDB = require('./db');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const urlRoutes = require('./routes/urls');
const cors = require('cors');

const app = express();
app.use(cors());
const PORT = process.env.PORT || 3000;

connectDB();

app.use(express.json());

// Define authentication routes
app.use('/auth', authRoutes);

// Define user routes
app.use('/user', userRoutes);

//get a record from the db based on the originalUrl passed in the body
app.get('/get-url', urlRoutes);

//get an original url based on the short url path passed in the body
app.get('/get-org-url', urlRoutes);

//shorten a provided url
app.post('/shorten', urlRoutes);

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
