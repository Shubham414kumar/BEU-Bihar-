const express = require('express');
const router = express.Router();
const NodeCache = require('node-cache');
const { getAllResultLinks } = require('./scraper/getLinks');
const { fetchStudentResult } = require('./scraper/fetchResult');

const cache = new NodeCache({ stdTTL: 600 }); // 10 minutes TTL

// GET /api/result-links
router.get('/result-links', async (req, res, next) => {
    try {
        const cachedData = cache.get('result-links');
        if (cachedData) {
            console.log('Serving result links from cache');
            return res.json(cachedData);
        }

        console.log('Fetching result links from source...');
        const data = await getAllResultLinks();
        cache.set('result-links', data);
        res.json(data);
    } catch (error) {
        next(error);
    }
});

// POST /api/fetch-result
router.post('/fetch-result', async (req, res, next) => {
    try {
        const { semester, regNo, url } = req.body;

        if (!regNo) {
            return res.status(400).json({ error: 'Registration Number is required' });
        }

        // If URL is provided directly, use it. Otherwise, we might need to look it up (optional enhancement)
        // For now, assuming frontend sends the specific result URL or we pick the latest for the semester.
        // The user requirement said: "Open the correct semester result link (from the scraper)"
        // So we should probably fetch links first if URL isn't provided, or expect URL.
        // Let's support both: if URL is missing, try to find latest for semester.

        let resultUrl = url;
        if (!resultUrl && semester) {
            const linksData = cache.get('result-links') || await getAllResultLinks();
            const latest = linksData.latestBySemester[semester];
            if (latest) {
                resultUrl = latest.url;
            }
        }

        if (!resultUrl) {
            return res.status(400).json({ error: 'Result URL not found. Please provide a valid URL or Semester.' });
        }

        console.log(`Fetching result for RegNo: ${regNo} from ${resultUrl}`);
        const result = await fetchStudentResult(resultUrl, regNo);
        res.json(result);

    } catch (error) {
        next(error);
    }
});

module.exports = router;
