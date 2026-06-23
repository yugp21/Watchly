const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { getAllSites, addSite, updateSite, deleteSite, checkNow } = require('../controllers/siteController');

router.use(authenticate);
router.get('/', getAllSites);
router.post('/', addSite);
router.put('/:id', updateSite);
router.delete('/:id', deleteSite);
router.post('/check-now/:id', checkNow);

module.exports = router;