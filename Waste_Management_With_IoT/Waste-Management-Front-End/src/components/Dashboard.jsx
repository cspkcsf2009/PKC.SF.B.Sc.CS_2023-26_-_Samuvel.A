import React, { useEffect, useState, useMemo } from 'react';
import { toast } from 'react-toastify';
import { useLogout } from '../hooks/useLogout';
import Menubar from '../common/Menubar';
import axios from 'axios';
import Table from 'react-bootstrap/Table';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Modal from 'react-bootstrap/Modal';

function Dashboard() {
  // Retrieve the authentication token from the session storage
  const token = sessionStorage.getItem('token');

  // State for storing user data
  const [data, setData] = useState([]);

  // State to track the user to be deleted and show the confirmation dialog
  const [deleteUser, setDeleteUser] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Logout function from the useLogout custom hook
  const logout = useLogout();

  // Navigate function from the useNavigate hook
  const navigate = useNavigate();

  // Fetch user data from the backend
  const getData = async () => {
    try {
      const res = await axios.get(`${process.env.VITE_API_URL}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 200) {
        setData(res.data.data);
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error(error.response.data.message);
      if (error.response.status === 401) {
        logout();
      }
    }
  };

  // Handle user deletion
  const handleDelete = async (id) => {
    try {
      const res = await axios.delete(`${process.env.VITE_API_URL}/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 200) {
        toast.success(res.data.message);
        getData();
      }
    } catch (error) {
      toast.error(error.response.data.message);
      if (error.response.status === 401) {
        logout();
      }
    }
  };

  // Function to handle opening the confirmation dialog
  const handleOpenConfirmation = (user) => {
    setDeleteUser(user);
    setShowConfirmation(true);
  };

  // Function to handle closing the confirmation dialog
  const handleCloseConfirmation = () => {
    setDeleteUser(null);
    setShowConfirmation(false);
  };

  // Function to handle user deletion with confirmation
  const handleConfirmDelete = async () => {
    if (deleteUser) {
      await handleDelete(deleteUser._id);
      handleCloseConfirmation();
    }
  };

  // Fetch user data on component mount
  useEffect(() => {
    if (token) {
      getData();
    } else {
      logout();
    }
  }, []);

  // Memoize the mapped components to improve performance
  const userRows = useMemo(
    () =>
      data.map((user, index) => (
        <tr key={user._id}>
          <td>{index + 1}</td>
          <td style={{ textTransform: 'capitalize' }}>{user.role}</td>
          <td style={{ textTransform: 'capitalize' }}>{user.firstName}</td>
          <td style={{ textTransform: 'capitalize' }}>{user.lastName}</td>
          <td>{user.email}</td>
          <td style={{ textAlign: 'center' }}>{user.batch}</td>
          <td id='dashTD'>
            {/* Use the navigate function for better routing */}
            <Button onClick={() => navigate(`/edit-user/${user._id}`)}>Edit</Button>{' '}
            <Button variant='success' onClick={() => navigate(`/users/change-password/${user._id}`)}>Change Password</Button>{' '}
            <Button variant="danger" onClick={() => handleOpenConfirmation(user)}>
              Delete
            </Button>
          </td>
        </tr>
      )),
    [data, navigate, handleDelete]
  );

  // Render the Dashboard component
  return (
    <div>
      {/* Display the Menubar with the title 'Dashboard' */}
      <Menubar title="Dashboard" />

      {/* Display the user data in a table */}
      <div className="table-wrapper">
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>#</th>
              <th>Role</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th style={{ textAlign: 'center' }}>Batch</th>
              <th style={{ textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>{userRows}</tbody>
        </Table>
      </div>

      {/* Confirmation Modal */}
      <Modal show={showConfirmation} onHide={handleCloseConfirmation}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete {deleteUser ? `${deleteUser.firstName} ${deleteUser.lastName}` : 'this user'}?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseConfirmation}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            Confirm Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Dashboard;
