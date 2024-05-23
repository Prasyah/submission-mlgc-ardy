const Boom = require('@hapi/boom');
const crypto = require('crypto');
const { predict } = require('./src/controllers/predictController');
const { getDataFromFirestore } = require('./src/controllers/dataController');

const Firestore = require('@google-cloud/firestore');
const firestore = new Firestore();

async function storeData(id, data) {
  const predictCollection = firestore.collection('predictions');
  return predictCollection.doc(id).set(data);
}

module.exports = (server) => {
  server.route({
    method: 'POST',
    path: '/predict',
    options: {
      payload: {
        output: 'stream',
        parse: true,
        allow: 'multipart/form-data',
        maxBytes: 1000000, // Limit payload size to 1MB
        multipart: true, // Enable multipart handling
      },
      handler: async (request, h) => {
        try {
          const model = request.server.app.model;
          const file = request.payload.file; // Assume file is passed as 'file'
          if (!file) {
            throw Boom.badRequest('No file uploaded');
          }

          const data = [];
          for await (const chunk of file) {
            data.push(chunk);
          }
          const imageBuffer = Buffer.concat(data);

          const { label, suggestion } = await predict(model, imageBuffer);
          const id = crypto.randomUUID();
          const createdAt = new Date().toISOString();

          const result = {
            id,
            result: label,
            suggestion,
            createdAt,
          };

          await storeData(id, result);

          return h.response({
            status: 'success',
            message: 'Model is predicted successfully',
            data: result,
          }).code(201);
        } catch (err) {
          return Boom.badRequest('Terjadi kesalahan dalam melakukan prediksi');
        }
      },
    },
  });

  server.route({
    method: 'GET',
    path: '/predict/histories',
    handler: async (request, h) => {
      try {
        const data = await getDataFromFirestore();
        return h.response({
          status: 'success',
          data: data,
        }).code(200);
      } catch (error) {
        return Boom.internal('Failed to retrieve data from Firestore');
      }
    },
  });
};
