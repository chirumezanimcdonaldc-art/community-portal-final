import { NextRequest, NextResponse } from 'next/server';
import sequelize from '../../../lib/database';
import Notification from '../../../models/Notification';
import User from '../../../models/User';
import '../../../lib/sync'; // Auto-sync database

export async function GET(request: NextRequest) {
  try {
    await sequelize.authenticate();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const notifications = await Notification.findAll({
      where: { userId: parseInt(userId) },
      order: [['createdAt', 'DESC']],
      limit,
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await sequelize.authenticate();

    const { userId, notificationId, markAll } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (markAll) {
      // Mark all notifications as read
      await Notification.update(
        { isRead: true },
        { where: { userId: parseInt(userId), isRead: false } }
      );

      return NextResponse.json({ message: 'All notifications marked as read' });
    } else if (notificationId) {
      // Mark specific notification as read
      await Notification.update(
        { isRead: true },
        { where: { id: parseInt(notificationId), userId: parseInt(userId) } }
      );

      return NextResponse.json({ message: 'Notification marked as read' });
    } else {
      return NextResponse.json(
        { error: 'Either notificationId or markAll must be provided' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error updating notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
