import { DataTypes, Model } from 'sequelize';
import sequelize from '../lib/database';
import User from './User';
import Post from './Post';

interface LikeAttributes {
  id?: number;
  userId: number;
  postId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

class Like extends Model<LikeAttributes> implements LikeAttributes {
  declare id: number;
  declare userId: number;
  declare postId: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Like.init(
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
    postId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: Post,
        key: 'id',
      },
    },
  },
  {
    sequelize,
    modelName: 'Like',
    tableName: 'likes',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['userId', 'postId'],
      },
    ],
  }
);

// Define associations
Like.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Like.belongsTo(Post, { foreignKey: 'postId', as: 'post', onDelete: 'CASCADE' });
User.hasMany(Like, { foreignKey: 'userId', as: 'likes' });
Post.hasMany(Like, { foreignKey: 'postId', as: 'likes', onDelete: 'CASCADE' });

export default Like;
