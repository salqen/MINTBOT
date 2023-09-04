document.getElementById('startMinting').addEventListener('click', async () => {
    const statusElement = document.getElementById('status');
    statusElement.textContent = 'Minting started...';
    try {
        const response = await fetch('/start-minting', { method: 'POST' });
        if (response.ok) {
            const result = await response.json();
            statusElement.textContent = result.message;
        } else {
            statusElement.textContent = 'Error occurred while minting.';
        }
    } catch (error) {
        statusElement.textContent = 'Error: ' + error.message;
    }
});
