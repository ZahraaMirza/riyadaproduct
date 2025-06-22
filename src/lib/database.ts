import { supabase, Booking, Room, Startup } from './supabase'

// Booking operations
export const getBookings = async (): Promise<Booking[]> => {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching bookings:', error)
    throw error
  }

  return data || []
}

export const createBooking = async (booking: Omit<Booking, 'id' | 'created_at'>): Promise<Booking> => {
  const { data, error } = await supabase
    .from('bookings')
    .insert([booking])
    .select()
    .single()

  if (error) {
    console.error('Error creating booking:', error)
    throw error
  }

  return data
}

export const deleteAllBookings = async (): Promise<void> => {
  const { error } = await supabase
    .from('bookings')
    .delete()
    .neq('id', 0) // Delete all records

  if (error) {
    console.error('Error deleting bookings:', error)
    throw error
  }
}

// Room operations
export const getRooms = async (): Promise<Room[]> => {
  const { data, error } = await supabase
    .from('rooms')
    .select(`
      *,
      startups (*)
    `)
    .order('id')

  if (error) {
    console.error('Error fetching rooms:', error)
    throw error
  }

  return data || []
}

export const updateStartupSpots = async (startupId: string, spots: number): Promise<void> => {
  const { error } = await supabase
    .from('startups')
    .update({ spots })
    .eq('id', startupId)

  if (error) {
    console.error('Error updating startup spots:', error)
    throw error
  }
}

export const resetAllStartupSpots = async (): Promise<void> => {
  const { error } = await supabase
    .from('startups')
    .update({ spots: 5 })

  if (error) {
    console.error('Error resetting startup spots:', error)
    throw error
  }
}

// Initialize default data
export const initializeDefaultData = async (): Promise<void> => {
  // Check if rooms already exist
  const { data: existingRooms } = await supabase
    .from('rooms')
    .select('id')
    .limit(1)

  if (existingRooms && existingRooms.length > 0) {
    return // Data already exists
  }

  // Insert default rooms
  const { error: roomsError } = await supabase
    .from('rooms')
    .insert([
      { id: 'room1', name: 'Room 1' },
      { id: 'room2', name: 'Room 2' }
    ])

  if (roomsError) {
    console.error('Error creating rooms:', roomsError)
    throw roomsError
  }

  // Insert default startups
  const { error: startupsError } = await supabase
    .from('startups')
    .insert([
      { id: '1', name: 'Tamam', spots: 5, room_id: 'room1' },
      { id: '2', name: 'Cater Me', spots: 5, room_id: 'room1' },
      { id: '3', name: 'TellSaleem', spots: 5, room_id: 'room1' },
      { id: '4', name: 'Twazn', spots: 5, room_id: 'room1' },
      { id: '5', name: 'Soor', spots: 5, room_id: 'room2' },
      { id: '6', name: 'Rentat', spots: 5, room_id: 'room2' },
      { id: '7', name: 'Academity', spots: 5, room_id: 'room2' }
    ])

  if (startupsError) {
    console.error('Error creating startups:', startupsError)
    throw startupsError
  }
} 