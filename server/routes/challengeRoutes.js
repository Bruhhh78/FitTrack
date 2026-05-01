const express = require('express');
const router = express.Router();
const { getChallengesByBatch, getChallengeById, createChallenge, updateChallenge, deleteChallenge } = require('../controllers/challengeController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/batch/:batchId', protect, getChallengesByBatch);
router.get('/:id', protect, getChallengeById);
router.post('/', protect, adminOnly, createChallenge);
router.put('/:id', protect, adminOnly, updateChallenge);
router.delete('/:id', protect, adminOnly, deleteChallenge);

module.exports = router;
