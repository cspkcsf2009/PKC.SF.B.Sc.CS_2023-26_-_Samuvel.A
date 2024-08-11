import React, { useState } from 'react';
import { useFormik } from 'formik'; // Importing useFormik hook for form handling
import * as Yup from 'yup'; // Importing Yup for form validation
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Define the validation schema for the login form using Yup
const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email address').required('Email is required'), // Email validation using Yup
  password: Yup.string().required('Password is required'), // Password validation using Yup
});

function Login() {
  const [isLoading, setIsLoading] = useState(false); // State for loading spinner
  const [message, setMessage] = useState(''); // State for displaying messages
  const navigate = useNavigate(); // React Router hook for navigation
  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: LoginSchema, // Applying validation schema to Formik
    onSubmit: handleLogin, // Function to handle form submission
  });

  // Function to handle demo login
  const handleDemoLogin = async (role) => {
    // Setting demo account credentials based on role
    const email = role === 'admin' ? 'samuvel6826@gmail.com' : 'jenitharajan029@gmail.com';
    const password = '1';

    // Update form values programmatically using Formik methods
    formik.setValues({ email, password });

    // Delay the form submission to allow Formik to update its internal state
    setTimeout(async () => {
      // Submit the form
      formik.handleSubmit();
    }, 100); // Adjust the delay time as needed
  };

  // Function to handle login
  async function handleLogin(values) {
    try {
      setIsLoading(true); // Set loading state to true
      const res = await axios.post(`${process.env.VITE_API_URL}/users/login`, values); // Sending login request

      if (res.status === 200) {
        setIsLoading(false); // Set loading state to false
        sessionStorage.setItem('token', res.data.token); // Store token in sessionStorage
        setMessage({ variant: 'success', text: res.data.message }); // Set success message
        navigate(res.data.role === 'admin' ? '/dashboard' : '/users/bins'); // Redirect based on user role
      }
    } catch (error) {
      setIsLoading(false); // Set loading state to false
      setMessage({ variant: 'danger', text: error.response.data.message }); // Set error message
    }
  }

  return (
    <Container id="loginCTN">
      <div id="loginBorder">
        <div id="loginImgCTN">
          <img
            src="https://res.cloudinary.com/dgsucveh2/image/upload/v1706749935/photo_2024-02-01_06.41.54_nsfqx6.jpg"
            alt="Kumaraswamy Statue"
          />
        </div>

        <div id="loginFormCTN">
          <h1>PIONEER KUMARASWAMY COLLEGE</h1>
          <h5>(Affiliated to Manonmaniam Sundaranar University, Tirunelveli)</h5>
          <h3>Reaccredited with B<sup>++</sup> grade by NAAC</h3>
          <h4>Vetturnimadam, Nagercoil - 3.</h4>
          <br />

          <h1>Login Here!</h1>
          {message && <Alert variant={message.variant}>{message.text}</Alert>}
          <form onSubmit={formik.handleSubmit}>
            <input
              type="email"
              name="email"
              placeholder="Enter email"
              className="form-control mb-3"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.email}
            />
            {formik.touched.email && formik.errors.email && (
              <div className="text-danger">{formik.errors.email}</div>
            )}

            <input
              type="password"
              name="password"
              placeholder="Password"
              className="form-control mb-3"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.password}
            />
            {formik.touched.password && formik.errors.password && (
              <div className="text-danger">{formik.errors.password}</div>
            )}

            <Button variant="primary" type="submit" disabled={isLoading} style={{ margin: '1rem', width: '8rem' }}>
              {isLoading ? <Spinner animation="border" size="sm" /> : 'Login'}
            </Button>
          </form>

          <div className="demo" style={{ margin: '1rem' }}>
            <h4 className="demoTitle">Click the below buttons for Demo Accounts</h4>
            {/* Button to trigger admin demo login */}
            <Button variant="danger" type='submit' style={{ margin: '1rem', width: '8rem' }} onClick={() => handleDemoLogin('admin')}>Admin</Button>
            {/* Button to trigger user demo login */}
            <Button variant="danger" type='submit' style={{ margin: '1rem', width: '8rem' }} onClick={() => handleDemoLogin('user')}>User</Button>
          </div>

        </div>

      </div>
    </Container>
  );
}

export default Login;
