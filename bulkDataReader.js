const fs = require('fs');

function* readAndBuildDataFile(filename, batchSize) {
  const fileStream = fs.createReadStream(filename, { encoding: 'utf8' });
  let buffer = '';

  for await (const chunk of fileStream) {
    buffer += chunk;
    while (buffer.includes('\n')) {
      const newlineIndex = buffer.indexOf('\n');
      const line = buffer.slice(0, newlineIndex);
      buffer = buffer.slice(newlineIndex + 1);

      const data = JSON.parse(line);
      yield data;

      if (batchSize && batchSize > 0 && ++count % batchSize === 0) {
        console.log(`Read ${count} lines from ${filename}`);
      }
    }
  }

  if (buffer.length > 0) {
    const data = JSON.parse(buffer);
    yield data;
  }
}

module.exports = readAndBuildDataFile;
