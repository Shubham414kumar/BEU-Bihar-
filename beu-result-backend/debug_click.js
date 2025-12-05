const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    try {
        const browser = await puppeteer.launch({
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.goto('https://beu-bih.ac.in/result-one', { waitUntil: 'networkidle2', timeout: 60000 });
        await page.waitForSelector('tr.clickable-row');

        // Click first row
        const navigationPromise = page.waitForNavigation();
        await page.click('tr.clickable-row');
        await navigationPromise;

        const url = page.url();
        fs.writeFileSync('url.txt', url);
        console.log('Saved URL to url.txt');

        await browser.close();
    } catch (error) {
        console.error(error);
    }
})();
