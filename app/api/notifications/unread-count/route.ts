import { NextRequest, NextResponse } from 'next/server';
import sequelize from '../../../../lib/database';
import Notification from '../../../../models/Notification';
import '../../../../lib/sync'; // Auto-sync database

export async function GET(request: NextRequest) {
  try {
    await sequelize.authenticate();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const count = await Notification.count({
      where: { userId: parseInt(userId), isRead: false },
    });

    return NextResponse.json({ unreadCount: count });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
