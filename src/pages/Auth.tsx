import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Auth = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/");
    } else {
      // Redirect to login page by default
      navigate("/login");
    }
  }, [user, navigate]);

  return null; // This component just redirects
};

export default Auth;