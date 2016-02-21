define(['jquery', 'lodash'], function ($, _) {
    "use strict";

    return {
        getAsJson: function (id) {
            return new Promise(function (resolve, reject) {
                $.ajax({
                    url: 'https://spreadsheets.google.com/feeds/cells/' + id + '/od6/public/basic?alt=json',
                    dataType: "json",
                    success: function (response) {
                        var entry = response.feed.entry;
                        var numOfColumns = _.findIndex(entry, function (e) {
                            return /R(\d)C\d/.exec(e.id.$t)[1] === '2';
                        });

                        var content = _.map(entry, 'content.$t');

                        var data = [];
                        var index = numOfColumns;
                        while (index < content.length) {
                            var row = {};
                            for (var i = 0; i < numOfColumns; i++, index++) {
                                var key = content[i];
                                row[key] = content[index];
                            }
                            data.push(row);
                        }

                        resolve(data);
                    },
                    error: reject
                });
            });
        }
    };
});