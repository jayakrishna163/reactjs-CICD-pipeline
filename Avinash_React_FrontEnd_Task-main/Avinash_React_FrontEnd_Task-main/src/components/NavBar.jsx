import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";

const NavBar = () => {
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const [messages, setMessages] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data } = await axios.get("/api/home_api/");
        if (data.success) {
          setUsername(data.username || "Guest");
          setRole(data.role || "");
        } else {
          setMessages([
            { text: "Failed to load dashboard data", type: "error" },
          ]);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard:", err);
        setMessages([{ text: "Failed to load dashboard data", type: "error" }]);
      }
    };
    fetchDashboard();
  }, []);

  const handleLogout = async () => {
    try {
      const { data } = await axios.post("/api/logout_api/");
      if (data.success) navigate("/login");
      else setMessages([{ text: "Logout failed", type: "error" }]);
    } catch (err) {
      console.error("Logout request failed:", err);
      setMessages([{ text: "Logout request failed", type: "error" }]);
    }
  };

  const displayName =
    role === "admin" ?  `${username} (superUser)` : ` ${username}`;

  return (
    <header className="flex justify-center items-center py-4  border-gray-300 relative bg-blue-950">
      <h1 className="text-3xl font-bold text-white color:blue">Kafka Topic Manager</h1>

      <div className="absolute right-5 flex items-center gap-3">
        <Menu as="div" className="relative inline-block text-left">
          <MenuButton className="inline-flex items-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-800 shadow-sm ring-1 ring-gray-300 hover:bg-gray-100">
            <span className="text-gray-800 text-base">{displayName}</span>
            <ChevronDownIcon className="w-4 h-4 text-gray-600" />
          </MenuButton>

          <MenuItems
            transition
            className="absolute right-0 z-10 mt-2 w-44 origin-top-right rounded-md bg-blue-950 shadow-lg ring-1 ring-black/5 focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0 transition"
          >
            <div className="py-1">
              <MenuItem>
                <a
                  // onClick={navigate()}
                  className="block px-4 py-2 text-sm text-white  hover:bg-white hover:text-gray-600"
                >
                  Settings
                </a>
              </MenuItem>
              <MenuItem>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-white  hover:bg-red-100 hover:text-red-700"
                >
                  Logout
                </button>
              </MenuItem>
            </div>
          </MenuItems>
        </Menu>
      </div>
    </header>
  );
};

export default NavBar;
