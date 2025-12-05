const axios = require('axios');
const fs = require('fs');

const BEU_RESULT_URL = 'https://beu-bih.ac.in/result-one';

async function debug() {
    try {
        console.log('Fetching...');
        const { data } = await axios.get(BEU_RESULT_URL);
        console.log('Fetched length:', data.length);
        fs.writeFileSync('debug_page.html', data);
        console.log('Saved to debug_page.html');
    } catch (error) {
        console.error(error);
    }
}

debug();
