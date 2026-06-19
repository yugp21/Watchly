const express = require('express');
const router = express.Router();
const { createAccount, importAccount, renameAccount, deleteAccount } = require('../controllers/accountController');

router.post('/create', createAccount);
router.post('/import', importAccount);
router.patch('/rename', renameAccount);
router.delete('/delete', deleteAccount);

module.exports = router;