const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    try {
        console.log('Launching browser...');
        const browser = await puppeteer.launch({
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();

        console.log('Navigating to page...');
        await page.goto('https://beu-bih.ac.in/result-one', { waitUntil: 'networkidle2', timeout: 60000 });

        console.log('Waiting for 5 seconds...');
        await new Promise(r => setTimeout(r, 5000));

        console.log('Dumping HTML...');
        const content = await page.content();
        fs.writeFileSync('puppeteer_dump.html', content);
        console.log('Saved to puppeteer_dump.html');

        await browser.close();
    } catch (error) {
        console.error('Error:', error);
    }
})();
