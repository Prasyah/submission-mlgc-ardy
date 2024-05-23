require('dotenv').config();
 
const Hapi = require('@hapi/hapi');
const routes = require('./router');
const loadModel = require('../services/loadModel');
const InputError = require('../exceptions/InputError');
 
(async () => {
    const server = Hapi.server({
        port: 3000,
        host: '0.0.0.0',
        routes: {
            cors: {
              origin: ['*'],
            },
            payload: {
                multipart: true, 
                maxBytes: 1000000,
            }
        },
    });
 
    const model = await loadModel();
    server.app.model = model;
 
    server.route(routes);
 
    server.ext('onPreResponse', function (request, h) {
        const response = request.response;
    
        if (response instanceof InputError) {
            const newResponse = h.response({
                status: 'fail',
                message: `${response.message}`,
            })
            newResponse.code(response.output.statusCode)
            return newResponse;
        }
    
        if (response.isBoom) {
            const statusCode = response.output.statusCode;
            if (statusCode === 400) {
                return h.response({
                    status: 'fail',
                    message: 'Terjadi kesalahan dalam melakukan prediksi'
                }).code(statusCode);
            }
            if (statusCode === 413) {
                return h.response({
                    status: 'fail',
                    message: 'Payload content length greater than maximum allowed: 1000000'
                }).code(statusCode);
            }
        }
    
        return h.continue;
    });
 
    await server.start();
    console.log(`Server start at: ${server.info.uri}`);
})();