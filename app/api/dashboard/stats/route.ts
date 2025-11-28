import { NextRequest, NextResponse } from 'next/server';
import sequelize from '../../../../lib/database';
import User from '../../../../models/User';
import Post from '../../../../models/Post';
import Like from '../../../../models/Like';
import Comment from '../../../../models/Comment';
import '../../../../lib/sync'; // Auto-sync database

export async function GET(request: NextRequest) {
  try {
    await sequelize.authenticate();

    const [userPostCount, totalPosts, totalUsers, totalLikes, totalComments] = await Promise.all([
      // Get user's post count (we'll need user ID from token/auth in a real app)
      Post.count(),
      Post.count(),
      User.count(),
      Like.count(),
      Comment.count(),
    ]);

    // For now, we'll use a placeholder for user-specific data
    // In a real app, you'd get the user ID from authentication token
    const stats = {
      userPostCount: Math.floor(totalPosts * 0.1), // Placeholder: 10% of total posts
      totalPosts,
      totalUsers,
      totalLikes,
      totalComments,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
