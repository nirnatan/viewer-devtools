const fileSystem = require('fs');
const path = require('path');
const archiver = require('archiver');

const [,, src, dest] = process.argv;
if (!fileSystem.existsSync(dest)) {
  fileSystem.mkdirSync(path.parse(dest).dir);
}

const output = fileSystem.createWriteStream(dest);
const archive = archiver('zip');

output.on('close', () => {
  console.log(`${archive.pointer()} total bytes`);
  console.log('archiver has been finalized and the output file descriptor has closed.');
});

archive.on('error', (err) => {
  throw err;
});

archive.pipe(output);
archive.directory(src);
archive.finalize();
