import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const SettingsContext = createContext();

// Change this to a named constant export
export const useSettings = () => {
  return useContext(SettingsContext);
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState({
    siteName: 'WorkingSpice Helpdesk',
    logo: '⚡',
    primaryColor: '#2a6592',
    allowPublicRegistration: true,
    defaultTicketPriority: 'medium',
    ticketCategoriesEnabled: false,
    ticketCategories: [],
    maintenanceMode: false,
  });
  const [loading, setLoading] = useState(true);

  // Apply default settings immediately
  useEffect(() => {
    applyColorSettings(settings.primaryColor);
  }, []);

  // Function to apply color settings
  const applyColorSettings = (color) => {
    // Generate darker and lighter variants
    const darkenColor = (color, percent) => {
      const num = parseInt(color.replace('#', ''), 16);
      const amt = Math.round(2.55 * percent);
      const R = Math.max(0, (num >> 16) - amt);
      const G = Math.max(0, (num >> 8 & 0x00FF) - amt);
      const B = Math.max(0, (num & 0x0000FF) - amt);
      return '#' + (0x1000000 + (R << 16) + (G << 8) + B).toString(16).slice(1);
    };
    
    const lightenColor = (color, percent) => {
      const num = parseInt(color.replace('#', ''), 16);
      const amt = Math.round(2.55 * percent);
      const R = Math.min(255, (num >> 16) + amt);
      const G = Math.min(255, (num >> 8 & 0x00FF) + amt);
      const B = Math.min(255, (num & 0x0000FF) + amt);
      return '#' + (0x1000000 + (R << 16) + (G << 8) + B).toString(16).slice(1);
    };
    
    document.documentElement.style.setProperty('--primary', color);
    document.documentElement.style.setProperty('--primary-dark', darkenColor(color, 15));
    document.documentElement.style.setProperty('--primary-light', lightenColor(color, 20));
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // Fix the URL - remove double /api if needed
        const apiUrl = import.meta.env.VITE_API_URL;
        const url = apiUrl.endsWith('/api') 
          ? `${apiUrl}/settings/public` 
          : `${apiUrl}/api/settings/public`;
        
        const response = await axios.get(url);
        
        if (response.data && response.data.settings) {
          setSettings(response.data.settings);
          
          // Apply color settings when received from API
          if (response.data.settings.primaryColor) {
            applyColorSettings(response.data.settings.primaryColor);
          }
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
}