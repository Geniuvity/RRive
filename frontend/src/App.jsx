import LoginButton from "./components/LoginButton";
import Dashboard from "./components/Dashboard";
import { useAuth } from "./context/AuthContext"; 

function App() {
  const { user, loading } = useAuth();  

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {user ? <Dashboard /> : <LoginButton />}
    </div>
  );
}

export default App;