import Problems from '../model/problem.js';

export const getProblems = async (req, res) => {
    try {
        const problems = await Problems.find({ userId: req.body.userId }).sort({ updatedAt: -1 });
        res.json(problems);
    } catch (err) {
        console.error('Error fetching problems:', err);
        res.status(500).json({ error: 'Failed to fetch problems' });
    }
};

export const getProblemById = async (req, res) => {
    try {
        const problem = await Problems.findOne({ _id: req.params.id, userId: req.body.userId });
        if (!problem) {
            return res.status(404).json({ error: 'Problem not found' });
        }
        res.json(problem);
    } catch (err) {
        console.error('Error finding problems:', err);
        res.status(500).json({ error: 'Failed to find problems' });
    }
};

export const createProblem = async (req, res) => {
    try {
        const newProblem = new Problems({ ...req.body, userId: req.body.userId });
        await newProblem.save();
        res.status(201).json(newProblem);
    } catch (err) {
        console.error('Error Saving problems:', err);
        res.status(500).json({ error: 'Failed to save problems' });
    }
};

export const updateProblem = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedProblem = await Problems.findOneAndUpdate({ _id: id, userId: req.body.userId }, req.body, { new: true });
        if (!updatedProblem) {
            return res.status(404).json({ error: 'Problem not found' });
        }
        res.json(updatedProblem);
    } catch (err) {
        console.error('Error updating problem:', err);
        res.status(500).json({ error: 'Failed to update problem' });
    }
};

export const deleteProblem = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedProblem = await Problems.findOneAndDelete({ _id: id, userId: req.body.userId });
        if (!deletedProblem) {
            return res.status(404).json({ error: 'Problem not found' });
        }
        res.json({ message: 'Problem deleted successfully' });
    } catch (err) {
        console.error('Error deleting problem:', err);
        res.status(500).json({ error: 'Failed to delete problem' });
    }
};
