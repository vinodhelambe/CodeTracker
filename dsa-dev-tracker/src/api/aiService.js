import OpenAI from 'openai';

// IMPORTANT: Replace with your actual OpenAI API key
// You can get a key from https://platform.openai.com/account/api-keys
const openai = new OpenAI({
    apiKey: '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', // Replace with your key
    dangerouslyAllowBrowser: true, // This is required for client-side usage
});

// AI service implementation goes here
const generateDSAPlan = (experience, time, specificTopics) => {
    let plan = `Based on your preferences (Focus: DSA, Experience: ${experience}, Time: ${time}), here is a personalized plan:\n\n`;
    let tasks = [];
    let id = 1;

    plan += `1. Warm-up (15 mins): Quick review of key concepts on ${specificTopics || 'core data structures'}.\n`;
    tasks.push({ id: id++, time: '09:00 - 09:15', activity: `Warm-up: Review ${specificTopics || 'core DSA concepts'}`, completed: false });

    if (experience === 'Beginner') {
        plan += `2. Foundational Learning (1.5 hours): Focus on understanding one core data structure (e.g., Arrays, Linked Lists). Watch a tutorial and implement it from scratch.\n`;
        tasks.push({ id: id++, time: '09:15 - 10:45', activity: 'Foundational Learning: Arrays/Linked Lists', completed: false });
        plan += `3. Practice Problems (1 hour): Solve 2-3 easy-level problems on LeetCode/HackerRank related to the topic.\n`;
        tasks.push({ id: id++, time: '11:00 - 12:00', activity: 'Practice: 2-3 Easy LeetCode Problems', completed: false });
    } else if (experience === 'Intermediate') {
        plan += `2. Advanced Topic (2 hours): Dive into a more complex topic like Trees, Graphs, or Dynamic Programming. ${specificTopics ? `Specifically, focus on ${specificTopics}.` : ''}\n`;
        tasks.push({ id: id++, time: '09:15 - 11:15', activity: `Advanced Topic: ${specificTopics || 'Trees/Graphs'}`, completed: false });
        plan += `3. Problem Solving (1.5 hours): Solve 2 medium-level problems that require the day's topic.\n`;
        tasks.push({ id: id++, time: '11:30 - 13:00', activity: 'Practice: 2 Medium LeetCode Problems', completed: false });
    } else { // Advanced
        plan += `2. Complex Algorithm Study (2.5 hours): Study and implement a niche or complex algorithm (e.g., A*, Segment Trees). ${specificTopics ? `Focus on ${specificTopics}.` : ''}\n`;
        tasks.push({ id: id++, time: '09:15 - 11:45', activity: `Complex Algorithm: ${specificTopics || 'A* / Segment Trees'}`, completed: false });
        plan += `3. Competitive Problems (2 hours): Tackle 1-2 hard-level problems from a platform like Codeforces or LeetCode.\n`;
        tasks.push({ id: id++, time: '12:00 - 14:00', activity: 'Practice: 1-2 Hard LeetCode/Codeforces Problems', completed: false });
    }

    plan += `4. Review and Document (30 mins): Review solutions, understand different approaches, and document your learnings.`;
    tasks.push({ id: id++, time: '14:00 - 14:30', activity: 'Review and Document Learnings', completed: false });

    return { plan, tasks };
};

const generateWebDevPlan = (experience, time, specificTopics) => {
    let plan = `Based on your preferences (Focus: Web Dev, Experience: ${experience}, Time: ${time}), here is a personalized plan:\n\n`;
    let tasks = [];
    let id = 1;

    plan += `1. Tech veille (30 mins): Read articles or watch videos on the latest trends in ${specificTopics || 'web development (e.g., React, Node.js)'}.\n`;
    tasks.push({ id: id++, time: '09:00 - 09:30', activity: `Tech Veille: ${specificTopics || 'React/Node.js'}`, completed: false });

    if (experience === 'Beginner') {
        plan += `2. Tutorial-Driven Learning (2 hours): Follow a tutorial to build a small feature or a simple component. ${specificTopics ? `Focus on ${specificTopics}.` : 'Try building a custom UI component.'}\n`;
        tasks.push({ id: id++, time: '09:30 - 11:30', activity: `Tutorial: Build a ${specificTopics || 'UI component'}`, completed: false });
        plan += `3. Project Scaffolding (1 hour): Start a new project from scratch using a framework like Vite or Next.js. Set up the basic structure.\n`;
        tasks.push({ id: id++, time: '11:45 - 12:45', activity: 'Project: Scaffold a new Vite/Next.js app', completed: false });
    } else if (experience === 'Intermediate') {
        plan += `2. Feature Development (2.5 hours): Work on a personal project. Implement a new feature, such as authentication or state management. ${specificTopics ? `Focus on ${specificTopics}.` : ''}\n`;
        tasks.push({ id: id++, time: '09:30 - 12:00', activity: `Project Feature: ${specificTopics || 'Authentication'}`, completed: false });
        plan += `3. Refactoring and Testing (1 hour): Refactor a piece of existing code for clarity and performance. Write unit tests for it.\n`;
        tasks.push({ id: id++, time: '12:15 - 13:15', activity: 'Refactor and Test Code', completed: false });
    } else { // Advanced
        plan += `2. System Design and Architecture (2 hours): Design a new, scalable feature for a large application. Document the architecture. ${specificTopics ? `Focus on ${specificTopics}.` : ''}\n`;
        tasks.push({ id: id++, time: '09:30 - 11:30', activity: `System Design: ${specificTopics || 'Scalable Feature'}`, completed: false });
        plan += `3. Performance Optimization (2 hours): Profile a web app, identify bottlenecks, and implement optimizations (e.g., code splitting, memoization).\n`;
        tasks.push({ id: id++, time: '11:45 - 13:45', activity: 'Performance Optimization', completed: false });
    }

    plan += `4. Code Review / PR (30 mins): Review a pull request on a public project or write up your work for the day.`;
    tasks.push({ id: id++, time: '14:00 - 14:30', activity: 'Code Review / Documentation', completed: false });

    return { plan, tasks };
};

export const getAIPlan = async (preferences) => {
    const { focus, experience, time, specificTopics } = preferences;

    const prompt = `
        You are an expert planner for software developers. Generate a personalized daily learning plan based on the following preferences:
        - Focus: ${focus}
        - Experience Level: ${experience}
        - Time Available: ${time}
        - Specific Topics: ${specificTopics || 'any'}

        Your response must be a valid JSON object with two properties:
        1. "plan": A string containing a detailed, step-by-step plan formatted as a single block of text.
        2. "tasks": An array of objects, where each object represents a task in the routine and has the following properties: "id" (a unique number starting from 1), "time" (a string representing the time slot, e.g., "09:00 - 09:30"), "activity" (a string describing the task), and "completed" (boolean, default to false).

        Generate a realistic and actionable plan.
    `;

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
        });

        const content = response.choices[0].message.content;
        
        // Clean the content to ensure it is valid JSON
        const jsonResponse = JSON.parse(content.trim());

        return jsonResponse;
    } catch (error) {
        console.error("Error fetching AI plan:", error);
        // Fallback to mock data or a predefined plan in case of an API error
        return { 
            plan: "Could not generate a plan due to an error. Please check your API key and network connection. As a fallback, consider reviewing your notes.",
            tasks: [{ id: 1, time: 'N/A', activity: 'Error handling fallback: Review notes', completed: false }]
        };
    }
};
