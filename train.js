//review data
const fs = require('fs');

const reviews = JSON.parse(fs.readFileSync('reviews.json', 'utf-8'));
// Next, add the following code to tokenize the review data using BERT:
// This code uses the BertTokenizer class from the bert package to tokenize each review text. We set maxLen to 128, which is the maximum sequence length that BERT can handle. We truncate any reviews that are longer than 126 tokens (to account for the [CLS] and [SEP] tokens that we'll add later) and pad any reviews that are shorter than 126 tokens with [PAD] tokens.

// The tokenizedReviews array contains an object for each review, with the following properties:

// inputIds: an array of token IDs representing the review text
// attentionMask: an array of 1s and 0s indicating which tokens are part of the review text and which are padding
// label: the sentiment label for the review (0 for negative, 1 for positive)
const { BertTokenizer, TFBertModel } = require('bert');

const tokenizer = new BertTokenizer();
const maxLen = 128;

const tokenizedReviews = reviews.map(review => {
  const tokens = tokenizer.encode(review.text);
  const truncated = tokens.slice(0, maxLen - 2);
  const inputIds = [...truncated, tokenizer.vocab['[SEP]']];
  const paddingLength = maxLen - inputIds.length;
  const inputIdsPadded = [...inputIds, ...Array(paddingLength).fill(tokenizer.vocab['[PAD]'])];
  const attentionMask = [...Array(inputIds.length).fill(1), ...Array(paddingLength).fill(0)];
  return { inputIds: inputIdsPadded, attentionMask, label: review.label };
});
// Next, add the following code to split the data into training and validation sets:
// We set trainSize to 20,000, which means we'll use the first 20,000 reviews for training and the remaining reviews for validation.

const { range } = require('lodash');

const trainSize = 20000;
const trainIndices = new Set(range(trainSize));
const valIndices = new Set(range(trainSize, tokenizedReviews.length));

const trainData = tokenizedReviews.filter((_, i) => trainIndices.has(i));
const valData = tokenizedReviews.filter((_, i) => valIndices.has(i));
// Finally, add the following code to create the BERT model and train it on the data:
const tf = require('@tensorflow/tfjs-node');

const batchSize = 32;
const epochs = 2;

// const model = TFBertModel.fromPretrained('bert-base-uncased');
// const inputIds = tf.keras.layers.Input(shape=(maxLen,), dtype='int32');
// const attentionMask = tf.keras.layers.Input(shape=(maxLen,), dtype='int32');
// const output = model([inputIds, attentionMask]).poolerOutput;
// const outputDense = tf.keras.layers.Dense(1, activation='sigmoid')(output);
// const modelFinal = tf.keras.models.Model(inputs=[inputIds, attentionMask], outputs=outputDense);
// modelFinal.compile(optimizer=tf.keras.optimizers.Adam(),
//                    loss=tf.keras.loss
const model = TFBertModel.fromPretrained('bert-base-uncased');
const inputIds = tf.keras.layers.Input(shape=(maxLen,), dtype='int32');
const attentionMask = tf.keras.layers.Input(shape=(maxLen,), dtype='int32');
const output = model([inputIds, attentionMask]).poolerOutput;
const outputDense = tf.keras.layers.Dense(1, activation='sigmoid')(output);
const modelFinal = tf.keras.models.Model(inputs=[inputIds, attentionMask], outputs=outputDense);

modelFinal.compile(
  optimizer=tf.keras.optimizers.Adam(),
  loss=tf.keras.losses.BinaryCrossentropy(),
  metrics=[tf.keras.metrics.BinaryAccuracy()]
);
