import express from 'express';
import {
    getResources,
    getResourceById,
    createResource,
    updateResource,
    deleteResource
} from '../controllers/resourceController.js';
import {
    getProblems,
    getProblemById,
    createProblem,
    updateProblem,
    deleteProblem
} from '../controllers/problemController.js';
import {
    getRoutines,
    createOrUpdateRoutine,
    updateRoutine,
    deleteRoutine,
    getTodayRoutine
} from '../controllers/routineController.js';

const router = express.Router();

// Resources

import userAuth from '../middleware/userAuth.js';

router.get('/resources', userAuth, getResources);
router.get('/resources/:id', userAuth, getResourceById);
router.post('/resources', userAuth, createResource);
router.patch('/resources/:id', userAuth, updateResource);
router.delete('/resources/:id', userAuth, deleteResource);

// Problems
router.get('/problems', userAuth, getProblems);
router.get('/problems/:id', userAuth, getProblemById);
router.post('/problems', userAuth, createProblem);
router.patch('/problems/:id', userAuth, updateProblem);
router.delete('/problems/:id', userAuth, deleteProblem);

// Routines
router.get('/routine', userAuth, getRoutines);
router.get('/routine/today', userAuth, getTodayRoutine);
router.post('/routine', userAuth, createOrUpdateRoutine);
router.patch('/routine/:date', userAuth, updateRoutine);
router.delete('/routine/:date', userAuth, deleteRoutine);

export default router;
