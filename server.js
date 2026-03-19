const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Proxy endpoint to fetch the file universally using youtube-dl-exec
app.get('/api/download', async (req, res) => {
    let fileUrl = req.query.url;

    if (!fileUrl) {
        return res.status(400).json({ error: 'URL parameter is required.' });
    }

    try {
        // We use youtube-dl-exec (wrapper for yt-dlp) to universally extract raw media URLs
        // This supports Instagram, TikTok, YouTube, Twitter, and hundreds more websites natively.
        const youtubedl = require('youtube-dl-exec');
        
        const mediaInfo = await youtubedl(fileUrl, {
            dumpSingleJson: true,
            noCheckCertificates: true,
            noWarnings: true,
            preferFreeFormats: true,
            addHeader: ['referer:youtube.com', 'user-agent:googlebot']
        });

        // yt-dlp returns the direct media url in info.url, or inside a formats array
        let downloadUrl = mediaInfo.url;
        if (!downloadUrl && mediaInfo.formats && mediaInfo.formats.length > 0) {
            // Find the best format with both video and audio, or just the highest quality
            const format = mediaInfo.formats.find(f => f.url && f.protocol === 'https');
            downloadUrl = format ? format.url : mediaInfo.formats[0].url;
        }

        if (!downloadUrl) {
             return res.status(400).json({ error: 'Could not extract direct media from this link.' });
        }

        // Use axios to fetch the file stream directly via the extracted raw media URL. 
        // This handles redirects automatically and allows us to spoof a User-Agent.
        const response = await axios({
            method: 'GET',
            url: downloadUrl,
            responseType: 'stream',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5'
            },
            validateStatus: (status) => status >= 200 && status < 400 // only reject on 4xx/5xx errors
        });

        // Forward the content-type and disposition if any to the browser
        const contentType = response.headers['content-type'] || 'application/octet-stream';
        res.setHeader('Content-Type', contentType);
        
        if (response.headers['content-disposition']) {
            res.setHeader('Content-Disposition', response.headers['content-disposition']);
        }

        // Pipe the stream directly to the client's response
        response.data.pipe(res);

    } catch (e) {
        console.error('Universal Proxy Error:', e.message);
        
        // If axois failed, we check e.response. If yt-dlp failed, it doesn't have e.response.
        const statusCode = e.response ? e.response.status : 500;
        let msg = 'Failed to extract media from the target URL.';
        if (e.response) {
             msg = `Target server blocked request with status: ${statusCode}`;
        } else if (e.message && e.message.includes('youtube-dl')) {
             msg = 'The site structure was not recognized or is blocking automated extraction.';
        }
        
        return res.status(statusCode).json({ error: msg });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
