import React, { useState, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';

const FileUploadForm: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [downloadLink, setDownloadLink] = useState<string | null>(null);
    const [fileName, setFileName]= useState<string>("");

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setFile(event.target.files[0]);
        }
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!file) {
            console.error('No file selected.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('https://warp-theme-converter.vercel.app/api/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setDownloadLink(response.data.downloadLink);
            setFileName(response.data.fileName);
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    };

    const handleDownload = async () => {
        if (downloadLink) {
            try {
                const blob = await fetch(downloadLink).then((res) => res.blob());
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName + '.yaml';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            } catch (error) {
                console.error('Error downloading YAML:', error);
            }
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <input type="file" onChange={handleFileChange} accept=".txt" required />
                <button type="submit">Upload</button>
            </form>

            {downloadLink && (
                <button onClick={handleDownload}>Download YAML</button>
            )}
        </div>
    );
};

export default FileUploadForm;
