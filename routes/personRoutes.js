const express = require('express');
const router = express.Router();
const csvController = require('../controllers/csvController');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
router.post('/insertPersons', upload.single('csvFile'),csvController.uploadCsv);
router.get('/conversations/:dpi', csvController.getConversationsByDPI);

module.exports = router;