import { Sequelize } from 'sequelize';
import mysql2 from 'mysql2';

const dbName = process.env.DB_NAME;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbHost = process.env.DB_HOST;
const dbPort = process.env.DB_PORT;

if (!dbName || !dbUser || !dbPassword || !dbHost) {
  throw new Error(
    'Missing required database environment variables. Please set DB_NAME, DB_USER, DB_PASSWORD, and DB_HOST.'
  );
}

const sequelize = new Sequelize(
  dbName,
  dbUser,
  dbPassword,
  {
    host: dbHost,
    port: dbPort ? Number(dbPort) : undefined,
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
