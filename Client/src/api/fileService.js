// src/api/fileService.js

import axios from 'axios';

const Base_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api';

const loadResource = async () => {
    try {
        const response = await axios.get(`${Base_URL}/resources`);
        return response.data;
    } catch (error) {
        console.error('Error saving resource:', error);
        throw error;
    }
}
const saveResource = async (resource) => {
    try {
        const response = await axios.post(`${Base_URL}/resources`, resource);
        return response.data;
    } catch (error) {
        console.error('Error saving resource:', error);
        throw error;
    }
}

const deleteResource = async (resourceId) => {
    try {
        await axios.delete(`${Base_URL}/resources/${resourceId}`);
    } catch (error) {
        console.error('Error deleting resource:', error);
        throw error;
    }
}


const loadRoutine = async () => {
    try {
        const response = await axios.get(`${Base_URL}/routine`);
        return response.data;
    } catch (error) {
        console.error('Error loading routine:', error);
        throw error;
    }
}

// Get today's routine for the logged-in user
const loadTodayRoutine = async (date) => {
    try {
        const response = await axios.get(`${Base_URL}/routine/today`, { params: { date } });
        return response.data;
    } catch (error) {
        console.error('Error loading today routine:', error);
        throw error;
    }
}

const saveRoutine = async (routine) => {
    try {
        const response = await axios.post(`${Base_URL}/routine`, routine);
        return response.data;
    } catch (error) {
        console.error('Error saving routine:', error);
        throw error;
    }
}

const deleteRoutine = async (date) => {
    try {
        await axios.delete(`${Base_URL}/routine/${date}`);
    } catch (error) {
        console.error('Error deleting routine:', error);
        throw error;
    }
}

const loadproblems = async()=>{
  try{
    const response = await axios.get(`${Base_URL}/problems`) 
    return response.data;
  }catch(error){
    console.error('error in feaching problemsa: ',error);
    throw error;
  }
}

const saveProblems = async(problem)=>{
  try {
    const response = await axios.post(`${Base_URL}/problems`,problem);
    return response.data;
  }catch(error){
    console.error('error in Saving problemsa: ',error);
    throw error;
  }
}


// Use the correct API endpoint for finding a problem by id
const findproblem = async(id)=>{
    try{
        const response =  await axios.get(`${Base_URL}/problems/${id}`);
        return response.data;
    }catch(error){
        console.error('error in finding problemsa: ',error);
        throw error;
    }
}

const findresource = async(id) => {
    try {
        const response = await axios.get(`${Base_URL}/resources/${id}`);
        return response.data;
    } catch (error) {
        console.error('error in finding resource: ', error);
        throw error;
    }
}

const deleteProblem = async (problemId) => {
    try {
        await axios.delete(`${Base_URL}/problems/${problemId}`);
    } catch (error) {
        console.error('Error deleting problem:', error);
        throw error;
    }
};

const updateProblem = async (id, dataObj) => {
    await axios.patch(`${Base_URL}/problems/${id}`, dataObj);
};
const updateResource = async (id, dataObj) => {
    await axios.patch(`${Base_URL}/resources/${id}`, dataObj);
};

const codeforces = async (handle) => {
    try {
        const params = handle ? { handle } : {};
        const response = await axios.get(`${Base_URL}/fetchCodeforce`, { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching codeforces data:', error);
        throw error;
    }
}

const leetcode = async (handle) => {
    try {
        const params = handle ? { handle } : {};
        const response = await axios.get(`${Base_URL}/fetchLeetcode`, { params });
        return response.data;
    } catch (error) {
        console.log('Error fetching leetcode data:', error);
    }
}

const hackerRank = async (handle) => {
    try {
        const params = handle ? { handle } : {};
        const response = await axios.get(`${Base_URL}/fetchHackerRank`, { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching HackerRank data:', error);
        throw error;
    }
}

export const data = {
    loadResource, saveResource, deleteResource,
    loadRoutine, loadTodayRoutine, saveRoutine, deleteRoutine,
    loadproblems, saveProblems, findproblem, findresource,
    deleteProblem, updateProblem, updateResource,codeforces,leetcode,hackerRank
};