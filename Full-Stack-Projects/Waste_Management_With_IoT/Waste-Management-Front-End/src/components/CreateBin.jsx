import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Loader from '../common/Loader';
import Menubar from '../common/Menubar';

function CreateBin() {
  const navigate = useNavigate();

  // Updated initial value to an empty string for binColor
  const initialValues = {
    binName: '',
    binLocation: '',
    binColor: '',
  };

  // Validation schema using Yup
  const validationSchema = Yup.object().shape({
    binName: Yup.string().required('Bin Name is required'),
    binLocation: Yup.string().required('Bin Location is required'),
    binColor: Yup.string().required('Bin Color is required'),
  });

  // Function to handle form submission
  const onSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      setSubmitting(true);
      const res = await axios.post(`${process.env.VITE_API_URL}/bins`, values);

      if (res.status === 200) {
        // Display success message using toast
        toast.success(res.data.message);
        // Reset the form after successful submission
        resetForm();
        // Navigate to the bins list page
        navigate('/users/bins');
      }
    } catch (error) {
      // Log an error and display an error message using toast
      console.error('Error in onSubmit:', error);
      toast.error(error.response.data.message);
    } finally {
      // Set submitting to false after submission (success or error)
      setSubmitting(false);
    }
  };

  // Formik hook for managing form state and submission
  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit,
  });

  return (
    <>
      <div>
        {/* Display the Menubar with the title 'Create Bin' */}
        <Menubar title={'Create Bin'} />
        <h2 style={{ textAlign: 'center', margin: '1rem 0' }}>Create Bin</h2>

        <div className="container-fluid" style={{ width: '60%', margin: '0 auto' }}>
          {/* Formik form */}
          <Form onSubmit={formik.handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="binName">Bin ID</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Bin Name"
                name="binName"
                value={formik.values.binName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {/* Display error message if binName field is touched and has an error */}
              {formik.touched.binName && formik.errors.binName && (
                <div className="error" style={{ color: 'red' }}>
                  {formik.errors.binName}*
                </div>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label htmlFor="binLocation">Location</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Bin Location"
                name="binLocation"
                value={formik.values.binLocation}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {/* Display error message if binLocation field is touched and has an error */}
              {formik.touched.binLocation && formik.errors.binLocation && (
                <div className="error" style={{ color: 'red' }}>
                  {formik.errors.binLocation}*
                </div>
              )}
            </Form.Group>

            {/* Updated binColor field to a dropdown */}
            <Form.Group className="mb-3">
              <Form.Label htmlFor="binColor">Type</Form.Label>
              <Form.Select
                name="binColor"
                value={formik.values.binColor}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              >
                <option value="" disabled>Select Bin Color</option>
                <option value="green">Green - Organic Waste</option>
                <option value="yellow">Blue - Paper Waste</option>
                <option value="red">Red - E-Waste</option>
              </Form.Select>
              {/* Display error message if binColor field is touched and has an error */}
              {formik.touched.binColor && formik.errors.binColor && (
                <div className="error" style={{ color: 'red' }}>
                  {formik.errors.binColor}*
                </div>
              )}
            </Form.Group>

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
}

export default CreateBin;
