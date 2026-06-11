import React, { useState, useEffect } from 'react';
import { LoggedUser, SavedAddress } from '../types';
import { Plus, Edit2, Trash2, MapPin, Phone, Mail, Check, X } from 'lucide-react';

interface ProfilePageProps {
  currentUser: LoggedUser | null;
  onUpdateUser: (user: LoggedUser) => void;
}

export default function ProfilePage({ currentUser, onUpdateUser }: ProfilePageProps) {
  const [editingProfile, setEditingProfile] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  
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

  // Address form state
  const [addressLabel, setAddressLabel] = useState('');
  const [addressFullName, setAddressFullName] = useState('');
  const [addressEmail, setAddressEmail] = useState('');
  const [addressPhone, setAddressPhone] = useState('');
  const [addressStreet, setAddressStreet] = useState('');
  const [addressCity, setAddressCity] = useState('');
  const [addressState, setAddressState] = useState('');
  const [addressZip, setAddressZip] = useState('');
  const [addressDefault, setAddressDefault] = useState(false);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-slate-600 text-lg">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  const handleUpdateProfile = () => {
    const updated: LoggedUser = {
      ...currentUser,
      name: editName,
      email: editEmail,
      phoneNumber: editPhone
    };
    onUpdateUser(updated);
    setEditingProfile(false);
  };

  const handleAddAddress = () => {
    if (!currentUser) return;

    // Check max 5 addresses
    if (currentUser.addresses.length >= 5) {
      alert('Maximum 5 addresses allowed');
      return;
    }

    if (!addressFullName.trim() || !addressPhone.trim() || !addressStreet.trim() || !addressCity.trim() || !addressState.trim() || !addressZip.trim()) {
      alert('Please fill in all required address fields.');
      return;
    }

    const newAddress: SavedAddress = {
      id: Date.now().toString(),
      label: addressLabel || 'New Address',
      fullName: addressFullName,
      email: addressEmail,
      phoneNumber: addressPhone,
      address: addressStreet,
      city: addressCity,
      state: addressState,
      zipCode: addressZip,
      isDefault: addressDefault || currentUser.addresses.length === 0,
      createdAt: new Date().toISOString()
    };

    // If this is default, unset others
    let updatedAddresses = currentUser.addresses;
    if (newAddress.isDefault) {
      updatedAddresses = updatedAddresses.map(a => ({ ...a, isDefault: false }));
    }

    const updated: LoggedUser = {
      ...currentUser,
      addresses: [...updatedAddresses, newAddress]
    };
    onUpdateUser(updated);

    // Reset form
    setAddressLabel('');
    setAddressFullName('');
    setAddressEmail('');
    setAddressPhone('');
    setAddressStreet('');
    setAddressCity('');
    setAddressState('');
    setAddressZip('');
    setAddressDefault(false);
    setShowAddressForm(false);
  };

  const handleDeleteAddress = (id: string) => {
    if (!currentUser) return;
    const updated: LoggedUser = {
      ...currentUser,
      addresses: currentUser.addresses.filter(a => a.id !== id)
    };
    onUpdateUser(updated);
  };

  const handleSetDefault = (id: string) => {
    if (!currentUser) return;
    const updated: LoggedUser = {
      ...currentUser,
      addresses: currentUser.addresses.map(a => ({
        ...a,
        isDefault: a.id === id
      }))
    };
    onUpdateUser(updated);
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
            <button
              onClick={() => setShowAddressForm(!showAddressForm)}
              disabled={currentUser.addresses.length >= 5}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add New
            </button>
          </div>

          {/* Add Address Form */}
          {showAddressForm && (
            <div className="mb-6 p-4 border-2 border-dashed border-slate-200 rounded-xl">
              <h3 className="font-bold text-sm text-slate-900 mb-4">Add New Address</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Label (e.g., Home, Work)"
                  value={addressLabel}
                  onChange={(e) => setAddressLabel(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-900 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={addressFullName}
                  onChange={(e) => setAddressFullName(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-900 focus:outline-none"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={addressEmail}
                  onChange={(e) => setAddressEmail(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-900 focus:outline-none"
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={addressPhone}
                  onChange={(e) => setAddressPhone(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-900 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Street Address"
                  value={addressStreet}
                  onChange={(e) => setAddressStreet(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-900 focus:outline-none"
                />
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="City"
                    value={addressCity}
                    onChange={(e) => setAddressCity(e.target.value)}
                    className="text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-900 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={addressState}
                    onChange={(e) => setAddressState(e.target.value)}
                    className="text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-900 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="ZIP"
                    value={addressZip}
                    onChange={(e) => setAddressZip(e.target.value)}
                    className="text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={addressDefault}
                    onChange={(e) => setAddressDefault(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-slate-900"
                  />
                  <span className="font-semibold text-slate-700">Set as default address</span>
                </label>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleAddAddress}
                    className="flex-1 py-2 bg-slate-900 text-white font-bold text-xs rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    Save Address
                  </button>
                  <button
                    onClick={() => setShowAddressForm(false)}
                    className="flex-1 py-2 border border-slate-200 text-slate-700 font-bold text-xs rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Address List */}
          {currentUser.addresses.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No addresses saved yet.</p>
          ) : (
            <div className="space-y-3">
              {currentUser.addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    addr.isDefault ? 'border-slate-900 bg-slate-50' : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-sm text-slate-900">{addr.label}</h3>
                        {addr.isDefault && (
                          <span className="px-2 py-0.5 bg-slate-900 text-white text-[10px] font-bold rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-700 font-semibold mb-2">{addr.fullName}</p>
                      <div className="space-y-1 text-[11px] text-slate-600">
                        <p className="flex items-center gap-2">
                          <MapPin className="w-3 h-3" />
                          {addr.address}, {addr.city}, {addr.state} {addr.zipCode}
                        </p>
                        <p className="flex items-center gap-2">
                          <Mail className="w-3 h-3" />
                          {addr.email}
                        </p>
                        <p className="flex items-center gap-2">
                          <Phone className="w-3 h-3" />
                          {addr.phoneNumber}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-3">
                      {!addr.isDefault && (
                        <button
                          onClick={() => handleSetDefault(addr.id)}
                          className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-slate-900 transition-colors"
                          title="Set as default"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="p-2 hover:bg-rose-100 rounded-lg text-slate-600 hover:text-rose-600 transition-colors"
                        title="Delete address"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {currentUser.addresses.length >= 5 && (
            <p className="mt-3 text-xs text-slate-500 italic">Maximum 5 addresses reached.</p>
          )}
        </div>

      </div>
    </div>
  );
}
