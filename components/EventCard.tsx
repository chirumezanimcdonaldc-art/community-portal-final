'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  location: string;
  maxAttendees?: number;
  createdBy: number;
  status: string;
  createdAt: string;
  creator: {
    id: number;
    username: string;
    profilePicture?: string;
  };
  requests?: Array<{
    id: number;
    userId: number;
    status: string;
    message?: string;
    user: {
      id: number;
      username: string;
      profilePicture?: string;
    };
  }>;
}

export default function EventCard({ event, onEventUpdated }: { event: Event; onEventUpdated: () => void }) {
  const { user } = useAuth();
  const [showRequests, setShowRequests] = useState(false);
  const [requests, setRequests] = useState(event.requests || []);
  const [joinMessage, setJoinMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isCreator = user?.id === event.createdBy;
  const hasRequested = requests.some(req => req.userId === user?.id);
  const acceptedCount = requests.filter(req => req.status === 'accepted').length;
  const pendingCount = requests.filter(req => req.status === 'pending').length;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleJoinRequest = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch(`/api/events/${event.id}/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          message: joinMessage.trim() || null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Join request sent successfully!');
        setJoinMessage('');
        fetchRequests();
      } else {
        setError(data.error || 'Failed to send join request');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestResponse = async (requestId: number, action: 'accept' | 'decline') => {
    try {
      const response = await fetch(`/api/events/${event.id}/requests/${requestId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      const data = await response.json();

      if (response.ok) {
        fetchRequests();
        onEventUpdated();
      } else {
        setError(data.error || 'Failed to process request');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    }
  };

  const fetchRequests = async () => {
    try {
      const response = await fetch(`/api/events/${event.id}/requests`);
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  useEffect(() => {
    if (showRequests) {
      fetchRequests();
    }
  }, [showRequests, event.id]);

  const getStatusColor = () => {
    switch (event.status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'ongoing': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor()}`}>
              {event.status}
            </span>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{formatDate(event.date)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{event.location}</span>
            </div>
            {event.maxAttendees && (
              <div className="flex items-center space-x-1">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span>{acceptedCount}/{event.maxAttendees} attending</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Creator Info */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="flex-shrink-0">
          {event.creator.profilePicture ? (
            <img
              src={event.creator.profilePicture}
              alt={event.creator.username}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">Created by {event.creator.username}</p>
        </div>
      </div>

      {/* Description */}
      <div className="mb-4">
        <p className="text-gray-800 whitespace-pre-wrap">{event.description}</p>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
          {success}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {isCreator && (
            <>
              <button
                onClick={() => setShowRequests(!showRequests)}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                {pendingCount > 0 && `(${pendingCount})`} Manage Requests
              </button>
            </>
          )}
          {!isCreator && !hasRequested && (
            <button
              onClick={() => setShowRequests(!showRequests)}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              Request to Join
            </button>
          )}
          {!isCreator && hasRequested && (
            <span className="text-sm text-gray-500">
              {requests.find(req => req.userId === user?.id)?.status === 'pending' ? 'Request Pending' : 
               requests.find(req => req.userId === user?.id)?.status === 'accepted' ? 'Accepted' : 'Declined'}
            </span>
          )}
        </div>
      </div>

      {/* Join Request Form / Requests Management */}
      {showRequests && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          {!isCreator ? (
            /* Join Request Form */
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Request to Join Event</h4>
              <textarea
                value={joinMessage}
                onChange={(e) => setJoinMessage(e.target.value)}
                placeholder="Add a message to the event organizer (optional)"
                className="w-full p-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                maxLength={500}
              />
              <div className="flex space-x-3">
                <button
                  onClick={handleJoinRequest}
                  disabled={loading || hasRequested}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Sending...' : 'Send Request'}
                </button>
                <button
                  onClick={() => setShowRequests(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            /* Requests Management */
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Join Requests ({requests.length})</h4>
              {requests.length === 0 ? (
                <p className="text-gray-500 text-sm">No requests yet</p>
              ) : (
                <div className="space-y-3">
                  {requests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          {request.user.profilePicture ? (
                            <img
                              src={request.user.profilePicture}
                              alt={request.user.username}
                              className="h-8 w-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{request.user.username}</p>
                          {request.message && (
                            <p className="text-sm text-gray-600 mt-1">{request.message}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            Status: <span className={`font-medium ${
                              request.status === 'accepted' ? 'text-green-600' :
                              request.status === 'declined' ? 'text-red-600' :
                              'text-yellow-600'
                            }`}>{request.status}</span>
                          </p>
                        </div>
                      </div>
                      {request.status === 'pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleRequestResponse(request.id, 'accept')}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleRequestResponse(request.id, 'decline')}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                          >
                            Decline
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
