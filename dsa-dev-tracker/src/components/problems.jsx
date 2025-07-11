import React, { useEffect, useState, useContext } from "react";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { data } from "../api/fileService";
import { toast } from "react-toastify";
import useStickyState from "../hooks/useStickyState";

const Problems = () => {
  const { Userdata } = useContext(AppContext);
  const [Problems, setProblems] = useState([]);
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [topic, setTopic] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Only fetch problems from DB
    data.loadproblems()
      .then(fetchedProblems => {
        if (Array.isArray(fetchedProblems)) {
          setProblems(fetchedProblems);
        } else {
          setProblems([]);
        }
      })
      .catch(() => {
        setProblems([]);
      });
  }, []);

  // Filter logic
  const filtered = Problems.filter((problem) => {
    const matchesSearch =
      problem.ProblemName.toLowerCase().includes(search.toLowerCase()) ||
      (problem.Topic && problem.Topic.toLowerCase().includes(search.toLowerCase()));
    const matchesDifficulty = difficulty ? problem.Difficulty === difficulty : true;
    const matchesTopic = topic ? (problem.Topic && problem.Topic.toLowerCase().includes(topic.toLowerCase())) : true;
    return matchesSearch && matchesDifficulty && matchesTopic;
  });

  // Unique topics for dropdown
  const uniqueTopics = Array.from(new Set(Problems.map(p => p.Topic).filter(Boolean)));

  return (
    <div>
      <div className="bg-gray-800 p-6 rounded-lg mt-8">
        <h3 className="text-xl font-bold mb-4 text-gray-300">
          Solved Problems History
        </h3>
        {/* Search and filter controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <input
            type="text"
            placeholder="Search by name or topic..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-gray-700 text-white rounded-lg p-2 w-full md:w-1/3"
          />
          <select
            value={difficulty}
            onChange={e => setDifficulty(e.target.value)}
            className="bg-gray-700 text-white rounded-lg p-2 w-full md:w-1/4"
          >
            <option value="">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
          <select
            value={topic}
            onChange={e => setTopic(e.target.value)}
            className="bg-gray-700 text-white rounded-lg p-2 w-full md:w-1/4"
          >
            <option value="">All Topics</option>
            {uniqueTopics.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-700">
              <tr>
                <th className="py-2 px-4 text-gray-300">Problem Name</th>
                <th className="py-2 px-4 text-gray-300">Topic</th>
                <th className="py-2 px-4 text-gray-300">URL</th>
                <th className="py-2 px-4 text-gray-300">Difficulty</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((problem) => (
                <tr
                  key={problem._id}
                  className="border-b border-gray-700"
                  onClick={() => {
                    // Always navigate to DB view
                    navigate(`/view/problem/${encodeURIComponent(problem._id)}`);
                  }}
                  style={{ cursor: "pointer" }}
                >
                  <td className="py-2 px-4 text-gray-300">
                    {problem.ProblemName}
                  </td>
                  <td className="py-2 px-4 text-gray-300">{problem.Topic}</td>
                  <td className="py-2 px-4 text-gray-300">
                    <a
                      href={problem.URL}
                      className="text-blue-400 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {problem.URL}
                    </a>
                  </td>
                  <td className="py-2 px-4 text-gray-300">
                    {problem.Difficulty}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Problems;
