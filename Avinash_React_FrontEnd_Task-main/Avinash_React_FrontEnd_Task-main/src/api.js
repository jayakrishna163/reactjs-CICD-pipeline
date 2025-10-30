    import axios from "axios";

    const api = axios.create({
    baseURL: "http://127.0.0.1:8000", // Django backend
    withCredentials: true,
    });



/**
 * The below functions use async/await to fetch created topics from different API endpoints for admin
    and user roles
 */
    export const fetchCreatedTopics = async () => {
    try {
        const res = await axios.get("/api/admin_dashboard_api/"); // Admin
        return res.data.created_topics || [];
    } catch (err) {
        console.error("Error fetching topics:", err);
        return [];
    }
    };

    export const fetchUserTopics = async () => {
    try {
        const res = await axios.get("/api/home_api/"); // User
        return res.data.created_topics || [];
    } catch (err) {
        console.error("Error fetching user topics:", err);
        return [];
    }
    };    

    export default api;


