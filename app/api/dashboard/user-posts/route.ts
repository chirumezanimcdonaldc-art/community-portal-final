import { NextRequest, NextResponse } from 'next/server';
import sequelize from '../../../../lib/database';
import Post from '../../../../models/Post';
import Like from '../../../../models/Like';
import Comment from '../../../../models/Comment';
import User from '../../../../models/User';
import '../../../../lib/sync'; // Auto-sync database

export async function GET(request: NextRequest) {
  try {
    await sequelize.authenticate();

    // Get recent posts with likes and comments count
    const posts = await Post.findAll({
      attributes: ['id', 'content', 'imageUrl', 'createdAt', 'authorId'], // Explicitly select id
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'profilePicture'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: 10,
    });

    console.log('Found posts:', posts.length);
    console.log('Posts data:', JSON.stringify(posts.map(p => ({
      id: p.id,
      content: p.content,
      hasId: !!p.id,
      dataValues: p.dataValues
    })), null, 2));

    // Format posts with counts
    const formattedPostsPromises = posts.map(async (post: any) => {
      const postId = post.id || post.dataValues?.id;
      console.log('Processing post:', postId, post.content);
      
      if (!postId) {
        console.error('Post ID is undefined for post:', post);
        return null;
      }
      
      const [likesCount, commentsCount] = await Promise.all([
        Like.count({ where: { postId } }),
        Comment.count({ where: { postId } }),
      ]);

      return {
        id: postId,
        content: post.content,
        imageUrl: post.imageUrl,
        createdAt: post.createdAt,
        likesCount,
        commentsCount,
      };
    });
    
    const formattedPosts = (await Promise.all(formattedPostsPromises)).filter((post): post is NonNullable<typeof post> => post !== null);

    return NextResponse.json(formattedPosts);
  } catch (error) {
    console.error('Error fetching user posts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
