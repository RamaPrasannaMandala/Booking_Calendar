import { useState, useEffect } from 'react';
import axios from 'axios';
import CalendarGrid from '../Common/CalendarGrid.jsx';
import AppointmentForm from '../Common/AppointmentForm.jsx';
import ConfirmationModal from '../Modals/ConfirmationModal.jsx';
import ShareModal from '../Modals/ShareModal.jsx';
import AvailabilitySettings from '../Availability/AvailabilitySettings.jsx';
import AppointmentsList from './AppointmentsList.jsx';

function MainCalendar({ currentUser, onLogout }) {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 7, 24));
  const [selectedDate, setSelectedDate] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [todayAppointments,     setTodayAppointments] = useState([]);
  const [allAppointments, setAllAppointments] = useState([]);
  const [availability, setAvailability] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationDetails, setConfirmationDetails] = useState({});
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareLink, setShareLink] = useState('');

  useEffect(() => {
    fetchAppointments();
    fetchShareId();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchAvailabilityForDate(formatDate(selectedDate));
      fetchAppointmentsForDate(formatDate(selectedDate));
    }
  }, [selectedDate]);

  const fetchAppointments = async () => {
    try {
      const res = await axios.get('/appointments');
      setAllAppointments(res.data.appointments);
      const todayRes = await axios.get('/appointments/today');
      setTodayAppointments(todayRes.data.appointments);
    } catch (err) {
      alert('Failed to load appointments');
    }
  };

  const fetchAppointmentsForDate = async (date) => {
    try {
      const res = await axios.get(`/appointments/date/${date}`);
      setAppointments(res.data.appointments);
    } catch (err) {
      console.error('Failed to load appointments for date');
    }
  };

  const fetchAvailabilityForDate = async (date) => {
    try {
      const res = await axios.get('/calendar/availability', { params: { date } });
      setAvailability(res.data.availability[0] || null);
    } catch (err) {
      console.error('Failed to load availability');
    }
  };

  const fetchShareId = async () => {
    try {
      const res = await axios.get('/calendar/share-id');
      setShareLink(res.data.shareUrl);
    } catch (err) {
      console.error('Failed to get share link');
    }
  };

  const changeMonth = (delta) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + delta);
    setCurrentDate(newDate);
  };
  console.log(selectedDate);
  const handleCreateAppointment = async (title, time, duration, customerName, customerEmail, notes) => {
    try {

      const date = formatDate(selectedDate);
      console.log(date);
      const res = await axios.post('/appointments', {
        title,
        date,
        time,
        duration,
        customerName,
        customerEmail,
        notes,
      });
      setAppointments([...appointments, res.data.appointment]);
      setConfirmationDetails(res.data.appointment);
      setShowConfirmation(true);
      fetchAppointments();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create appointment');
    }
  };

  const handleUpdateAvailability = async (data) => {
    try {
      const res = await axios.post('/calendar/availability', data);
      setAvailability(res.data.availability);
      alert('Availability updated');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update availability');
    }
  };

  const handleDeleteAvailability = async (date) => {
    try {
      await axios.delete(`/calendar/availability/${date}`);
      setAvailability(null);
      alert('Availability deleted');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete availability');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <header className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Appointment Calendar</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span>{currentUser.name}</span>
              <button onClick={onLogout} className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600">
                Sign Out
              </button>
            </div>
            <button
              onClick={() => setShowShareModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Share Calendar
            </button>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button onClick={() => changeMonth(-1)} className="bg-gray-200 px-4 py-2 rounded-md">&lt;</button>
          <h2 className="text-xl font-semibold">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>
          <button onClick={() => changeMonth(1)} className="bg-gray-200 px-4 py-2 rounded-md">&gt;</button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <section className="col-span-2">
          <CalendarGrid
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            appointments={allAppointments}
            isSharedView={false}
          />
          {selectedDate && (
            <>
              <AppointmentForm onSubmit={handleCreateAppointment} onCancel={() => setSelectedDate(null)} />
              <AvailabilitySettings
                selectedDate={selectedDate}
                availability={availability}
                onUpdate={handleUpdateAvailability}
                onDelete={handleDeleteAvailability}
              />
            </>
          )}
        </section>

        <AppointmentsList todayAppointments={todayAppointments} allAppointments={allAppointments} />
      </div>

      {showConfirmation && (
        <ConfirmationModal details={confirmationDetails} onClose={() => setShowConfirmation(false)} />
      )}

      {showShareModal && <ShareModal shareLink={shareLink} onClose={() => setShowShareModal(false)} />}
    </div>
  );
}

const formatDate = (date) => date.toISOString().split('T')[0];

export default MainCalendar;