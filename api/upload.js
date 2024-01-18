const cors = require('cors');
const multer = require('multer');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const corsHandler = cors({
    origin: ['https://warp-theme-converter.vercel.app/', 'http://localhost:3000'],
    methods: 'POST',
    optionsSuccessStatus: 204,
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

module.exports = async (req, res) => {
    corsHandler(req, res, async () => {
        try {
            if (!req.file) {
                return res.status(400).send('No file uploaded.');
            }

            const fileNameWithExtension = req.file.originalname;
            const lastDotIndex = fileNameWithExtension.lastIndexOf('.');
            const fileNameWithoutExtension = fileNameWithExtension.substring(0, lastDotIndex);

            // Save the uploaded file temporarily
            const filePath = path.join(__dirname, 'uploads', fileNameWithoutExtension2 + '.txt');
            console.log('filePath: ', filePath)
            const buffer = req.file.buffer;
            require('fs').writeFileSync(filePath, buffer);

            // Call your Python script with the uploaded file
            const pythonScript = './convert-iterm2-to-warp.py';
            exec(`python ${pythonScript} ${filePath}`, (error, stdout, stderr) => {
                if (error) {
                    console.error('Error running Python script:', error);
                    return res.status(500).send('Error running Python script.');
                }

                const generatedFileName = fileNameWithoutExtension + '.yaml';
                const yamlFilePath = path.join('/tmp', generatedFileName);

                // Send the download link as the response
                const downloadLink = `/api/download/${generatedFileName}`;
                res.json({
                    downloadLink: downloadLink,
                    fileName: fileNameWithoutExtension,
                });

                // Optionally, clean up: Delete the temporary uploaded and generated files
                fs.unlinkSync(filePath);
                fs.unlinkSync(yamlFilePath);
            });
        } catch (error) {
            console.error('Error processing upload:', error);
            res.status(500).send('Error processing upload.');
        }
    });
};
