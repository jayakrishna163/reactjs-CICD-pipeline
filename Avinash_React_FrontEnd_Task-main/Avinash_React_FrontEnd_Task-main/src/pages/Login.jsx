    import { useState } from "react";
    import { useNavigate } from "react-router-dom";
    import axios from "axios";

    export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [messageColor, setMessageColor] = useState("");

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("Logging in...");
        setMessageColor("text-blue-500");

        try {
        const response = await axios.post(


            "/api/login_api/", //  full backend URL
            new URLSearchParams({ username, password }),
            {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            withCredentials: true,
            }
        );

        const {data} = response;

        if (data.success) {
            setMessageColor("text-green-600");
            setMessage(data.message);

            //  Redirect on frontend
            if (data.role === "admin") {
            navigate("/admin-dashboard"); // React route
            } else {
            navigate("/home"); // React route
            }
        } else {
            setMessageColor("text-red-600");
            setMessage(data.message || "Invalid credentials.");
        }
        } catch (error) {
        console.error("Login error:", error);
        setMessageColor("text-red-600");
        setMessage("Unexpected error. Please try again.");
        }
    };

    return (
        <div className="max-w-sm mx-auto mt-32 p-8 bg-white rounded-xl shadow-lg text-center font-sans">
        <h2 className="mb-5 text-2xl font-semibold text-gray-800">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
            <input
            id="username"
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-11/12 p-2.5 border border-gray-300 rounded-md text-base focus:outline-none focus:border-blue-500"
            />
            <input
            id="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-11/12 p-2.5 border border-gray-800 rounded-md text-base focus:outline-none focus:border-blue-500"
            />
            <button
            type="submit"
            className="w-11/12 p-2.5 bg-blue-500 hover:bg-blue-700 text-white text-base font-medium rounded-md transition-colors"
            >
            Login
            </button>
        </form>
        <p className={`mt-4 font-semibold ${messageColor}`}>{message}</p>
        </div>
    );
    }
