const predictClassification = require('./infservice');
const crypto = require('crypto');
const storeData = require('../controllers/storeData')

async function postPredictHandler(request, h) {
  const { image } = request.payload;
  const { model } = request.server.app;
 
  const { confidenceScore, label, explanation, suggestion } = await predictClassification(model, image);
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
 
  const data = {
    "id": id,
    "result": label,
    "suggestion": suggestion,
    "createdAt": createdAt
  }
  
  await storeData(id, data);
  const response = h.response({
    status: 'success',
    message:'Model is predicted successfully',
    data
  })
  
  response.code(201);
  return response;
}

async function getPredictHistoriesHandler(request, h) {
    const predictionHistories = [];
  
    return {
      status: 'success',
      data: predictionHistories
    };
  }
 
module.exports = {
    postPredictHandler,
    getPredictHistoriesHandler};