import { NextRequest, NextResponse } from 'next/server';
import sequelize from '../../../../lib/database';
import User from '../../../../models/User';
import { comparePassword, generateToken } from '../../../../lib/auth';
import '../../../../lib/sync'; // Auto-sync database

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    await sequelize.authenticate();

    const user = await User.findOne({
      where: { email },
    });

    console.log('Login attempt for email:', email);
    console.log('User found:', !!user);
    
    if (user) {
      console.log('User object:', {
        id: user.id,
        username: user.username,
        email: user.email,
        hasPassword: !!user.password,
        passwordLength: user.password?.length || 0,
        passwordType: typeof user.password,
        passwordValue: user.password ? 'exists' : 'missing'
      });
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if user has a password
    if (!user.password) {
      console.log('User password is missing');
      return NextResponse.json(
        { error: 'Account setup incomplete. Please contact support.' },
        { status: 401 }
      );
    }

    console.log('Attempting password comparison...');
    const isValidPassword = await comparePassword(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const token = generateToken(user.id, user.email);

    return NextResponse.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
