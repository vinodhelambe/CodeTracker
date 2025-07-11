import axios from 'axios';
import problem from './problem.js';

function codeforces(app) {
    app.get('/api/fetchCodeforce', async (req, res) => {
        try {
            const username = req.query.handle;
            const url = `https://codeforces.com/api/user.info?handles=${username}`;
            const contestUrl = `https://codeforces.com/api/user.rating?handle=${username}`;
            const submissionsUrl = `https://codeforces.com/api/user.status?handle=${username}`;

            const [infoRes, contestRes, submissionsRes] = await Promise.all([
                axios.get(url),
                axios.get(contestUrl),
                axios.get(submissionsUrl)
            ]);

            if (!infoRes.data || !contestRes.data || !submissionsRes.data) {
                return res.status(404).json({ error: 'Codeforces data not found' });
            }

            const info = infoRes.data;
            const contests = contestRes.data;
            const submissions = submissionsRes.data;

            // Calculate problems solved (unique problems with verdict OK)
            let problemsSolved = 0;
            if (submissions && submissions.result) {
                const solvedSet = new Set();
                submissions.result.forEach(sub => {
                    if (sub.verdict === 'OK' && sub.problem) {
                        solvedSet.add(sub.problem.contestId + '-' + sub.problem.index);
                    }
                });
                problemsSolved = solvedSet.size;
            }

            const filtered = {
                username: info.result[0].handle,
                country: info.result[0].country || 'Unknown',
                maxRating: info.result[0].maxRating || 0,
                currentRating: info.result[0].rating || 0,
                problemsSolved: problemsSolved,
                rank: info.result[0].rank || 'Unknown',
                contestsParticipated: contests.result.length
            };

            res.json(filtered);
        } catch (err) {
            console.error('Error fetching code:', err);
            res.status(500).json({ error: 'Failed to fetch code' });
        }
    });
}

function leetcode(app) {
    app.get('/api/fetchLeetcode', async (req, res) => {
        try {
            const username = req.query.handle || 'vinodhelambe';
            const baseUrl = 'https://alfa-leetcode-api.onrender.com';
            // Fetch contest and solved data in parallel
            const [contestRes, solvedRes] = await Promise.all([
                axios.get(`${baseUrl}/${username}/contest`),
                axios.get(`${baseUrl}/${username}/solved`)
            ]);


            const contestData = contestRes.data;
            const solvedData = solvedRes.data;

            // Calculate acceptance rate
            const totalSubmissions = solvedData.totalSubmissionNum?.[0]?.submissions || 0;
            const acSubmissions = solvedData.acSubmissionNum?.[0]?.submissions || 0;

            const filtered = {
                username: username,
                totalSolved: solvedData.solvedProblem || 0,
                contestRating: Math.ceil(contestData.contestRating || 0),
                acceptanceRate: totalSubmissions > 0 ?
                    ((acSubmissions / totalSubmissions) * 100).toFixed(2) + '%' : '0%',
                globalRank: 'Top ' + Math.floor(contestData.contestTopPercentage || 100) + '%',
                easySolved: solvedData.easySolved || 0,
                mediumSolved: solvedData.mediumSolved || 0,
                hardSolved: solvedData.hardSolved || 0,
                attendedContests: contestData.contestAttend || 0
            };

            // const temp = {

            //     "username": "vinodhelambe",
            //     "totalSolved": 417,
            //     "contestRating": 1582,
            //     "acceptanceRate": "73.34%",
            //     "globalRank": "Top 25%",
            //     "easySolved": 149,
            //     "mediumSolved": 234,
            //     "hardSolved": 34,
            //     "attendedContests": 15
            // };

            // res.json(temp);

            res.json(filtered);
            
        } catch (error) {
            console.error('Error fetching leetcode data:', error);
            res.status(500).json({ error: 'Failed to fetch leetcode data' });
        }
    });
}

function hackerRank(app) {
    app.get('/api/fetchHackerRank', async (req, res) => {
        try {
            const username = req.query.handle || 'vinodghelambe';
            const proxyUrl = 'https://api.allorigins.win/raw?url=';
            const targetUrl = `https://www.hackerrank.com/rest/hackers/${username}/badges`;

            const response = await axios.get(proxyUrl + encodeURIComponent(targetUrl));
            
            const data = response.data;

            if (!data || !data.models) {
                return res.status(404).json({ error: 'HackerRank data not found' });
            }

            const filtered = {
                username: username,
                problemSolvingStars: data.models?.[0]?.total_stars || 0,
                cppStars: data.models?.[1]?.total_stars || 0,
                problemsSolved: data.models?.[0]?.solved + data.models?.[1]?.solved || 0
            };

            res.json(filtered);
        } catch (err) {
            console.error('Error fetching HackerRank data:', err);
            res.status(500).json({ error: 'Failed to fetch HackerRank data' });
        }
    });
}

export { codeforces, leetcode, hackerRank };

