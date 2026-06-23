const express = require('express');
const router = express.Router();
const {
  createAccount,
  importAccount,
  renameAccount,
  deleteAccount,
  recoverAccount,
} = require('../controllers/accountController');

router.post('/create', createAccount);
router.post('/import', importAccount);
router.patch('/rename', renameAccount);
router.delete('/delete', deleteAccount);
router.post('/recover', recoverAccount);

module.exports = router;