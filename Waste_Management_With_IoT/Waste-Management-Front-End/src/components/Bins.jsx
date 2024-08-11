import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Menubar from '../common/Menubar';
import Bin from './Bin';

const Bins = () => {
  // State to store bin data
  const [data, setData] = useState([]);

  // Function to fetch bin data from the API
  const getData = async () => {
    try {
      // Make a GET request to fetch bin data from the API
      const res = await axios.get(`${process.env.VITE_API_URL}/bins`);

      // Check if the response is successful and has the expected data structure
      if (res.status === 200 && res.data && res.data.data) {
        // Update the state with the fetched bin data
        setData(res.data.data);
        // Display success message using toast
        toast.success(res.data.message);
      } else {
        // Log an error if the response structure is invalid
        console.error('Invalid response structure:', res);
        // Display an error message using toast
        toast.error('Error in API response. Please try again.');
      }
    } catch (error) {
      // Log an error if there's an issue fetching bin data
      console.error('Error fetching bins:', error);
      // Display an error message using toast
      toast.error('Error fetching bins. Please try again.');
    }
  };

  // Effect hook to fetch bin data on component mount
  useEffect(() => {
    getData();
  }, []);

  // Handler function for bin deletion
  const handleBinDelete = (deletedId) => {
    // Update the state by filtering out the deleted bin
    setData((prevData) => prevData.filter((bin) => bin._id !== deletedId));
  };

  return (
    <>
      <div className='binBox'>
        {/* Display the Menubar with the title 'PKC' */}
        <div className="menuBar">
          <Menubar/>
        </div>
        {/* Display the list of bins */}
        <div className="binWrapper">
          {data.map((bin) => (
            // Render Bin components with unique keys and onDelete handler
            <Bin key={bin._id} id={bin._id} onDelete={handleBinDelete} />
          ))}
        </div>
      </div>
    </>
  );
};

export default Bins;
