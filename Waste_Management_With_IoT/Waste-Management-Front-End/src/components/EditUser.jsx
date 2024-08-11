import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Button, Form } from 'react-bootstrap';
import Loader from '../common/Loader';
import Menubar from '../common/Menubar';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import { useLogout } from '../hooks/useLogout';

const EditUser = () => {
  const token = sessionStorage.getItem('token');
  const navigate = useNavigate();
  const params = useParams();
  const { id } = params;
  const logout = useLogout();

  // Validation schema using Yup
  const validationSchema = Yup.object().shape({
    firstName: Yup.string().required('First Name is required'),
    lastName: Yup.string().required('Last Name is required'),
    email: Yup.string().email('Invalid email format').required('Email is required'),
    batch: Yup.string().required('Batch is required'),
    role: Yup.string(),
  });

  // Formik hook for managing form state and submission
  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      batch: '',
      role: 'user',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        // Make the request to update user data
        const res = await axios.put(
          `${process.env.VITE_API_URL}/users/${id}`,
          {
            email: values.email,
            firstName: values.firstName,
            lastName: values.lastName,
            batch: values.batch,
            role: values.role,
          },
          {
            headers: {
              authorization: `Bearer ${token}`,
            },
          }
        );

        // Check if the request was successful
        if (res.status === 200) {
          toast.success(res.data.message);
          // Redirect to the dashboard after successful submission
          navigate('/dashboard');
        }
      } catch (error) {
        // Handle errors during the update process
        toast.error(
          error.response?.data?.errorMessage || error.response?.data?.message || 'Error updating user'
        );
        // Logout the user if the request is unauthorized
        if (error.response?.status === 401) {
          logout();
        }
      }
    },
  });

  // Function to fetch user data
  const getData = async () => {
    try {
      // Fetch user data from the API
      const res = await axios.get(`${process.env.VITE_API_URL}/users/${id}`, {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      // Check if the request was successful
      if (res.status === 200) {
        // Set form values with fetched data
        formik.setValues({
          firstName: res.data.data.firstName,
          lastName: res.data.data.lastName,
          email: res.data.data.email,
          batch: res.data.data.batch,
          role: res.data.data.role,
        });

        // Display success message
        toast.success(res.data.message);
      }
    } catch (error) {
      // Handle errors during data fetching
      toast.error(error.response?.data?.message || 'Error fetching user data');
      // Logout the user if the request is unauthorized
      if (error.response?.status === 401) {
        logout();
      }
    }
  };

  // Fetch user data on component mount
  useEffect(() => {
    if (token && id) {
      getData();
    } else {
      // Logout the user if the necessary information is not available
      logout();
    }
  }, [token, id]);

  return (
    <>
      <div>
        {/* Display the Menubar with the title 'Edit User' */}
        <Menubar title={'Edit User'} />
        <h2 style={{ textAlign: 'center', margin: '1rem 0 2rem 0' }}>Edit User</h2>
        <div className="container-fluid" style={{ width: '60%', margin: '0 auto' }}>
          {/* Formik form */}
          <Form onSubmit={formik.handleSubmit}>
            {/* Input field for first name */}
            <Form.Label htmlFor="firstName">First Name</Form.Label>
            <Form.Group className="mb-3">
              <Form.Control
                type="text"
                name="firstName"
                placeholder="Enter First Name"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.firstName}
              />
              {/* Display error message if the first name field is touched and has an error */}
              {formik.touched.firstName && formik.errors.firstName && (
                <div className="error" style={{ color: 'red' }}>
                  {formik.errors.firstName}*
                </div>
              )}
            </Form.Group>

            {/* Input field for last name */}
            <Form.Group className="mb-3">
              <Form.Label htmlFor="lastName">Last Name</Form.Label>
              <Form.Control
                type="text"
                name="lastName"
                placeholder="Enter Last Name"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.lastName}
              />
              {/* Display error message if the last name field is touched and has an error */}
              {formik.touched.lastName && formik.errors.lastName && (
                <div className="error" style={{ color: 'red' }}>
                  {formik.errors.lastName}*
                </div>
              )}
            </Form.Group>

            {/* Input field for email */}
            <Form.Group className="mb-3">
              <Form.Label htmlFor="email">Email ID</Form.Label>
              <Form.Control
                type="email"
                name="email"
                placeholder="Enter email"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.email}
              />
              {/* Display error message if the email field is touched and has an error */}
              {formik.touched.email && formik.errors.email && (
                <div className="error" style={{ color: 'red' }}>
                  {formik.errors.email}*
                </div>
              )}
            </Form.Group>

            {/* Input field for batch */}
            <Form.Group className="mb-3">
              <Form.Label htmlFor="batch">Batch</Form.Label>
              <Form.Control
                type="text"
                name="batch"
                placeholder="Enter Batch"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.batch}
              />
              {/* Display error message if the batch field is touched and has an error */}
              {formik.touched.batch && formik.errors.batch && (
                <div className="error" style={{ color: 'red' }}>
                  {formik.errors.batch}*
                </div>
              )}
            </Form.Group>

            {/* Dropdown for user role */}
            <Form.Group className="mb-3">
              <Form.Label htmlFor="role">Role</Form.Label>
              <Form.Control
                as="select"
                name="role"
                value={formik.values.role}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              >
                {/* Options for user roles */}
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </Form.Control>
              {/* Display error message if the role field is touched and has an error */}
              {formik.touched.role && formik.errors.role && (
                <div className="error" style={{ color: 'red' }}>
                  {formik.errors.role}*
                </div>
              )}
            </Form.Group>

            {/* Submission button */}
            <div className="text-center">
              <Button variant="primary" type="submit" style={{ width: '35%' }}>
                {/* Display loader while submitting or 'Submit' text otherwise */}
                {formik.isSubmitting ? <Loader /> : <>Submit</>}
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </>
  );
};

export default EditUser;
