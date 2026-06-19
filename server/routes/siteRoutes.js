const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { getAllSites, addSite, deleteSite, checkNow } = require('../controllers/siteController');

router.use(authenticate); // all site routes require auth
router.get('/', getAllSites);
router.post('/', addSite);
router.delete('/:id', deleteSite);
router.post('/check-now/:id', checkNow);

module.exports = router;