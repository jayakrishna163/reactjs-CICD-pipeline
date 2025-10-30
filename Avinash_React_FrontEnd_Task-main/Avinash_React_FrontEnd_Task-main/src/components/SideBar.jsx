
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/20/solid";

function SideBar() {
  const [createdTopics, setCreatedTopics] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isExpandedAcl, setIsExpandedAcl] = useState(false);
  const role = localStorage.getItem("role"); // retrieve saved role
  const navigate = useNavigate();

  // Common fetch function (used by both effects)
  const fetchTopics = async () => {
    try {
      const endpoint =
        role === "admin" ? "/api/admin_dashboard_api/" : "/api/home_api/";
      const { data } = await axios.get(endpoint);
      setCreatedTopics(data.created_topics || []);
    } catch (err) {
      console.error("Failed to fetch topics:", err);
    }
  };

  // Fetch topics when sidebar mounts
  useEffect(() => {
    if (role) fetchTopics();
  }, [role]);

  // Listen for real-time updates across app
  useEffect(() => {
    const refreshSidebar = () => {
      fetchTopics();
    };

    window.addEventListener("dataUpdated", refreshSidebar);

    // cleanup
    return () => window.removeEventListener("dataUpdated", refreshSidebar);
  }, [role]);

  useEffect(() => {
    const interval = setInterval(fetchTopics, 1000);
    return () => clearInterval(interval);
  }, [role]);
  
  return (
    <aside className="w-full md:w-60 bg-gray-50 border-r border-gray-300 p-4 rounded-md shadow-sm">
      <h2 className="text-lg font-semibold text-gray-700 mb-3">Dashboard</h2>

      <div>
        {/* My Topics */}
        <button
          onClick={() => setIsExpanded((s) => !s)}
          className="flex items-center justify-between w-full text-left bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 hover:bg-gray-100 transition"
        >
          <span className="font-medium">My Topics</span>
          {isExpanded ? (
            <ChevronDownIcon className="w-4 h-4" />
          ) : (
            <ChevronRightIcon className="w-4 h-4" />
          )}
        </button>

        {isExpanded && (
          <ul className="mt-2 space-y-2 pl-3">
            {createdTopics.length > 0 ? (
              createdTopics.map((topic) => (
                <li
                  key={topic.id || topic.name}
                  onClick={() =>
                    navigate(`/topic/${encodeURIComponent(topic.name)}`)
                  }
                  className="bg-white p-2 rounded-md border text-gray-700 hover:bg-gray-100 cursor-pointer transition"
                >
                  <div className="font-medium">{topic.name}</div>
                  <div className="text-sm text-gray-500">
                    Partitions: {topic.partitions}
                  </div>
                </li>
              ))
            ) : (
              <p className="text-sm text-gray-500 pl-2">
                No topics yet. Create one!
              </p>
            )}
          </ul>
        )}

        {/* My ACLs */}
        <br />
        <button
          onClick={() => setIsExpandedAcl((s) => !s)}
          className="flex items-center justify-between w-full text-left bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 hover:bg-gray-100 transition"
        >
          <span className="font-medium">My ACL's</span>
          {isExpandedAcl ? (
            <ChevronDownIcon className="w-4 h-4" />
          ) : (
            <ChevronRightIcon className="w-4 h-4" />
          )}
        </button>
        {isExpandedAcl && (
          <p className="text-sm text-gray-500 pl-2">No ACL's yet.</p>
        )}
      </div>
    </aside>
  );
}

export default SideBar;

