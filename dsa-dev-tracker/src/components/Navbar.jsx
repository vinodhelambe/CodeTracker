import { Link, useLocation } from "react-router-dom";
import React, { useContext, useState, useRef, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";


const navLinks = [
  {to:"/" , label :"Home"},
  { to: "/Dashboard", label: "Dashboard" },
  { to: "/routine", label: "Routine" },
  { to: "/problems", label: "Problems" },
  { to: "/resources", label: "Resources" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { Userdata, isLoggedIn, setIsLoggedIn, backendUrl, setUserData } =
    useContext(AppContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const sendVerifyOtp = async () => {
    try {
      axios.defaults.withCredentials = true;

      const { data } = await axios.post(
        backendUrl + "/api/auth/send-verify-otp"
      );

      if (data.success) {
        navigate("/verify-Email");
        toast.success("Verification email sent successfully!");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const handleLogout = async () => {
    setIsLoggedIn(false);
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(backendUrl + "/api/auth/logout");

      data.success && setIsLoggedIn(false);
      data.success && setUserData(false);
      navigate("/");
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="w-full bg-gray-900 px-6 py-4 flex  justify-between shadow relative z-20">
      <nav className="bg-gray-900 shadow-lg sticky top-0 z-999">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="hidden md:block">
                <div className="ml-4 flex items-baseline space-x-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                        location.pathname === link.to
                          ? "bg-indigo-700 text-white"
                          : "text-gray-300 hover:bg-gray-800 hover:text-indigo-400"
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <div className="-mr-2 flex md:hidden">
              <button
                onClick={() => setOpen(!open)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none focus:bg-gray-800 focus:text-white"
                aria-label="Main menu"
                aria-expanded={open}
              >
                <svg
                  className="h-6 w-6"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  {open ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
        {/* Mobile menu */}
        {open && (
          <div className="md:hidden bg-gray-900 border-t border-gray-800">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                    location.pathname === link.to
                      ? "bg-indigo-700 text-white"
                      : "text-gray-300 hover:bg-gray-800 hover:text-indigo-400"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
      <div className="flex items-center space-x-4">
        {!isLoggedIn ? (
          <button
            className="px-5 py-2 rounded-md bg-sky-500 text-white font-semibold hover:bg-sky-600 transition"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
        ) : (
          <div className="relative" ref={menuRef}>
            <button
              className="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center text-white text-xl font-bold focus:outline-none focus:ring-2 focus:ring-sky-400"
              onClick={() => setMenuOpen((open) => !open)}
            >
              {Userdata?.name?.[0].toUpperCase()}
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-md shadow-lg py-2 z-30 animate-fade-in">
                {Userdata.IsAccountVerified === false && (
                  <button
                    className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                    onClick={() => {
                      setMenuOpen(false);
                      sendVerifyOtp();
                    }}
                  >
                    Verify Email
                  </button>
                )}
                <button
                  className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
