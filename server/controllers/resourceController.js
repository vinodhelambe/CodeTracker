import Resource from '../model/resource.js';

export const getResources = async (req, res) => {
    try {
        const resources = await Resource.find({ userId: req.body.userId }).sort({ updatedAt: -1 });
        res.json(resources);
    } catch (err) {
        console.log('Error fetching resources:', err);
        res.status(500).json({ error: 'Failed to fetch resources' });
    }
};

export const getResourceById = async (req, res) => {
    try {
        const resource = await Resource.findOne({ _id: req.params.id, userId: req.body.userId });
        if (!resource) {
            return res.status(404).json({ error: 'Resource not found' });
        }
        res.json(resource);
    } catch (err) {
        console.error('Error finding resource:', err);
        res.status(500).json({ error: 'Failed to find resource' });
    }
};

export const createResource = async (req, res) => {
    try {
        const newResource = new Resource({ ...req.body, userId: req.body.userId });
        await newResource.save();
        res.status(201).json(newResource);
    } catch (err) {
        console.error('Error saving resource:', err);
        res.status(500).json({ error: 'Failed to save resource' });
    }
};

export const updateResource = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedResource = await Resource.findOneAndUpdate({ _id: id, userId: req.body.userId }, req.body, { new: true });
        if (!updatedResource) {
            return res.status(404).json({ error: 'Resource not found' });
        }
        res.json(updatedResource);
    } catch (err) {
        console.error('Error updating resource:', err);
        res.status(500).json({ error: 'Failed to update resource' });
    }
};

export const deleteResource = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedResource = await Resource.findOneAndDelete({ _id: id, userId: req.body.userId });
        if (!deletedResource) {
            return res.status(404).json({ error: 'Resource not found' });
        }
        res.json({ message: 'Resource deleted successfully' });
    } catch (err) {
        console.error('Error deleting resource:', err);
        res.status(500).json({ error: 'Failed to delete resource' });
    }
};
