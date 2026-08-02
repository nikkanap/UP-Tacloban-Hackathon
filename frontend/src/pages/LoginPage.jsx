import { useNavigate } from "react-router-dom";
import { useState } from "react";
import LoginForm from "../components/LoginForm";
import { apiRequest } from "../api";

function LoginPage() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (formData) => {
    setError("");
    setIsLoading(true);

    try {
      const isAdmin = formData.mode === "admin";
      const data = await apiRequest(isAdmin ? "login-admin/" : "login-voter/", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      if (isAdmin) {
        localStorage.removeItem("currentVoter");
        localStorage.setItem("currentAdmin", JSON.stringify(data.admin));
        navigate("/admin/dashboard");
      } else {
        localStorage.removeItem("currentAdmin");
        localStorage.setItem("currentVoter", JSON.stringify(data.voter));
        navigate("/voter-dashboard");
      }
    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center w-full h-screen bg-background p-5">
      <LoginForm onSubmit={handleLogin} isLoading={isLoading} error={error} />
    </div>
  );
}

export default LoginPage;
