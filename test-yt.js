const youtubedl = require('youtube-dl-exec');

async function test() {
    console.log("Testing yt-dlp download...");
    try {
        const output = await youtubedl('https://www.instagram.com/p/DBh8w8ZSU2b/', {
            dumpSingleJson: true,
            noCheckCertificates: true,
            noWarnings: true,
            addHeader: ['referer:youtube.com', 'user-agent:googlebot']
        });
        console.log("Found Media Info:", output.url ? "Has URL" : "No root URL", output.formats ? "Has formats array: " + output.formats.length : "No formats");
        
        let downloadUrl = output.url;
        if (!downloadUrl && output.formats && output.formats.length > 0) {
            const format = output.formats.find(f => f.url && f.protocol === 'https');
            downloadUrl = format ? format.url : output.formats[0].url;
        }
        
        console.log("Direct URL to fetch:", downloadUrl);
        
        // test fetching the direct url
        const axios = require('axios');
        const cres = await axios.head(downloadUrl);
        console.log("Media fetch test HTTP Status:", cres.status);
    } catch(e) {
        console.error("Test Error:", e.message);
    }
}
test();
