import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { data } from '../api/fileService';

const Viewpage = () => {
    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({});
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    // Detect type from URL
    const resourceType = location.pathname.includes('/view/resource/') ? 'resource' : 'problem';

    // Helper: get from localStorage
    const getFromLocal = () => {
        if (resourceType === 'problem') {
            const solved = JSON.parse(localStorage.getItem('solvedQuestions') || '[]');
            // Use q.link as _id and compare with decoded id from URL
            return solved
                .map(q => ({
                    _id: q.link,
                    ProblemName: q.name,
                    Topic: q.topic,
                    URL: q.link,
                    Difficulty: q.difficulty,
                    Content: q.content,
                }))
                .find(q => q._id === decodeURIComponent(id));
        } else {
            const resources = JSON.parse(localStorage.getItem('resourcesLocal') || '[]');
            return resources
                .map(r => ({
                    _id: r.title,
                    type: r.type,
                    title: r.title,
                    tags: r.tags,
                    content: r.content,
                    url: r.url,
                }))
                .find(r => r._id === id);
        }
    };

    useEffect(() => {
        const fetchContent = async () => {
            setLoading(true);
            setError(null);
            let result = null;
            let mongoError = false;
            try {
                if (resourceType === 'problem') {
                    result = await data.findproblem(id);
                } else if (resourceType === 'resource') {
                    result = await data.findresource(id);
                }
                if (!result || result.error) throw new Error('Not found in DB');
                setContent(result);
                setForm(result);
            } catch (err) {
                mongoError = true;
                // Fallback: try localStorage
                const localResult = getFromLocal();
                if (localResult) {
                    setContent(localResult);
                    setForm(localResult);
                } else {
                    setError('Failed to load content');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchContent();
        // eslint-disable-next-line
    }, [id, resourceType]);

    // Delete handler
    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this item?')) return;
        setDeleting(true);
        try {
            if (resourceType === 'problem') {
                await data.deleteProblem(id);
                navigate('/problems');
            } else if (resourceType === 'resource') {
                await data.deleteResource(id);
                navigate('/resources');
            }
        } catch (err) {
            // Fallback: delete from localStorage
            if (resourceType === 'problem') {
                let solved = JSON.parse(localStorage.getItem('solvedQuestions') || '[]');
                solved = solved.filter(q => q.link !== id);
                localStorage.setItem('solvedQuestions', JSON.stringify(solved));
                navigate('/problems');
            } else if (resourceType === 'resource') {
                let resources = JSON.parse(localStorage.getItem('resourcesLocal') || '[]');
                resources = resources.filter(r => r.title !== id && r._id !== id);
                localStorage.setItem('resourcesLocal', JSON.stringify(resources));
                navigate('/resources');
            }
        } finally {
            setDeleting(false);
        }
    };

    // Edit handler
    const handleEdit = () => {
        setEditing(true);
    };

    // Cancel handler
    const handleCancel = () => {
        setForm(content); // revert changes
        setEditing(false);
    };

    // Input change handler
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // Update handler
    const handleUpdate = async () => {
        try {
            if (resourceType === 'problem') {
                await data.updateProblem(id, form);
            } else if (resourceType === 'resource') {
                await data.updateResource(id, form);
            }
            setContent(form);
            setEditing(false);
        } catch (err) {
            // Fallback: update in localStorage
            if (resourceType === 'problem') {
                let solved = JSON.parse(localStorage.getItem('solvedQuestions') || '[]');
                solved = solved.map(q =>
                    q.link === id
                        ? {
                              ...q,
                              name: form.ProblemName || form.name,
                              topic: form.Topic || form.topic,
                              link: form.URL || form.link,
                              difficulty: form.Difficulty || form.difficulty,
                              content: form.Content || form.content,
                          }
                        : q
                );
                localStorage.setItem('solvedQuestions', JSON.stringify(solved));
            } else if (resourceType === 'resource') {
                let resources = JSON.parse(localStorage.getItem('resourcesLocal') || '[]');
                resources = resources.map(r =>
                    (r.title === id || r._id === id)
                        ? {
                              ...r,
                              title: form.title,
                              type: form.type,
                              tags: form.tags,
                              content: form.content,
                              url: form.url,
                          }
                        : r
                );
                localStorage.setItem('resourcesLocal', JSON.stringify(resources));
            }
            setContent(form);
            setEditing(false);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div className="text-red-500">{error}</div>;
    if (!content) return <div>Content not found.</div>;

    return (
        <div className="p-6 bg-gray-800 rounded-lg relative">
            {/* Go back button */}
            <button
                onClick={() => navigate(-1)}
                className="absolute top-4 left-4 bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded-full flex items-center gap-2 shadow"
                title="Go back"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
                <span className="hidden sm:inline">Back</span>
            </button>
            <div className="flex justify-end gap-2 mb-4">
                {!editing && (
                    <button
                        onClick={handleEdit}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                    >
                        Edit
                    </button>
                )}
                <button
                    onClick={handleDelete}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                    disabled={deleting}
                >
                    {deleting ? 'Deleting...' : 'Delete'}
                </button>
                {editing && (
                    <>
                        <button
                            onClick={handleUpdate}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                        >
                            Update
                        </button>
                        <button
                            onClick={handleCancel}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
                        >
                            Cancel
                        </button>
                    </>
                )}
            </div>
            {/* Problem or Resource fields */}
            <div className="space-y-4">
                {/* Title or ProblemName */}
                <div>
                    <label className="block text-gray-300 mb-1">
                        {resourceType === 'problem' ? 'Problem Name' : 'Title'}
                    </label>
                    <input
                        type="text"
                        name={resourceType === 'problem' ? 'ProblemName' : 'title'}
                        value={form?.ProblemName || form?.title || ''}
                        onChange={handleChange}
                        disabled={!editing}
                        className="w-full bg-gray-700 text-white rounded-lg p-2"
                    />
                </div>
                {/* Topic (problem only) */}
                {resourceType === 'problem' && (
                    <div>
                        <label className="block text-gray-300 mb-1">Topic</label>
                        <input
                            type="text"
                            name="Topic"
                            value={form?.Topic || ''}
                            onChange={handleChange}
                            disabled={!editing}
                            className="w-full bg-gray-700 text-white rounded-lg p-2"
                        />
                    </div>
                )}
                {/* Difficulty (problem only) */}
                {resourceType === 'problem' && (
                    <div>
                        <label className="block text-gray-300 mb-1">Difficulty</label>
                        <select
                            name="Difficulty"
                            value={form?.Difficulty || ''}
                            onChange={handleChange}
                            disabled={!editing}
                            className="w-full bg-gray-700 text-white rounded-lg p-2"
                        >
                            <option value="">Select</option>
                            <option value="Easy">Easy</option>
                            <option value="Medium">Medium</option>
                            <option value="Hard">Hard</option>
                        </select>
                    </div>
                )}
                {/* Type (resource only) */}
                {resourceType === 'resource' && (
                    <div>
                        <label className="block text-gray-300 mb-1">Type</label>
                        <input
                            type="text"
                            name="type"
                            value={form?.type || ''}
                            onChange={handleChange}
                            disabled={!editing}
                            className="w-full bg-gray-700 text-white rounded-lg p-2"
                        />
                    </div>
                )}
                {/* URL (resource or problem) */}
                {(resourceType === 'problem' || (resourceType === 'resource' && form?.url)) && (
                    <div>
                        <label className="block text-gray-300 mb-1">URL</label>
                        <input
                            type="text"
                            name={resourceType === 'problem' ? 'URL' : 'url'}
                            value={form?.URL || form?.url || ''}
                            onChange={handleChange}
                            disabled={!editing}
                            className="w-full bg-gray-700 text-white rounded-lg p-2"
                        />
                    </div>
                )}
                {/* Content/Description */}
                {(form?.content || form?.Content) && (
                    <div>
                        <label className="block text-gray-300 mb-1">
                            {resourceType === 'problem' ? 'Content' : 'Content/Description'}
                        </label>
                        <textarea
                            name={resourceType === 'problem' ? 'Content' : 'content'}
                            value={form?.Content || form?.content || ''}
                            onChange={handleChange}
                            disabled={!editing}
                            className="w-full bg-gray-700 text-white rounded-lg p-2 min-h-[120px]"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Viewpage;