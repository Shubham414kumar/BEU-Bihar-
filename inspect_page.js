const puppeteer = require('puppeteer');

(async () => {
    try {
        console.log('Launching browser...');
        const browser = await puppeteer.launch({
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();

        console.log('Navigating to page...');
        page.on('response', response => {
            const url = response.url();
            if (url.includes('GetResult') || url.includes('api') || url.includes('json')) {
                console.log('Potential API URL:', url);
            }
        });

        await page.goto('https://beu-bih.ac.in/result-one', { waitUntil: 'networkidle2', timeout: 60000 });

        console.log('Page loaded. Extracting links...');
        const data = await page.evaluate(() => {
            const links = Array.from(document.querySelectorAll('a')).map(a => ({
                text: a.innerText.trim(),
                href: a.href
            }));

            const tableRows = Array.from(document.querySelectorAll('tr')).map(tr => tr.innerText);

            return { links, tableRows };
        });

        console.log('Found Links:', JSON.stringify(data.links, null, 2));
        console.log('Table Rows (first 5):', JSON.stringify(data.tableRows.slice(0, 5), null, 2));

        await browser.close();
    } catch (error) {
        console.error('Error:', error);
    }
})();
