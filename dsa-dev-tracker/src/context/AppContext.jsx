
import React, { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";



export const AppContext = createContext();

export const AppContextProvider = (props) => {

    axios.defaults.withCredentials = true;

    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [Userdata, setUserData] = useState(false);

    const getUserData = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/user/data`);
            if (data.success) {
                setUserData(data.userdata);
            } else {
                toast.error(data.message );
            }
        } catch (error) {
            toast.error(error.message || "Error fetching user data");
        }
    };

    const getAuthStatus = async () => {
        try {
            const { data } = await axios.post(`${backendUrl}/api/auth/is-auth`);
            if (data.success) {
                setIsLoggedIn(true);
                getUserData();
            } else {
                setIsLoggedIn(false);
                setUserData(false);
            }
        } catch (error) {
            toast.error("issue");
        }
    };

    useEffect(() => {
        getAuthStatus();
    }, []);

    const value = {
        backendUrl, isLoggedIn, setIsLoggedIn,
        Userdata, setUserData, getUserData, getAuthStatus
    };

    return (
        <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
    );
};
