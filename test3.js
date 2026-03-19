const axios = require('axios');
axios.post('https://api.cobalt.tools/', {
    url: 'https://www.instagram.com/p/DBh8w8ZSU2b/'
}, {
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/119.0.0.0 Safari/537.36'
    }
}).then(cres => console.log("Cobalt:", cres.data))
  .catch(e => console.error("Cobalt Error:", e.response ? e.response.status + ' ' + JSON.stringify(e.response.data) : e.message));
