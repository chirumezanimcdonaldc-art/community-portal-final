import { NextRequest, NextResponse } from 'next/server';
import sequelize from '../../../../../lib/database';
import Comment from '../../../../../models/Comment';
import User from '../../../../../models/User';
import Post from '../../../../../models/Post';
import { NotificationService } from '../../../../../lib/notifications';
import '../../../../../lib/sync'; // Auto-sync database

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { content, userId } = await request.json();
    const { id } = await params;
    const postId = parseInt(id, 10);

    if (isNaN(postId) || !content?.trim() || !userId) {
      return NextResponse.json(
        { error: 'Invalid post ID, content, or user ID' },
        { status: 400 }
      );
    }

    await sequelize.authenticate();

    const comment = await Comment.create({
      content: content.trim(),
      userId,
      postId,
    });

    // Create notification for post author
    await NotificationService.createCommentNotification(userId, postId);

    const createdComment = await Comment.findByPk(comment.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'profilePicture'],
        },
      ],
    });

    return NextResponse.json(createdComment, { status: 201 });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const postId = parseInt(id, 10);

    if (isNaN(postId)) {
      return NextResponse.json(
        { error: 'Invalid post ID' },
        { status: 400 }
      );
    }

    await sequelize.authenticate();

    const comments = await Comment.findAll({
      where: { postId },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'profilePicture'],
        },
      ],
      order: [['createdAt', 'ASC']],
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
