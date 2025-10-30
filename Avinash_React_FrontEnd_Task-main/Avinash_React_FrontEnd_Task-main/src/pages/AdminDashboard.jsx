import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import SideBar from "../components/SideBar";
import NavBar from "../components/NavBar";
import { fetchCreatedTopics } from "../api";

const AdminDashboard = () => {
  const [messages, setMessages] = useState([]);
  const [topicName, setTopicName] = useState("");
  const [partitions, setPartitions] = useState(1);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [createdTopics, setCreatedTopics] = useState([]);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // Fetch initial dashboard data

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data } = await axios.get("/api/admin_dashboard_api/");
        setPendingRequests(data.pending_requests || []);
        setCreatedTopics(data.created_topics || []);
      } catch (err) {
        console.error("Failed to fetch admin data:", err);
      }
    };

    fetchDashboard(); // initial fetch

    const interval = setInterval(fetchDashboard, 1000); // refresh 
    return () => clearInterval(interval);
  }, []);

  // Listen for global updates 
  useEffect(() => {
    const refreshData = async () => {
      try {
        const { data } = await axios.get("/api/admin_dashboard_api/");
        setPendingRequests(data.pending_requests || []);
        setCreatedTopics(data.created_topics || []);
      } catch (err) {
        console.error("Failed to auto-refresh admin dashboard:", err);
      }
    };

    window.addEventListener("dataUpdated", refreshData);
    return () => window.removeEventListener("dataUpdated", refreshData);
  }, []);

  // Create new topic
  const handleCreateTopic = async (e) => {
    e.preventDefault();
    setError("");
    setMessages([]);
    try {
      const res = await axios.post("/api/admin_dashboard_api/", {
        topic_name: topicName,
        partitions: partitions,
      });
      const { data } = res;

      if (data.success) {
        setMessages([{ text: data.message, type: "success" }]);
        setTopicName("");
        setPartitions(1);
        const updatedTopics = await fetchCreatedTopics();
        setCreatedTopics(updatedTopics);

        window.dispatchEvent(new Event("dataUpdated"));

      } else {
        setError(data.message || "Failed to create topic");
      }
    } catch (err) {
      console.error("Error while creating topic:", err);
      setError("Error while creating topic");
    }
  };

  // Approve request
  const handleApprove = async (id) => {
    try {
      const res = await axios.post(`/api/approve_request/${id}/`);
      const message =
        res.data.message || "Topic request approved successfully!";

      setMessages([{ text: message, type: "success" }]);

      if (res.data.success) {
        // Remove from pending list
        setPendingRequests((prev) => prev.filter((req) => req.id !== id));

        window.dispatchEvent(new Event("dataUpdated"));
      }

    } catch (err) {
      console.error("Approval error:", err);
      setMessages([{ text: "Failed to approve request", type: "error" }]);
    }
  };

  // Decline request
  const handleDecline = async (id) => {
    try {
      const res = await axios.post(`/api/decline_request/${id}/`);
      const message = res.data.message || "Topic request declined.";

      setMessages([{ text: message, type: "error" }]);
      if (res.data.success) {
        setPendingRequests(pendingRequests.filter((req) => req.id !== id));
        window.dispatchEvent(new Event("dataUpdated"));
      }
    } catch (err) {
      console.error("Decline error:", err);
      setMessages([{ text: "Failed to decline request", type: "error" }]);
    }
  };

  //  Delete topic 
  const handleDeleteTopic = async (id) => {
    try {
      const res = await axios.delete(`/api/delete_topic/${id}/`);
      setMessages([
        {
          text: res.data.message,
          type: res.data.success ? "success" : "error",
        },
      ]);

      if (res.data.success) {
        const updatedTopics = await fetchCreatedTopics();
        setCreatedTopics(updatedTopics);
        window.dispatchEvent(new Event("dataUpdated"));
      }
    } catch (err) {
      setMessages([{ text: "Delete failed", type: "error" }]);
    }
  };

  return (
    <div className="max-w-10xl mx-auto font-sans">
      <NavBar />

      {/* Content Wrapper */}
      <div className="flex flex-col md:flex-row">
        <SideBar />

        {/* Main Content */}
        <main className="flex-1 p-5 bg-gray-100 rounded-md">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Admin Dashboard
          </h2>

          {messages.map((msg, i) => (
            <div
              key={`${msg.type}-${i}`}
              className={`mb-3 p-3 rounded text-sm font-medium ${
                msg.type === "success"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {msg.text}
            </div>
          ))}

          {/* Topic Creation Form */}
          <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Create a New Topic
            </h2>
            {error && <p className="text-red-600 mb-4">{error}</p>}
            <form onSubmit={handleCreateTopic} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Topic Name
                </label>
                <input
                  type="text"
                  value={topicName}
                  onChange={(e) => setTopicName(e.target.value)}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Number of Partitions
                </label>
                <input
                  type="number"
                  value={partitions}
                  min="1"
                  onChange={(e) => setPartitions(e.target.value)}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                />
              </div>
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md shadow-md transition-all"
              >
                Create Topic
              </button>
            </form>
          </div>

          {/* Pending Requests Table */}
          <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Pending Topic Requests
            </h2>
            {pendingRequests.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Topic Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Partitions
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Requested By
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pendingRequests.map((req) => (
                      <tr key={req.id || req.request_id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {req.topic_name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {req.partitions}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {req.requested_by__username}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium space-x-2">
                          <button
                            onClick={() => handleApprove(req.id)}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleDecline(req.id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs"
                          >
                            Decline
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center">No pending requests.</p>
            )}
          </div>

          {/* Created Topics Table */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-gray-700 mb-3">
              Created Topics
            </h2>
            {createdTopics.length > 0 ? (
              <table className="w-full border-collapse">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Topic Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Partitions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Created By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {createdTopics.map((topic, index) => (
                    <tr key={`{topic.id || topic.name}-${index}`}>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {topic.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {topic.partitions}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {topic.created_by__username}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium space-x-2">
                        <button
                          onClick={() => navigate(`/topic/${topic.name}`)}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                        >
                          View
                        </button>
                        <button
                          onClick={() => navigate(`/alter-topic/${topic.name}`)}
                          className="bg-orange-400 hover:bg-orange-500 text-white px-3 py-1 rounded text-sm"
                        >
                          Alter
                        </button>
                        <button
                          onClick={() => handleDeleteTopic(topic.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-500 text-center">
                No created topics yet.
              </p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
