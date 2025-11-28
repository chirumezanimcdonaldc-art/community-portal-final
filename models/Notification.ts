import { DataTypes, Model } from 'sequelize';
import sequelize from '../lib/database';
import User from './User';

interface NotificationAttributes {
  id?: number;
  userId: number;
  type: 'like' | 'comment' | 'event_request' | 'event_accepted' | 'event_declined' | 'follow';
  title: string;
  message: string;
  relatedId?: number; // ID of related item (post, event, etc.)
  relatedType?: 'post' | 'event' | 'user';
  isRead: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

class Notification extends Model<NotificationAttributes> implements NotificationAttributes {
  declare id: number;
  declare userId: number;
  declare type: 'like' | 'comment' | 'event_request' | 'event_accepted' | 'event_declined' | 'follow';
  declare title: string;
  declare message: string;
  declare relatedId?: number;
  declare relatedType?: 'post' | 'event' | 'user';
  declare isRead: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Notification.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    type: {
      type: DataTypes.ENUM('like', 'comment', 'event_request', 'event_accepted', 'event_declined', 'follow'),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        len: [1, 200],
      },
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: [1, 1000],
      },
    },
    relatedId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    relatedType: {
      type: DataTypes.ENUM('post', 'event', 'user'),
      allowNull: true,
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: 'Notification',
    tableName: 'notifications',
    timestamps: true,
    indexes: [
      {
        fields: ['userId', 'isRead'],
      },
      {
        fields: ['createdAt'],
      },
    ],
  }
);

// Define associations
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });

export default Notification;
