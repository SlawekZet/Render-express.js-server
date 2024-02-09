import { getClient } from './dbconnect.js';

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
export const getUrl = async (req, res) => {
  const client = getClient();
  const orgUrl = req.query.url;

  try {
    const collection = client.db('url-shortener').collection('urls');

    const searchResult = await collection.findOne({ originalUrl: orgUrl });

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

// Get original URL: GET
export const getOrgUrl = async (req, res) => {
  const client = getClient();
  const shortPath = req.query.shortenedUrlPath;

  try {
    const collection = client.db('url-shortener').collection('urls');
    const searchResult = await collection.findOne({
      shortenedUrlPath: shortPath,
    });

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
export const shortenUrl = async (req, res) => {
  const client = getClient();
  const orgUrl = req.body.originalUrl;
  let shortUrlPath = shortUrlPathGenerator();
  let urlEntry = {};

  try {
    const collection = client.db('url-shortener').collection('urls');

    const searchResult = await collection.findOne({
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

    await collection.insertOne(urlEntry);
    res.json({
      shortenedUrl: `https://shooort.eu/${urlEntry.shortenedUrlPath}`,
    });
  } catch (error) {
    console.error('Error while shortening URL:', error);
    res.status(500).send(error);
  }
};
