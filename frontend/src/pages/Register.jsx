import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import "./Register.css";

function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        password2: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });

        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        if (!formData.username.trim()) {
            setError("Please enter a username.");
            return;
        }

        if (!formData.email.trim()) {
            setError("Please enter your email.");
            return;
        }

        if (!formData.password) {
            setError("Please enter a password.");
            return;
        }

        if (formData.password !== formData.password2) {
            setError("Passwords do not match.");
            return;
        }

        if (formData.password.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }

        try {
            setLoading(true);

            await api.post("accounts/register/", {
                username: formData.username,
                email: formData.email,
                password: formData.password,
                password2: formData.password2,
            });

            alert("Registration successful! Please login.");

            navigate("/login");

        } catch (error) {
            console.error(
                "Registration error:",
                error.response?.data || error.message
            );

            const data = error.response?.data;

            if (data?.username) {
                setError(data.username[0]);
            } else if (data?.email) {
                setError(data.email[0]);
            } else if (data?.password) {
                setError(data.password[0]);
            } else if (data?.password2) {
                setError(data.password2[0]);
            } else if (data?.detail) {
                setError(data.detail);
            } else {
                setError("Registration failed. Please try again.");
            }

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-page">

            <div className="register-card">

                <div className="register-header">

                    <div className="register-logo">
                        💰
                    </div>

                    <h1>
                        Create Account
                    </h1>

                    <p>
                        Start managing your finances today.
                    </p>

                </div>

                {error && (
                    <div className="register-error">
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>

                    <div className="form-group">

                        <label>
                            Username
                        </label>

                        <input
                            type="text"
                            name="username"
                            placeholder="Enter your username"
                            value={formData.username}
                            onChange={handleChange}
                            autoComplete="username"
                        />

                    </div>

                    <div className="form-group">

                        <label>
                            Email
                        </label>

                        <input
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                            autoComplete="email"
                        />

                    </div>

                    <div className="form-group">

                        <label>
                            Password
                        </label>

                        <input
                            type="password"
                            name="password"
                            placeholder="Create a password"
                            value={formData.password}
                            onChange={handleChange}
                            autoComplete="new-password"
                        />

                    </div>

                    <div className="form-group">

                        <label>
                            Confirm Password
                        </label>

                        <input
                            type="password"
                            name="password2"
                            placeholder="Confirm your password"
                            value={formData.password2}
                            onChange={handleChange}
                            autoComplete="new-password"
                        />

                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Creating Account..."
                            : "Create Account"}
                    </button>

                </form>

                <div className="register-footer">

                    <p>
                        Already have an account?
                    </p>

                    <Link to="/login">
                        Login here
                    </Link>

                </div>

            </div>

        </div>
    );
}

export default Register;