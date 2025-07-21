import React, { useState, useEffect } from 'react';
import Stagewise from './components/Stagewise';
import { Check, Users, Award, ArrowLeft, MapPin, Shield, Wifi, WifiOff } from 'lucide-react';
import { supabase } from './lib/supabase';
import { 
  getBookings, 
  createBooking, 
  deleteAllBookings, 
  getRooms, 
  updateStartupSpots, 
  resetAllStartupSpots,
  initializeDefaultData 
} from './lib/database';
import type { Booking, Room } from './lib/supabase';
import brandingLogo from './assets/branding-logo.png';

interface Startup {
  id: string;
  name: string;
  spots: number;
}

interface AppData {
  bookings: Booking[];
  rooms: Room[];
}

// Default room configuration (fallback)
const DEFAULT_ROOMS: Room[] = [
  {
    id: 'room1',
    name: 'Product Demo Day Startups',
    startups: [
      { id: '1', name: 'Tamam', spots: 4, room_id: 'room1' },
      { id: '3', name: 'TellSaleem', spots: 4, room_id: 'room1' },
      { id: '4', name: 'Soor', spots: 4, room_id: 'room1' },
      { id: '5', name: 'Rentat', spots: 4, room_id: 'room1' },
    ]
  }
];

// Local storage fallback for offline functionality
const STORAGE_KEYS = {
  ADMIN_STATUS: 'product_demo_admin_status',
  SELECTED_STARTUPS: 'product_demo_selected_startups',
  USER_NAME: 'product_demo_user_name',
  USER_PHONE: 'product_demo_user_phone',
  COUNTRY_CODE: 'product_demo_country_code'
};

const saveToStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

const loadFromStorage = (key: string, defaultValue: any) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return defaultValue;
  }
};

function App() {
  const [selectedRoom, setSelectedRoom] = useState<string | null>('room1');
  const [selectedStartups, setSelectedStartups] = useState<string[]>([]);
  const maxSelections = 2;
  const [isAdmin, setIsAdmin] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedCountryCode, setSelectedCountryCode] = useState('973');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [rooms, setRooms] = useState<Room[]>(DEFAULT_ROOMS);
  const [isConnected, setIsConnected] = useState(false);

  // Initialize Supabase and load data
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize default data if needed
        await initializeDefaultData();
        
        // Load initial data
        const [bookingsData, roomsData] = await Promise.all([
          getBookings(),
          getRooms()
        ]);
        
        setBookings(bookingsData);
        setRooms(roomsData);
        setIsConnected(true);
      } catch (error) {
        console.error('Error initializing app:', error);
        setIsConnected(false);
      }
    };

    initializeApp();
  }, []);

  // Set up real-time subscriptions
  useEffect(() => {
    // Subscribe to bookings changes
    const bookingsSubscription = supabase
      .channel('bookings')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'bookings' },
        async () => {
          try {
            const newBookings = await getBookings();
            setBookings(newBookings);
          } catch (error) {
            console.error('Error fetching updated bookings:', error);
          }
        }
      )
      .subscribe();

    // Subscribe to startups changes
    const startupsSubscription = supabase
      .channel('startups')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'startups' },
        async () => {
          try {
            const newRooms = await getRooms();
            setRooms(newRooms);
          } catch (error)
 {
            console.error('Error fetching updated rooms:', error);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(bookingsSubscription);
      supabase.removeChannel(startupsSubscription);
    };
  }, []);

  // Load user-specific data from localStorage (for offline functionality)
  useEffect(() => {
    const savedAdminStatus = loadFromStorage(STORAGE_KEYS.ADMIN_STATUS, false);
    const savedSelectedStartups = loadFromStorage(STORAGE_KEYS.SELECTED_STARTUPS, []);
    const savedUserName = loadFromStorage(STORAGE_KEYS.USER_NAME, '');
    const savedUserPhone = loadFromStorage(STORAGE_KEYS.USER_PHONE, '');
    const savedCountryCode = loadFromStorage(STORAGE_KEYS.COUNTRY_CODE, '973');

    setIsAdmin(savedAdminStatus);
    setSelectedStartups(savedSelectedStartups);
    setUserName(savedUserName);
    setUserPhone(savedUserPhone);
    setSelectedCountryCode(savedCountryCode);
  }, []);

  // Save user-specific data to localStorage (for offline functionality)
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.ADMIN_STATUS, isAdmin);
  }, [isAdmin]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.SELECTED_STARTUPS, selectedStartups);
  }, [selectedStartups]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.USER_NAME, userName);
  }, [userName]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.USER_PHONE, userPhone);
  }, [userPhone]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.COUNTRY_CODE, selectedCountryCode);
  }, [selectedCountryCode]);

  const currentRoom = rooms.find(room => room.id === selectedRoom);
  const canSelectMore = selectedStartups.length < maxSelections;
  const hasSelections = selectedStartups.length > 0;

  const handleSelect = (startupId: string) => {
    if (selectedStartups.includes(startupId)) {
      setSelectedStartups(selectedStartups.filter(id => id !== startupId));
    } else if (canSelectMore) {
      setSelectedStartups([...selectedStartups, startupId]);
    }
  };

  const resetSelections = () => {
    setSelectedStartups([]);
  };

  // Connection status indicator
  const ConnectionStatus = () => (
    <div className={`fixed top-6 left-6 z-50 flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium ${
      isConnected 
        ? 'bg-green-100 text-green-800 border border-green-200' 
        : 'bg-red-100 text-red-800 border border-red-200'
    }`}>
      {isConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
      {isConnected ? 'Connected' : 'Disconnected'}
    </div>
  );

  // AdminButton: fixed, only on md and up
  const AdminButton = (
    <button
      className="hidden md:flex fixed top-6 right-6 z-50 bg-[#7ACDB9] hover:bg-[#5bb99e] text-white font-bold py-3 px-6 rounded-full shadow-lg items-center gap-2 transition-all"
      onClick={() => setShowAdminLogin(true)}
      style={{ boxShadow: '0 4px 24px 0 rgba(122,205,185,0.15)' }}
    >
      <Shield className="w-5 h-5" /> Admin Login
    </button>
  );

  if (isAdmin) {
    // Create a map of all startups for easy lookup
    const allStartups = new Map<string, { name: string; roomName: string }>();
    rooms.forEach(room => {
        room.startups.forEach(startup => {
            allStartups.set(startup.id, { name: startup.name, roomName: 'Product Demo Day Startups' });
        });
    });

    // Group bookings by startup name
    const startupBookings: { [startupName: string]: { name: string; phone: string; room: string }[] } = {};
    bookings.forEach(b => {
        b.startups.forEach(startupId => {
            const startupInfo = allStartups.get(startupId);
            if (startupInfo) {
                const startupName = startupInfo.name;
                const roomName = startupInfo.roomName;
                if (!startupBookings[startupName]) {
                    startupBookings[startupName] = [];
                }
                startupBookings[startupName].push({ name: b.name, phone: b.phone, room: roomName });
            }
        });
    });
    // Custom confirmation modal for reset
    if (showResetConfirm) {
      return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
          <div className="bg-white rounded-xl shadow-lg p-8 border border-[#7ACDB9]/40 w-full max-w-sm flex flex-col items-center">
            <h2 className="text-xl font-bold mb-4 text-[#2B4A3D]">Confirm Reset</h2>
            <p className="mb-6 text-gray-700 text-center">Are you sure you want to reset all bookings and availability? This cannot be undone.</p>
            <div className="flex gap-4 w-full">
              <button
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full"
                onClick={async () => {
                  try {
                    await Promise.all([
                      deleteAllBookings(),
                      resetAllStartupSpots()
                    ]);
                    setShowResetConfirm(false);
                  } catch (error) {
                    alert('Error resetting data. Please try again.');
                  }
                }}
              >
                Yes, Reset
              </button>
              <button
                className="flex-1 bg-[#7ACDB9] hover:bg-[#5bb99e] text-white font-bold py-2 px-4 rounded-full"
                onClick={() => setShowResetConfirm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-green-50 to-green-100 p-2 md:p-8">
        <ConnectionStatus />
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 md:mb-8 gap-2">
          <h1 className="text-xl md:text-3xl font-bold text-[#2B4A3D]">Admin Dashboard</h1>
          <div className="flex flex-col md:flex-row gap-2">
            <button className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 md:px-6 rounded-full text-sm md:text-md shadow-lg" onClick={() => setShowResetConfirm(true)}>
              Reset All Bookings
            </button>
            <button className="bg-[#7ACDB9] hover:bg-[#5bb99e] text-white font-bold py-2 px-4 md:px-6 rounded-full text-sm md:text-md shadow-lg" onClick={() => setIsAdmin(false)}>
              Switch to User View
            </button>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-2 md:p-6 border border-[#7ACDB9]/40 mb-4 md:mb-8">
          <h2 className="text-lg md:text-xl font-semibold mb-2 md:mb-4">All Bookings</h2>
          {bookings.length === 0 ? (
            <p className="text-gray-500 text-sm md:text-base">No bookings yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[500px] w-full text-left border-collapse text-xs md:text-base">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 px-4">#</th>
                    <th className="py-2 px-4">Name</th>
                    <th className="py-2 px-4">Phone</th>
                    <th className="py-2 px-4">Startups</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b, i) => {
                    const startupNames = b.startups.map(id => allStartups.get(id)?.name || id).join(', ');
                    return (
                      <tr key={b.id || i} className="border-b hover:bg-[#7ACDB9]/10">
                        <td className="py-2 px-4 font-semibold">{i + 1}</td>
                        <td className="py-2 px-4">{b.name}</td>
                        <td className="py-2 px-4">{b.phone}</td>
                        <td className="py-2 px-4">{startupNames}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
          {Object.entries(startupBookings).map(([startup, users]) => {
            return (
              <div key={startup} className="bg-white rounded-xl shadow-lg p-2 md:p-6 border border-[#7ACDB9]/40">
                <h3 className="text-base md:text-lg font-bold mb-1 md:mb-2 text-[#2B4A3D]">{startup}</h3>
                {users.length === 0 ? (
                  <p className="text-gray-500 text-xs md:text-base">No bookings for this startup.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-[300px] w-full text-left border-collapse text-xs md:text-base">
                      <thead>
                        <tr className="border-b">
                          <th className="py-2 px-4">#</th>
                          <th className="py-2 px-4">Name</th>
                          <th className="py-2 px-4">Phone</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u, idx) => (
                          <tr key={idx} className="border-b hover:bg-[#7ACDB9]/10">
                            <td className="py-2 px-4 font-semibold">{idx + 1}</td>
                            <td className="py-2 px-4">{u.name}</td>
                            <td className="py-2 px-4">{u.phone}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (showAdminLogin) {
    return (
      <>
        <ConnectionStatus />
        {AdminButton}
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-green-50 to-green-100">
          <div className="bg-white rounded-xl shadow-lg p-8 border border-[#7ACDB9]/40 w-full max-w-sm">
            <h2 className="text-2xl font-bold mb-4 text-[#2B4A3D]">Admin Login</h2>
            <input
              type="password"
              placeholder="Enter admin password"
              className="w-full border border-[#7ACDB9] rounded px-4 py-2 mb-4"
              value={adminPassword}
              onChange={e => setAdminPassword(e.target.value)}
            />
            <button
              className="bg-[#7ACDB9] hover:bg-[#5bb99e] text-white font-bold py-2 px-6 rounded-full w-full flex items-center justify-center gap-2"
              onClick={() => {
                if (adminPassword === '0000') {
                  setIsAdmin(true);
                  setShowAdminLogin(false);
                  setAdminPassword('');
                } else {
                  alert('Incorrect password');
                }
              }}
            >
              <Shield className="w-5 h-5" /> Login
            </button>
            <button
              className="mt-4 text-[#7ACDB9] underline w-full"
              onClick={() => setShowAdminLogin(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      </>
    );
  }

  if (showForm) {
    if (showSuccess) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-green-50 to-green-100">
          <div className="bg-white rounded-xl shadow-lg p-8 border border-[#7ACDB9]/40 w-full max-w-sm flex flex-col items-center">
            <div className="bg-[#7ACDB9] rounded-full p-4 mb-4">
              <Check className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-[#2B4A3D]">Thank you for your booking!</h2>
            <p className="text-[#2B4A3D] text-center mb-4">Your selection has been submitted. Enjoy the rest of the event! 🎉</p>
          </div>
        </div>
      );
    }
    return (
      <>
        <ConnectionStatus />
        {AdminButton}
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-green-50 to-green-100">
          <div className="bg-white rounded-2xl shadow-lg p-10 border border-[#7ACDB9]/40 w-full max-w-lg md:max-w-lg flex flex-col items-center" style={{ boxShadow: '0 4px 24px 0 rgba(122,205,185,0.10)' }}>
            <h2 className="text-2xl font-bold mb-6 text-[#2B4A3D] text-center">Complete Your Booking</h2>
            <form
              className="w-full"
              onSubmit={async (e) => {
                e.preventDefault();
                console.log('Selected Startups:', selectedStartups);
                console.log('Selected Room:', selectedRoom);

                try {
                  const booking = {
                    name: userName,
                    phone: `+${selectedCountryCode}${userPhone}`,
                    startups: selectedStartups, // Use the IDs from the state
                    room_id: selectedRoom!
                  };

                  // Create booking
                  await createBooking(booking);
                  
                  // Update startup spots
                  const updatePromises = selectedStartups.map(startupId => {
                    const startup = currentRoom?.startups.find(s => s.id === startupId);
                    if (startup && startup.spots > 0) {
                      return updateStartupSpots(startupId, startup.spots - 1);
                    }
                    return Promise.resolve();
                  });
                  
                  await Promise.all(updatePromises);
                  
                  // Immediately fetch latest rooms data to update spots left in UI
                  const updatedRooms = await getRooms();
                  setRooms(updatedRooms);
                  setShowSuccess(true);
                  setTimeout(() => {
                    setShowSuccess(false);
                    setShowForm(false);
                    setSelectedStartups([]);
                    setUserName('');
                    setUserPhone('');
                  }, 2500);
                } catch (error) {
                  alert('Error submitting booking. Please try again.');
                }
              }}
            >
              <div className="flex flex-col gap-4 mb-6 w-full">
                <input
                  type="text"
                  placeholder="Your Name"
                  className="w-full border border-[#7ACDB9] rounded-lg px-4 py-3 text-[#2B4A3D] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7ACDB9]/40"
                  value={userName}
                  onChange={e => setUserName(e.target.value)}
                  required
                />
                <div className="flex flex-col gap-2 w-full">
                  <select
                    className="border border-[#7ACDB9] rounded-lg px-2 py-3 text-[#2B4A3D] focus:outline-none focus:ring-2 focus:ring-[#7ACDB9]/40 min-w-[120px]"
                    value={selectedCountryCode}
                    onChange={e => setSelectedCountryCode(e.target.value)}
                  >
                    <option value="973">🇧🇭 +973 (Bahrain)</option>
                    <option value="966">🇸🇦 +966 (Saudi Arabia)</option>
                    <option value="971">🇦🇪 +971 (UAE)</option>
                    <option value="965">🇰🇼 +965 (Kuwait)</option>
                    <option value="974">🇶🇦 +974 (Qatar)</option>
                    <option value="968">🇴🇲 +968 (Oman)</option>
                  </select>
                  <input
                    type="text"
                    pattern="[0-9]*"
                    inputMode="numeric"
                    placeholder="Phone Number"
                    className="w-full border border-[#7ACDB9] rounded-lg px-4 py-3 text-[#2B4A3D] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7ACDB9]/40"
                    value={userPhone}
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '');
                      setUserPhone(val);
                    }}
                    required
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2 w-full mt-2">
                <button
                  type="submit"
                  className="w-full bg-[#7ACDB9] hover:bg-[#5bb99e] text-white font-bold py-3 rounded-full text-lg shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit
                </button>
                <button
                  type="button"
                  className="w-full bg-gray-200 hover:bg-gray-300 text-[#2B4A3D] font-bold py-3 rounded-full text-lg shadow-md transition"
                  onClick={() => { setShowForm(false); setSelectedStartups([]); }}
                >
                  Back
                </button>
              </div>
            </form>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Stagewise />
      <ConnectionStatus />
      {AdminButton}
      <div className="min-h-screen bg-gradient-to-br from-white via-green-50 to-green-100">
        <div className="container mx-auto px-4 py-8">
          {/* Branding Logo */}
          <div className="flex justify-center mb-10">
            <img src={brandingLogo} alt="Tamkeen Riyada Logo" className="h-20 md:h-28" />
          </div>
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-[#7ACDB9] rounded-full mb-6 shadow-lg">
              <Award className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Product Demo Day
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8 whitespace-pre-line">
{`🎉 Thanks for joining all the product demos!

🙌 It's time for the Q&A rotation—please stay, we're almost at the finish line of an amazing event! Choose up to 2 startups you'd love to sit with for questions, feedback, or just because you like them!

⏳ Spots are limited, so pick wisely. If your favorites are full or you want more than 2, just ask a Spring team member and we'll help!`}
            </p>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">Select Your Startups</h2>
          </div>

          {/* Selection Status */}
          <div className="max-w-6xl mx-auto mb-8">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-[#7ACDB9]/40">
              <div className="flex items-center space-x-3">
                <Users className="w-6 h-6 text-[#7ACDB9]" />
                <span className="text-lg font-semibold text-gray-900">
                  Selected: {selectedStartups.length} / {maxSelections} startups
                </span>
              </div>
              {hasSelections && (
                <div className="mt-4 pt-4 border-t border-[#7ACDB9]/40">
                  <p className="text-sm text-gray-600 mb-2">Your selections:</p>
                  <div className="flex flex-wrap gap-3">
                    {selectedStartups.map(startupId => {
                      const startup = currentRoom?.startups.find(s => s.id === startupId);
                      return startup ? (
                        <div key={startupId} className="bg-[#7ACDB9] text-[#2B4A3D] px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2">
                          <span>{startup.name}</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Startup Selection Options */}
          <div className="max-w-6xl mx-auto">
            <div className="grid gap-8">
              {rooms.flatMap(room => room.startups).map((startup) => {
                const isSelected = selectedStartups.includes(startup.id);
                const spotsLeft = startup.spots - (isSelected ? 1 : 0);
                const isFull = startup.spots <= 0 && !isSelected;
                return (
                  <React.Fragment key={startup.id}>
                    <div
                      className={`
                        relative overflow-hidden rounded-2xl border-2 transition-all duration-300 shadow-lg
                        ${isFull
                          ? 'border-gray-300 bg-gray-100 opacity-70 cursor-not-allowed'
                          : isSelected
                            ? 'border-[#7ACDB9] bg-[#7ACDB9] shadow-xl ring-4 ring-[#7ACDB9]/30'
                            : 'border-[#7ACDB9] bg-white'}
                      `}
                      onClick={() => {
                        if (!isFull) handleSelect(startup.id)
                      }}
                      style={{ cursor: canSelectMore || isSelected ? 'pointer' : 'not-allowed', opacity: canSelectMore || isSelected ? 1 : 0.6 }}
                    >
                      <div className="p-8">
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4 mb-3">
                              <h3 className={`text-2xl font-bold ${
                                isFull ? 'text-gray-400' : isSelected ? 'text-[#2B4A3D]' : 'text-gray-900'
                              }`}>
                                {startup.name}
                              </h3>
                              {isSelected && (
                                <div className="flex items-center space-x-2 bg-[#7ACDB9] text-white px-4 py-2 rounded-full text-sm font-medium shadow-md">
                                  <Check className="w-4 h-4" />
                                  <span>Selected</span>
                                </div>
                              )}
                            </div>
                            <div className="text-sm text-gray-500 mt-2">
                              {isFull && !isSelected ? (
                                <span className="text-gray-400 font-semibold">Full</span>
                              ) : (
                                <span>{spotsLeft} spots left</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="max-w-6xl mx-auto mt-12 text-center">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-[#7ACDB9]/40">
              <p className="text-gray-600 font-medium">
                🚀 Select up to 2 startups
              </p>
            </div>
          </div>

          {/* Confirm Button */}
          <div className="max-w-6xl mx-auto mt-8 text-center">
            <button
              className="bg-[#7ACDB9] hover:bg-[#5bb99e] text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={selectedStartups.length === 0}
              onClick={() => {
                setShowForm(true);
              }}
            >
              Confirm Selection
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;