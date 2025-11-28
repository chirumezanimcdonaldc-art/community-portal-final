import { DataTypes, Model } from 'sequelize';
import sequelize from '../lib/database';
import User from './User';
import Post from './Post';

interface CommentAttributes {
  id?: number;
  content: string;
  userId: number;
  postId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

class Comment extends Model<CommentAttributes> implements CommentAttributes {
  declare id: number;
  declare content: string;
  declare userId: number;
  declare postId: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Comment.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: [1, 1000],
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
    modelName: 'Comment',
    tableName: 'comments',
    timestamps: true,
  }
);

// Define associations
Comment.belongsTo(User, { foreignKey: 'userId', as: 'author' });
Comment.belongsTo(Post, { foreignKey: 'postId', as: 'post', onDelete: 'CASCADE' });
User.hasMany(Comment, { foreignKey: 'userId', as: 'comments' });
Post.hasMany(Comment, { foreignKey: 'postId', as: 'comments', onDelete: 'CASCADE' });

export default Comment;
