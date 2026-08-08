import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import "./Login.css";

function Login() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            const response = await api.post(
                "accounts/login/",
                {
                    username: formData.username,
                    password: formData.password,
                }
            );

            localStorage.setItem(
                "access",
                response.data.access
            );

            localStorage.setItem(
                "refresh",
                response.data.refresh
            );

            navigate("/dashboard");

        } catch (error) {
            console.error(
                "Login error:",
                error.response?.data || error.message
            );

            setError(
                error.response?.data?.detail ||
                "Invalid username or password."
            );

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">

            <div className="login-card">

                <div className="login-header">

                    <div className="app-logo">
                        💰
                    </div>

                    <h1>
                        Personal Finance
                    </h1>

                    <p className="login-quote">
                        "Manage your money. Build your future."
                    </p>

                </div>


                <div className="login-form-section">

                    <h2>
                        Welcome back
                    </h2>

                    <p className="login-subtitle">
                        Sign in to your account
                    </p>


                    {error && (
                        <div className="login-error">
                            {error}
                        </div>
                    )}


                    <form onSubmit={handleLogin}>

                        <div className="form-group">

                            <label htmlFor="username">
                                Username
                            </label>

                            <input
                                id="username"
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="Enter your username"
                                required
                            />

                        </div>


                        <div className="form-group">

                            <label htmlFor="password">
                                Password
                            </label>

                            <input
                                id="password"
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter your password"
                                required
                            />

                        </div>


                        <button
                            type="submit"
                            className="login-button"
                            disabled={loading}
                        >
                            {loading
                                ? "Signing in..."
                                : "Sign In"
                            }
                        </button>

                    </form>


                    <div className="register-link">

                        <span>
                            Don't have an account?
                        </span>

                        <Link to="/register">
                            Create account
                        </Link>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default Login;