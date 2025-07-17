import React, { useState, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AppContext } from '../context/AppContext';

const ForgetPassword = () => {
  axios.defaults.withCredentials = true;
  const { backendUrl } = useContext(AppContext);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [step, setStep] = useState('request'); // 'request', 'verify', 'reset'
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputsRef = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post(`${backendUrl}/api/auth/send-reset-otp`, { email });
      if (data.success) {
        toast.success('Reset OTP sent successfully!');
        localStorage.setItem('resetEmail', email);
        setSubmitted(true);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Optionally, you can verify OTP with a backend endpoint if needed
      setStep('reset');
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const otpValue = otp.join('');
      const { data } = await axios.post(`${backendUrl}/api/auth/reset-password`, { otp: otpValue, newPassword, email });
      if (data.success) {
        setResetSuccess(true);
        toast.success('Password reset successfully!');
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
      <div className="max-w-md w-full">
        <div className="bg-gray-900 rounded-3xl shadow-xl overflow-hidden transition-all duration-500 p-8">
          <h2 className="text-center text-3xl font-extrabold text-white mb-2">Forgot Password?</h2>
          <p className="text-center text-gray-400 mb-6">Enter your email address and we'll send you a link to reset your password.</p>
          {step === 'request' && (
            submitted ? (
              <div className="text-green-400 text-center py-8">If an account exists for {email}, a reset link has been sent.<br/>
                <button className="mt-4 text-indigo-400 hover:underline" onClick={() => setStep('verify')}>Enter OTP</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    id="email"
                    required
                    placeholder="Email address"
                    className="appearance-none relative block w-full px-10 py-3 border border-gray-700 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-gray-900 bg-indigo-500 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Send Reset Link
                </button>
              </form>
            )
          )}
          {step === 'verify' && (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
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
                    onChange={e => {
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
                    }}
                    autoFocus={idx === 0}
                    required
                  />
                ))}
              </div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-gray-900 bg-indigo-500 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Verify OTP
              </button>
              <div className="mt-4 text-center">
                <button className="text-indigo-400 hover:underline" onClick={() => setStep('request')}>Back</button>
              </div>
            </form>
          )}
          {step === 'reset' && (
            resetSuccess ? (
              <div className="text-green-400 text-center py-8">Password reset successfully! Redirecting to login...</div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-6">
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
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgetPassword;