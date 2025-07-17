import React, { useState, useRef, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { AppContext } from '../context/AppContext';

const ResetPassword = () => {
  axios.defaults.withCredentials = true;
  const { backendUrl } = useContext(AppContext);
  const navigate = useNavigate();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputsRef = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e, idx) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    if (value.length === otp.length) {
      const arr = value.split('').slice(0, otp.length);
      setOtp(arr);
      inputsRef[otp.length - 1].current?.focus();
      return;
    }
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[idx] = value;
    setOtp(newOtp);
    if (value && idx < otp.length - 1) {
      inputsRef[idx + 1].current?.focus();
    }
    if (!value && idx > 0) {
      inputsRef[idx - 1].current?.focus();
    }
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      inputsRef[idx - 1].current?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const otpValue = otp.join('');
      const { data } = await axios.post(`${backendUrl}/api/auth/reset-password`, { otp: otpValue, newPassword });
      if (data.success) {
        setSuccess(true);
        toast.success('Password reset successfully');
        setTimeout(() => navigate('/login'), 1500);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex justify-center items-center flex-col overflow-hidden w-full [background:linear-gradient(to_right,#24243e,#302b63,#0f0c29)] transition-all duration-1000">
      <div className="max-w-lg w-full">
        <div className="bg-gray-900 rounded-lg shadow-xl overflow-hidden">
          <div className="p-8">
            <h2 className="text-center text-3xl font-extrabold text-white mb-4">Reset Password</h2>
            {success ? (
              <div className="text-green-400 text-center py-8">Password reset successfully! Redirecting to login...</div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex justify-center gap-3">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={inputsRef[idx]}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      className="w-12 h-12 text-center text-xl border border-gray-700 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={digit}
                      onChange={e => handleChange(e, idx)}
                      onKeyDown={e => handleKeyDown(e, idx)}
                      autoFocus={idx === 0}
                      required
                    />
                  ))}
                </div>
                <div className="space-y-4">
                  <input
                    type="password"
                    placeholder="New Password"
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-md focus:outline-none"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                  />
                  <input
                    type="password"
                    placeholder="Confirm Password"
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-md focus:outline-none"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-gray-900 bg-indigo-500 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            )}
            <div className="mt-6 text-center">
              <button
                className="text-indigo-400 hover:underline"
                onClick={() => navigate('/')}
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
