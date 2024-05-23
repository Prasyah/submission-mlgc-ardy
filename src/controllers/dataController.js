const Firestore = require('@google-cloud/firestore');

const firestore = new Firestore();

async function getDataFromFirestore() {
  const predictCollection = firestore.collection('predictions');
  const snapshot = await predictCollection.get();
  const data = snapshot.docs.map(doc => doc.data());
  return data;
}

module.exports = { getDataFromFirestore };
