const tf = require('@tensorflow/tfjs-node');

async function loadModel() {
  return tf.loadGraphModel('https://storage.googleapis.com/ml-model-mlgc-ardy/submissions-model/model.json');
}

module.exports = loadModel;
