import React, { useState } from 'react';
import { Check, Users, Award, ArrowLeft, MapPin, Shield } from 'lucide-react';
import logo from './assets/branding-logo.png';

interface Startup {
  id: string;
  name: string;
  spots: number;
}

interface Room {
  id: string;
  name: string;
  startups: Startup[];
}

function App() {
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [selectedStartups, setSelectedStartups] = useState<string[]>([]);
  const maxVotes = 2;
  const [isAdmin, setIsAdmin] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [bookings, setBookings] = useState<{ name: string; phone: string; startups: string[] }[]>([]);
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedCountryCode, setSelectedCountryCode] = useState('973');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const [rooms, setRooms] = useState<Room[]>([
    {
      id: 'room1',
      name: 'Room 1',
      startups: [
        { id: '1', name: 'Tamam', spots: 5 },
        { id: '2', name: 'Cater Me', spots: 5 },
        { id: '3', name: 'TellSaleem', spots: 5 },
        { id: '4', name: 'Twazn', spots: 5 }
      ]
    },
    {
      id: 'room2',
      name: 'Room 2',
      startups: [
        { id: '5', name: 'Soor', spots: 5 },
        { id: '6', name: 'Rentat', spots: 5 },
        { id: '7', name: 'Academity', spots: 5 }
      ]
    }
  ]);

  const currentRoom = rooms.find(room => room.id === selectedRoom);
  const canVoteMore = selectedStartups.length < maxVotes;
  const hasVotes = selectedStartups.length > 0;

  const handleVote = (startupId: string) => {
    if (selectedStartups.includes(startupId)) {
      setSelectedStartups(selectedStartups.filter(id => id !== startupId));
    } else if (canVoteMore) {
      setSelectedStartups([...selectedStartups, startupId]);
    }
  };

  const resetVotes = () => {
    setSelectedStartups([]);
    setSelectedRoom(null);
  };

  // Floating Admin Login Button (always visible on user view)
  const AdminButton = (
    <button
      className="fixed top-6 right-6 z-50 bg-[#7ACDB9] hover:bg-[#5bb99e] text-white font-bold py-3 px-6 rounded-full shadow-lg flex items-center gap-2 transition-all"
      onClick={() => setShowAdminLogin(true)}
      style={{ boxShadow: '0 4px 24px 0 rgba(122,205,185,0.15)' }}
    >
      <Shield className="w-5 h-5" /> Admin Login
    </button>
  );

  if (isAdmin) {
    // Group bookings by startup and by room
    const startupBookings: { [startup: string]: { name: string; phone: string; room: string }[] } = {};
    bookings.forEach(b => {
      b.startups.forEach(s => {
        // Find the room for this startup
        const room = rooms.find(r => r.startups.some(st => st.name === s));
        const roomName = room ? room.name : '';
        if (!startupBookings[s]) startupBookings[s] = [];
        startupBookings[s].push({ name: b.name, phone: b.phone, room: roomName });
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
                onClick={() => {
                  setBookings([]);
                  setRooms(prevRooms => prevRooms.map(room => ({
                    ...room,
                    startups: room.startups.map(s => ({ ...s, spots: 5 }))
                  })));
                  setShowResetConfirm(false);
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
      <div className="min-h-screen bg-gradient-to-br from-white via-green-50 to-green-100 p-8">
        {/* Admin button not shown in admin view */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[#2B4A3D]">Admin Dashboard</h1>
          <div className="flex gap-4">
            <button
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-full text-md shadow-lg"
              onClick={() => setShowResetConfirm(true)}
            >
              Reset All Bookings
            </button>
            <button
              className="bg-[#7ACDB9] hover:bg-[#5bb99e] text-white font-bold py-2 px-6 rounded-full text-md shadow-lg"
              onClick={() => setIsAdmin(false)}
            >
              Switch to User View
            </button>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border border-[#7ACDB9]/40 mb-8">
          <h2 className="text-xl font-semibold mb-4">All Bookings</h2>
          {bookings.length === 0 ? (
            <p className="text-gray-500">No bookings yet.</p>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="py-2 px-4">#</th>
                  <th className="py-2 px-4">Name</th>
                  <th className="py-2 px-4">Phone</th>
                  <th className="py-2 px-4">Startups</th>
                  <th className="py-2 px-4">Room</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b, i) => {
                  // Find the room for the first startup in the booking
                  const firstStartup = b.startups[0];
                  const room = rooms.find(r => r.startups.some(st => st.name === firstStartup));
                  const roomName = room ? room.name : '';
                  return (
                    <tr key={i} className="border-b hover:bg-[#7ACDB9]/10">
                      <td className="py-2 px-4 font-semibold">{i + 1}</td>
                      <td className="py-2 px-4">{b.name}</td>
                      <td className="py-2 px-4">{b.phone}</td>
                      <td className="py-2 px-4">{b.startups.join(', ')}</td>
                      <td className="py-2 px-4">{roomName}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        {/* Table for each startup */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {Object.entries(startupBookings).map(([startup, users]) => {
            const roomName = users[0]?.room || '';
            return (
              <div key={startup} className="bg-white rounded-xl shadow-lg p-6 border border-[#7ACDB9]/40">
                <h3 className="text-lg font-bold mb-2 text-[#2B4A3D]">{startup}</h3>
                <div className="text-sm text-gray-500 mb-2">Room: <span className="font-semibold text-[#2B4A3D]">{roomName}</span></div>
                {users.length === 0 ? (
                  <p className="text-gray-500">No bookings for this startup.</p>
                ) : (
                  <table className="w-full text-left border-collapse">
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

  if (!selectedRoom) {
    return (
      <>
        {AdminButton}
        <div className="min-h-screen bg-gradient-to-br from-white via-green-50 to-green-100">
          <div className="container mx-auto px-4 py-8">
            {/* Branding Logo */}
            <div className="flex justify-center mb-10">
              <img src={logo} alt="Tamkeen Riyada Logo" className="h-20 md:h-28" />
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
                🎉 Thanks for joining all the product demos!
                <br></br>
                <br></br>
                🙌 It's time for the Q&A rotation—please stay, we're almost at the finish line of an amazing event! Choose up to 2 startups you'd love to sit with for questions, feedback, or just because you like them!
                <br></br>
                <br></br>
                ⏳ Spots are limited, so pick wisely. If your favorites are full or you want more than 2, just ask a Spring team member and we'll help!
              </p>
            </div>

            {/* Room Selection */}
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Select Your Room</h2>
              <div className="grid md:grid-cols-2 gap-8">
                {rooms.map((room) => (
                  <div
                    key={room.id}
                    className="bg-white rounded-2xl border-2 border-[#7ACDB9] p-8 cursor-pointer transition-all duration-300 hover:border-[#7ACDB9] hover:shadow-xl hover:transform hover:scale-[1.02] hover:ring-4 hover:ring-[#7ACDB9]/30"
                    onClick={() => setSelectedRoom(room.id)}
                  >
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="flex items-center justify-center w-12 h-12 bg-[#7ACDB9] rounded-full">
                        <MapPin className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900">{room.name}</h3>
                    </div>
                    <div className="space-y-3">
                      <p className="text-[#7ACDB9] font-medium mb-4">Featured Startups:</p>
                      {room.startups.map((startup) => (
                        <div key={startup.id} className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-[#7ACDB9] rounded-full"></div>
                          <span className="text-[#2B4A3D] font-medium">{startup.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
        {AdminButton}
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-green-50 to-green-100">
          <div className="bg-white rounded-2xl shadow-lg p-10 border border-[#7ACDB9]/40 w-full max-w-lg md:max-w-lg flex flex-col items-center" style={{ boxShadow: '0 4px 24px 0 rgba(122,205,185,0.10)' }}>
            <h2 className="text-2xl font-bold mb-6 text-[#2B4A3D] text-center">Complete Your Booking</h2>
            <form
              className="w-full"
              onSubmit={e => {
                e.preventDefault();
                setBookings([...bookings, {
                  name: userName,
                  phone: `+${selectedCountryCode}${userPhone}`,
                  startups: currentRoom?.startups.filter(s => selectedStartups.includes(s.id)).map(s => s.name) || []
                }]);
                setRooms(prevRooms => prevRooms.map(room =>
                  room.id !== currentRoom?.id ? room : {
                    ...room,
                    startups: room.startups.map(s =>
                      selectedStartups.includes(s.id)
                        ? { ...s, spots: Math.max(0, s.spots - 1) }
                        : s
                    )
                  }
                ));
                setShowSuccess(true);
                setTimeout(() => {
                  setShowSuccess(false);
                  setShowForm(false);
                  setSelectedStartups([]);
                  setUserName('');
                  setUserPhone('');
                }, 2500);
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
      {AdminButton}
      <div className="min-h-screen bg-gradient-to-br from-white via-green-50 to-green-100">
        <div className="container mx-auto px-4 py-8">
          {/* Branding Logo */}
          <div className="flex justify-center mb-10">
            <img src={logo} alt="Tamkeen Riyada Logo" className="h-20 md:h-28" />
          </div>
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <button
                onClick={resetVotes}
                className="flex items-center space-x-2 text-[#7ACDB9] hover:text-[#5bb99e] transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Room Selection</span>
              </button>
            </div>
            <div className="inline-flex items-center justify-center w-20 h-20 bg-[#7ACDB9] rounded-full mb-6 shadow-lg">
              <Award className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Product Demo Day
            </h1>
            <div className="inline-block bg-[#7ACDB9]/20 text-[#2B4A3D] px-6 py-2 rounded-full text-lg font-semibold mb-4">
              {currentRoom?.name} - Startup Voting
            </div>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-6">
              Please vote for up to <span className="font-semibold text-[#7ACDB9]">2 startups</span> in this room.
            </p>
          </div>

          {/* Voting Status */}
          <div className="max-w-6xl mx-auto mb-8">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-[#7ACDB9]/40">
              <div className="flex items-center space-x-3">
                <Users className="w-6 h-6 text-[#7ACDB9]" />
                <span className="text-lg font-semibold text-gray-900">
                  Voted: {selectedStartups.length} / {maxVotes} startups
                </span>
              </div>
              {hasVotes && (
                <div className="mt-4 pt-4 border-t border-[#7ACDB9]/40">
                  <p className="text-sm text-gray-600 mb-2">Your votes:</p>
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

          {/* Startup Voting Options */}
          <div className="max-w-6xl mx-auto">
            <div className="grid gap-8">
              {currentRoom?.startups.map((startup) => {
                const isVoted = selectedStartups.includes(startup.id);
                const spotsLeft = startup.spots - (isVoted ? 1 : 0);
                const isFull = startup.spots <= 0 && !isVoted;
                return (
                  <React.Fragment key={startup.id}>
                    <div
                      className={`
                        relative overflow-hidden rounded-2xl border-2 transition-all duration-300 shadow-lg
                        ${isFull
                          ? 'border-gray-300 bg-gray-100 opacity-70 cursor-not-allowed'
                          : isVoted
                            ? 'border-[#7ACDB9] bg-[#7ACDB9] shadow-xl ring-4 ring-[#7ACDB9]/30'
                            : 'border-[#7ACDB9] bg-white'}
                      `}
                      onClick={() => {
                        if (!isFull) handleVote(startup.id)
                      }}
                      style={{ cursor: canVoteMore || isVoted ? 'pointer' : 'not-allowed', opacity: canVoteMore || isVoted ? 1 : 0.6 }}
                    >
                      <div className="p-8">
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4 mb-3">
                              <h3 className={`text-2xl font-bold ${
                                isFull ? 'text-gray-400' : isVoted ? 'text-[#2B4A3D]' : 'text-gray-900'
                              }`}>
                                {startup.name}
                              </h3>
                              {isVoted && (
                                <div className="flex items-center space-x-2 bg-[#7ACDB9] text-white px-4 py-2 rounded-full text-sm font-medium shadow-md">
                                  <Check className="w-4 h-4" />
                                  <span>Voted</span>
                                </div>
                              )}
                            </div>
                            <div className="text-sm text-gray-500 mt-2">
                              {isFull && !isVoted ? (
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
                🚀 Vote for up to 2 startups in this room
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
              Confirm Vote
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;