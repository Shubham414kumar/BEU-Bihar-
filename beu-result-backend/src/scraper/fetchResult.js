const puppeteer = require('puppeteer');

async function fetchStudentResult(resultUrl, regNo) {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();

        // Navigate to the result page
        await page.goto(resultUrl, { waitUntil: 'networkidle2', timeout: 60000 });

        // Wait for input field (assuming standard BEU result page structure)
        // We need to find the input for Reg No. Usually it's an input type='text'
        const inputSelector = 'input[type="text"]';
        await page.waitForSelector(inputSelector);

        // Type Reg No
        await page.type(inputSelector, regNo);

        // Click Submit (assuming a button or input type='submit')
        const submitSelector = 'button[type="submit"], input[type="submit"]';
        await page.waitForSelector(submitSelector);
        await page.click(submitSelector);

        // Wait for result to load
        // We'll wait for a table or some specific text indicating result
        await page.waitForSelector('table', { timeout: 30000 });

        // Scrape Result
        const resultData = await page.evaluate(() => {
            const data = {
                studentInfo: {},
                marks: [],
                sgpa: "N/A"
            };

            // Extract Student Info (Name, College, Roll No)
            // This is highly dependent on the page structure. 
            // Assuming a table with "Name", "Registration No", etc.
            const tables = document.querySelectorAll('table');

            if (tables.length > 0) {
                // Try to find student info in the first few tables
                tables.forEach(table => {
                    const rows = table.querySelectorAll('tr');
                    rows.forEach(row => {
                        const text = row.innerText;
                        if (text.includes('Name')) data.studentInfo.Name = text.split(':')[1]?.trim() || text;
                        if (text.includes('Registration No') || text.includes('Roll No')) data.studentInfo['Roll No'] = text.split(':')[1]?.trim() || text;
                        if (text.includes('College')) data.studentInfo.College = text.split(':')[1]?.trim() || text;
                        if (text.includes('SGPA')) data.sgpa = text.split(':')[1]?.trim() || text.match(/SGPA\s*[:=-]\s*([\d.]+)/)?.[1];
                    });
                });

                // Extract Marks
                // Look for a table with headers like "Subject Code", "Subject Name", "Grade"
                tables.forEach(table => {
                    const headers = Array.from(table.querySelectorAll('th')).map(th => th.innerText.toLowerCase());
                    if (headers.some(h => h.includes('subject') || h.includes('code'))) {
                        const rows = table.querySelectorAll('tr');
                        rows.forEach((row, index) => {
                            if (index === 0) return; // Skip header
                            const cols = row.querySelectorAll('td');
                            if (cols.length >= 3) {
                                data.marks.push({
                                    code: cols[0]?.innerText.trim(),
                                    subject: cols[1]?.innerText.trim(),
                                    grade: cols[cols.length - 1]?.innerText.trim() // Assuming grade is last
                                });
                            }
                        });
                    }
                });
            }

            return data;
        });

        return resultData;

    } catch (error) {
        console.error('Error fetching student result:', error);
        throw new Error('Failed to fetch result. Please check Registration Number or try again later.');
    } finally {
        if (browser) await browser.close();
    }
}

module.exports = { fetchStudentResult };
