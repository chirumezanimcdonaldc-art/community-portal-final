import { NextRequest, NextResponse } from 'next/server';
import sequelize from '../../../../../lib/database';
import EventRequest from '../../../../../models/EventRequest';
import Event from '../../../../../models/Event';
import User from '../../../../../models/User';
import { NotificationService } from '../../../../../lib/notifications';
import '../../../../../lib/sync'; // Auto-sync database

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId, message } = await request.json();
    const { id } = await params;
    const eventId = parseInt(id, 10);

    if (isNaN(eventId) || !userId) {
      return NextResponse.json(
        { error: 'Invalid event ID or user ID' },
        { status: 400 }
      );
    }

    await sequelize.authenticate();

    // Check if event exists
    const event = await Event.findByPk(eventId);
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Check if user already requested
    const existingRequest = await EventRequest.findOne({
      where: { eventId, userId },
    });

    if (existingRequest) {
      return NextResponse.json(
        { error: 'You have already requested to join this event' },
        { status: 409 }
      );
    }

    // Create join request
    const joinRequest = await EventRequest.create({
      eventId,
      userId,
      message: message?.trim() || null,
      status: 'pending', // Add required status field
    });

    // Create notification for event creator
    await NotificationService.createEventRequestNotification(eventId, userId);

    const createdRequest = await EventRequest.findByPk(joinRequest.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'profilePicture'],
        },
      ],
    });

    return NextResponse.json(createdRequest, { status: 201 });
  } catch (error) {
    console.error('Error creating event request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const eventId = parseInt(id, 10);

    if (isNaN(eventId)) {
      return NextResponse.json(
        { error: 'Invalid event ID' },
        { status: 400 }
      );
    }

    await sequelize.authenticate();

    const requests = await EventRequest.findAll({
      where: { eventId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'profilePicture'],
        },
      ],
      order: [['createdAt', 'ASC']],
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error('Error fetching event requests:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
