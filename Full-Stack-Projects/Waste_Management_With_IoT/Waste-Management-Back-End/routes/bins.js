const express = require('express');
const BinsController = require('../controller/bins');
const router = express.Router();

// Group bin-related routes under /bins
router.get('/', BinsController.getBins);

router.get('/:id', BinsController.getBinById);

router.post('/', BinsController.createBin);

router.put('/:id', BinsController.editBinById);

router.delete('/:id', BinsController.deleteBinById);

module.exports = router;
