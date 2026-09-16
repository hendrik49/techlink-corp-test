import React, { useRef, useState } from "react";
import Tesseract from "tesseract.js";

export default function IDScanner() {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [detectedCode, setDetectedCode] = useState("");

    // Start camera
    const startCamera = async () => {
        let stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
        videoRef.current.play();
    };

    // Capture image and scan text
    const captureAndScan = async () => {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        const context = canvas.getContext("2d");

        // Draw video frame into canvas
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert canvas image to data url
        const imageData = canvas.toDataURL("image/png");

        // OCR scan
        const result = await Tesseract.recognize(imageData, "eng");

        const text = result.data.text;
        console.log("Scanned Text:", text);

        // Extract 4-digit code
        const match = text.match(/\b\d{1,10}\b/);

        if (match) {
            const code = match[0];
            console.log("Detected Code:", code);
            setDetectedCode(code);
        } else {
            console.log("No code found");
            setDetectedCode("No code found!");
        }
    };

    return (
        <div style={{ textAlign: "center", padding: "20px" }}>
            <h2>Scan Code from Camera</h2>

            <video ref={videoRef} style={{ width: "300px", border: "2px solid #000" }}></video>
            <br /><br />

            <button onClick={startCamera}>Start Camera</button>
            <button onClick={captureAndScan}>Capture & Scan</button>

            <canvas ref={canvasRef} style={{ display: "none" }}></canvas>

            <h3>Detected Code: {detectedCode}</h3>
        </div>
    );
}
