const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8080;

// Allow requests from your frontend domain (replace 'http://localhost:3000' with your actual frontend URL)
app.use(cors({
    origin: 'https://warp-theme-converter.vercel.app/',
    methods: 'POST',
    optionsSuccessStatus: 204, // some legacy browsers (IE11, various SmartTVs) choke on 204
  }));
app.use(express.json());

// Serve the static files from the React app
app.use(express.static(path.join(__dirname, 'build')));

// app.use(express.static('public'));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/upload', upload.single('file'), (req, res) => {
    console.log("yoyo")
    try {
        if (!req.file) {
            return res.status(400).send('No file uploaded.');
        }

        const fileNameWithExtension = req.file.originalname;
        const lastDotIndex = fileNameWithExtension.lastIndexOf('.');
        const fileNameWithoutExtension = fileNameWithExtension.substring(0, lastDotIndex);

        // Save the uploaded file temporarily
        const filePath = path.join(__dirname, 'uploads', fileNameWithoutExtension + '.txt');
        console.log('filePath: ', filePath);
        fs.writeFileSync(filePath, req.file.buffer);

        // Call your Python script with the uploaded file
        const pythonScript = './convert-iterm2-to-warp.py';
        exec(`python ${pythonScript} ${filePath}`, (error, stdout, stderr) => {
            if (error) {
                console.error('Error running Python script:', error);
                return res.status(500).send('Error running Python script.');
            }

            const generatedFileName = fileNameWithoutExtension + '.yaml';
            const yamlFilePath = path.join(__dirname, 'generated', generatedFileName);
            console.log('generatedFileName: ', generatedFileName);

            // Send the download link as the response
            const downloadLink = `/download/${generatedFileName}`;
            res.json({ downloadLink: downloadLink,
                       fileName: fileNameWithoutExtension,
            });

            // Optionally, clean up: Delete the temporary uploaded file
            // fs.unlinkSync(filePath);
        });
    } catch (error) {
        console.error('Error processing upload:', error);
        res.status(500).send('Error processing upload.');
    }
});

app.get('/download/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'generated', filename);
    console.log('filePath: ', filePath)

    // Set the response headers for file download
    res.setHeader('Content-disposition', `attachment; filename=${filename}`);
    res.setHeader('Content-type', 'application/yaml');

    // Send the file as the response
    res.sendFile(filePath);
});

// Handle the root URL to serve the React app
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
