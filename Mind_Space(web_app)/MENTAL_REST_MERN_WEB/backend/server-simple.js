// Simple server for testing without MongoDB
const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Simple server is running',
    timestamp: new Date().toISOString()
  });
});

// Simple register endpoint (without database)
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  
  // Basic validation
  if (!name || !email || !password) {
    return res.status(400).json({
      message: 'Name, email, and password are required'
    });
  }
  
  if (password.length < 6) {
    return res.status(400).json({
      message: 'Password must be at least 6 characters long'
    });
  }
  
  // Simulate successful registration
  const mockUser = {
    _id: 'mock-user-id',
    name,
    email,
    role: 'user',
    createdAt: new Date().toISOString()
  };
  
  const mockToken = 'mock-jwt-token-' + Date.now();
  
  res.json({
    message: 'Registration successful',
    token: mockToken,
    user: mockUser
  });
});

// Simple login endpoint (without database)
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Basic validation
  if (!email || !password) {
    return res.status(400).json({
      message: 'Email and password are required'
    });
  }
  
  // Simulate successful login
  const mockUser = {
    _id: 'mock-user-id',
    name: 'Test User',
    email,
    role: 'user',
    createdAt: new Date().toISOString()
  };
  
  const mockToken = 'mock-jwt-token-' + Date.now();
  
  res.json({
    message: 'Login successful',
    token: mockToken,
    user: mockUser
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Simple server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔗 This is a test server without MongoDB connection`);
});
