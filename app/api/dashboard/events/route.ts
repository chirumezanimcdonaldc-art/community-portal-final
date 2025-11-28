import { NextRequest, NextResponse } from 'next/server';
import sequelize from '../../../../lib/database';
import Event from '../../../../models/Event';
import User from '../../../../models/User';
import EventRequest from '../../../../models/EventRequest';
import '../../../../lib/sync'; // Auto-sync database

export async function GET(request: NextRequest) {
  try {
    console.log('Dashboard Events API: Authenticating and fetching events...');
    await sequelize.authenticate();

    // Get all events (similar to main events API)
    const events = await Event.findAll({
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'profilePicture'],
        },
        {
          model: EventRequest,
          as: 'requests',
          attributes: ['id', 'status'],
        },
      ],
      order: [['date', 'ASC']],
      limit: 10, // Show up to 10 events
    });

    console.log('Found events:', events.length);

    // Format events with request counts
    const formattedEvents = events.map((event: any) => {
      const acceptedCount = event.requests?.filter((req: any) => req.status === 'accepted').length || 0;
      const pendingCount = event.requests?.filter((req: any) => req.status === 'pending').length || 0;

      return {
        id: event.id,
        title: event.title,
        description: event.description,
        date: event.date,
        location: event.location,
        maxAttendees: event.maxAttendees,
        status: event.status,
        creator: event.creator,
        acceptedCount,
        pendingCount,
      };
    });

    return NextResponse.json(formattedEvents);
  } catch (error) {
    console.error('Error fetching dashboard events:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
