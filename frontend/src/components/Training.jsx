import axios from 'axios';

const migrateTraining = async () => {
  try {
    const token = localStorage.getItem('token');   // adjust to your auth flow
    const res = await axios.post(
      'https://lms-testenv.onrender.com/api/admin/migrate/foundationTraining',
      {},                                          // no body needed
      { headers: { Authorization: `Bearer ${token}` } }
    );
    alert(res.data.message);
  } catch (err) {
    alert(err.response?.data?.message || 'Migration failed');
  }
};

export default function Training() {
  return (
    <button onClick={migrateTraining}>
      Migrate “Foundation of Service”
    </button>
  );
}
