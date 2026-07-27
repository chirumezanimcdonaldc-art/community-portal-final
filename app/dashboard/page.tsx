'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import OrganizerRequestsPanel from '../../components/OrganizerRequestsPanel';

interface DashboardStats {
  userPostCount: number;
  totalPosts: number;
  totalUsers: number;
  totalLikes: number;
  totalComments: number;
  totalEvents: number;
}

interface UserPost {
  id: number;
  content: string;
  imageUrl?: string;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
}

interface DashboardEvent {
  id: number;
  title: string;
  date: string;
  location: string;
  creator: {
    id: number;
    username: string;
    profilePicture?: string;
  };
  acceptedCount: number;
  pendingCount: number;
  maxAttendees?: number;
  status: string;
}

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    userPostCount: 0,
    totalPosts: 0,
    totalUsers: 0,
    totalLikes: 0,
    totalComments: 0,
    totalEvents: 0,
  });
  const [userPosts, setUserPosts] = useState<UserPost[]>([]);
  const [events, setEvents] = useState<DashboardEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    fetchDashboardData();
  }, [isAuthenticated, user]);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, postsResponse, eventsResponse] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/dashboard/user-posts'),
        fetch('/api/dashboard/events'),
      ]);

      if (statsResponse.ok) {
        setStats(await statsResponse.json());
      }

      if (postsResponse.ok) {
        setUserPosts(await postsResponse.json());
      }

      if (eventsResponse.ok) {
        setEvents(await eventsResponse.json());
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="mt-4 text-slate-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Community Portal</p>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Advanced Dashboard</h1>
            <p className="max-w-2xl text-slate-600">
              Performance metrics, event summaries, and activity insights to help you run a better community experience.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <button
              onClick={() => router.push('/events')}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:opacity-95"
            >
              Create Event
            </button>
            <button
              onClick={() => router.push('/')}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300"
            >
              Explore Feed
            </button>
          </div>
        </div>

        <section className="mt-8 grid gap-6 xl:grid-cols-[1.8fr_1.2fr]">
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              <MetricCard label="Your Posts" value={stats.userPostCount} change="+12%" accent="from-sky-500 to-blue-600" />
              <MetricCard label="Total Posts" value={stats.totalPosts} change="+9%" accent="from-emerald-500 to-emerald-600" />
              <MetricCard label="Total Events" value={stats.totalEvents} change="+6%" accent="from-indigo-500 to-violet-600" />
              <MetricCard label="Total Users" value={stats.totalUsers} change="+4%" accent="from-violet-500 to-purple-600" />
              <MetricCard label="Total Likes" value={stats.totalLikes} change="+18%" accent="from-rose-500 to-pink-600" />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <InsightCard
                title="Engagement Score"
                value={`${Math.round(stats.totalPosts > 0 ? ((stats.totalLikes + stats.totalComments) / stats.totalPosts) * 10 : 0)} / 10`}
                description="Average interaction per post"
                progress={Math.min(100, stats.totalPosts > 0 ? ((stats.totalLikes + stats.totalComments) / stats.totalPosts) * 10 : 0)}
              />
              <InsightCard
                title="Comments"
                value={`${stats.totalComments}`}
                description="Community conversations"
                progress={Math.min(100, (stats.totalComments / 100) * 100)}
              />
              <InsightCard
                title="Post Reach"
                value={`${stats.totalPosts}`}
                description="Total shared updates"
                progress={Math.min(100, (stats.totalPosts / 200) * 100)}
              />
            </div>

            <div className="bg-white shadow-md rounded-3xl border border-slate-200 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-5 bg-slate-50">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Summary</p>
                  <h2 className="text-xl font-semibold text-slate-900">Event Activity</h2>
                </div>
                <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-600">
                  {events.length} upcoming
                </span>
              </div>

              <div className="divide-y divide-slate-200">
                {events.length === 0 ? (
                  <div className="px-6 py-10 text-center text-slate-500">No upcoming events available.</div>
                ) : (
                  events.map((event) => (
                    <div key={event.id} className="grid gap-4 px-6 py-5 sm:grid-cols-[1.4fr_0.8fr_0.8fr] items-center">
                      <div>
                        <p className="font-semibold text-slate-900">{event.title}</p>
                        <p className="mt-1 text-sm text-slate-500">{formatDate(event.date)} · {event.location}</p>
                      </div>
                      <div className="rounded-2xl bg-slate-100 px-4 py-2 text-sm text-slate-700">
                        {event.creator.username}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <StatusBadge status={event.status} />
                        <CountBadge label="Accepted" value={event.acceptedCount} />
                        <CountBadge label="Pending" value={event.pendingCount} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="bg-white shadow-md rounded-3xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
              <div className="grid gap-3">
                <ActionCard title="New Event" description="Launch a fresh event and invite the community." actionLabel="Create now" onAction={() => router.push('/events')} />
                <ActionCard title="Publish Post" description="Share updates, announcements, or event highlights." actionLabel="Post now" onAction={() => router.push('/')} />
                <ActionCard title="Review Requests" description="Check event participation requests and approvals." actionLabel="View requests" onAction={() => router.push('/dashboard')} />
              </div>
            </div>

            <div className="bg-white shadow-md rounded-3xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Latest Posts</h2>
              <div className="space-y-4">
                {userPosts.slice(0, 4).map((post) => (
                  <div key={post.id} className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
                    <p className="text-sm text-slate-700 line-clamp-3">{post.content}</p>
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                      <span>{formatDateTime(post.createdAt)}</span>
                      <span>❤️ {post.likesCount} · 💬 {post.commentsCount}</span>
                    </div>
                  </div>
                ))}
                {userPosts.length === 0 && <p className="text-sm text-slate-500">No recent posts yet. Create your first update.</p>}
              </div>
            </div>

            <div>
              <OrganizerRequestsPanel onUpdate={fetchDashboardData} />
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
}

function MetricCard({ label, value, change, accent }: { label: string; value: number; change: string; accent: string }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className={`h-2 bg-gradient-to-r ${accent}`} />
      <div className="p-6">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="mt-3 text-3xl font-semibold text-slate-900">{value}</p>
        <p className="mt-2 text-sm text-slate-500">{change} this month</p>
      </div>
    </div>
  );
}

function InsightCard({ title, value, description, progress }: { title: string; value: string; description: string; progress: number }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{value}</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-600">Insight</span>
      </div>
      <p className="mt-4 text-sm text-slate-500">{description}</p>
      <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-blue-600" style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} />
      </div>
    </div>
  );
}

function ActionCard({ title, description, actionLabel, onAction }: { title: string; description: string; actionLabel: string; onAction: () => void }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          <p className="mt-2 text-sm text-slate-600">{description}</p>
        </div>
        <button
          onClick={onAction}
          className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white shadow-sm transition hover:bg-slate-800"
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusMap: Record<string, string> = {
    upcoming: 'bg-sky-100 text-sky-700',
    ongoing: 'bg-emerald-100 text-emerald-700',
    completed: 'bg-slate-100 text-slate-700',
    cancelled: 'bg-rose-100 text-rose-700',
  };

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusMap[status] || 'bg-slate-100 text-slate-700'}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function CountBadge({ label, value }: { label: string; value: number }) {
  return (
    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
      {label}: {value}
    </span>
  );
}

function formatDate(dateValue: string) {
  const date = new Date(dateValue);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateTime(dateValue: string) {
  const date = new Date(dateValue);
  return date.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}
