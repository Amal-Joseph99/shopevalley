import React, { useState, useEffect } from 'react';
import { LoggedUser } from '../types';
import { MapPin } from 'lucide-react';
import { updateUserProfile } from '../lib/supabaseClient';

interface ProfilePageProps {
  currentUser: LoggedUser | null;
  onUpdateUser: (user: LoggedUser) => void;
}

export default function ProfilePage({ currentUser, onUpdateUser }: ProfilePageProps) {
  const [editingProfile, setEditingProfile] = useState(false);
  
  // Profile edit state
  const [editName, setEditName] = useState(currentUser?.name || '');
  const [editEmail, setEditEmail] = useState(currentUser?.email || '');
  const [editPhone, setEditPhone] = useState(currentUser?.phoneNumber || '');

  useEffect(() => {
    if (currentUser) {
      setEditName(currentUser.name);
      setEditEmail(currentUser.email);
      setEditPhone(currentUser.phoneNumber || '');
    }
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-slate-600 text-lg">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  const handleUpdateProfile = async () => {
    await updateUserProfile(currentUser.id, {
      name: editName,
      email: editEmail,
      phone: editPhone
    });
    const updated: LoggedUser = {
      ...currentUser,
      name: editName,
      email: editEmail,
      phoneNumber: editPhone
    };
    onUpdateUser(updated);
    setEditingProfile(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Profile Section */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
            <h2 className="text-lg font-extrabold text-slate-950">Profile Information</h2>
            <button
              onClick={() => setEditingProfile(!editingProfile)}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
            >
              {editingProfile ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {editingProfile ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full text-sm px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-slate-900 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Email</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full text-sm px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-slate-900 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full text-sm px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-slate-900 focus:outline-none"
                />
              </div>
              <button
                onClick={handleUpdateProfile}
                className="w-full py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-colors"
              >
                Save Changes
              </button>
            </div>
          ) : (
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs font-bold text-slate-500 mb-1">Full Name</p>
                <p className="text-slate-900 font-semibold">{currentUser.name}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 mb-1">Email</p>
                <p className="text-slate-900 font-semibold">{currentUser.email}</p>
              </div>
              {currentUser.phoneNumber && (
                <div>
                  <p className="text-xs font-bold text-slate-500 mb-1">Phone Number</p>
                  <p className="text-slate-900 font-semibold">{currentUser.phoneNumber}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Addresses Section */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
            <h2 className="text-lg font-extrabold text-slate-950">Saved Addresses</h2>
          </div>
          <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <MapPin className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-slate-900">Manage addresses from the Addresses page.</p>
              <p className="text-xs text-slate-500 mt-1">Saved addresses are stored in Supabase `shipping_addresses`.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
