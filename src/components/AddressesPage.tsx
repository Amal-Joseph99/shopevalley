import React, { useState } from 'react';
import { LoggedUser, SavedAddress } from '../types';
import { Plus, Trash2, MapPin, Phone, Mail, Check, X } from 'lucide-react';

interface AddressesPageProps {
  currentUser: LoggedUser | null;
  onUpdateUser: (user: LoggedUser) => void;
}

export default function AddressesPage({ currentUser, onUpdateUser }: AddressesPageProps) {
  const [showAddressForm, setShowAddressForm] = useState(false);
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
          <p className="text-slate-600 text-lg">Please log in to manage your saved addresses.</p>
        </div>
      </div>
    );
  }

  const resetForm = () => {
    setAddressLabel('');
    setAddressFullName('');
    setAddressEmail('');
    setAddressPhone('');
    setAddressStreet('');
    setAddressCity('');
    setAddressState('');
    setAddressZip('');
    setAddressDefault(false);
  };

  const handleAddAddress = () => {
    if (currentUser.addresses.length >= 5) {
      alert('Maximum 5 addresses allowed. Please remove one before adding a new address.');
      return;
    }

    if (!addressFullName.trim() || !addressPhone.trim() || !addressStreet.trim() || !addressCity.trim() || !addressState.trim() || !addressZip.trim()) {
      alert('Please fill in all required address fields.');
      return;
    }

    const newAddress: SavedAddress = {
      id: Date.now().toString(),
      label: addressLabel || 'New Address',
      fullName: addressFullName.trim(),
      email: addressEmail.trim(),
      phoneNumber: addressPhone.trim(),
      address: addressStreet.trim(),
      city: addressCity.trim(),
      state: addressState.trim(),
      zipCode: addressZip.trim(),
      isDefault: addressDefault || currentUser.addresses.length === 0,
      createdAt: new Date().toISOString()
    };

    const updatedAddresses = newAddress.isDefault
      ? currentUser.addresses.map((a) => ({ ...a, isDefault: false }))
      : currentUser.addresses;

    onUpdateUser({
      ...currentUser,
      addresses: [...updatedAddresses, newAddress]
    });

    resetForm();
    setShowAddressForm(false);
  };

  const handleDeleteAddress = (id: string) => {
    const newAddresses = currentUser.addresses.filter((addr) => addr.id !== id);
    onUpdateUser({ ...currentUser, addresses: newAddresses });
  };

  const handleSetDefault = (id: string) => {
    onUpdateUser({
      ...currentUser,
      addresses: currentUser.addresses.map((addr) => ({
        ...addr,
        isDefault: addr.id === id
      }))
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 border-b border-slate-100 pb-4">
            <div>
              <h1 className="text-xl font-extrabold text-slate-950">Addresses</h1>
              <p className="text-sm text-slate-500 mt-1">Manage up to 5 saved shipping addresses and set one as the default.</p>
            </div>
            <button
              onClick={() => setShowAddressForm(!showAddressForm)}
              disabled={currentUser.addresses.length >= 5}
              className="inline-flex items-center gap-2 rounded-full border border-slate-900 bg-slate-950 px-4 py-2 text-xs font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              Add Address
            </button>
          </div>

          {showAddressForm && (
            <div className="mb-6 p-4 rounded-2xl border border-slate-200 bg-slate-50">
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  type="text"
                  placeholder="Label (e.g. Home, Work)"
                  value={addressLabel}
                  onChange={(e) => setAddressLabel(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-900 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={addressFullName}
                  onChange={(e) => setAddressFullName(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-900 focus:outline-none"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={addressEmail}
                  onChange={(e) => setAddressEmail(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-900 focus:outline-none"
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={addressPhone}
                  onChange={(e) => setAddressPhone(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-900 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Street Address"
                  value={addressStreet}
                  onChange={(e) => setAddressStreet(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-900 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="City"
                  value={addressCity}
                  onChange={(e) => setAddressCity(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-900 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="State"
                  value={addressState}
                  onChange={(e) => setAddressState(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-900 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="ZIP Code"
                  value={addressZip}
                  onChange={(e) => setAddressZip(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-900 focus:outline-none"
                />
                <label className="flex items-center gap-2 text-sm col-span-2">
                  <input
                    type="checkbox"
                    checked={addressDefault}
                    onChange={(e) => setAddressDefault(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-slate-900"
                  />
                  Set as default address
                </label>
              </div>
              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleAddAddress}
                  className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2 text-sm font-bold text-white hover:bg-slate-800 transition"
                >
                  Save Address
                </button>
                <button
                  onClick={() => {
                    resetForm();
                    setShowAddressForm(false);
                  }}
                  className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {currentUser.addresses.length === 0 ? (
            <p className="text-sm text-slate-500">No saved addresses yet. Use the button above to add your first address.</p>
          ) : (
            <div className="grid gap-4">
              {currentUser.addresses.map((address) => (
                <div
                  key={address.id}
                  className={`rounded-3xl border p-5 transition ${address.isDefault ? 'border-slate-900 bg-slate-50' : 'border-slate-200 bg-white'}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <h2 className="text-sm font-bold text-slate-950">{address.label}</h2>
                        {address.isDefault && (
                          <span className="rounded-full bg-slate-900 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-white">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-slate-900">{address.fullName}</p>
                      <p className="text-sm text-slate-600">{address.address}, {address.city}, {address.state} {address.zipCode}</p>
                      <div className="mt-2 text-sm text-slate-600 space-y-1">
                        <p className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" />{address.city}, {address.state}</p>
                        <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" />{address.email}</p>
                        <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" />{address.phoneNumber}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!address.isDefault && (
                        <button
                          onClick={() => handleSetDefault(address.id)}
                          className="inline-flex items-center justify-center rounded-full border border-slate-900 px-4 py-2 text-xs font-bold text-slate-900 hover:bg-slate-100 transition"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Set Default
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteAddress(address.id)}
                        className="inline-flex items-center justify-center rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-100 transition"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {currentUser.addresses.length >= 5 && (
            <p className="mt-4 text-sm text-slate-500">Maximum 5 addresses saved. Delete one to add another.</p>
          )}
        </div>
      </div>
    </div>
  );
}
