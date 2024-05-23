'use strict';

const Hapi = require('@hapi/hapi');
const Boom = require('@hapi/boom');
const loadModel = require('./src/services/loadModel');
const registerRoutes = require('./router'); // Import your routes

const startServer = async () => {
  const server = Hapi.server({
    port: 8080,
    host: 'localhost',
    routes: {
      cors: true,
      validate: {
        failAction: (request, h, err) => {
          throw err;
        }
      }
    }
  });

  // Load model and set as server.app property
  try {
    const model = await loadModel();
    server.app.model = model;
  } catch (error) {
    console.error('Error loading model:', error);
    process.exit(1);
  }

  // Register routes
  registerRoutes(server);

  // Server extension to handle specific errors
  server.ext('onPreResponse', (request, h) => {
    const response = request.response;

    if (Boom.isBoom(response)) {
      if (response.output.statusCode === 413) {
        return h.response({
          status: 'fail',
          message: 'Payload content length greater than maximum allowed: 1000000',
        }).code(413);
      }
    }

    return h.continue;
  });

  // Start the server
  await server.start();
  console.log(`Server running on ${server.info.uri}`);
};

startServer().catch(err => {
  console.error(err);
  process.exit(1);
});
