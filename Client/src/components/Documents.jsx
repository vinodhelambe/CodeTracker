import React, { useState } from 'react';
import useStickyState from '../hooks/useStickyState';

const Tag = ({ name, onRemove }) => (
    <span className="bg-gray-700 text-sm text-gray-300 px-2 py-1 rounded-full mr-2 mb-2 inline-block">
        {name}
        {onRemove && 
            <button onClick={onRemove} className="ml-1 text-red-500 hover:text-red-700 font-bold">&times;</button>
        }
    </span>
);

function Documents() {
    const [documents, setDocuments] = useStickyState([], 'documents');
    const [newDocTitle, setNewDocTitle] = useState('');
    const [newDocContent, setNewDocContent] = useState('');
    const [currentTags, setCurrentTags] = useState([]);
    const [newTag, setNewTag] = useState('');

    const handleAddTag = () => {
        const formattedTag = newTag.trim().toLowerCase();
        if (formattedTag && !currentTags.includes(formattedTag)) {
            setCurrentTags([...currentTags, formattedTag]);
            setNewTag('');
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setCurrentTags(currentTags.filter(tag => tag !== tagToRemove));
    };

    const handleAddDocument = (e) => {
        e.preventDefault();
        if (newDocTitle.trim() === '' || newDocContent.trim() === '') return;

        const newDocument = {
            title: newDocTitle,
            content: newDocContent,
            id: Date.now(),
            tags: currentTags,
        };

        setDocuments([newDocument, ...documents]);
        setNewDocTitle('');
        setNewDocContent('');
        setCurrentTags([]);
    };

    const handleDeleteDocument = (id) => {
        setDocuments(documents.filter(doc => doc.id !== id));
    };

    return (
        <div className="p-4">
            <h2 className="text-3xl font-bold mb-6 text-teal-400">Documents & Notes</h2>

            <div className="bg-gray-800 p-6 rounded-lg mb-6">
                <h3 className="text-xl font-bold mb-4 text-gray-300">Add New Document</h3>
                <form onSubmit={handleAddDocument}>
                    <input
                        type="text"
                        value={newDocTitle}
                        onChange={(e) => setNewDocTitle(e.target.value)}
                        placeholder="Document Title"
                        className="w-full bg-gray-700 text-white rounded-lg p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <textarea
                        value={newDocContent}
                        onChange={(e) => setNewDocContent(e.target.value)}
                        placeholder="Document Content..."
                        className="w-full bg-gray-700 text-white rounded-lg p-2 mb-4 h-32 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <div className="flex items-center mb-2">
                        <input
                            type="text"
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                            placeholder="Add a tag (e.g., dsa, webdev) and press Enter"
                            className="flex-grow bg-gray-700 text-white rounded-l-lg p-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                        <button
                            type="button"
                            onClick={handleAddTag}
                            className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-r-lg transition duration-300"
                        >
                            Add Tag
                        </button>
                    </div>
                    <div className="mb-4 min-h-[2.5rem]">
                        {currentTags.map(tag => (
                            <Tag key={tag} name={tag} onRemove={() => handleRemoveTag(tag)} />
                        ))}
                    </div>
                    <button
                        type="submit"
                        className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
                    >
                        + Add Document
                    </button>
                </form>
            </div>

            <div>
                <h3 className="text-xl font-bold mb-4 text-gray-300">Saved Documents</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {documents.map(doc => (
                        <div key={doc.id} className="bg-gray-800 p-6 rounded-lg relative flex flex-col">
                            <button 
                                onClick={() => handleDeleteDocument(doc.id)}
                                className="absolute top-2 right-2 text-gray-400 hover:text-red-500 font-bold text-xl"
                            >
                                &times;
                            </button>
                            <div className="flex-grow">
                                <h4 className="text-lg font-bold mb-2 text-teal-400">{doc.title}</h4>
                                <p className="text-gray-300 whitespace-pre-wrap">{doc.content}</p>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-700">
                                {doc.tags.map(tag => (
                                    <Tag key={tag} name={tag} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                {documents.length === 0 && (
                    <p className="text-gray-500">No documents saved yet. Use the form above to add one.</p>
                )}
            </div>
        </div>
    );
}

export default Documents;
