import React, { useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import ProfileDropdown from "../user/ProfileDropdown";
import HostProfileDropdown from "../host/HostProfileDropdown";
import { debounce } from "lodash";
import CityAutocomplete from "./CityAutocomplete";
import { useEventStore } from "../../store/eventStore";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();
  const { fetchEventsByCity, setSelectedCity } = useEventStore();
  const userRole = user?.role;
  console.log("role recieved", user);
  const handleLogout = () => {
    logout();
    if (userRole === "host") {
      navigate("/host/login");
    } else {
      navigate("/login");
    }
  };

  const isHost = userRole === "host";

  const handleCitySelect = useMemo(
    () =>
      debounce((city: { id: string; name: string }) => {
        console.log("Selected city:", city);
        const cityName = city.name.split(",")[0].trim();
        setSelectedCity(cityName);
        console.log(cityName);
        fetchEventsByCity(cityName);
        navigate("/");
      }, 500),
    [fetchEventsByCity, setSelectedCity, navigate]
  );

  useEffect(() => {
    return () => {
      handleCitySelect.cancel();
    };
  }, [handleCitySelect]);

  return (
    <header className="bg-black text-white py-4 px-6">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Left: Logo and Brand */}
        <div className="flex items-center space-x-2">
          <img
            src="/assets/images/nightup-logo.jpg"
            alt="NightUp Logo"
            className="h-10 w-auto"
          />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text">
            NightUp
          </h1>
        </div>

        {/* Right: Conditional Buttons */}
        <div className="flex items-center space-x-4">
          {/* Show city selector ONLY if not host */}
          {!isHost && <CityAutocomplete onSelect={handleCitySelect} />}

          {!isAuthenticated && (
            <>
              <Link
                to="/login"
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md"
              >
                Login
              </Link>
              <Link
                to="/host/login"
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md"
              >
                List Your Events
              </Link>
            </>
          )}

          {isAuthenticated && userRole === "user" && <ProfileDropdown />}

          {isAuthenticated && isHost && <HostProfileDropdown />}

          {isAuthenticated && userRole === "admin" && (
            <button
              onClick={handleLogout}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
