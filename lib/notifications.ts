import Notification from '../models/Notification';
import User from '../models/User';
import Post from '../models/Post';
import Event from '../models/Event';

// Define extended types for models with associations
interface PostWithAuthor extends Post {
  author?: {
    id: number;
    username: string;
  };
}

interface EventWithCreator extends Event {
  creator?: {
    id: number;
    username: string;
  };
}

export interface NotificationData {
  userId: number;
  type: 'like' | 'comment' | 'event_request' | 'event_accepted' | 'event_declined' | 'follow';
  title: string;
  message: string;
  relatedId?: number;
  relatedType?: 'post' | 'event' | 'user';
}

export class NotificationService {
  static async createNotification(data: NotificationData): Promise<void> {
    try {
      await Notification.create({
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        relatedId: data.relatedId,
        relatedType: data.relatedType,
        isRead: false, // Add required isRead field
      });
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  }

  static async createLikeNotification(likedByUserId: number, postId: number): Promise<void> {
    try {
      // Get the post with author
      const post = await Post.findByPk(postId, {
        include: [{ model: User, as: 'author', attributes: ['id', 'username'] }],
      }) as PostWithAuthor | null;

      if (!post || !post.author) return;

      // Don't notify if user liked their own post
      if (post.author.id === likedByUserId) return;

      // Get the user who liked
      const likedByUser = await User.findByPk(likedByUserId, {
        attributes: ['username'],
      });

      if (!likedByUser) return;

      await this.createNotification({
        userId: post.author.id,
        type: 'like',
        title: 'New Like',
        message: `${likedByUser.username} liked your post`,
        relatedId: postId,
        relatedType: 'post',
      });
    } catch (error) {
      console.error('Error creating like notification:', error);
    }
  }

  static async createCommentNotification(commentByUserId: number, postId: number): Promise<void> {
    try {
      // Get the post with author
      const post = await Post.findByPk(postId, {
        include: [{ model: User, as: 'author', attributes: ['id', 'username'] }],
      }) as PostWithAuthor | null;

      if (!post || !post.author) return;

      // Don't notify if user commented on their own post
      if (post.author.id === commentByUserId) return;

      // Get the user who commented
      const commentByUser = await User.findByPk(commentByUserId, {
        attributes: ['username'],
      });

      if (!commentByUser) return;

      await this.createNotification({
        userId: post.author.id,
        type: 'comment',
        title: 'New Comment',
        message: `${commentByUser.username} commented on your post`,
        relatedId: postId,
        relatedType: 'post',
      });
    } catch (error) {
      console.error('Error creating comment notification:', error);
    }
  }

  static async createEventRequestNotification(eventId: number, requestByUserId: number): Promise<void> {
    try {
      // Get the event with creator
      const event = await Event.findByPk(eventId, {
        include: [{ model: User, as: 'creator', attributes: ['id', 'username'] }],
      }) as EventWithCreator | null;

      if (!event || !event.creator) return;

      // Get the user who requested
      const requestByUser = await User.findByPk(requestByUserId, {
        attributes: ['username'],
      });

      if (!requestByUser) return;

      await this.createNotification({
        userId: event.creator.id,
        type: 'event_request',
        title: 'New Event Request',
        message: `${requestByUser.username} requested to join your event "${event.title}"`,
        relatedId: eventId,
        relatedType: 'event',
      });
    } catch (error) {
      console.error('Error creating event request notification:', error);
    }
  }

  static async createEventResponseNotification(eventId: number, userId: number, action: 'accepted' | 'declined'): Promise<void> {
    try {
      // Get the event
      const event = await Event.findByPk(eventId);

      if (!event) return;

      await this.createNotification({
        userId,
        type: action === 'accepted' ? 'event_accepted' : 'event_declined',
        title: `Event ${action === 'accepted' ? 'Accepted' : 'Declined'}`,
        message: `Your request to join "${event.title}" was ${action}`,
        relatedId: eventId,
        relatedType: 'event',
      });
    } catch (error) {
      console.error('Error creating event response notification:', error);
    }
  }

  static async getUserNotifications(userId: number, limit: number = 20) {
    try {
      const notifications = await Notification.findAll({
        where: { userId },
        order: [['createdAt', 'DESC']],
        limit,
      });

      return notifications;
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      return [];
    }
  }

  static async markAsRead(notificationId: number, userId: number): Promise<void> {
    try {
      await Notification.update(
        { isRead: true },
        { where: { id: notificationId, userId } }
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  static async markAllAsRead(userId: number): Promise<void> {
    try {
      await Notification.update(
        { isRead: true },
        { where: { userId, isRead: false } }
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }

  static async getUnreadCount(userId: number): Promise<number> {
    try {
      const count = await Notification.count({
        where: { userId, isRead: false },
      });
      return count;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }
}
