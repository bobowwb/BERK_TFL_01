const dataUploadForm = document.getElementById('data-upload-form');
const trainModelForm = document.getElementById('train-model-form');
const textClassifyForm = document.getElementById('text-classify-form');
const dataFileInput = document.getElementById('data-file-input');
const textInput = document.getElementById('text-input');
const classificationResult = document.getElementById('classification-result');
const trainButton = document.getElementById('train-button');

// Upload data
dataUploadForm.addEventListener('submit', event => {
  event.preventDefault();
  const file = dataFileInput.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.readAsText(file);
  reader.onload = async event => {
    const reviews = JSON.parse(event.target.result);
    const positiveReviews = reviews.filter(review => review.sentiment === 'positive').map(review => review.review);
    const negativeReviews = reviews.filter(review => review.sentiment === 'negative').map(review => review.review);
    const tokenizer = new BertTokenizer();
    const maxLen = 128;
    const batchSize = 32;
    const positiveTokens = positiveReviews.map(review => tokenizer.encode(review));
    const negativeTokens = negativeReviews.map(review => tokenizer.encode(review));
    const tokenizedReviews = [...positiveTokens.map(tokenizedReview => [tokenizedReview, 1]), ...negativeTokens.map(tokenizedReview => [tokenizedReview, 0])];
    const inputIdsPadded = tokenizedReviews.map(review => {
      const inputIds = [...review[0], tokenizer.vocab['[SEP]']];
      const paddingLength = maxLen - inputIds.length;
      const attentionMask = [...Array(inputIds.length).fill(1), ...Array(paddingLength).fill(0)];
      return [...inputIds, ...Array(paddingLength).fill(tokenizer.vocab['[PAD]'])];
    });
    const trainDataset = tf.data.generator(() => {
      tf.util.shuffle(tokenizedReviews);
      const inputIds = tokenizedReviews.map(review => review[0]);
      const attentionMask = tokenizedReviews.map(review => review[1]);
      const labels = tokenizedReviews.map(review => review[2]);
      const numBatches = Math.ceil(inputIds.length / batchSize);
      return tf.data.zip({xs: tf.data.array(inputIds), ys: tf.data.array(labels), mask: tf.data.array(attentionMask)}).batch(batchSize).take(numBatches);
    });
    const trainSteps = Math.ceil(reviews.length / batchSize);
    const model = await tf.loadLayersModel('model/model.json');
    await model.fit(trainDataset, {
      epochs: 2,
      stepsPerEpoch: trainSteps
    });
    await model.save('downloads://model');
    alert('Model trained successfully and saved!');
  };
});

module.exports = 