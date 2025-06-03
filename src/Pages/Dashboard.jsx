
import useAuth from '../hooks/useAuth';

const Dashboard = () => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  return (
    <div className="dashboard">
      <h1>Welcome to DocSwitch, {user?.name}!</h1>
      <p>You're successfully logged in.</p>
      {/* Future functionalities will be added here */}
    </div>
  );
};

export default Dashboard;