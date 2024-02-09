const mongoose = require('mongoose');

// Define Mongoose schema
const urlSchema = new mongoose.Schema({
  originalUrl: { type: String, required: true },
  shortenedUrlPath: { type: String, required: true, unique: true },
});

// Define Mongoose model
const Url = mongoose.model('Url', urlSchema);

// Connect to MongoDB using Mongoose
mongoose
  .connect('mongodb://localhost/url-shortener', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

// Function to generate short URL path
const shortUrlPathGenerator = () => {
  let path = '';
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i <= 5; i++) {
    const number = Math.floor(Math.random() * chars.length);
    const element = chars.charAt(number);
    path += element;
  }

  return path;
};

// Get shortened URL: GET
const getUrl = async (req, res) => {
  const orgUrl = req.query.url;

  try {
    const searchResult = await Url.findOne({ originalUrl: orgUrl });

    if (searchResult) {
      res.json(searchResult);
    } else {
      res.status(404).json({ message: 'URL not found' });
    }
  } catch (error) {
    console.error('Error fetching shortened URLs:', error);
    res.status(500).send(error);
  }
};

// Get original URL: POST
const getOrgUrl = async (req, res) => {
  const shortPath = req.query.shortenedUrlPath;

  try {
    const searchResult = await Url.findOne({ shortenedUrlPath: shortPath });

    if (searchResult) {
      res.json(searchResult);
    } else {
      res.status(404).json({
        message: `URL connected to https://shooort.eu/${shortPath} not found`,
      });
    }
  } catch (error) {
    console.error('Error fetching shortened URLs:', error);
    res.status(500).send(error);
  }
};

// Shorten new URL: POST
const shortenUrl = async (req, res) => {
  const orgUrl = req.body.originalUrl;
  let shortUrlPath = shortUrlPathGenerator();
  let urlEntry = {};

  try {
    const searchResult = await Url.findOne({
      $or: [{ originalUrl: orgUrl }, { shortenedUrlPath: shortUrlPath }],
    });

    if (searchResult) {
      if (searchResult.originalUrl === orgUrl) {
        res.json({
          shortenedUrl: `https://shooort.eu/${searchResult.shortenedUrlPath}`,
        });
        return;
      } else {
        while (searchResult.shortenedUrlPath === shortUrlPath) {
          shortUrlPath = shortUrlPathGenerator();
        }
      }
    }

    urlEntry = {
      originalUrl: orgUrl,
      shortenedUrlPath: shortUrlPath,
    };

    await Url.create(urlEntry);
    res.json({
      shortenedUrl: `https://shooort.eu/${urlEntry.shortenedUrlPath}`,
    });
  } catch (error) {
    console.error('Error while shortening URL:', error);
    res.status(500).send(error);
  }
};

module.exports = { getUrl, getOrgUrl, shortenUrl };
