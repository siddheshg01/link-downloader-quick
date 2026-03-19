const youtubedl = require('youtube-dl-exec')

youtubedl('https://www.instagram.com/p/DBh8w8ZSU2b/', {
  dumpSingleJson: true,
  noCheckCertificates: true,
  noWarnings: true,
  addHeader: ['referer:youtube.com', 'user-agent:googlebot']
}).then(output => console.log("Success! Output URL:", output.url || output.formats[0].url))
  .catch(err => console.error("YT-DLP Error:", err.message))
