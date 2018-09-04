const glob = require('glob');
const fs = require('fs');
const path = require('path');
const uniq = require('lodash.uniq');
const shell = require('shelljs');

const getExperiments = root => (
  new Promise(resolve => {
    const options = {
      root,
      ignore: ['**/*.unit.js', '**/*.spec.js'],
    };

    glob('/packages/**/*.js', options, (err, files) => {
      const experimentRegex = /experiment\.isOpen\(['"](.*?)['"]\)/g;
      const result = [];
      let counter = files.length;
      files.forEach(file => {
        fs.readFile(file, (error, data) => {
          if (error) {
            // return;
            throw file;
          }

          let experiment = experimentRegex.exec(data);
          while (experiment) {
            result.push(experiment[1]);
            experiment = experimentRegex.exec(data);
          }

          counter--;
          if (!counter) {
            resolve(uniq(result));
          }
        });
      });
    });
  })
);

const packageRegEx = /.*packages\/(.*)/;
const getPackages = root => {
  const packages = shell.ls('-d', path.join(root, 'packages', '*')).stdout.split('\n').slice(0, -1);
  return packages.map(packagePath => packageRegEx.exec(packagePath)[1]);
};

const createConfig = (output, project) => {
  let outputDirectory = path.join(__dirname, '..', 'src', 'generated');
  if (!fs.existsSync(outputDirectory)) {
    fs.mkdirSync(outputDirectory);
  }

  const root = '/Users/Nir_Natan/Projects';
  return getExperiments(path.join(root, project))
    .then(experiments => (
      new Promise(res => {
        const content = `/* eslint-disable */
        module.exports = ${JSON.stringify({
          packages: getPackages(path.join(root, project)),
          experiments,
        })};`;
        fs.writeFile(path.join(outputDirectory, output), content, res);
      })
    ));
};

const [,, output, project] = process.argv;
createConfig(output, project);
