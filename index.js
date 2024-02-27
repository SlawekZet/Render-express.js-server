const express = require('express');
const cookieParser = require('cookie-parser');
const connectDB = require('./db');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const urlRoutes = require('./routes/urls');
const cors = require('cors');
const corsOptions = require('./config/corsOptions');

const app = express();
app.use(cors(corsOptions));

const PORT = process.env.PORT || 3000;

connectDB();
app.use(cookieParser());
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

//provide a list of URLs assigned to the user
app.get('/get-url-list', urlRoutes);

//detach user from an URL entity
app.put('/delete-user-from-entry', urlRoutes);

//update the short path of the URL
app.put('/update-short-url', urlRoutes);

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
