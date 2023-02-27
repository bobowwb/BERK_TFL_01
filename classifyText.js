// Classify text
textClassifyForm.addEventListener('submit', async event => {
    event.preventDefault();
    const model = await tf.loadLayersModel('model/model.json');
    const tokenizer = new BertTokenizer();
    const maxLen = 128;
    const text = textInput.value.trim();
    if (!text) return;
    const tokens = tokenizer.encode(text);
    const truncated = tokens.slice(0, maxLen - 2);
    const inputIds = [...truncated, tokenizer.vocab['[SEP]']];
    const paddingLength = maxLen - inputIds.length;
    const inputIdsPadded = [...inputIds, ...Array(paddingLength).fill(tokenizer.vocab['[PAD]'])];
    const attentionMask = [...Array(inputIds.length).fill(1), ...Array(paddingLength).fill(0)];
    const inputTensor = tf.tensor2d([inputIdsPadded], [1, maxLen]);
    const prediction = await model.predict([inputTensor, tf.tensor2d([attentionMask], [1, maxLen])]).array();
    const classification = prediction[0][0] > 0.5 ? 'positive' : 'negative';
    classificationResult.innerText = `The text is classified as ${classification}.`;
  });
  
  // Enable train button on data upload
  dataFileInput.addEventListener('change', () => {
    trainButton.disabled = false;
  });
  