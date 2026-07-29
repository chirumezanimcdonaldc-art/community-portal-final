import sequelize from './database';
import User from '../models/User';
import Post from '../models/Post';
import Like from '../models/Like';
import Comment from '../models/Comment';
import Event from '../models/Event';
import EventRequest from '../models/EventRequest';
import Notification from '../models/Notification';

let hasSynced = false;

export const syncDatabase = async () => {
  if (hasSynced) {
    return true;
  }

  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    await sequelize.sync({ force: false });
    console.log('Database synchronized successfully.');

    hasSynced = true;
    return true;
  } catch (error) {
    console.error('Unable to sync database:', error);
    return false;
  }
};

// Exported function only; do not auto-sync on import.

