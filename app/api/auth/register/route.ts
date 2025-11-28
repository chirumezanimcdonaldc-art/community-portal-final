import { NextRequest, NextResponse } from 'next/server';
import sequelize from '../../../../lib/database';
import User from '../../../../models/User';
import { hashPassword, generateToken } from '../../../../lib/auth';
import { Op } from 'sequelize';
import '../../../../lib/sync'; // Auto-sync database

export async function POST(request: NextRequest) {
  try {
    const { username, email, password, profilePicture } = await request.json();

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'Username, email, and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    await sequelize.authenticate();

    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { username }],
      },
    });

    if (existingUser) {
      const field = existingUser.email === email ? 'email' : 'username';
      return NextResponse.json(
        { error: `User with this ${field} already exists` },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);

    console.log('Creating user with data:', { 
      username, 
      email, 
      passwordLength: password.length,
      hashedPasswordLength: hashedPassword.length,
      hasPassword: !!hashedPassword 
    });

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      profilePicture: profilePicture || null,
    });

    console.log('User created successfully:', { 
      id: user.id, 
      username: user.username, 
      email: user.email,
      hasPassword: !!user.password,
      passwordLength: user.password?.length || 0
    });

    // Double-check the saved user
    const savedUser = await User.findByPk(user.id);
    console.log('Retrieved user from DB:', {
      id: savedUser?.id,
      hasPassword: !!savedUser?.password,
      passwordLength: savedUser?.password?.length || 0
    });

    const token = generateToken(user.id, user.email);

    return NextResponse.json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture,
      },
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
