const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const SettingsSchema = new Schema({
  siteName: { 
    type: String, 
    default: 'WorkingSpice Helpdesk'
  },
  logo: { 
    type: String, 
    default: '⚡'
  },
  primaryColor: { 
    type: String, 
    default: '#2a6592'
  },
  allowPublicRegistration: { 
    type: Boolean, 
    default: true 
  },
  defaultTicketPriority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'critical', 'choose priority'],
    default: 'medium'
  },
  ticketCategoriesEnabled: { 
    type: Boolean, 
    default: false 
  },
  ticketCategories: [{ 
    type: String 
  }],
  maintenanceMode: { 
    type: Boolean, 
    default: false 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User'
  }
});

// Make sure we have only one settings document
SettingsSchema.statics.getSettings = async function() {
  const settings = await this.findOne();
  if (settings) {
    return settings;
  }
  return await this.create({});
};

const Settings = model("Settings", SettingsSchema);
module.exports = Settings;