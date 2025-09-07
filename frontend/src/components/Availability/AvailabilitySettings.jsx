import { useState, useRef } from 'react';

function AvailabilitySettings({ selectedDate, availability, onUpdate, onDelete }) {
  const [isCustomDay, setIsCustomDay] = useState(availability?.isCustomDay || false);
  const customStartTimeRef = useRef(availability?.customStartTime || '09:00');
  const customEndTimeRef = useRef(availability?.customEndTime || '18:00');
  const customSlotDurationRef = useRef(availability?.customSlotDuration || 30);
  const [unavailableSlots, setUnavailableSlots] = useState(availability?.unavailableSlots || []);

  const handleAddUnavailableSlot = (slot) => {
    if (!unavailableSlots.includes(slot)) {
      setUnavailableSlots([...unavailableSlots, slot].sort());
    }
  };

  const handleRemoveUnavailableSlot = (slot) => {
    setUnavailableSlots(unavailableSlots.filter((s) => s !== slot));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const date = formatDate(selectedDate);
    const data = {
      date,
      unavailableSlots,
      isCustomDay,
    };
    if (isCustomDay) {
      data.customStartTime = customStartTimeRef.current.value;
      data.customEndTime = customEndTimeRef.current.value;
      data.customSlotDuration = parseInt(customSlotDurationRef.current.value);
    }
    onUpdate(data);
  };

  const handleDelete = () => {
    const date = formatDate(selectedDate);
    onDelete(date);
  };

  const generateSlots = () => {
    const start = isCustomDay ? customStartTimeRef.current.value : '09:00';
    const end = isCustomDay ? customEndTimeRef.current.value : '18:00';
    const duration = isCustomDay ? parseInt(customSlotDurationRef.current.value) : 30;
    const slots = [];
    let [hours, mins] = start.split(':').map(Number);
    while (hours < parseInt(end.split(':')[0]) || (hours === parseInt(end.split(':')[0]) && mins < parseInt(end.split(':')[1]))) {
      slots.push(`${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`);
      mins += duration;
      if (mins >= 60) {
        hours += Math.floor(mins / 60);
        mins %= 60;
      }
    }
    return slots;
  };

  return (
    <div className="bg-white p-6 rounded-md shadow mb-6">
      <h3 className="text-lg font-semibold mb-4">
        Availability Settings for {formatDate(selectedDate)}
      </h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={isCustomDay}
              onChange={(e) => setIsCustomDay(e.target.checked)}
              className="mr-2"
            />
            Custom Day
          </label>
        </div>
        {isCustomDay && (
          <>
            <div className="mb-4">
              <label htmlFor="customStartTime" className="block text-sm font-medium text-gray-700">
                Start Time
              </label>
              <input
                type="time"
                id="customStartTime"
                ref={customStartTimeRef}
                defaultValue={customStartTimeRef.current}
                className="mt-1 block w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="customEndTime" className="block text-sm font-medium text-gray-700">
                End Time
              </label>
              <input
                type="time"
                id="customEndTime"
                ref={customEndTimeRef}
                defaultValue={customEndTimeRef.current}
                className="mt-1 block w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="customSlotDuration"
                className="block text-sm font-medium text-gray-700"
              >
                Slot Duration (minutes)
              </label>
              <select
                id="customSlotDuration"
                ref={customSlotDurationRef}
                defaultValue={customSlotDurationRef.current}
                className="mt-1 block w-full px-3 py-2 border rounded-md"
              >
                <option value="15">15</option>
                <option value="30">30</option>
                <option value="45">45</option>
                <option value="60">60</option>
              </select>
            </div>
          </>
        )}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700">Unavailable Slots</h4>
          <ul className="list-disc pl-5 mb-2">
            {unavailableSlots.map((slot) => (
              <li key={slot} className="flex justify-between items-center">
                {slot}
                <button
                  type="button"
                  onClick={() => handleRemoveUnavailableSlot(slot)}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <select
            onChange={(e) => {
              if (e.target.value) handleAddUnavailableSlot(e.target.value);
              e.target.value = '';
            }}
            className="mt-1 block w-full px-3 py-2 border rounded-md"
          >
            <option value="">Add unavailable slot</option>
            {generateSlots().map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </select>
        </div>
        <div className="flex space-x-4">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            Save Availability
          </button>
          {availability && (
            <button
              type="button"
              onClick={handleDelete}
              className="bg-gray-300 px-4 py-2 rounded-md hover:bg-gray-400"
            >
              Delete Availability
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

const formatDate = (date) => date.toISOString().split('T')[0];

export default AvailabilitySettings;