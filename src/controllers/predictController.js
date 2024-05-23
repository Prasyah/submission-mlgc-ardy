const tf = require('@tensorflow/tfjs-node');

async function predict(model, imageBuffer) {
  // Load image and preprocess it here
  const imageTensor = tf.node.decodeImage(imageBuffer);
  // Assuming the model expects a 4D tensor
  const inputTensor = imageTensor.expandDims(0);
  const prediction = model.predict(inputTensor);
  const predictionData = prediction.dataSync();

  // Replace with actual logic
  const label = 'Cancer';
  const suggestion = 'Segera periksa ke dokter!';

  return { label, suggestion };
}

module.exports = { predict };
