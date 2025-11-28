import { NextRequest, NextResponse } from 'next/server';
import sequelize from '../../../lib/database';
import Post from '../../../models/Post';
import User from '../../../models/User';
import '../../../lib/sync'; // Auto-sync database

export async function GET(request: NextRequest) {
  try {
    await sequelize.authenticate();
    console.log('Fetching posts from database...');

    const posts = await Post.findAll({
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'profilePicture'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    console.log('Found posts:', posts.length);
    console.log('Posts data:', JSON.stringify(posts, null, 2));

    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { content, imageUrl, authorId } = await request.json();

    if (!content || !authorId) {
      return NextResponse.json(
        { error: 'Content and author ID are required' },
        { status: 400 }
      );
    }

    await sequelize.authenticate();

    const post = await Post.create({
      content,
      imageUrl: imageUrl || null,
      authorId,
    });

    const createdPost = await Post.findByPk(post.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'profilePicture'],
        },
      ],
    });

    return NextResponse.json(createdPost, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
