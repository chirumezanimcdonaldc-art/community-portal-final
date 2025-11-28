import { NextRequest, NextResponse } from 'next/server';
import sequelize from '../../../lib/database';
import Event from '../../../models/Event';
import User from '../../../models/User';
import EventRequest from '../../../models/EventRequest';
import '../../../lib/sync'; // Auto-sync database

export async function GET(request: NextRequest) {
  try {
    console.log('Events API: Authenticating and fetching events...');
    await sequelize.authenticate();

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
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'profilePicture'],
            },
          ],
        },
      ],
      order: [['date', 'ASC']],
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Events POST API: Authenticating and creating event...');
    
    const { title, description, date, location, maxAttendees, createdBy } = await request.json();

    if (!title || !description || !date || !location || !createdBy) {
      return NextResponse.json(
        { error: 'Title, description, date, location, and creator are required' },
        { status: 400 }
      );
    }

    await sequelize.authenticate();

    const event = await Event.create({
      title: title.trim(),
      description: description.trim(),
      date: new Date(date),
      location: location.trim(),
      maxAttendees: maxAttendees || null,
      createdBy,
      status: 'upcoming', // Add required status field
    });

    const createdEvent = await Event.findByPk(event.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'profilePicture'],
        },
      ],
    });

    return NextResponse.json(createdEvent, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
