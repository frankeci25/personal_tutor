import { useState, useEffect } from 'react';
import axios from 'axios';
import api from '../utils/api';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';

const AddUserForm = ({ onClose }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'student',
    name: '',
    tutorId: ''
  });
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fetchingTutors, setFetchingTutors] = useState(false);

  useEffect(() => {
    const fetchTutors = async () => {
      if (formData.role === 'student') {
        setFetchingTutors(true);
        try {
          const res = await axios.get('http://localhost:5000/api/users/tutors', {
            headers: { 'x-auth-token': localStorage.getItem('token') }
          });
          setTutors(res.data);
          if (res.data.length > 0) {
            setFormData(prev => ({ ...prev, tutorId: res.data[0]._id }));
          }
        } catch (err) {
          setError('Failed to fetch tutors');
        } finally {
          setFetchingTutors(false);
        }
      }
    };
    fetchTutors();
  }, [formData.role]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post('http://localhost:5000/api/users', {
        ...formData,
        tutorId: formData.role === 'student' ? formData.tutorId : undefined
      }, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.msg || 'Error creating user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={true} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Add New User</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}

          <Form.Group className="mb-3">
            <Form.Label>Username *</Form.Label>
            <Form.Control
              type="text"
              required
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Password *</Form.Label>
            <Form.Control
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Role *</Form.Label>
            <Form.Select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <option value="student">Student</option>
              <option value="tutor">Tutor</option>
              <option value="admin">Admin</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Full Name</Form.Label>
            <Form.Control
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </Form.Group>

          {formData.role === 'student' && (
            <Form.Group className="mb-3">
              <Form.Label>Assigned Tutor *</Form.Label>
              {fetchingTutors ? (
                <Spinner animation="border" size="sm" />
              ) : tutors.length === 0 ? (
                <Alert variant="warning">No tutors available. Please create a tutor first.</Alert>
              ) : (
                <Form.Select
                  value={formData.tutorId}
                  onChange={(e) => setFormData({ ...formData, tutorId: e.target.value })}
                >
                  {tutors.map(tutor => (
                    <option key={tutor._id} value={tutor._id}>
                      {tutor.name} ({tutor.username})
                    </option>
                  ))}
                </Form.Select>
              )}
            </Form.Group>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading || (formData.role === 'student' && tutors.length === 0)}>
            {loading ? 'Creating...' : 'Create User'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AddUserForm;