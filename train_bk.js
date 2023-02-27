const fs = require('fs');
const { BertTokenizer, TFBertModel } = require('bert');
const { range } = require('lodash');
const tf = require('@tensorflow/tfjs-node');

const tokenizer = new BertTokenizer();
const maxLen = 128;
const batchSize = 32;
const epochs = 2;

const reviews = JSON.parse(fs.readFileSync('reviews.json', 'utf-8'));

const tokenizedReviews = reviews.map(review => {
  const tokens = tokenizer.encode(review.text);
  const truncated = tokens.slice(0, maxLen - 2);
  const inputIds = [...truncated, tokenizer.vocab['[SEP]']];
  const paddingLength = maxLen - inputIds.length;
  const inputIdsPadded = [...inputIds, ...Array(paddingLength).fill(tokenizer.vocab['[PAD]'])];
  const attentionMask = [...Array(inputIds.length).fill(1), ...Array(paddingLength).fill(0)];
  return { inputIds: inputIdsPadded, attentionMask, label: review.label };
});

const trainSize = 20000;
const trainIndices = new Set(range(trainSize));
const valIndices = new Set(range(trainSize, tokenizedReviews.length));

const trainData = tokenizedReviews.filter((_, i) => trainIndices.has(i));
const valData = tokenizedReviews.filter((_, i) => valIndices.has(i));

const model = TFBertModel.fromPretrained('bert-base-uncased');
const inputIds = tf.keras.layers.Input(shape=(maxLen,), dtype='int32');
const attentionMask = tf.keras.layers.Input(shape=(maxLen,), dtype='int32');
const output = model([inputIds, attentionMask]).poolerOutput;
const outputDense = tf.keras.layers.Dense(1, activation='sigmoid')(output);
const modelFinal = tf.keras.models.Model(inputs=[inputIds, attentionMask], outputs=outputDense);
modelFinal.compile(optimizer=tf.keras.optimizers.Adam(),
                   loss=tf.keras.losses.BinaryCrossentropy(),
                   metrics=[tf.keras.metrics.BinaryAccuracy()]);
                   
const trainDataset = tf.data.generator(() => {
  const indices = tf.data.array(trainIndices);
  return indices.shuffle(trainSize).batch(batchSize).map(i => {
    const batch = trainData.slice(i[0], i[i.length - 1] + 1);
    const inputIdsBatch = tf.tensor(batch.map(x => x.inputIds));
    const attentionMaskBatch = tf.tensor(batch.map(x => x.attentionMask));
    const labelBatch = tf.tensor(batch.map(x => x.label));
    return {inputIds: inputIdsBatch, attentionMask: attentionMaskBatch, label: labelBatch};
  });
});

const valDataset = tf.data.generator(() => {
  const indices = tf.data.array(valIndices);
  return indices.shuffle(tokenizedReviews.length - trainSize).batch(batchSize).map(i => {
    const batch = valData.slice(i[0], i[i.length - 1] + 1);
    const inputIdsBatch = tf.tensor(batch.map(x => x.inputIds));
    const attentionMaskBatch = tf.tensor(batch.map(x => x.attentionMask));
    const labelBatch = tf.tensor(batch.map(x => x.label));
    return {inputIds: inputIdsBatch, attentionMask: attentionMaskBatch, label: labelBatch};
  });
});

const trainSteps = trainSize / batchSize;
const valSteps = (tokenizedReviews.length - trainSize) / batchSize;

modelFinal.fit(trainDataset, {
    epochs: epochs,
    stepsPerEpoch: trainSteps,
    validation_data: valDataset,
    validation_steps: valSteps,
  });
  
  // Save the model
  modelFinal.save('model');
  