import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import CreateUser from './components/CreateUser';
import Dashboard from './components/Dashboard';
import Edit from './components/EditUser';
import Bins from './components/Bins';
import CreateBin from './components/CreateBin';
import EditBin from './components/EditBin';
import ChangePassword from './components/ChangePassword';

function App() {
  return (
    <>
      {/* Use of BrowserRouter for client-side routing */}
      <BrowserRouter>
        {/* Define the routes using the Routes component */}
        <Routes>
          {/* Route for the login page */}
          <Route path='/login' element={<Login />} />

          {/* Route for creating a new user */}
          <Route path='/create-user' element={<CreateUser />} />

          {/* Route for the main dashboard */}
          <Route path='/dashboard' element={<Dashboard />} />

          {/* Route for editing a user, dynamic ID provided */}
          <Route path='/edit-user/:id' element={<Edit />} />

          {/* Route for managing bins related to users */}
          <Route path='/users/bins' element={<Bins />} />

          {/* Route for editing a bin, dynamic ID provided */}
          <Route path='/users/edit-bin/:id' element={<EditBin />} />

          {/* Route for changing user password, dynamic ID provided */}
          <Route path='/users/change-password/:id' element={<ChangePassword />} />

          {/* Route for creating a new bin */}
          <Route path='/users/create-bin' element={<CreateBin />} />

          {/* Default route to navigate to the login page if the provided route is not matched */}
          <Route path='*' element={<Navigate to='/login' />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
