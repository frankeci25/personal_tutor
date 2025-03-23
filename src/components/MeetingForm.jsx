import { useState } from 'react';
import axios from 'axios';
import api from '../utils/api.js'
import { useAuth } from '../context/AuthContext.jsx';
import { Modal, Button, Form, Alert } from 'react-bootstrap';

const MeetingForm = ({ studentId, onClose, onSave }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    discussion: '',
    recommendations: '',
    referrals: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/meetings', {
        studentId,
        tutorId: user._id,
        ...formData
      }, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      onSave();
      onClose();
    } catch (err) {
      setError(err.response?.data?.msg || 'Error saving meeting');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={true} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Add Meeting Details</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Form.Group className="mb-3">
            <Form.Label>Discussion</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={formData.discussion}
              onChange={(e) => setFormData({ ...formData, discussion: e.target.value })}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Recommendations</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={formData.recommendations}
              onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Referrals</Form.Label>
            <Form.Control
              type="text"
              value={formData.referrals}
              onChange={(e) => setFormData({ ...formData, referrals: e.target.value })}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Meeting'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default MeetingForm;