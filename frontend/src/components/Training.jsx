import React from 'react';
import axios from 'axios';

const migrateTraining = async () => {
  try {
    // Correctly pointing to the backend API URL
    const response = await axios.post('https://lms-testenv.onrender.com/api/migrate-training'); // Ensure the URL is correct
    alert(response.data.message);
  } catch (error) {
    console.error('Error migrating training:', error);
    alert('Error occurred during migration.');
  }
};

const Training = () => {
  return (
    <div>
      <button onClick={migrateTraining}>Migrate Foundation Training</button>
    </div>
  );
};

export default Training;

