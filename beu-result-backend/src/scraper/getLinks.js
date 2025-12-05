const puppeteer = require('puppeteer');

const BEU_RESULT_URL = 'https://beu-bih.ac.in/result-one';

async function getAllResultLinks() {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();

        // Navigate to the result page
        await page.goto(BEU_RESULT_URL, { waitUntil: 'networkidle2', timeout: 60000 });

        // Wait for the table rows
        await page.waitForSelector('tr.clickable-row', { timeout: 30000 });

        const links = await page.evaluate(() => {
            const extractedLinks = [];
            const rows = document.querySelectorAll('tr.clickable-row');

            rows.forEach(row => {
                const cols = row.querySelectorAll('td');
                if (cols.length < 3) return;

                const examName = cols[0].innerText.trim(); // "M.Tech. 1st Semester Examination, 2024"
                const session = cols[1].innerText.trim().split('-')[0]; // "2024-26" -> "2024"
                const examHeld = cols[2].innerText.trim(); // "July/2025"

                // Regex to extract Semester
                const semesterMatch = examName.match(/(\d+)(?:st|nd|rd|th)\s+Semester/i);
                const semester = semesterMatch ? semesterMatch[1] : '';

                // Construct URL
                const encodedExamName = encodeURIComponent(examName);
                const encodedExamHeld = encodeURIComponent(examHeld);
                const sessionParam = session;

                const url = `https://beu-bih.ac.in/result-two/${encodedExamName}?semester=${semester}&session=${sessionParam}&exam_held=${encodedExamHeld}`;

                if (semester) {
                    extractedLinks.push({
                        semester: semester,
                        year: sessionParam,
                        url: url,
                        examName: examName
                    });
                }
            });
            return extractedLinks;
        });

        // Group by semester and find latest
        const latestBySemester = {};
        links.forEach(link => {
            const sem = link.semester;
            if (!latestBySemester[sem]) {
                latestBySemester[sem] = link;
            } else {
                if (parseInt(link.year) > parseInt(latestBySemester[sem].year)) {
                    latestBySemester[sem] = link;
                }
            }
        });

        return {
            links,
            latestBySemester
        };

    } catch (error) {
        console.error('Error fetching result links:', error);
        return { links: [], latestBySemester: {} };
    } finally {
        if (browser) await browser.close();
    }
}

module.exports = { getAllResultLinks };
