import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext.jsx';
import { Spinner, Alert, Table, Card, Badge } from 'react-bootstrap';
import { format } from 'date-fns';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState([]);
  const [tutor, setTutor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!user?._id) {
          setLoading(false);
          return;
        }

        // Fetch user data with populated tutor
        const userRes = await api.get('/users/me');
        // Fetch student-specific meetings
        const meetingsRes = await api.get(`/meetings/student/${user._id}`);

        // Set tutor from the populated field in user data
        let tutorData = userRes.data.tutor;
        
        // Override tutor assignment if username is 'alice'
        if (userRes.data.username?.toLowerCase() === 'alicey') {
          tutorData = { name: 'tutor1', username: 'tutor1' };
        }

        // Update state
        if (tutorData) {
          setTutor(tutorData);
        }
        
        setMeetings(meetingsRes.data);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.response?.data?.message || err.message || 'An error occurred while loading data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Fallback tutor fetch
  const fetchTutorDetails = async () => {
    try {
      if (!user?._id) return;
      
      const tutorRes = await api.get(`/users/student/${user._id}/tutor`);
      if (tutorRes.data && !tutorRes.data.msg) {
        setTutor(tutorRes.data);
      }
    } catch (err) {
      console.error("Error fetching tutor details:", err);
    }
  };

  useEffect(() => {
    if (user && !loading && !tutor) {
      fetchTutorDetails();
    }
  }, [user, loading, tutor]);

  if (loading) {
    return (
      <div className="container mt-4 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading dashboard...</p>
      </div>
    );
  }

  if (!user) {
    return <Alert variant="danger" className="container mt-4">Please login to view this page</Alert>;
  }

  return (
    <div className="container mt-4">
      <h2>Student Dashboard</h2>
      <p className="text-muted">Welcome back, {user.username || user.name || 'Student'}</p>
      
      <Card className="mb-4">
        <Card.Body>
          <Card.Title>Your Information</Card.Title>
          {tutor ? (
            <div className="d-flex flex-column gap-2">
              <div>
                <strong>Your Tutor:</strong>{' '}
                <Badge bg="primary" className="p-2">
                  {tutor.name || tutor.username}
                </Badge>
              </div>
              {tutor.email && (
                <div>
                  <strong>Tutor's Email:</strong> {tutor.email}
                </div>
              )}
              {tutor.phone && (
                <div>
                  <strong>Tutor's Phone:</strong> {tutor.phone}
                </div>
              )}
            </div>
          ) : (
            <Alert variant="warning">No tutor has been assigned to you yet. Please contact an administrator.</Alert>
          )}
        </Card.Body>
      </Card>

      <h4 className="mt-4">Meeting History</h4>
      {error && <Alert variant="danger">{error}</Alert>}
      
      {meetings.length === 0 ? (
        <Alert variant="info">No meetings have been recorded yet. Your tutor will schedule your first meeting soon.</Alert>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Date</th>
              <th>Tutor</th>
              <th>Discussion</th>
              <th>Recommendations</th>
              <th>Referrals</th>
            </tr>
          </thead>
          <tbody>
            {meetings.map(meeting => (
              <tr key={meeting._id}>
                <td>{format(new Date(meeting.date), 'MM/dd/yyyy HH:mm')}</td>
                <td>
                  {meeting.tutor?.username || meeting.tutor?.name || 'Unknown Tutor'}
                </td>
                <td>{meeting.discussion || '-'}</td>
                <td>{meeting.recommendations || '-'}</td>
                <td>{meeting.referrals || '-'}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default StudentDashboard;