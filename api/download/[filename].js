const path = require('path');
const fs = require('fs');

module.exports = async (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join('/tmp', filename);

        // Set the response headers for file download
        res.setHeader('Content-disposition', `attachment; filename=${filename}`);
        res.setHeader('Content-type', 'application/yaml');

        // Send the file as the response
        res.sendFile(filePath);
    } catch (error) {
        console.error('Error processing download:', error);
        res.status(500).send('Error processing download.');
    }
};