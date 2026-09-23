const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const { doubleCsrf } = require('csrf-csrf');
const { body, validationResult } = require('express-validator');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());


app.use(
    helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" },
        contentSecurityPolicy:false,
    })
);
app.use(express.json());
app.use(cookieParser());


const { generateCsrfToken, doubleCsrfProtection } = doubleCsrf({
    getSecret: () => "your_secure_secret_key",
    getSessionIdentifier: (req) => req.ip,
    cookieName: "x-csrf-token",
    cookieOptions: { sameSite: "lax", secure: false },
    getCsrfTokenFromRequest: (req) => req.headers["csrf-token"],
});


app.get('/api/projects', (req, res) => {
    try {
        const projectData = require('./projects.json');
        res.json(projectData);
    } catch (error) {
        res.status(500).json({ error: "Could not retrieve project data. Ensure projects.json exists." });
    }
});


app.get('/api/csrf-token', (req, res) => {
    try {
        const token = generateCsrfToken(req, res);
        res.json({ csrfToken: token });
    } catch (err) {
        res.status(500).json({ error: "Failed to generate token" });
    }
});

app.post('/api/projects', doubleCsrfProtection, [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('desc').trim().notEmpty().withMessage('Description is required'),
    body('tech').custom((value) => {
        if (!Array.isArray(value) || value.length === 0) {
            throw new Error('At least one technology is required');
        }
        return true;
    }),
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    res.status(200).json({ message: 'Project added successfully' });
});

// Serve static files
app.use(express.static(path.join(__dirname)));

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));