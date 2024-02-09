const express = require('express');
const { getUrl, getOrgUrl, shortenUrl } = require('../src/urls');

const router = express.Router();

router.get('/get-url', getUrl);
router.get('/get-org-url', getOrgUrl);
router.post('/shorten', shortenUrl);

module.exports = router;
