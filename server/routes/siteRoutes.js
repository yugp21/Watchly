const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  getAllSites,
  addSite,
  updateSite,
  deleteSite,
  checkNow,
  verifyEmail,
  unsubscribe,
} = require('../controllers/siteController');

// Public routes — no auth needed (called from email links)
router.get('/verify-email', verifyEmail);
router.get('/unsubscribe', unsubscribe);

// Protected routes
router.use(authenticate);
router.get('/', getAllSites);
router.post('/', addSite);
router.put('/:id', updateSite);
router.delete('/:id', deleteSite);
router.post('/check-now/:id', checkNow);

module.exports = router;