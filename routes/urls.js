const express = require('express');
const {
  getUrl,
  getOrgUrl,
  shortenUrl,
  getUrlList,
  deleteUserFromUrl,
  updateShortUrl,
} = require('../controllers/urlsController');
const verifyJwt = require('../middlewares/verifyJWT');
const router = express.Router();

router.get('/get-url', getUrl);
router.get('/get-org-url', getOrgUrl);
router.post('/shorten', shortenUrl);
router.get('/get-url-list', verifyJwt, getUrlList);
router.put('/delete-user-from-entry', verifyJwt, deleteUserFromUrl);
router.put('/update-short-url', verifyJwt, updateShortUrl);

module.exports = router;
