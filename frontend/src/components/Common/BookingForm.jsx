
function BookingForm({ selectedDate, availableSlots, onSubmit, isSharedView }) {
  const titleRef = useRef();
  const timeRef = useRef();
  const durationRef = useRef();
  const nameRef = useRef();
  const emailRef = useRef();
  const notesRef = useRef();

  const handleSubmit = (e) => {
    e.preventDefault();
    const title = titleRef.current.value;
    const time = timeRef.current.value;
    const duration = parseInt(durationRef.current.value);
    const customerName = nameRef.current.value;
    const customerEmail = emailRef.current.value;
    const notes = notesRef.current.value;
    onSubmit(title, time, duration, customerName, customerEmail, notes);
  };

  return (
    <div className="bg-white p-6 rounded-md shadow mb-6">
      <h3 className="text-lg font-semibold mb-4">
        Book Appointment on {selectedDate.toLocaleDateString()}
      </h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="appointmentTitle" className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            type="text"
            id="appointmentTitle"
            ref={titleRef}
            className="mt-1 block w-full px-3 py-2 border rounded-md"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="appointmentTime" className="block text-sm font-medium text-gray-700">
            Time
          </label>
          <select
            id="appointmentTime"
            ref={timeRef}
            className="mt-1 block w-full px-3 py-2 border rounded-md"
            required
          >
            {availableSlots.map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="appointmentDuration" className="block text-sm font-medium text-gray-700">
            Duration
          </label>
          <select
            id="appointmentDuration"
            ref={durationRef}
            className="mt-1 block w-full px-3 py-2 border rounded-md"
          >
            <option value="30">30 minutes</option>
            <option value="60">1 hour</option>
            <option value="90">1 hour 30 minutes</option>
            <option value="120">2 hours</option>
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="customerName" className="block text-sm font-medium text-gray-700">
            Your Name
          </label>
          <input
            type="text"
            id="customerName"
            ref={nameRef}
            className="mt-1 block w-full px-3 py-2 border rounded-md"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700">
            Your Email
          </label>
          <input
            type="email"
            id="customerEmail"
            ref={emailRef}
            className="mt-1 block w-full px-3 py-2 border rounded-md"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="appointmentNotes" className="block text-sm font-medium text-gray-700">
            Notes (Optional)
          </label>
          <textarea
            id="appointmentNotes"
            ref={notesRef}
            className="mt-1 block w-full px-3 py-2 border rounded-md"
          ></textarea>
        </div>
        <div>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            Book Now
          </button>
        </div>
      </form>
    </div>
  );
}

export default BookingForm;