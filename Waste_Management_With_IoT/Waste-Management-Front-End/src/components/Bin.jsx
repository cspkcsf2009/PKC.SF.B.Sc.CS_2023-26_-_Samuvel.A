import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';
import axios from 'axios';
import database from '../firebase/FirebaseConfig';

const Bin = React.memo(({ id, onDelete }) => {
  // State to manage bin information and modal visibility
  const [indicator, setIndicator] = useState('');
  const [binPercentage, setBinPercentage] = useState('');
  const [binHeight, setBinHeight] = useState('');
  const [lidStatus, setLidStatus] = useState('Closed');
  const [showModal, setShowModal] = useState(false);

  // Total height for determining lid status
  const [totalBinHeight, setTotalBinHeight] = useState(10);

  // Navigation hook
  const navigate = useNavigate();

  // Handle delete button click
  const handleDelete = () => {
    setShowModal(true);
  };

  // Confirm deletion and update parent component state
  const confirmDelete = async () => {
    try {
      await axios.delete(`${process.env.VITE_API_URL}/bins/${id}`);
      toast.success('Bin deleted successfully');

      // Call the onDelete prop to update the state in the parent component
      onDelete(id);
    } catch (error) {
      console.error('Error deleting bin:', error);
      toast.error('Error deleting bin. Please try again.');
    } finally {
      setShowModal(false);
    }
  };

  // Close the modal
  const handleCloseModal = () => {
    setShowModal(false);
  };

  // Fetch bin information from the database on component mount
  useEffect(() => {
    const handleBinPercentage = (data) => {
      const getPercentage = Object.values(data.val());
      setBinHeight(getPercentage[0]);
      setBinPercentage(getPercentage[1]);
    };

    database.ref().child('IOT').on('value', handleBinPercentage);

    return () => {
      // Cleanup the listener when the component unmounts
      database.ref().child('IOT').off('value', handleBinPercentage);
    };
  }, []);

  // Update indicator color based on bin percentage
  useEffect(() => {
    if (binPercentage <= 50) {
      setIndicator('green');
    } else if (binPercentage <= 80) {
      setIndicator('yellow');
    } else if (binPercentage <= 100) {
      setIndicator('red');
    }
  }, [binPercentage]);

  // Update lid status based on bin height
  useEffect(() => {
    if (binHeight > totalBinHeight) {
      setLidStatus('Opened');
    } else {
      setLidStatus('Closed');
    }
  }, [binHeight, totalBinHeight]);

  // Render the bin component
  return (
    <>
      <div className='binCtn' style={{ backgroundColor: indicator }}>
        <h3>Lid: {lidStatus}</h3>
        <h3>Height: {binHeight} cm </h3>
        <h3>Percentage: {binPercentage}% </h3>
        <div>
          <Button onClick={() => navigate(`/users/edit-bin/${id}`)}>Edit</Button>
          &nbsp;
          <Button variant='danger' onClick={handleDelete}>Delete</Button>
        </div>
      </div>

      {/* Modal for confirming deletion */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this bin?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
});

export default Bin;
