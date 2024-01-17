// FileUploadForm.tsx
import React, { useState, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';

const FileUploadForm: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);

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
            const response = await axios.post('http://localhost:8080/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            // Handle the response, e.g., display a download link
            console.log(response.data);
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input type="file" onChange={handleFileChange} accept=".txt" required />
            <button type="submit">Upload</button>
        </form>
    );
};

export default FileUploadForm;
