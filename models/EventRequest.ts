import { DataTypes, Model } from 'sequelize';
import sequelize from '../lib/database';
import User from './User';
import Event from './Event';

interface EventRequestAttributes {
  id?: number;
  eventId: number;
  userId: number;
  status: 'pending' | 'accepted' | 'declined';
  message?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

class EventRequest extends Model<EventRequestAttributes> implements EventRequestAttributes {
  declare id: number;
  declare eventId: number;
  declare userId: number;
  declare status: 'pending' | 'accepted' | 'declined';
  declare message?: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

EventRequest.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    eventId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: Event,
        key: 'id',
      },
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    status: {
      type: DataTypes.ENUM('pending', 'accepted', 'declined'),
      allowNull: false,
      defaultValue: 'pending',
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: [0, 500],
      },
    },
  },
  {
    sequelize,
    modelName: 'EventRequest',
    tableName: 'event_requests',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['eventId', 'userId'],
      },
    ],
  }
);

// Define associations
EventRequest.belongsTo(User, { foreignKey: 'userId', as: 'user' });
EventRequest.belongsTo(Event, { foreignKey: 'eventId', as: 'event' });
User.hasMany(EventRequest, { foreignKey: 'userId', as: 'eventRequests' });
Event.hasMany(EventRequest, { foreignKey: 'eventId', as: 'requests' });

export default EventRequest;
