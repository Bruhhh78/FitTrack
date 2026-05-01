const express = require('express');
const router = express.Router();
const { getBatches, getBatchById, createBatch, updateBatch, deleteBatch } = require('../controllers/batchController');
const { protect, adminOnly, optionalProtect } = require('../middleware/auth');

router.get('/', optionalProtect, getBatches);
router.get('/:id', protect, getBatchById);
router.post('/', protect, adminOnly, createBatch);
router.put('/:id', protect, adminOnly, updateBatch);
router.delete('/:id', protect, adminOnly, deleteBatch);

module.exports = router;
