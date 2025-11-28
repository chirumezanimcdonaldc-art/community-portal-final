import { DataTypes, Model } from 'sequelize';
import sequelize from '../lib/database';
import User from './User';

interface EventAttributes {
  id?: number;
  title: string;
  description: string;
  date: Date;
  location: string;
  maxAttendees?: number;
  createdBy: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  createdAt?: Date;
  updatedAt?: Date;
}

class Event extends Model<EventAttributes> implements EventAttributes {
  declare id: number;
  declare title: string;
  declare description: string;
  declare date: Date;
  declare location: string;
  declare maxAttendees?: number;
  declare createdBy: number;
  declare status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Event.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        len: [1, 200],
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: [1, 2000],
      },
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING(500),
      allowNull: false,
      validate: {
        len: [1, 500],
      },
    },
    maxAttendees: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      validate: {
        min: 1,
      },
    },
    createdBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    status: {
      type: DataTypes.ENUM('upcoming', 'ongoing', 'completed', 'cancelled'),
      allowNull: false,
      defaultValue: 'upcoming',
    },
  },
  {
    sequelize,
    modelName: 'Event',
    tableName: 'events',
    timestamps: true,
  }
);

// Define associations
Event.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
User.hasMany(Event, { foreignKey: 'createdBy', as: 'createdEvents' });

export default Event;
