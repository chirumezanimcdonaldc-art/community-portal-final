import sequelize from './database';
import User from '../models/User';
import Post from '../models/Post';
import Like from '../models/Like';
import Comment from '../models/Comment';
import Event from '../models/Event';
import EventRequest from '../models/EventRequest';
import Notification from '../models/Notification';

export const syncDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    // Sync without force to preserve existing data
    await sequelize.sync({ force: false });
    console.log('Database synchronized successfully.');
    
    return true;
  } catch (error) {
    console.error('Unable to sync database:', error);
    return false;
  }
};

// Exported function only; do not auto-sync on import.

