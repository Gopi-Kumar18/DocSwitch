
import useAuth from '../hooks/useAuth';

const Dashboard = () => {
  const { user, loading } = useAuth();
  
  useEffect(() => {
    document.title = 'Dashboard';
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="dashboard">
      <h1>Welcome to DocSwitch, {user?.name}!</h1>
      <p>You're successfully logged in.</p>

    </div>
  );
};

export default Dashboard;