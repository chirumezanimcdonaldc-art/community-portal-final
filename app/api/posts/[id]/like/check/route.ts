import { NextRequest, NextResponse } from 'next/server';
import sequelize from '../../../../../../lib/database';
import Like from '../../../../../../models/Like';
import '../../../../../../lib/sync'; // Auto-sync database

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const postId = parseInt(id, 10);
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (isNaN(postId) || !userId) {
      return NextResponse.json(
        { error: 'Invalid post ID or user ID' },
        { status: 400 }
      );
    }

    await sequelize.authenticate();

    const existingLike = await Like.findOne({
      where: { 
        userId: parseInt(userId, 10),
        postId 
      },
    });

    return NextResponse.json({ liked: !!existingLike });
  } catch (error) {
    console.error('Error checking like status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
