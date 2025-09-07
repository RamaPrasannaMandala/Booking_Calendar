function CalendarGrid({ currentDate, setCurrentDate, selectedDate, setSelectedDate, appointments, isSharedView }) {
  const formatDate = (date) => date.toISOString().split('T')[0];

  const days = [];
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startingDay = firstDay.getDay();

  for (let i = 0; i < startingDay; i++) {
    days.push(<div key={`empty-${i}`} className="h-24 bg-gray-100"></div>);
  }

  for (let i = 1; i <= lastDay.getDate(); i++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
    const dateStr = formatDate(date);
    const hasAppointments = appointments.some((apt) => apt.date === dateStr);
    const isSelected = selectedDate && formatDate(selectedDate) === dateStr;
    const className = `h-24 border p-2 cursor-pointer ${hasAppointments ? 'bg-blue-100' : 'bg-white'} ${
      isSelected ? 'ring-2 ring-blue-500' : ''
    }`;

    days.push(
      <div
        key={i}
        className={className}
        onClick={() => (!isSharedView || hasAppointments ? setSelectedDate(date) : null)}
      >
        <span className="text-sm font-medium">{i}</span>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="grid grid-cols-7 gap-1 text-center font-semibold text-gray-600 mb-2">
        <div>Sun</div>
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
      </div>
      <div className="grid grid-cols-7 gap-1">{days}</div>
    </div>
  );
}

export default CalendarGrid;