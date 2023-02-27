import textReader from "./textReader";


document.getElementById("upload").addEventListener("click",async function(){
    const fileInput = document.querySelector('#data-file');
    const aFiles = fileInput.files; // Get all selected files

    const aText = await textReader.readBulkFiles(aFiles);
  });
