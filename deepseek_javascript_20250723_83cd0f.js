import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import AppointmentCalendar from '../components/AppointmentCalendar';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchAppointments();
    }
  }, [status]);

  const fetchAppointments = async () => {
    try {
      const res = await fetch('/api/appointments');
      const data = await res.json();
      setAppointments(data);
    } catch (err) {
      console.error('Failed to fetch appointments', err);
    } finally {
      setLoading(false);
    }
  };

  if (status !== 'authenticated') {
    return <Layout>Loading...</Layout>;
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold mb-6">Welcome, {session.user.name}</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Your Appointments</h2>
            {loading ? (
              <p>Loading appointments...</p>
            ) : appointments.length === 0 ? (
              <p>No upcoming appointments</p>
            ) : (
              <div className="space-y-4">
                {appointments.map((appt) => (
                  <div key={appt._id} className="border rounded-lg p-4">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium">
                          {new Date(appt.date).toLocaleDateString()} at{' '}
                          {new Date(appt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p>With {appt.therapist.name}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${
                        appt.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                        appt.status === 'completed' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {appt.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Book New Appointment</h2>
            <AppointmentCalendar />
          </div>
        </div>
      </div>
    </Layout>
  );
}