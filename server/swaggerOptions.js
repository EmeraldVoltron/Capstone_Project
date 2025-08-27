module.exports = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Budget API',
      version: '1.0.0',
      description: 'Tracks transactions & categories',
    },
    servers: [
      { url: process.env.SERVER_URL || 'http://localhost:5000' }
    ],
  },
  apis: ['./routes/*.js'],  // all JSDoc scanned here
};
