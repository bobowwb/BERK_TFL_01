// Load BERT model from SavedModel format
const bertModel = await tf.loadGraphModel('path/to/saved/model');

// Define a function for tokenizing input text
function tokenize(text, maxLen) {
  const tokenizer = bert.tokenization.getTokenizer();
  const tokens = tokenizer.tokenize(text);
  const inputIds = tokenizer.convertTokensToIds(tokens);
  const attentionMask = Array.from({length: inputIds.length}, () => 1);
  const paddingLength = maxLen - inputIds.length;
  const inputIdsPadded = [...inputIds, ...Array(paddingLength).fill(0)];
  const attentionMaskPadded = [...attentionMask, ...Array(paddingLength).fill(0)];
  return [inputIdsPadded, attentionMaskPadded];
}

// Define a function for encoding input text
function encode(inputs, maxLen) {
  const [inputIds, attentionMask] = tokenize(inputs, maxLen);
  return {
    input_ids: tf.tensor2d([inputIds], [1, maxLen], 'int32'),
    attention_mask: tf.tensor2d([attentionMask], [1, maxLen], 'int32')
  };
}

// Define a function for doing inference on a single input
function predict(input, labels) {
  const logits = bertModel.predict(input);
  const scores = tf.softmax(logits).dataSync();
  const results = {};
  for (let i = 0; i < scores.length; i++) {
    results[labels[i]] = scores[i];
  }
  return results;
}

// Define a function for doing inference on multiple inputs
async function classify(inputs, labels, maxLen) {
  const results = [];
  for (let i = 0; i < inputs.length; i++) {
    const input = encode(inputs[i], maxLen);
    const prediction = predict(input, labels);
    results.push(prediction);
    input.input_ids.dispose();
    input.attention_mask.dispose();
  }
  return results;
}

// // Example usage
// const inputs = ['This is a positive review', 'This is a negative review'];
// const labels = ['positive', 'negative'];
// const maxLen = 128;
// const results = await classify(inputs, labels, maxLen);
// console.log(results);
