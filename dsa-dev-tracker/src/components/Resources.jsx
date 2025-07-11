import React, { useState, useMemo, useEffect, useContext } from "react";
import { AppContext } from "../context/AppContext";
import { data } from "../api/fileService";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Tag = ({ name, onRemove, onClick, isSelected }) => (
  <span
    className={`bg-gray-700 text-sm text-gray-300 px-2 py-1 rounded-full mr-2 mb-2 inline-block cursor-pointer ${
      isSelected ? "ring-2 ring-teal-500" : ""
    }`}
    onClick={onClick}
  >
    {name}
    {onRemove && (
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="ml-1 text-red-500 hover:text-red-700 font-bold"
      >
        &times;
      </button>
    )}
  </span>
);

function Resources() {
  const { Userdata } = useContext(AppContext);
  const [resources, setResources] = useState([]);
  const [newResourceType, setNewResourceType] = useState("document"); // 'document' or 'reference'
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [currentTags, setCurrentTags] = useState([]);
  const [newTag, setNewTag] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Helper to load from localStorage
    const loadLocalResources = () => {
      const resource = JSON.parse(localStorage.getItem("resourcesLocal") || "[]");
      const resourcesLocal = resource.map((r) => ({
        _id: r.title,
        type: r.type,
        title: r.title,
        tags: r.tags,
        content: r.content,
        url: r.url,
      }));
      setResources(resourcesLocal);
    };

    // Try to load from DB
    data.loadResource().then((fetchedResource) => {
      if (Array.isArray(fetchedResource) && fetchedResource.length > 0) {
        setResources(fetchedResource);

        // Try to sync local resources if any
        let local = JSON.parse(localStorage.getItem("resourcesLocal") || "[]");
        if (local.length > 0) {
          Promise.all(
            local.map(async (resource) => {
              try {
                await data.saveResource(resource);
                return null; // Mark as uploaded
              } catch {
                return resource; // Keep if failed
              }
            })
          ).then((results) => {
            const failedToUpload = results.filter(Boolean);
            localStorage.setItem("resourcesLocal", JSON.stringify(failedToUpload));
            if (failedToUpload.length !== local.length) {
              toast.success("Local resources synced to server!");
              // Reload resources from server
              data.loadResource().then((fresh) => {
                if (Array.isArray(fresh) && fresh.length > 0) setResources(fresh);
              });
            }
          });
        }
      } else {
        // DB is empty, fallback to localStorage
        loadLocalResources();
      }
    }).catch(() => {
      // DB not reachable, fallback to localStorage
      loadLocalResources();
    });
  }, []);

  const handleAddTag = () => {
    const formattedTag = newTag.trim().toLowerCase();
    if (formattedTag && !currentTags.includes(formattedTag)) {
      setCurrentTags([...currentTags, formattedTag]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setCurrentTags(currentTags.filter((tag) => tag !== tagToRemove));
  };

  const handleAddResource = async (e) => {
    e.preventDefault();
    if (newTitle.trim() === "") return;

    let newResource = {
      userId: Userdata && Userdata._id,
      type: newResourceType,
      title: newTitle,
      tags: currentTags,
    };
    if (newResourceType === "document") {
      if (newContent.trim() === "") return;
      newResource.content = newContent;
    } else {
      if (newUrl.trim() === "") return;
      newResource.url = newUrl;
    }

    try {
      const response = await data.saveResource(newResource);
      setNewTitle("");
      setNewContent("");
      setNewUrl("");
      setCurrentTags([]);
    } catch (error) {
      let local = JSON.parse(localStorage.getItem("resourcesLocal") || "[]");
      local.unshift(newResource);
      localStorage.setItem("resourcesLocal", JSON.stringify(local));
      setResources([newResource, ...resources]);
      setNewTitle("");
      setNewContent("");
      setNewUrl("");
      setCurrentTags([]);
      toast.error("Failed to add resource to Server . Saved locally instead.");
    }
  };

  const handleDeleteResource = async (id) => {
    try {
      await data.deleteResource(id);
      setResources(resources.filter((res) => res._id !== id)); // Remove from local state
    } catch (error) {
      // Remove from localStorage if server delete fails or for local-only resources
      let local = JSON.parse(localStorage.getItem("resourcesLocal") || "[]");
      // Remove by _id or title (adjust as needed)
      local = local.filter((res) => res._id !== id && res.title !== id);
      localStorage.setItem("resourcesLocal", JSON.stringify(local));
      setResources(resources.filter((res) => res._id !== id));
      toast.error("Failed to delete from server. Deleted locally.");
    }
  };

  const toggleTagFilter = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // here we used useMemo hook to prevent calcuation on each render
  const filteredResources = useMemo(() => {
    return resources.filter((res) => {
      const searchTermLower = searchTerm.toLowerCase();
      const matchesSearch =
        res.title.toLowerCase().includes(searchTermLower) ||
        (res.content && res.content.toLowerCase().includes(searchTermLower)) ||
        (res.url && res.url.toLowerCase().includes(searchTermLower));
      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.every((tag) => res.tags.includes(tag));
      return matchesSearch && matchesTags;
    });
  }, [resources, searchTerm, selectedTags]);

  const allTags = useMemo(() => {
    const tags = new Set();
    resources.forEach((res) => {
      res.tags.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags);
  }, [resources]);

  return (
    <div className="p-4">
      <h2 className="text-3xl font-bold mb-6 text-purple-400">Resources</h2>

      {/* Add New Resource Form */}
      <div className="bg-gray-800 p-6 rounded-lg mb-6">
        <h3 className="text-xl font-bold mb-4 text-gray-300">
          Add New Resource
        </h3>
        <div className="flex mb-4">
          <button
            onClick={() => setNewResourceType("document")}
            className={`px-4 py-2 rounded-l-lg ${
              newResourceType === "document"
                ? "bg-purple-600 text-white"
                : "bg-gray-700 text-gray-300"
            }`}
          >
            Document
          </button>
          <button
            onClick={() => setNewResourceType("reference")}
            className={`px-4 py-2 rounded-r-lg ${
              newResourceType === "reference"
                ? "bg-purple-600 text-white"
                : "bg-gray-700 text-gray-300"
            }`}
          >
            Reference
          </button>
        </div>
        <form onSubmit={handleAddResource}>
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Title"
            className="w-full bg-gray-700 text-white rounded-lg p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          {newResourceType === "document" ? (
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Content..."
              className="w-full bg-gray-700 text-white rounded-lg p-2 mb-4 h-32 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          ) : (
            <input
              type="url"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="URL"
              className="w-full bg-gray-700 text-white rounded-lg p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          )}
          <div className="flex items-center mb-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && (e.preventDefault(), handleAddTag())
              }
              placeholder="Add a tag and press Enter"
              className="flex-grow bg-gray-700 text-white rounded-l-lg p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-r-lg"
            >
              Add Tag
            </button>
          </div>
          <div className="mb-4 min-h-[2.5rem]">
            {currentTags.map((tag) => (
              <Tag key={tag} name={tag} onRemove={() => handleRemoveTag(tag)} />
            ))}
          </div>
          <button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg"
          >
            + Add {newResourceType === "document" ? "Document" : "Reference"}
          </button>
        </form>
      </div>

      {/* Search and Filter */}
      <div className="bg-gray-800 p-6 rounded-lg mb-6">
        <h3 className="text-xl font-bold mb-4 text-gray-300">
          Filter & Search
        </h3>
        <input
          type="text"
          placeholder="Search by title, content, or URL..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-gray-700 text-white rounded-lg p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <div className="mb-4">
          <h4 className="text-lg font-bold mb-2 text-gray-400">
            Filter by Tags:
          </h4>
          {allTags.length > 0 ? (
            allTags.map((tag) => (
              <Tag
                key={tag}
                name={tag}
                onClick={() => toggleTagFilter(tag)}
                isSelected={selectedTags.includes(tag)}
              />
            ))
          ) : (
            <p className="text-gray-500">
              No tags yet. Add resources with tags to filter.
            </p>
          )}
        </div>
      </div>

      {/* Display Resources */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((res) => (
          <div
            key={res._id}
            className="bg-gray-800 p-6 rounded-lg shadow-lg relative"
            onClick={() => navigate(`/view/resource/${res._id}`)}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteResource(res._id);
              }}
              className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-2xl font-bold"
            >
              &times;
            </button>
            <h3 className="text-xl font-bold mb-2 text-purple-400">
              {res.title}
            </h3>
            <div className="mb-4">
              {res.tags.map((tag) => (
                <Tag key={tag} name={tag} />
              ))}
            </div>
            {res.type === "document" ? (
              <p className="text-gray-300 whitespace-pre-wrap">{res.content}</p>
            ) : (
              <a
                href={res.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-400 hover:text-teal-300 break-all"
                onClick={(e) => e.stopPropagation()}
              >
                {res.url}
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Resources;
