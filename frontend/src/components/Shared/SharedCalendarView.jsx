import { useState, useEffect } from 'react';
import axios from 'axios';
import CalendarGrid from '../Common/CalendarGrid.jsx';
import BookingForm from '../Common/BookingForm.jsx';

function SharedCalendarView({ shareId }) {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 7, 24));
  const [selectedDate, setSelectedDate] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchSharedCalendar();
  }, [currentDate]);

  const fetchSharedCalendar = async () => {
    try {
      const dateStr = formatDate(currentDate);
      const res = await axios.get(`/calendar/shared/${shareId}?date=${dateStr}`);
      setUser(res.data.user);
      setAppointments(res.data.appointments);
      setAvailableSlots(res.data.availableSlots);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to load shared calendar');
    }
  };

  const handleBooking = async (title, time, duration, customerName, customerEmail, notes) => {
    try {
      const date = formatDate(selectedDate);
      const res = await axios.post(`/calendar/shared/${shareId}/book`, {
        title,
        date,
        time,
        duration,
        customerName,
        customerEmail,
        notes,
      });
      setAppointments([...appointments, res.data.appointment]);
      alert('Appointment booked successfully');
    } catch (err) {
      alert(err.response?.data?.error || 'Booking failed');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">{user?.name}'s Calendar</h1>
      </header>
      <CalendarGrid
        currentDate={currentDate}
        setCurrentDate={setCurrentDate}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        appointments={appointments}
        isSharedView={true}
      />
      {selectedDate && (
        <BookingForm
          selectedDate={selectedDate}
          availableSlots={availableSlots}
          onSubmit={handleBooking}
          isSharedView={true}
        />
      )}
    </div>
  );
}

const formatDate = (date) => date.toISOString().split('T')[0];

export default SharedCalendarView;