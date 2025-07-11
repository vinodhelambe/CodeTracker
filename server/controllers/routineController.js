// Get today's routine for the logged-in user
export const getTodayRoutine = async (req, res) => {
    try {
        const { date } = req.query;
        if (!date) {
            return res.status(400).json({ error: 'Date is required' });
        }
        const routine = await Routine.findOne({ userId: req.body.userId, date });
        if (!routine) {
            return res.status(404).json({ error: 'Routine not found for this date' });
        }
        res.json(routine);
    } catch (err) {
        console.error('Error fetching today routine:', err);
        res.status(500).json({ error: 'Failed to fetch today routine' });
    }
};
import Routine from '../model/routine.js';

export const getRoutines = async (req, res) => {
    try {
        const routines = await Routine.find({ userId: req.body.userId });
        res.json(routines);
    } catch (err) {
        console.error('Error fetching routine:', err);
        res.status(500).json({ error: 'Failed to fetch routine' });
    }
};

export const createOrUpdateRoutine = async (req, res) => {
    try {
        const { date, tasks, userId } = req.body;
        if (!date) {
            return res.status(400).json({ error: 'Date is required' });
        }
        const updatedRoutine = await Routine.findOneAndUpdate(
            { date: date, userId: userId },
            { $set: { tasks: tasks }, $setOnInsert: { userId: userId } },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );
        res.status(201).json(updatedRoutine);
    } catch (err) {
        console.error('Error saving/updating routine:', err);
        res.status(500).json({ error: 'Failed to save/update routine' });
    }
};

export const updateRoutine = async (req, res) => {
    try {
        const { date } = req.params;
        const { tasks } = req.body;
        if (!tasks) {
            return res.status(400).json({ error: 'Tasks are required for update' });
        }
        const routine = await Routine.findOneAndUpdate(
            { date: date, userId: req.body.userId },
            { $set: { tasks: tasks } },
            { new: true }
        );
        if (!routine) {
            return res.status(404).json({ error: 'Routine for this date not found' });
        }
        res.json(routine);
    } catch (err) {
        console.error('Error updating routine:', err);
        res.status(500).json({ error: 'Failed to update routine' });
    }
};

export const deleteRoutine = async (req, res) => {
    try {
        const { date } = req.params;
        const deletedRoutine = await Routine.findOneAndDelete({ date: date, userId: req.body.userId });
        if (!deletedRoutine) {
            return res.status(404).json({ error: 'Routine not found for this date' });
        }
        res.json({ message: 'Routine deleted successfully' });
    } catch (err) {
        console.error('Error deleting routine:', err);
        res.status(500).json({ error: 'Failed to delete routine' });
    }
};
