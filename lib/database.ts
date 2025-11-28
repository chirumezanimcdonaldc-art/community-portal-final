import { Sequelize } from 'sequelize';
import mysql2 from 'mysql2';

const sequelize = new Sequelize(
  "bsllvo3idsz7i88ixnas",
 "u4dq6ddsjahf6dew",
  "Ev4HOtygXLATcuOD25zx",
  {
    host: "bsllvo3idsz7i88ixnas-mysql.services.clever-cloud.com",
    dialect: 'mysql',
    dialectModule: mysql2,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 2, // Reduced to 2 connections to stay well under limit
      min: 0, // Minimum number of connections in pool
      acquire: 60000, // Increase time to acquire a connection
      idle: 5000, // Reduce idle time to close connections faster
      evict: 1000, // Evict connections after 1 second of inactivity
    },
    retry: {
      max: 3, // Maximum number of retry attempts
      timeout: 5000, // Time between retries (ms)
    },
  }
);

export default sequelize;
