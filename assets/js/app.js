'use strict';

// --- 1. IMPORTS & CONFIGURATION ---
require('dotenv').config(); // MUST be the first line
const express = require('express');
const path = require('path');
const cors = require('cors');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const express = require('express');
const multer = require('multer');
const path = require('path');
const app = express();
const NodeMediaServer = require('node-media-server'); // <-- FIXED HERE

// --- 2. EXPRESS APP INITIALIZATION ---
const PORT = process.env.PORT || 8081;
const JWT_SECRET = process.env.JWT_SECRET;

// Critical check for security key
if (!JWT_SECRET) {
    console.error("FATAL ERROR: JWT_SECRET is not defined in your .env file. Application cannot start.");
    process.exit(1);
}

// --- 3. MIDDLEWARE SETUP ---
app.use(cors());
app.use(express.json());

// --- 4. REAL-TIME MEDIA SERVER ---
const mediaRoot = path.join(__dirname, 'media_root');
if (!fs.existsSync(mediaRoot)) {
    fs.mkdirSync(mediaRoot, { recursive: true });
}

const nmsConfig = {
    rtmp: {
        port: 1935,
        chunk_size: 60000,
        gop_cache: true,
        ping: 30,
        ping_timeout: 60
    },
    http: {
        port: 8000, // Dedicated port for media streams
        mediaroot: mediaRoot,
        allow_origin: '*'
    },
    trans: {
        ffmpeg: 'C:/ffmpeg/bin/ffmpeg.exe', // IMPORTANT: Verify this path is correct for your system
        tasks: [
            {
                app: 'live',
                hls: true,
                hlsFlags: '[hls_time=2:hls_list_size=3:hls_flags=delete_segments]',
                hls_path: '/live' // Creates stream at /media_root/live/STREAM_KEY
            }
        ]
    }
};
const nms = new NodeMediaServer(nmsConfig);
nms.run();
console.log(`Node Media Server is listening for RTMP on port 1935 and serving HLS on http://localhost:8000`);

// --- 5. MULTER CONFIGURATION for File Uploads ---
const uploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// --- 6. AUTHENTICATION MIDDLEWARE ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"
    if (token == null) return res.sendStatus(401); // Unauthorized

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403); // Forbidden (invalid token)
        req.user = user;
        next();
    });
};

// --- 7. API ROUTES ---
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'admin') { // Use bcrypt.compare in production
        const accessToken = jwt.sign({ username: username }, JWT_SECRET, { expiresIn: '8h' });
        res.json({ accessToken });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

// Example of a protected route
app.get('/api/projects', authenticateToken, (req, res) => {
    res.json([{ id: 1, name: 'Demo Project', user: req.user.username }]);
});

// --- 8. FRONTEND PAGE ROUTING & STATIC FILES ---
const publicDirectoryPath = path.join(__dirname, '../public');

// These explicit routes are checked BEFORE the static middleware
app.get('/', (req, res) => res.sendFile(path.join(publicDirectoryPath, 'login.html')));
app.get('/login', (req, res) => res.sendFile(path.join(publicDirectoryPath, 'login.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(publicDirectoryPath, 'dashboard.html')));
app.get('/map-viewer', (req, res) => res.sendFile(path.join(publicDirectoryPath, 'index.html')));
app.get('/inspection', (req, res) => res.sendFile(path.join(publicDirectoryPath, 'inspection_tool.html')));
app.get('/construction_monitor', (req, res) => res.sendFile(path.join(publicDirectoryPath, 'construction_monitor.html')));

// The static middleware serves CSS, client-side JS, images, etc.
// The { index: false } option prevents it from automatically serving index.html on "/"
app.use(express.static(publicDirectoryPath, { index: false }));

// Final catch-all for any unknown URL redirects to the root (login page)
app.get('*', (req, res) => {
    res.redirect('/');
});

// If serving via a template engine like EJS from a 'views' folder
app.get('/monitoring', (req, res) => {
    // You can pass project-specific data from your database to the template here
    const projectData = {
        projectName: "Project Alpha",
        availableDates: ["2023-10-01", "2023-10-08", "2023-10-15"]
    };
    res.render('construction-monitoring', projectData); // Assumes 'construction-monitoring.ejs'
});

// --- 9. START THE SERVER ---
app.listen(PORT, () => {
    console.log(`AIVA backend server is running on http://localhost:${PORT}`);
});



// --- Multer Configuration for file uploads ---
// This tells multer to store uploaded files in a directory named 'uploads'
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    // Creates a unique filename to prevent overwrites
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
  }
});
const upload = multer({ storage: storage });


// --- Your existing Express app setup ---
// e.g., app.use(express.static('public'));


// --- THE NEW AI DETECTION API ENDPOINT ---
// The frontend will send files to this '/api/detect' route
// 'upload.single('mediaFile')' tells multer to expect one file with the field name 'mediaFile'
app.post('/api/detect', upload.single('mediaFile'), (req, res) => {
    console.log('File received:', req.file);

    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded.' });
    }

    //
    // --- THIS IS WHERE YOUR REAL AI PROCESSING HAPPENS ---
    // For example, you would:
    // 1. Get the path to the uploaded file: `req.file.path`
    // 2. Call a Python script with this file path.
    //    `const { spawn } = require('child_process');`
    //    `const pythonProcess = spawn('python', ['scripts/detect.py', req.file.path]);`
    // 3. Listen for the results from the Python script's standard output.
    // 4. Once you get the JSON results, send them back to the frontend.
    //

    // --- For now, we will just return a "dummy" JSON response after a short delay ---
    console.log('Simulating AI analysis on:', req.file.path);

    setTimeout(() => {
        const dummyDetections = [
            { label: 'Bulldozer', confidence: 0.91, box: [0.15, 0.5, 0.4, 0.3], type: 'vehicle' },
            { label: 'Anomaly: Worker w/o Vest', confidence: 0.85, box: [0.65, 0.4, 0.1, 0.3], type: 'anomaly' },
            { label: 'Scaffolding', confidence: 0.98, box: [0.05, 0.1, 0.8, 0.8], type: 'structure' }
        ];
        
        console.log('Analysis complete. Sending results.');
        res.status(200).json(dummyDetections);

    }, 2500); // Simulate a 2.5 second processing time
});


// --- Your route to serve the main HTML page ---
app.get('/monitoring', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'construction-monitoring.html'));
});

// --- Start the server ---
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
