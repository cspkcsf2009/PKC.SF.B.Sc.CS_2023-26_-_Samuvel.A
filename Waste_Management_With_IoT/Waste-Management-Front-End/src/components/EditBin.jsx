import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Loader from '../common/Loader';
import Menubar from '../common/Menubar';

const EditBin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const params = useParams();
  const { id } = params;

  // Initial form values
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

  // Formik hook
  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      try {
        setIsLoading(true);
        const res = await axios.put(`${process.env.VITE_API_URL}/bins/${id}`, values);
        if (res.status === 200) {
          setIsLoading(false);
          toast.success(res.data.message);
          navigate('/users/bins');
        }
      } catch (error) {
        setIsLoading(false);
        toast.error(error.response.data.errorMessage || error.response.data.message);
      }
    },
  });

  // Fetch data on component mount
  useEffect(() => {
    const getData = async () => {
      try {
        const res = await axios.get(`${process.env.VITE_API_URL}/bins/${id}`);
        if (res.status === 200) {
          const { binName, binLocation, binColor } = res.data.data;
          formik.setValues({ binName, binLocation, binColor });
          toast.success(res.data.message);
        }
      } catch (error) {
        toast.error(error.response.data.message);
      }
    };

    getData();
  }, [id]);

  return (
    <>
      <div>
        <Menubar title={'Edit Bin'} />
        <h2 style={{ textAlign: 'center', margin: '1rem 0' }}>Edit Bin</h2>

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
              {formik.touched.binColor && formik.errors.binColor && (
                <div className="error" style={{ color: 'red' }}>
                  {formik.errors.binColor}*
                </div>
              )}
            </Form.Group>

            <div className="text-center">
              <Button variant="primary" type="submit" style={{ width: '35%' }}>
                {isLoading ? <Loader /> : <>Submit</>}
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </>
  );
};

export default EditBin;
