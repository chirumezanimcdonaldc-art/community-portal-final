'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface RequestItem {
  id: number;
  userId: number;
  status: 'pending' | 'accepted' | 'declined';
  message?: string;
  user: { id: number; username: string; profilePicture?: string };
}

interface EventSummary {
  id: number;
  title: string;
  pendingCount: number;
  acceptedCount: number;
}

export default function OrganizerRequestsPanel({ onUpdate }: { onUpdate?: () => void }) {
  const { user, isAuthenticated } = useAuth();
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [expandedEventId, setExpandedEventId] = useState<number | null>(null);
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchEvents();
  }, [isAuthenticated]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/dashboard/events');
      if (res.ok) {
        const data = await res.json();
        // Only keep events where current user is the creator
        const mine = data.filter((e: any) => e.creator?.id === user?.id).map((e: any) => ({
          id: e.id,
          title: e.title,
          pendingCount: e.pendingCount || 0,
          acceptedCount: e.acceptedCount || 0,
        }));
        setEvents(mine);
      }
    } catch (err) {
      console.error('Error fetching dashboard events for organizer:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async (eventId: number) => {
    try {
      const res = await fetch(`/api/events/${eventId}/requests`);
      if (res.ok) {
        const data = await res.json();
        setRequests(data.filter((r: any) => r.status === 'pending'));
      }
    } catch (err) {
      console.error('Error fetching requests:', err);
    }
  };

  const toggleExpand = async (eventId: number) => {
    if (expandedEventId === eventId) {
      setExpandedEventId(null);
      setRequests([]);
      return;
    }
    setExpandedEventId(eventId);
    await fetchRequests(eventId);
  };

  const respondToRequest = async (eventId: number, requestId: number, action: 'accept' | 'decline') => {
    if (!user) return;
    setActionLoading(requestId);
    try {
      const res = await fetch(`/api/events/${eventId}/requests/${requestId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, userId: user.id }),
      });
      if (res.ok) {
        // refresh requests and events summary
        await fetchRequests(eventId);
        await fetchEvents();
        if (onUpdate) onUpdate();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to process request');
      }
    } catch (err) {
      console.error('Error responding to request:', err);
      alert('An error occurred while processing the request');
    } finally {
      setActionLoading(null);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="bg-white shadow-md rounded-3xl border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-3">Attendee Requests</h3>
      {loading ? (
        <p className="text-sm text-slate-500">Loading...</p>
      ) : events.length === 0 ? (
        <p className="text-sm text-slate-500">You have no events with pending requests.</p>
      ) : (
        <div className="space-y-3">
          {events.map((ev) => (
            <div key={ev.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">{ev.title}</p>
                  <p className="text-xs text-slate-500">Pending: {ev.pendingCount} · Accepted: {ev.acceptedCount}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleExpand(ev.id)} className="text-sm text-blue-600 hover:underline">
                    {expandedEventId === ev.id ? 'Hide' : 'Manage'}
                  </button>
                </div>
              </div>

              {expandedEventId === ev.id && (
                <div className="mt-3 space-y-2">
                  {requests.length === 0 ? (
                    <p className="text-sm text-slate-500">No pending requests.</p>
                  ) : (
                    requests.map((r) => (
                      <div key={r.id} className="flex items-center justify-between p-2 bg-white rounded-lg">
                        <div>
                          <p className="font-medium text-slate-900">{r.user.username}</p>
                          {r.message && <p className="text-sm text-slate-500">{r.message}</p>}
                        </div>
                        <div className="flex items-center gap-2">
                          <button disabled={actionLoading === r.id} onClick={() => respondToRequest(ev.id, r.id, 'accept')} className="px-3 py-1 bg-green-600 text-white rounded text-sm disabled:opacity-50">{actionLoading === r.id ? '...' : 'Accept'}</button>
                          <button disabled={actionLoading === r.id} onClick={() => respondToRequest(ev.id, r.id, 'decline')} className="px-3 py-1 bg-red-600 text-white rounded text-sm disabled:opacity-50">{actionLoading === r.id ? '...' : 'Decline'}</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
