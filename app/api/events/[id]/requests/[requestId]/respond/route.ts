import { NextRequest, NextResponse } from 'next/server';
import sequelize from '../../../../../../../lib/database';
import EventRequest from '../../../../../../../models/EventRequest';
import Event from '../../../../../../../models/Event';
import User from '../../../../../../../models/User';
import { NotificationService } from '../../../../../../../lib/notifications';
import '../../../../../../../lib/sync'; // Auto-sync database

export async function POST(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string; requestId: string }> }
) {
  try {
    const { action, userId } = await request.json();
    const { id, requestId } = await params;
    const eventId = parseInt(id, 10);
    const requestToUpdateId = parseInt(requestId, 10);
    const organizerId = Number(userId);

    if (isNaN(eventId) || isNaN(requestToUpdateId) || !action || isNaN(organizerId)) {
      return NextResponse.json(
        { error: 'Invalid event ID, request ID, action, or user ID' },
        { status: 400 }
      );
    }

    if (!['accept', 'decline'].includes(action)) {
      return NextResponse.json(
        { error: 'Action must be either "accept" or "decline"' },
        { status: 400 }
      );
    }

    await sequelize.authenticate();

    // Find the request
    const eventRequest = await EventRequest.findByPk(requestToUpdateId, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'profilePicture'],
        },
      ],
    });

    if (!eventRequest) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      );
    }

    if (eventRequest.eventId !== eventId) {
      return NextResponse.json(
        { error: 'Request does not belong to this event' },
        { status: 400 }
      );
    }

    const event = await Event.findByPk(eventId);
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    if (event.createdBy !== organizerId) {
      return NextResponse.json(
        { error: 'Only the event organizer can approve or decline requests' },
        { status: 403 }
      );
    }

    if (eventRequest.status !== 'pending') {
      return NextResponse.json(
        { error: 'Request has already been processed' },
        { status: 400 }
      );
    }

    if (action === 'accept' && event.maxAttendees) {
      const acceptedCount = await EventRequest.count({
        where: { eventId, status: 'accepted' },
      });

      if (acceptedCount >= event.maxAttendees) {
        return NextResponse.json(
          { error: 'Event is at capacity. No more attendees can be accepted.' },
          { status: 409 }
        );
      }
    }

    // Update request status
    await eventRequest.update({
      status: action === 'accept' ? 'accepted' : 'declined',
    });

    // Create notification for the user who made the request
    await NotificationService.createEventResponseNotification(eventId, eventRequest.userId, action);

    return NextResponse.json({
      message: `Request ${action}ed successfully`,
      request: eventRequest,
    });
  } catch (error) {
    console.error('Error responding to event request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
