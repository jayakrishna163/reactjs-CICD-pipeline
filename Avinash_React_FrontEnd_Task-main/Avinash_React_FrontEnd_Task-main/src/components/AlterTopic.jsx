import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const AlterTopic = () => {
  const { topicName } = useParams();
  const [topic, setTopic] = useState(null);
  const [newPartitions, setNewPartitions] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`/api/topic/${topicName}/`)
      .then((res) => setTopic(res.data.topic))
      .catch(() => setMessage("Failed to load topic details"));
  }, [topicName]);

  const handleAlter = async () => {
    if (!newPartitions || isNaN(newPartitions)) {
      setMessage("Please enter a valid number of partitions");
      return;
    }

    try {
      const res = await axios.post("http://127.0.0.1:8000/api/alter_topic/", {
        topic_name: topicName,
        partitions: parseInt(newPartitions),
      });
      if (res.data.success) {
        setMessage("Topic updated successfully!");
        // Redirect to home after 2 seconds
        setTimeout(() => {
          navigate("/home");
        }, 1000);
      } else {
        setMessage(res.data.message || "Failed to update topic");
      }
    } catch (err) {
      setMessage("Error while updating topic");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 font-sans">
      <h2 className="text-2xl font-semibold mb-4 text-gray-700">
        Alter Topic — {topicName}
      </h2>

      {topic ? (
        <div className="bg-white p-5 rounded shadow space-y-4">
          <p>
            <strong>Current Partitions:</strong> {topic.partitions}
          </p>

          <input
            type="number"
            value={newPartitions}
            onChange={(e) => setNewPartitions(e.target.value)}
            placeholder="Enter new partition count"
            className="border p-2 rounded-md w-64"
          />

          <div className="space-x-3">
            <button
              onClick={handleAlter}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded font-medium"
            >
              Save
            </button>
            <button
              onClick={() => navigate(-1)}
              className="bg-gray-500 hover:bg-gray-600 text-white px-5 py-2 rounded font-medium"
            >
              Cancel
            </button>
          </div>

          {message && <p className="text-green-700">{message}</p>}
        </div>
      ) : (
        <p>Loading topic details...</p>
      )}
    </div>
  );
};

export default AlterTopic;
