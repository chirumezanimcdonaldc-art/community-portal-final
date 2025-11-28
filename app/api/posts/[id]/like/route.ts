import { NextRequest, NextResponse } from 'next/server';
import sequelize from '../../../../../lib/database';
import Like from '../../../../../models/Like';
import User from '../../../../../models/User';
import Post from '../../../../../models/Post';
import { NotificationService } from '../../../../../lib/notifications';
import '../../../../../lib/sync'; // Auto-sync database sync

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await request.json();
    const { id } = await params;
    const postId = parseInt(id, 10);

    if (isNaN(postId) || !userId) {
      return NextResponse.json(
        { error: 'Invalid post ID or user ID' },
        { status: 400 }
      );
    }

    await sequelize.authenticate();

    // Check if already liked
    const existingLike = await Like.findOne({
      where: { userId, postId },
    });

    if (existingLike) {
      // Unlike
      await existingLike.destroy();
      return NextResponse.json({ liked: false, likesCount: 0 });
    } else {
      // Like
      await Like.create({ userId, postId });
      
      // Create notification for post author
      await NotificationService.createLikeNotification(userId, postId);
      
      // Get total likes count
      const likesCount = await Like.count({
        where: { postId },
      });
      
      return NextResponse.json({ liked: true, likesCount });
    }
  } catch (error) {
    console.error('Error toggling like:', error);
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

    const likesCount = await Like.count({
      where: { postId },
    });

    return NextResponse.json({ likesCount });
  } catch (error) {
    console.error('Error fetching likes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
