'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import Link from 'next/link';
import PostCreator from '../components/PostCreator';
import PostCard from '../components/PostCard';
import NotificationDropdown from '../components/NotificationDropdown';

interface Post {
  id: number;
  content: string;
  imageUrl?: string;
  createdAt: string;
  author: {
    id: number;
    username: string;
    profilePicture?: string;
  };
}

export default function Home() {
  const { user, isAuthenticated, logout } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  console.log('Home page render:', { isAuthenticated, user: !!user, username: user?.username });

  const fetchPosts = async () => {
    try {
      console.log('Fetching posts from API...');
      const response = await fetch('/api/posts');
      console.log('Posts API response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Posts received:', data.length, 'posts');
        console.log('Posts data:', data);
        setPosts(data);
      } else {
        console.error('Posts API error:', response.status);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchPosts();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex min-h-screen items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-6">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                Welcome to Social Hub
              </h1>
              <p className="text-gray-600 mb-8">
                Connect with friends and share your moments
              </p>
            </div>
            
            <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
              <h2 className="text-xl font-semibold text-center text-gray-900">
                Get Started
              </h2>
              
              <div className="space-y-3">
                <Link
                  href="/auth/login"
                  className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
                >
                  Sign In
                </Link>
                
                <Link
                  href="/auth/register"
                  className="w-full flex justify-center py-3 px-4 border border-gray-300 text-sm font-semibold rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200"
                >
                  Create Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white shadow-sm border-b border-gray-200 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                  </svg>
                </div>
                <h1 className="text-xl font-bold text-gray-900">Community Portal</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
          <Link href="/events" className="text-gray-600 hover:text-gray-900 font-medium">
            Events
          </Link>
          <NotificationDropdown />
          <button
            onClick={() => router.push('/dashboard')}
            className="relative group"
          >
            {user?.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={user.username}
                className="h-10 w-10 rounded-full object-cover ring-2 ring-blue-500 ring-offset-2 group-hover:ring-blue-600 transition-all duration-200"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center ring-2 ring-blue-500 ring-offset-2 group-hover:ring-blue-600 transition-all duration-200">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
          <span className="text-sm font-medium text-gray-700">{user?.username}</span>
          <button
            onClick={logout}
            className="px-3 py-1 text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
          >
            Logout
          </button>
        </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 pt-20 sm:px-6 lg:px-8">
        {/* Post Creator */}
        <PostCreator onPostCreated={fetchPosts} />
        
        {/* Posts Feed */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-500">Loading posts...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="h-16 w-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
              <p className="text-gray-500">Be the first to share something!</p>
            </div>
          ) : (
            posts.map((post) => (
              <PostCard key={post.id} post={post} onPostUpdated={fetchPosts} />
            ))
          )}
        </div>
      </main>
    </div>
  );
}
