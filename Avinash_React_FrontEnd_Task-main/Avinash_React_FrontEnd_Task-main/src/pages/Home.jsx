    import React, { useState, useEffect } from "react";
    import { useNavigate } from "react-router-dom";
    import axios from "axios";
    import SideBar from "../components/SideBar";
    import NavBar from "../components/NavBar";
    import { fetchUserTopics } from "../api";


    const Home = () => {
      const [messages, setMessages] = useState([]);
      const [topicName, setTopicName] = useState("");
      const [partitions, setPartitions] = useState(1);
      const [createdTopics, setCreatedTopics] = useState([]); // topics already approved and created
      const [username, setUsername] = useState("");
      const [uncreatedRequests, setUncreatedRequests] = useState([]); // topics waiting for approve

      const navigate = useNavigate();

      //  Fetch dashboard data

      useEffect(() => {
        const fetchDashboard = async () => {
          try {
            const { data } = await axios.get("/api/home_api/");
            setUncreatedRequests(data.uncreated_requests || []);
            setCreatedTopics(data.created_topics || []); // approved & created topics
            setUsername(data.username || "Guest");
          } catch (err) {
            console.error("Failed to fetch dashboard:", err);
            setMessages([
              { text: "Failed to load dashboard data", type: "error" },
            ]);
          }
        };
        fetchDashboard();
        const interval = setInterval(fetchDashboard, 1000);

        return () => clearInterval(interval); // Cleanup interval on unmount
        }, []);
      

      //   Listen for real-time updates
      useEffect(() => {
        const refreshData = async () => {
          try {
            const { data } = await axios.get("/api/home_api/");
            setUncreatedRequests(data.uncreated_requests || []);
            setCreatedTopics(data.created_topics || []);
          } catch (err) {
            console.error("Failed to auto-refresh user dashboard:", err);
          }
        };

        window.addEventListener("dataUpdated", refreshData);
        return () => window.removeEventListener("dataUpdated", refreshData);
      }, []);

      // Submit a new topic request

      const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
          topic_name: topicName,
          partitions: Number(partitions),
        };

        try {
          const { data } = await axios.post("/api/home_api/", payload, {
            withCredentials: true,
            headers: { "Content-Type": "application/json" },
          });
          
          setMessages([
            { text: data.message, type: data.success ? "success" : "error" },
          ]);
          if (data.success) {
            setTopicName("");
            setPartitions(1);
            const topics = await fetchUserTopics(); // refresh topic list
            setCreatedTopics(topics);
            window.dispatchEvent(new Event("dataUpdated"));
          }
        } catch (err) {
          console.error(
            "Error creating topic:",
            err.response?.data || err.message
          );
          setMessages([
            {
              text:
                err.response?.data?.message || "Failed to send topic request",
              type: "error",
            },
          ]);
        }
      };

      //  Create topic from approved request
      const handleCreateTopic = async (id) => {
        try {
          const { data } = await axios.post(`/api/create_topic_api/${id}/`);

          if (data.success) {
            setMessages([{ text: data.message, type: "success" }]);

            const updatedTopics = await fetchUserTopics();
            setCreatedTopics(updatedTopics);

            const topics = await fetchUserTopics();
            setCreatedTopics(topics);

            window.dispatchEvent(new Event("dataUpdated"));
          }
          // setMessages([
          //   { text: data.message, type: data.success ? "success" : "error" },
          // ]);
        } catch (err) {
          console.error(err);
          setMessages([{ text: "Topic creation failed", type: "error" }]);
        }
      };

      //  Delete created topic 
      const handleDeleteTopic = async (id) => {
        try {
          const { data } = await axios.delete(`/api/delete_topic/${id}/`);
          setMessages([
            { text: data.message, type: data.success ? "success" : "error" },
          ]);

          if (data.success) {
            const topics = await fetchUserTopics();
            setCreatedTopics(topics);
          }

          window.dispatchEvent(new Event("dataUpdated"));

          // if (data.success) {
          //   setCreatedTopics((prev) => prev.filter((t) => t.id !== id));
          // }
        } catch (err) {
          console.error(err);
          setMessages([{ text: "Delete failed", type: "error" }]);
        }
      };

      return (
        <div className="max-w-10xl mx-auto font-sans">
          {/* Header */}
          <NavBar />

          {/* Content Wrapper */}
          <div className="flex flex-col md:flex-row">
            {/* Sidebar */}
            <SideBar />

            {/* Main content */}
            <main className="flex-1 p-5 bg-gray-100 rounded-md">
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                User Dashboard
              </h2>

              {/* Messages */}
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`p-3 mb-3 rounded text-sm font-medium ${
                    msg.type === "success"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {msg.text}
                </div>
              ))}

              {/* Request New Topic */}
              <div className="bg-white rounded-lg p-5 mb-5 shadow">
                <h2 className="text-xl font-semibold text-gray-700 mb-3">
                  Request a New Topic
                </h2>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div>
                    <label className="block text-gray-600 mb-1">
                      Topic Name
                    </label>
                    <input
                      type="text"
                      value={topicName}
                      onChange={(e) => setTopicName(e.target.value)}
                      required
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-1">
                      Number of Partitions
                    </label>
                    <input
                      type="number"
                      value={partitions}
                      onChange={(e) => setPartitions(e.target.value)}
                      min="1"
                      required
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded font-medium"
                  >
                    Submit Request
                  </button>
                </form>
              </div>

              {/* Approved topic Requests */}
              <div className="bg-white rounded-lg p-5 mb-5 shadow">
                <h2 className="text-xl font-semibold text-gray-700 mb-3">
                  Approved Topic Requests
                </h2>
                {uncreatedRequests.length > 0 ? (
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100 text-gray-700">
                        <th className="p-2 text-left">Topic Name</th>
                        <th className="p-2 text-left">Partitions</th>
                        <th className="p-2 text-left">Status</th>
                        <th className="p-2 text-left">Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {uncreatedRequests.map((req) => (
                        <tr key={req.id} className="border-b border-gray-200">
                          <td className="p-2">{req.topic_name}</td>
                          <td className="p-2">{req.partitions}</td>

                          {/* Status with color */}
                          <td className="p-2">
                            <span
                              className={`px-2 py-1 rounded text-sm font-medium ${
                                req.status === "APPROVED"
                                  ? "bg-green-100 text-green-700"
                                  : req.status === "PENDING"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {req.status}
                            </span>
                          </td>

                          {/* Action button */}
                          <td className="p-2">
                            <button
                              onClick={() => handleCreateTopic(req.id)}
                              disabled={req.status !== "APPROVED"} // only active when approved
                              className={`px-3 py-1 rounded text-sm text-white ${
                                req.status === "APPROVED"
                                  ? "bg-green-600 hover:bg-green-700"
                                  : "bg-gray-400 cursor-not-allowed"
                              }`}
                            >
                              Create Topic
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>

                    
                  </table>
                ) : (
                  <p className="text-gray-500 text-center">
                    No Approved requests.
                  </p>
                )}
              </div>

              {/* Created Topics */}
              <div className="bg-white rounded-lg p-5 mb-5 shadow">
                <h2 className="text-xl font-semibold text-gray-700 mb-3">
                  Created Topics
                </h2>
                {createdTopics.length > 0 ? (
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100 text-gray-700">
                        <th className="p-2 text-left">Topic Name</th>
                        <th className="p-2 text-left">Partitions</th>
                        <th className="p-2 text-left">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {createdTopics.map((topic) => (
                        <tr key={topic.id} className="border-b border-gray-200">
                          <td className="p-2">{topic.name}</td>
                          <td className="p-2">{topic.partitions}</td>
                          <td className="p-2 space-x-2">
                            <button
                              onClick={() => navigate(`/topic/${topic.name}`)}
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                            >
                              View
                            </button>

                            <button
                              onClick={() =>
                                navigate(`/alter-topic/${topic.name}`)
                              }
                              className="bg-orange-400 hover:bg-orange-500 text-white px-3 py-1 rounded text-sm"
                            >
                              Alter
                            </button>

                            <button
                              onClick={() => handleDeleteTopic(topic.id)}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
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

    export default Home;
