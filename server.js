const express = require('express');
const cors = require('cors'); // Import the cors middleware
const multer = require('multer');
const { exec } = require('child_process');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// Use the cors middleware
app.use(cors());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.json());
app.use(express.static('public'));

app.post('/upload', upload.single('file'), (req, res) => {
    console.log("original file name is: ", req.file.originalname)
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const fileNameWithExtension = req.file.originalname
    const lastDotIndex = fileNameWithExtension.lastIndexOf('.');
    const fileNameWithoutExtension2 = fileNameWithExtension.substring(0, lastDotIndex);

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

        const generatedFileName = fileNameWithoutExtension2 + '.yaml'
        const yamlFilePath = './generated/' + generatedFileName;
        console.log('generatedFileName: ', generatedFileName)
        res.download(yamlFilePath, generatedFileName, (downloadError) => {
            if (downloadError) {
                console.error('Error sending generated YAML:', downloadError);
                res.status(500).send('Error sending generated YAML.');
            }

            // Clean up: Delete the temporary uploaded file
            // require('fs').unlinkSync(filePath);
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
