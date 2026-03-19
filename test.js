const ig = require('instagram-url-direct');

async function test() {
    console.log("Testing IG...");
    try {
        const res = await ig('https://www.instagram.com/p/DBh8w8ZSU2b/');
        console.log("IG Result:", res);
    } catch(e) {
        console.error("IG Error:", e);
    }

    console.log("Testing Cobalt...");
    try {
        const fetch = require('node-fetch'); // or axios
        const axios = require('axios');
        const cres = await axios.post('https://api.cobalt.tools/api/json', {
            url: 'https://www.instagram.com/p/DBh8w8ZSU2b/'
        }, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'User-Agent': 'cobalt-test'
            }
        });
        console.log("Cobalt Result:", cres.data);
    } catch(e) {
        console.error("Cobalt Error:", e.response ? e.response.status + ' ' + JSON.stringify(e.response.data) : e.message);
    }
}
test();
