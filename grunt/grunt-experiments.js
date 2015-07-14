var fs = require('fs');
var _ = require('lodash');

function collectExperiments(files, callback) {
    var experimentRegex = /experiment!(.*?)['"]/g;
    var result = [];
    var counter = files.length;
    files.forEach(function (file) {
        fs.readFile(file, function (err, data) {
            if (err) {
                throw err;
            }

            var experiment = experimentRegex.exec(data);
            while (experiment) {
                result.push(experiment[1]);
                experiment = experimentRegex.exec(data);
            }

            counter--;
            if (!counter) {
                callback(_.unique(result));
            }
        });
    });
}

module.exports = function (grunt, options) {
    grunt.registerMultiTask('experiments', 'creates an experiments file', function () {
        var done = this.async();

        this.files.forEach(function (file) {
            grunt.log.writeln('Processing ' + file.src.length + ' files.');

            collectExperiments(file.src, function (experiments) {
                grunt.log.writeln('Found ' + experiments.length + ' experiments.');
                experiments.sort(function (a, b) {
                    return a.toLowerCase().localeCompare(b.toLowerCase());
                });

                fs.writeFile(file.dest, JSON.stringify(experiments, null, 4), function (err) {
                    if (err) {
                        throw err;
                    }
                    done();
                });
            });
        });
    });
};