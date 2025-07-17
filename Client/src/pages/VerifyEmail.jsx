import React, { useState, useRef, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { AppContext } from '../context/AppContext';



const VerifyEmail = () => {
    axios.defaults.withCredentials = true;
    const { backendUrl ,  Userdata} = useContext(AppContext);


    const navigate = useNavigate();

    useEffect(() => {
        if (Userdata && Userdata.IsAccountVerified) {
            navigate('/');
        }
    }, [Userdata, navigate]);
    

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputsRef = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e, idx) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    // Handle paste of full OTP
    if (value.length === otp.length) {
      const arr = value.split("").slice(0, otp.length);
      setOtp(arr);
      // Focus last input
      inputsRef[otp.length - 1].current.focus();
      return;
    }
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[idx] = value;
    setOtp(newOtp);
    if (value && idx < otp.length - 1) {
      inputsRef[idx + 1].current.focus();
    }
    if (!value && idx > 0) {
      inputsRef[idx - 1].current.focus();
    }
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      inputsRef[idx - 1].current.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const otpValue = otp.join("");
      const { data } = await axios.post(`${backendUrl}/api/auth/verify-account`, { otp: otpValue });
      if (data.success) {
        setSuccess(true);
        toast.success('Email verified successfully!');
        setTimeout(() => navigate('/'), 1500);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="h-screen flex justify-center items-center flex-col overflow-hidden w-full [background:linear-gradient(to_right,#24243e,#302b63,#0f0c29)] transition-all duration-1000">
      <div className="max-w-lg w-full ">
        <div className="bg-gray-900 rounded-lg shadow-xl overflow-hidden ">
          <div className="p-8">
            <h2 className="text-center text-3xl font-extrabold text-white">Enter OTP</h2>
            <p className="mt-2 text-center text-gray-400">Please enter the OTP sent to your email address.</p>
            <p className="text-center text-gray-400 text-sm mt-1">
              {otp.length === 0 && "Email: "}
              {otp.length === 0 && (window.localStorage.getItem('verifyEmail') ? window.localStorage.getItem('verifyEmail').slice(0, 4) + '****' : '')}
            </p>
            {success ? (
              <div className="text-green-400 text-center py-8">Email verified successfully!</div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 space-y-6">
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
                      onPaste={e => {
                        const paste = e.clipboardData.getData('text').replace(/[^0-9]/g, "");
                        if (paste.length === otp.length) {
                          setOtp(paste.split("").slice(0, otp.length));
                          setTimeout(() => inputsRef[otp.length - 1].current.focus(), 0);
                          e.preventDefault();
                        }
                      }}
                    />
                  ))}
                </div>
                <button
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-gray-900 bg-indigo-500 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
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

export default VerifyEmail;