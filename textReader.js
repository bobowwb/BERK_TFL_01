const RD = {
  delay:function (ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },
  getFileContent: async function(oFile) {
    return new Promise((resolve, reject) => {
      RD.delay(500);
      const reader = new FileReader();
      RD.delay(500);
      reader.readAsText(oFile);
      RD.delay(500);
      reader.onload = function(e) {
        RD.delay(500);
        const content = e.target.result;
        RD.delay(500);
        resolve(content);
      }
      
      try {
        reader.onerror = function(e) {
          throw new Error('Error while reading file.');
        }
      } catch(error) {
        reject(error);
      }
      
    });
  },
  readFileObjects:async function* (aFileObjectArray) {
    for (let i = 0; i < aFileObjectArray.length; i++) {
      RD.delay(500);
      const text = await RD.getFileContent(aFileObjectArray[i]);
      RD.delay(500);
      yield text;
      RD.delay(500);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
}

async function readTextFileIncrementally(aFileObjectArray) {
  console.log("readTextFileIncrementally called");
  RD.delay(500);
  console.time("readTextFileIncrementally");
  RD.delay(500);
  const fileArray = [...aFileObjectArray];
  RD.delay(500);
  const promises = fileArray.map(RD.getFileContent);
  RD.delay(500);
  const fileContents = await Promise.all(promises);
  RD.delay(500);
  const textArray = await Promise.all(fileContents.map(async f => {
    RD.delay(500);
    console.log("Before parseFromString()");
    RD.delay(500);
    const parser = new DOMParser();
    RD.delay(500);
    console.log("After parseFromString()");
    RD.delay(500);
    return parser.parseFromString(f, 'text/html').body.textContent;
  }));
  console.timeEnd("readTextFileIncrementally");
  console.log(textArray);
  return textArray;
}

module.exports = {
  readBulkFiles:readTextFileIncrementally
}