const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const { doubleCsrf } = require('csrf-csrf');
const { body, validationResult } = require('express-validator');

const app = express();
const PORT = process.env.PORT || 3000;


// Security Middleware
app.use(helmet());// Basic security headers
app.use(express.json());// Parses JSON data for Part 3
app.use(cookieParser());


// CSRF Protection setup
const { generateToken, doubleCsrfProtection } = doubleCsrf({
    getSecret: () => "A secret key, which normall would be stored in a .env file",
    cookieName: "x-csrf-token",
    cookieOptions: { sameSite: "strict", secure: false },
});

// Serve static files from the current directory
app.use(express.static(path.join(__dirname)));

const handleErrors = (err, req, res, next) => {
    console.error(`[Error Log]: ${err.message}`);
    const status = err.code === 'EBADCSRFTOKEN' ? 403 : (err.status || 500);
    res.status(status).json({
        success: false,
        error: status === 403 ? 'Form tampered with (CSRF)' : 'Internal Server Error'
    });
};

app.get('/api/projects', (req, res, next) => {
    try {
        const projectData = require('./projects.json');
        res.json(projectData);
    } catch (error) {
        next(new Error('Could not retrieve project data'));
    }
});

app.get('/api/csrf-token', (req, res) => {
    res.json({ csrfToken: generateToken(req, res) });
});

// Secure contact form handling with validation
app.post('/api/contact', doubleCsrfProtection, [
    body('email').isEmail().normalizeEmail(),
    body('comments').trim().escape().isLength({ min: 1 })
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    res.status(200).send({ message: 'Data processed and stored securely' });
});

app.use(handleErrors);

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});