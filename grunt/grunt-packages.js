var fs = require('fs');
var _ = require('lodash');

module.exports = function (grunt, options) {
    grunt.registerMultiTask('packages', 'creates an packages file', function () {
        var done = this.async();

        var packageNameRegex = /packages\/(.*?)\//;
        _.each(this.files, function (file) {
            var packages = _(file.src)
                .transform(function (acc, name) {
                    var packageName = name.match(packageNameRegex)[1];
                    if (packageName) {
                        acc[packageName] = false;
                    }
                }, {})
                .keys()
                .value();

            grunt.log.writeln('Found ' + packages.length + ' packages.');

            fs.writeFile(file.dest, JSON.stringify(packages, null, 4), function (err) {
                if (err) {
                    throw err;
                }
                done();
            });
        });
    });
};