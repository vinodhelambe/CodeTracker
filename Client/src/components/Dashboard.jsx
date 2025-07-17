import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useStickyState from "../hooks/useStickyState";
import Timer from "./Timer";
import { data } from "../api/fileService";

import PlatformStats from "./PlatformStats";

const StatCard = ({ title, value, icon }) => (
  <div className="bg-gray-800 p-6 rounded-lg flex items-center">
    <div className="text-3xl text-indigo-400 mr-4">{icon}</div>
    <div>
      <p className="text-lg font-semibold text-gray-300">{title}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  </div>
);

const RecentItem = ({ text, subtext, type, onClick }) => (
  <div
    className="bg-gray-700 p-3 rounded-lg mb-2 cursor-pointer"
    onClick={onClick}
  >
    <p className="font-bold text-white">{text}</p>
    <p className="text-sm text-gray-400">
      {type} - {subtext}
    </p>
  </div>
);

function Dashboard() {
  const [solvedQuestions, setSolvedQuestions] = useStickyState(
    [],
    "solvedQuestions"
  );
  const [newQuestion, setNewQuestion] = useState({
    name: "",
    link: "",
    difficulty: "Easy",
    topic: "",
  });
  const [routine, setRoutine] = useState();
  const [allResources, setAllResources] = useState([]);
  const [recentProblems, setRecentProblems] = useState([]);
  const [recentResources, setRecentResources] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Load all resources (for stats) and recent resource (for sidebar)
    data
      .loadResource()
      .then((resourceData) => {
        let allRes = [];
        if (Array.isArray(resourceData) && resourceData.length > 0) {
          allRes = resourceData;
        } else {
          allRes = JSON.parse(localStorage.getItem("resourcesLocal") || "[]");
        }
        setAllResources(allRes);
        setRecentResources(allRes.slice(0, 1));
      })
      .catch(() => {
        const local = JSON.parse(
          localStorage.getItem("resourcesLocal") || "[]"
        );
        setAllResources(local);
        setRecentResources(local.slice(0, 1));
      });

    // Load problems (with localStorage fallback)
    data
      .loadproblems()
      .then((problem) => {
        if (Array.isArray(problem) && problem.length > 0) {
          setRecentProblems(problem);
        } else {
          const solved = JSON.parse(
            localStorage.getItem("solvedQuestions") || "[]"
          );
          const solvedMapped = solved.map((q) => ({
            _id: q.link,
            ProblemName: q.name,
            Topic: q.topic,
            URL: q.link,
            Difficulty: q.difficulty,
          }));
          setRecentProblems(solvedMapped);
        }
      })
      .catch(() => {
        const solved = JSON.parse(
          localStorage.getItem("solvedQuestions") || "[]"
        );
        const solvedMapped = solved.map((q) => ({
          _id: q.link,
          ProblemName: q.name,
          Topic: q.topic,
          URL: q.link,
          Difficulty: q.difficulty,
        }));
        setRecentProblems(solvedMapped);
      });

    // Load today's routine (for stats)
    const todayObj = new Date();
    const today =
      todayObj.getFullYear() +
      "-" +
      String(todayObj.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(todayObj.getDate()).padStart(2, "0");
    data
      .loadTodayRoutine(today)
      .then((routine) => {
        setRoutine(routine || { tasks: [] });
      })
      .catch(() => {
        const localRoutines = JSON.parse(
          localStorage.getItem("routineLocal") || "[]"
        );
        const todayRoutine = localRoutines.find((r) => r.date === today);
        setRoutine(todayRoutine || { tasks: [] });
      });
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewQuestion((prev) => ({ ...prev, [name]: value }));
  };

  // handle adding a new solved question !
  const handleAddQuestion = (e) => {
    e.preventDefault();
    if (newQuestion.name.trim() === "" || newQuestion.topic.trim() === "")
      return;
    let NewProblem = {
      ProblemName: newQuestion.name,
      Topic: newQuestion.topic,
      URL: newQuestion.link,
      Difficulty: newQuestion.difficulty,
    };

    data.saveProblems(NewProblem);

    const question = {
      ...newQuestion,
    };
    setSolvedQuestions([question, ...solvedQuestions]);
    setNewQuestion({ name: "", link: "", difficulty: "Easy", topic: "" });
  };

  // Normalize difficulty for robust stats
  function getDifficulty(q) {
    // Accept both 'difficulty' and 'Difficulty' fields
    const raw = (q.difficulty || q.Difficulty || "").toString().toLowerCase();
    if (raw.startsWith("e")) return "Easy";
    if (raw.startsWith("m")) return "Medium";
    if (raw.startsWith("h")) return "Hard";
    return "Other";
  }

  // Load all problems for stats, but only show 2 in recent
  let allProblems = [];
  if (recentProblems && recentProblems.length > 0) {
    allProblems = recentProblems.map((q) => ({
      name: q.name || q.ProblemName || "",
      link: q.link || q.URL || "",
      difficulty: q.difficulty || q.Difficulty || "",
      topic: q.topic || q.Topic || "",
    }));
  } else {
    allProblems = solvedQuestions.map((q) => ({
      name: q.name || q.ProblemName || "",
      link: q.link || q.URL || "",
      difficulty: q.difficulty || q.Difficulty || "",
      topic: q.topic || q.Topic || "",
    }));
  }

  // For recent display, show only the latest 2
  const recentProblemsDisplay = allProblems.slice(0, 2);

  const dsaSolved = allProblems.length;
  const easySolved = allProblems.filter(
    (q) => getDifficulty(q) === "Easy"
  ).length;
  const mediumSolved = allProblems.filter(
    (q) => getDifficulty(q) === "Medium"
  ).length;
  const hardSolved = allProblems.filter(
    (q) => getDifficulty(q) === "Hard"
  ).length;

  const numDocuments = allResources.filter((r) => r.type === "document").length;
  const numReferences = allResources.filter(
    (r) => r.type === "reference"
  ).length;
  const tasksCompleted = routine?.tasks?.filter((t) => t.completed).length || 0;
  const totalTasks = routine?.tasks?.length || 0;

  return (
    <div className="p-4">
      <Timer />
      <PlatformStats />
      <h2 className="text-3xl font-bold mb-6 text-indigo-400">Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total DSA Solved" value={dsaSolved} icon="🧮" />
        <StatCard
          title="Easy / Med / Hard"
          value={`${easySolved} / ${mediumSolved} / ${hardSolved}`}
          icon="📊"
        />
        <StatCard
          title="Documents & Refs"
          value={`${numDocuments} / ${numReferences}`}
          icon="📚"
        />
        <StatCard
          title="Tasks Done Today"
          value={`${tasksCompleted} / ${totalTasks}`}
          icon="✅"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        {/* Left Column: Quick Add DSA */}
        <div className="lg:col-span-1">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-4 text-gray-300">
              Add Solved Problem
            </h3>
            <form onSubmit={handleAddQuestion}>
              <input
                type="text"
                name="name"
                value={newQuestion.name}
                onChange={handleInputChange}
                placeholder="Problem Name"
                className="w-full bg-gray-700 text-white rounded-lg p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
              <input
                type="text"
                name="topic"
                value={newQuestion.topic}
                onChange={handleInputChange}
                placeholder="Topic (e.g., Arrays, DP)"
                className="w-full bg-gray-700 text-white rounded-lg p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
              <input
                type="url"
                name="link"
                value={newQuestion.link}
                onChange={handleInputChange}
                placeholder="Link to Problem (optional)"
                className="w-full bg-gray-700 text-white rounded-lg p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <select
                name="difficulty"
                value={newQuestion.difficulty}
                onChange={handleInputChange}
                className="w-full bg-gray-700 text-white rounded-lg p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
              >
                + Add Problem
              </button>
            </form>
          </div>
        </div>

        {/* Middle Column: Recent Activity */}
        <div className="lg:col-span-1">
          <div className="bg-gray-800 p-6 rounded-lg">
            <div>
              <h4 className="font-bold text-lg mb-2 text-gray-400">
                Latest Resources
              </h4>
              {recentResources.length > 0 ? (
                recentResources.map((res) => (
                  <RecentItem
                    key={res._id}
                    text={res.title}
                    subtext={res.type === "document" ? "Document" : res.url}
                    type="Resource"
                    onClick={() => navigate(`/view/resource/${res._id}`)}
                  />
                ))
              ) : (
                <p className="text-gray-500">No resources added yet.</p>
              )}

              <h4 className="font-bold text-lg mb-2 text-gray-400 mt-4">
                Latest Solved Problems
              </h4>
              {recentProblemsDisplay.length > 0 ? (
                recentProblemsDisplay.map((q, idx) => (
                  <RecentItem
                    key={q.link || q.name || idx}
                    text={q.name}
                    subtext={`${q.topic} - ${q.difficulty}`}
                    type="DSA"
                    onClick={() =>
                      navigate(
                        `/view/problem/${encodeURIComponent(q.link || q.name)}`
                      )
                    }
                  />
                ))
              ) : (
                <p className="text-gray-500">No problems logged yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
