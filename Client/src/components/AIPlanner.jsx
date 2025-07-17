import React, { useState } from 'react';
import { getAIPlan } from '../api/aiService';

const AIPlanner = ({ setTasks }) => {
    const [step, setStep] = useState(1);
    const [preferences, setPreferences] = useState({
        focus: '',
        experience: '',
        time: '',
        specificTopics: ''
    });
    const [plan, setPlan] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPreferences(prev => ({ ...prev, [name]: value }));
    };

    

   

    return (
        <div className="p-8 text-white">
            <h2 className="text-3xl font-bold mb-6 text-purple-400">AI-Powered Planner</h2>
            <div className="bg-gray-800 p-6 rounded-lg mb-6">
            </div>

            
        </div>
    );
};

export default AIPlanner;
