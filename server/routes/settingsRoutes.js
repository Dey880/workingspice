const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');

// Get public settings (no auth required)
router.get('/public', async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    
    // Only send necessary settings to the client
    const publicSettings = {
      siteName: settings.siteName,
      logo: settings.logo,
      primaryColor: settings.primaryColor,
      allowPublicRegistration: settings.allowPublicRegistration,
      ticketCategoriesEnabled: settings.ticketCategoriesEnabled,
      ticketCategories: settings.ticketCategories,
      defaultTicketPriority: settings.defaultTicketPriority,
      maintenanceMode: settings.maintenanceMode
    };
    
    res.status(200).json({ settings: publicSettings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Internal server error" });
  }
});

module.exports = router;