const mongoose = require('mongoose');
const Url = require('../models/Url');

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

// Get original URL: GET
const getOrgUrl = async (req, res) => {
  const shortPath = req.query.shortenedUrlPath;

  try {
    const searchResult = await Url.findOne({
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
const shortenUrl = async (req, res) => {
  const orgUrl = req.body.originalUrl;
  const username = req.body.genByUser;
  let shortUrlPath = shortUrlPathGenerator();
  let urlEntry = {};

  const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/;
  const foundUrl = await Url.findOne({
    genByUser: username,
    originalUrl: orgUrl,
  });

  if (!urlRegex.test(orgUrl)) {
    return res.status(400).json({ message: 'Invalid URL' });
  } else if (foundUrl) {
    return res
      .status(400)
      .json({ message: 'This url is already shortened and on your list' });
  } else if (orgUrl.includes('shooort.eu')) {
    return res
      .status(400)
      .json({ message: 'You cannot shorten already shortened URL' });
  }

  try {
    const searchResult = await Url.findOne({
      $or: [{ originalUrl: orgUrl }, { shortenedUrlPath: shortUrlPath }],
    });

    if (searchResult) {
      if (searchResult.originalUrl === orgUrl) {
        res.json({
          shortenedUrlPath: searchResult.shortenedUrlPath,
        });
        return;
      } else {
        while (searchResult.shortenedUrlPath === shortUrlPath) {
          shortUrlPath = shortUrlPathGenerator();
        }
      }
    }

    urlEntry = {
      genByUser: req.body.genByUser,
      originalUrl: orgUrl,
      shortenedUrlPath: shortUrlPath,
    };

    await Url.create(urlEntry);
    res.json({
      shortenedUrlPath: urlEntry.shortenedUrlPath,
    });
  } catch (error) {
    console.error('Error while shortening URL:', error);
    res.status(500).send(error);
  }
};

// Get array of URLs by username
const getUrlList = async (req, res) => {
  const username = req.query.username;
  const result = await Url.find({ genByUser: username });
  if (!result) return res.status(404).json({ message: 'No urls found' });

  const response = result.map((e) => {
    const urlObj = {
      orgUrl: e.originalUrl,
      shortUrl: e.shortenedUrlPath,
    };
    return urlObj;
  });

  console.log(response);
  res.json(response);
};

// delete User from the genByUser entity

const deleteUserFromUrl = async (req, res) => {
  if (!req?.body?.shortPath)
    return res
      .status(400)
      .json({ message: 'Short Path needed to delete the entry from the list' });

  try {
    const entry = await Url.findOne({
      shortenedUrlPath: req.body.shortPath,
    }).exec();
    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }
    entry.genByUser = 'null';
    const result = await entry.save();
    res.status(200).json({ message: 'Entry deleted successfully' });
  } catch (error) {
    console.error('Error while deleting the entry:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// update the shortPath

const updateShortUrl = async (req, res) => {
  const regex = /^[a-zA-Z0-9]{4,15}$/;
  if (!req?.body?.shortPath) {
    return res
      .status(400)
      .json({ message: 'An input is needed to change the short path URL' });
  } else if (req.body.shortPath > 15) {
    return res
      .status(400)
      .json({ message: 'URL should not be longer than 15 characters' });
  } else if (!regex.test(req.body.shortPath)) {
    return res
      .status(400)
      .json({ message: 'Invalid input. You can only use letters and numbers' });
  }
  try {
    const entry = await Url.findOne({
      shortenedUrlPath: req.body.shortPath,
    }).exec();
    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }
    entry.shortenedUrlPath = req.body.newShortPath;
    const result = await entry.save();
    console.log(result);
    res.status(200).json({ message: 'Short URL edited successfully' });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        error: 'Duplicate key error',
        message: 'URL with this path already exists',
      });
    }
    console.error('Error while updating short URL:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  getUrl,
  getOrgUrl,
  shortenUrl,
  getUrlList,
  deleteUserFromUrl,
  updateShortUrl,
};
