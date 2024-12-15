const express = require('express');
const router = express.Router();
const Inventory = require('../models/Inventory');  // Adjust the path as needed

router.get('/', async (req, res) => {
  try {
    const inventoryItems = await Inventory.find({});
    res.json(inventoryItems);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ message: 'Error fetching inventory' });
  }
});

module.exports = router;