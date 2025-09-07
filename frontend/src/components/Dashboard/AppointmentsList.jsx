function AppointmentsList({ todayAppointments, allAppointments }) {
  return (
    <section className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Today's Appointments</h3>
        <div className="space-y-4">
          {todayAppointments.map((apt) => (
            <div key={apt._id} className="bg-white p-4 rounded-md shadow">
              <h4 className="font-medium">{apt.title}</h4>
              <p className="text-gray-600">{apt.time} - {apt.endTime}</p>
              <p>{apt.customerName} ({apt.customerEmail})</p>
              <p>{apt.notes}</p>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">All Appointments</h3>
        <div className="space-y-4">
          {allAppointments.map((apt) => (
            <div key={apt._id} className="bg-white p-4 rounded-md shadow">
              <h4 className="font-medium">
                {apt.title} - {apt.date}
              </h4>
              <p className="text-gray-600">{apt.time} - {apt.endTime}</p>
              <p>{apt.customerName} ({apt.customerEmail})</p>
              <p>{apt.notes}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default AppointmentsList;