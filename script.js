document.addEventListener('DOMContentLoaded', () => {
    const urlInput = document.getElementById('urlInput');
    const downloadBtn = document.getElementById('downloadBtn');
    const statusText = document.getElementById('statusText');
    const statusDot = document.querySelector('.status-dot');
    const progressBarContainer = document.getElementById('progressBarContainer');
    const progressBar = document.getElementById('progressBar');

    function setStatus(message, state = 'default') {
        statusText.textContent = message;
        statusDot.className = 'status-dot'; // reset
        
        switch(state) {
            case 'active':
                statusDot.classList.add('active');
                statusText.style.color = 'var(--fire-orange)';
                break;
            case 'error':
                statusDot.classList.add('error');
                statusText.style.color = '#ff003c';
                break;
            case 'success':
                statusDot.classList.add('success');
                statusText.style.color = '#00ffaa';
                break;
            default:
                statusText.style.color = 'var(--text-primary)';
                break;
        }
    }

    // Extract filename from response or URL fallback
    function getFilename(response, url) {
        const disposition = response.headers.get('content-disposition');
        if (disposition && disposition.indexOf('attachment') !== -1) {
            const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
            const matches = filenameRegex.exec(disposition);
            if (matches != null && matches[1]) { 
                return matches[1].replace(/['"]/g, '');
            }
        }
        
        try {
            const parsedUrl = new URL(url);
            let path = parsedUrl.pathname;
            const lastSegment = path.substring(path.lastIndexOf('/') + 1);
            if (lastSegment) {
                return decodeURIComponent(lastSegment.split('?')[0]);
            }
        } catch(e) {}

        return 'downloaded_file';
    }

    downloadBtn.addEventListener('click', async () => {
        const urlToDownload = urlInput.value.trim();

        if (!urlToDownload) {
            setStatus('Error: Please enter a valid URL.', 'error');
            return;
        }

        try {
            new URL(urlToDownload);
        } catch (e) {
            setStatus('Error: Invalid URL format.', 'error');
            return;
        }

        setStatus('Initiating connection...', 'active');
        downloadBtn.disabled = true;
        progressBarContainer.classList.remove('hidden');
        progressBar.style.width = '10%';

        try {
            // Forward request to our backend proxy to avoid CORS
            // Use an absolute URL so it works even if the user opens index.html via Live Server!
            const proxyUrl = `http://localhost:3000/api/download?url=${encodeURIComponent(urlToDownload)}`;
            
            setStatus('Fetching data. Please wait...', 'active');
            progressBar.style.width = '40%';

            const response = await fetch(proxyUrl);

            if (!response.ok) {
                let errMsg = `Server Error: ${response.status}`;
                try {
                    const errData = await response.json();
                    if(errData.error) errMsg = errData.error;
                } catch(e) {}
                throw new Error(errMsg);
            }

            setStatus('Downloading data stream...', 'active');
            progressBar.style.width = '70%';

            const blob = await response.blob();
            const filename = getFilename(response, urlToDownload);

            setStatus('Processing file...', 'active');
            progressBar.style.width = '90%';

            // Trigger client-side download prompt via Blob URL
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = downloadUrl;
            a.download = filename;
            
            document.body.appendChild(a);
            a.click();
            
            window.URL.revokeObjectURL(downloadUrl);
            document.body.removeChild(a);

            setStatus('Download Complete!', 'success');
            progressBar.style.width = '100%';

            setTimeout(() => {
                progressBarContainer.classList.add('hidden');
                progressBar.style.width = '0%';
                setTimeout(() => setStatus('System Ready. Awaiting Input.', 'default'), 3000);
            }, 1500);

        } catch (error) {
            console.error('Download failed:', error);
            setStatus(`Error: ${error.message || 'Download failed.'}`, 'error');
            progressBarContainer.classList.add('hidden');
            progressBar.style.width = '0%';
        } finally {
            downloadBtn.disabled = false;
        }
    });

    urlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            downloadBtn.click();
        }
    });
});
