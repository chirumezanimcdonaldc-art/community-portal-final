'use client';

import { useState } from 'react';
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
}

export default function EventCreator({ onEventCreated }: { onEventCreated: () => void }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    maxAttendees: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : null,
          createdBy: user?.id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setFormData({
          title: '',
          description: '',
          date: '',
          location: '',
          maxAttendees: '',
        });
        setShowForm(false);
        onEventCreated();
      } else {
        setError(data.error || 'Failed to create event');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!showForm) {
    return (
      <div className="bg-slate-900 text-white rounded-3xl shadow-xl p-6 mb-6 border border-slate-700">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="uppercase tracking-[0.24em] text-xs text-slate-400 mb-2">Event Hub</p>
            <h2 className="text-2xl font-semibold">Create an Event</h2>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Launch a polished event with a unique title, clear details, and strong visibility for your community.
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center justify-center px-5 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full shadow-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200"
          >
            Start Event Setup
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 mb-6 border border-slate-200">
      <div className="mb-6">
        <p className="uppercase tracking-[0.24em] text-xs text-slate-500 mb-2">New Event</p>
        <h2 className="text-2xl font-semibold text-slate-900">Create New Event</h2>
        <p className="mt-2 text-sm text-slate-600 max-w-2xl">
          Add unique event details and avoid duplicates by choosing a distinctive event name, date, and location.
        </p>
      </div>
      
      {error && (
        <div className="mb-4 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">
            Event Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            maxLength={200}
            className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
            placeholder="Enter event title"
          />
          <p className="mt-2 text-xs text-slate-500">Use a unique, descriptive title that stands out.</p>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={4}
            maxLength={2000}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Describe your event"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Date & Time *
            </label>
            <input
              type="datetime-local"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="maxAttendees" className="block text-sm font-medium text-gray-700 mb-1">
              Max Attendees (Optional)
            </label>
            <input
              type="number"
              id="maxAttendees"
              name="maxAttendees"
              value={formData.maxAttendees}
              onChange={handleChange}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Unlimited"
            />
          </div>
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
            Location *
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            maxLength={500}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Event location"
          />
        </div>

        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-5 py-3 bg-gradient-to-r from-sky-600 to-indigo-600 text-white font-semibold rounded-2xl shadow-lg hover:from-sky-700 hover:to-indigo-700 disabled:opacity-50 transition-all duration-200"
          >
            {loading ? 'Creating Event…' : 'Create Event'}
          </button>
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="px-5 py-3 bg-slate-100 text-slate-700 rounded-2xl hover:bg-slate-200 transition-all duration-200"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
