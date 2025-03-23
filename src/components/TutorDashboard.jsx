import { useEffect, useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext.jsx';
import { Table, Button, Card, Spinner, Alert } from 'react-bootstrap';
import MeetingForm from './MeetingForm';

const TutorDashboard = () => {
  const { user: tutor } = useAuth();
  const [students, setStudents] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (!tutor?._id) return;

        const [studentsRes, meetingsRes] = await Promise.all([
          api.get(`/users/tutor/${tutor._id}/students`),
          api.get(`/meetings/tutor/${tutor._id}`)
        ]);

        setStudents(studentsRes.data);
        
        // Process meetings data to ensure student details are populated
        const meetingsData = meetingsRes.data;
        
        // Create a lookup map of student IDs to student objects
        const studentMap = {};
        studentsRes.data.forEach(student => {
          studentMap[student._id] = student;
        });
        
        // Ensure each meeting has the complete student object
        const processedMeetings = meetingsData.map(meeting => {
          // If the meeting only has student ID but not the full student object
          if (meeting.studentId && !meeting.student) {
            return {
              ...meeting,
              student: studentMap[meeting.studentId] || { username: 'Unknown Student' }
            };
          }
          // If the meeting has a student object but username might be missing
          if (meeting.student && !meeting.student.username) {
            const fullStudent = studentMap[meeting.student._id];
            if (fullStudent) {
              return {
                ...meeting,
                student: fullStudent
              };
            }
          }
          return meeting;
        });
        
        setMeetings(processedMeetings);
      } catch (err) {
        setError(err.message || 'An error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [tutor?._id]);

  const refreshMeetings = async () => {
    try {
      if (!tutor?._id) return;
      const response = await api.get(`/meetings/tutor/${tutor._id}`);
      
      // Apply the same processing to ensure student details
      const studentMap = {};
      students.forEach(student => {
        studentMap[student._id] = student;
      });
      
      const processedMeetings = response.data.map(meeting => {
        if (meeting.studentId && !meeting.student) {
          return {
            ...meeting,
            student: studentMap[meeting.studentId] || { username: 'Unknown Student' }
          };
        }
        if (meeting.student && !meeting.student.username) {
          const fullStudent = studentMap[meeting.student._id];
          if (fullStudent) {
            return {
              ...meeting,
              student: fullStudent
            };
          }
        }
        return meeting;
      });
      
      setMeetings(processedMeetings);
    } catch (error) {
      console.error('Failed to refresh meetings:', error);
    }
  };

  if (loading) return <Spinner animation="border" className="mt-4" />;
  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!tutor) return <Alert variant="warning">Please login as tutor</Alert>;

  return (
    <div className="container mt-4">
      <h2>Tutor Dashboard - {tutor.username}</h2>

      {/* Students Card */}
      <div className="row mb-4">
        <div className="col-md-6">
          <Card>
            <Card.Body>
              <Card.Title>My Students ({students.length})</Card.Title>
              {students.length === 0 ? (
                <Alert variant="info">No students assigned</Alert>
              ) : (
                <ul className="list-group">
                  {students.map(student => (
                    <li key={student._id} className="list-group-item d-flex justify-content-between align-items-center">
                      {student.username}
                      <Button 
                        size="sm"
                        onClick={() => {
                          setSelectedStudent(student._id);
                          setShowForm(true);
                        }}
                      >
                        Add Meeting
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Meetings Table */}
      <h4>Recent Meetings</h4>
      {meetings.length === 0 ? (
        <Alert variant="info">No meetings found</Alert>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Date</th>
              <th>Student</th>
              <th>Discussion</th>
              <th>Recommendations</th>
            </tr>
          </thead>
          <tbody>
            {meetings.map(meeting => (
              <tr key={meeting._id}>
                <td>{new Date(meeting.date).toLocaleDateString()}</td>
                <td>
                  {meeting.student?.username || 
                   (meeting.studentId && students.find(s => s._id === meeting.studentId)?.username) || 
                   'Unknown Student'}
                </td>
                <td>{meeting.discussion}</td>
                <td>{meeting.recommendations}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Meeting Form */}
      {showForm && (
        <MeetingForm 
          tutorId={tutor._id}
          studentId={selectedStudent} 
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            refreshMeetings();
          }}
        />
      )}
    </div>
  );
};

export default TutorDashboard;