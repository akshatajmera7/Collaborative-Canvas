const WebSocket = require('ws');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const app = express();
const JWT_SECRET = 'your-secret-key'; // In production, use environment variable

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/canvas_app', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((error) => {
    console.error('MongoDB connection error:', error);
});

// User Schema
const userSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true }
});

// Create User model - Fixed the model creation
const User = mongoose.model('User', userSchema);

// Canvas State Schema
const canvasStateSchema = new mongoose.Schema({
    rectangles: { type: Array, default: [] },
    timestamp: { type: Date, default: Date.now }
});

// Create CanvasState model
const CanvasState = mongoose.model('CanvasState', canvasStateSchema);

app.use(cors());
app.use(express.json());

// Authentication endpoints
app.post('/api/signup', async (req, res) => {
    try {
        const { username, password } = req.body;
        const existingUser = await User.findOne({ username });
        
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, password: hashedPassword });
        await user.save();

        const token = jwt.sign({ userId: user._id }, JWT_SECRET);
        res.json({ token, message: 'User created successfully' });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Error creating user' });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ message: 'Invalid password' });
        }

        const token = jwt.sign({ userId: user._id }, JWT_SECRET);
        res.json({ token, message: 'Logged in successfully' });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Error logging in' });
    }
});

// Start HTTP server
const server = app.listen(3000, () => {
    console.log('HTTP Server running on port 3000');
});

// WebSocket server
const wss = new WebSocket.Server({ port: 8080 });

let canvasState = [];

// Store connected clients with their authentication status
const clients = new Map();

wss.on('connection', async (ws) => {
    console.log('New WebSocket connection');
    let isAuthenticated = false;
    let username = null;

    ws.on('message', async (message) => {
        try {
            const msg = JSON.parse(message);

            if (msg.type === 'auth') {
                try {
                    const decoded = jwt.verify(msg.token, JWT_SECRET);
                    const user = await User.findById(decoded.userId);
                    if (user) {
                        isAuthenticated = true;
                        username = user.username;
                        clients.set(ws, { username });
                        
                        // Load latest canvas state
                        const latestState = await CanvasState.findOne().sort({ _id: -1 });
                        if (latestState) {
                            canvasState = latestState.rectangles;
                        }
                        
                        ws.send(JSON.stringify({ 
                            type: 'init', 
                            data: canvasState,
                            message: `Authenticated as ${username}`
                        }));
                        console.log(`User ${username} authenticated`);
                    }
                } catch (error) {
                    console.error('Authentication error:', error);
                    ws.send(JSON.stringify({ type: 'error', message: 'Authentication failed' }));
                }
            } else if (isAuthenticated && msg.type === 'update') {
                canvasState = msg.data;
                
                // Save to database
                try {
                    const newState = new CanvasState({ rectangles: canvasState });
                    await newState.save();

                    // Broadcast to all authenticated clients
                    wss.clients.forEach(client => {
                        if (client !== ws && client.readyState === WebSocket.OPEN && clients.has(client)) {
                            client.send(JSON.stringify({ 
                                type: 'update', 
                                data: canvasState,
                                username: username
                            }));
                        }
                    });
                } catch (error) {
                    console.error('Error saving canvas state:', error);
                }
            }
        } catch (error) {
            console.error('WebSocket message error:', error);
        }
    });

    ws.on('close', () => {
        console.log(`${username || 'Anonymous'} disconnected`);
        clients.delete(ws);
    });
});

console.log('WebSocket server is running on ws://localhost:8080');