import { DataTypes, Model } from 'sequelize';
import sequelize from '../lib/database';
import User from './User';

interface PostAttributes {
  id?: number;
  content: string;
  imageUrl?: string;
  authorId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

class Post extends Model<PostAttributes> implements PostAttributes {
  public id!: number;
  public content!: string;
  public imageUrl?: string;
  public authorId!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Post.init(
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
        len: [1, 2000],
      },
    },
    imageUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    authorId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
  },
  {
    sequelize,
    modelName: 'Post',
    tableName: 'posts',
    timestamps: true,
  }
);

// Define associations
Post.belongsTo(User, { foreignKey: 'authorId', as: 'author' });
User.hasMany(Post, { foreignKey: 'authorId', as: 'posts' });

export default Post;
