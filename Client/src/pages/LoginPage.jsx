import React, { useContext, useEffect, useState } from "react";
import {  useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const LoginPage = () => {
  const navigate = useNavigate();

  const { backendUrl, getUserData, setIsLoggedIn} = useContext(AppContext);

  const [State, setState] = useState("Sign Up");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [Name, setName] = useState("");
  const [Email, setEmail] = useState("");
  const [Password, setPassword] = useState("");

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const OnSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      axios.defaults.withCredentials = true;

      if (State === "Sign Up") {
        // Backend expects: name, email, password (all lowercase)
        const { data } = await axios.post(`${backendUrl}/api/auth/register`, {
          name: Name,
          email: Email,
          password: Password,
        });
        if (data.success) {
          setIsLoggedIn(true);
          getUserData();
          toast.success("Registration successful! Please sign in.");
          setState("Sign In");
        } else {
          toast.error(data.message);
        }
      } else {
        const { data } = await axios.post(`${backendUrl}/api/auth/login`, {
          email: Email,
          password: Password,
        });
        if (data.success) {
          setIsLoggedIn(true);
          getUserData();
          navigate("/");
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      toast.error(
        "An error occurred while processing your request. Please try again later."
      );
    }
  };

  return (
    <div className="h-screen flex justify-center items-center flex-col overflow-hidden w-full [background:linear-gradient(to_right,#24243e,#302b63,#0f0c29)] transition-all duration-1000">
      <div className="max-w-lg w-full ">
        <div className="bg-gray-900 rounded-lg shadow-xl overflow-hidden ">
          <div className="p-8">
            <h2 className="text-center text-3xl font-extrabold text-white">
              {State === "Sign Up" ? "Create Account" : "Welcome Back"}
            </h2>
            <p className="mt-2 text-center text-gray-400">
              {State === "Sign Up"
                ? "Sign up to get started"
                : "Sign in to continue"}
            </p>
            <form onSubmit={OnSubmitHandler} className="mt-2 space-y-6">
              <div className="rounded-md shadow-sm">
                {State === "Sign Up" ? (
                  <div className="mb-4">
                    <input
                      placeholder="Name"
                      className="appearance-none relative block w-full px-3 py-3 border border-gray-700 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                      required
                      type="text"
                      name="name"
                      id="name"
                      onChange={(e) => setName(e.target.value)}
                      value={Name}
                    />
                  </div>
                ) : null}
                <div>
                  <input
                    placeholder="Email address"
                    className="appearance-none relative block w-full px-3 py-3 border border-gray-700 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    required
                    autoComplete="email"
                    type="email"
                    name="email"
                    id="email"
                    onChange={(e) => setEmail(e.target.value)}
                    value={Email}
                  />
                </div>
                <div className="mt-4 relative">
                  <input
                    placeholder="Password"
                    className="appearance-none relative block w-full px-3 py-3 border border-gray-700 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm pr-10"
                    required
                    autoComplete="current-password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    id="password"
                    onChange={(e) => setPassword(e.target.value)}
                    value={Password}
                  />
                  <span
                    className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-400"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? (
                      // Eye open SVG
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    ) : (
                      // Eye closed SVG
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.956 9.956 0 012.293-3.95m3.249-2.383A9.956 9.956 0 0112 5c4.477 0 8.268 2.943 9.542 7a9.956 9.956 0 01-4.043 5.197M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 3l18 18"
                        />
                      </svg>
                    )}
                  </span>
                </div>
                {State === "Sign Up" && (
                  <div className="mt-4 relative">
                    <input
                      placeholder="Confirm Password"
                      className="appearance-none relative block w-full px-3 py-3 border border-gray-700 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm pr-10"
                      required
                      type={showConfirm ? "text" : "password"}
                      name="confirm-password"
                      id="confirm-password"
                    />
                    <span
                      className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-400"
                      onClick={() => setShowConfirm((prev) => !prev)}
                    >
                      {showConfirm ? (
                        // Eye open SVG
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      ) : (
                        // Eye closed SVG
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.956 9.956 0 012.293-3.95m3.249-2.383A9.956 9.956 0 0112 5c4.477 0 8.268 2.943 9.542 7a9.956 9.956 0 01-4.043 5.197M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 3l18 18"
                          />
                        </svg>
                      )}
                    </span>
                  </div>
                )}
              </div>

              {State === "Sign In" && (
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center">
                    <input
                      className="h-4 w-4 text-indigo-500 focus:ring-indigo-400 border-gray-600 rounded"
                      type="checkbox"
                      name="remember-me"
                      id="remember-me"
                    />
                    <label
                      className="ml-2 block text-sm text-gray-400"
                      htmlFor="remember-me"
                    >
                      Remember me
                    </label>
                  </div>

                  <div className="text-sm">
                    <a
                      className="font-medium text-indigo-500 hover:text-indigo-400"
                      href="#"
                      onClick={() => navigate("/reset-password")}
                    >
                      Forgot your password?
                    </a>
                  </div>
                </div>
              )}

              <div>
                <button
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-gray-900 bg-indigo-500 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  type="submit"
                >
                  {State === "Sign Up" ? "Sign Up" : "Sign In"}
                </button>
              </div>
            </form>
          </div>
          <div className="px-4 py-4 bg-gray-700 text-center">
            {State === "Sign Up" ? (
              <>
                <span className="text-gray-400">Already have an account?</span>
                <button
                  className="font-medium text-indigo-500 hover:text-indigo-400 ml-2"
                  onClick={() => setState("Sign In")}
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                <span className="text-gray-400">Don't have an account?</span>
                <button
                  className="font-medium text-indigo-500 hover:text-indigo-400 ml-2"
                  onClick={() => setState("Sign Up")}
                >
                  Sign up
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
