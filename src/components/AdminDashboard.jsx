import  { useEffect, useState } from 'react';
import axios from 'axios';
import api from '../utils/api';
import { Table, Button, Alert } from 'react-bootstrap';
import AddUserForm from './AddUseForm';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);

  

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
    useEffect(() => {
      fetchUsers();
    }, []);
  };

  return (
    <div className="container mt-4">
      <h2>Admin Dashboard</h2>
      
      <Button variant="success" onClick={() => setShowForm(true)} className="mb-3">
        Add New User
      </Button>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Username</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user._id}>
              <td>{user.username}</td>
              <td>{user.role}</td>
              <td>
                <Button variant="info" size="sm" className="me-2">Edit</Button>
                <Button variant="danger" size="sm">Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {showForm && <AddUserForm onClose={() => setShowForm(false)} onSuccess={fetchUsers} />}
    </div>
  );
};

export default AdminDashboard;