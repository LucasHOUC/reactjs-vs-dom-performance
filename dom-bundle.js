(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var executionTimes = [],
    startTime = null;

//init objects for IE
if (!performance.now) {
    performance.now = function () {
        return new Date().getTime();
    };
}
if (!window.console) {
    window.console = {
        log: function log() {}
    };
}

//Read url params for: maxRows
function getMaxRows() {
    var result = 500;
    var loc = location.search.slice(1);
    if (loc) {
        var params = {};
        var tokens = loc.split('&');
        tokens.forEach(function (token) {
            var bits = token.split('=');
            params[bits[0].toLowerCase()] = bits[1];
        });
        if (params['maxRows'.toLowerCase()]) {
            result = parseInt(params['maxRows'.toLowerCase()], 10);
        }
    }
    console.log("getMaxRows(): ", result);
    return result;
}

//////////////

module.exports = {

    maxRows: getMaxRows(),
    pageSize: 50,
    updateEvery: 750,
    rows: [],

    runApp: function runApp(renderNext) {

        if (!startTime) {
            startTime = performance.now();
        }

        var _lib = this;

        var updateInterval = setInterval(function () {

            if (_lib.rows.length < _lib.maxRows) {

                //Simulate that user 'scrolled' to bottom
                _lib.scrollToBottom();

                // simulate updating model with server results, after a scroll

                var pageSet = _lib.getNextPageSet();
                _lib.rows = _lib.rows.concat(pageSet);

                var t0 = performance.now();

                renderNext(pageSet, _lib.rows);

                var t1 = performance.now();

                _lib.addExecutionTime(t1 - t0);
            } else {
                clearInterval(updateInterval);

                _lib.printSummary();
            }
        }, _lib.updateEvery);
    },

    addExecutionTime: function addExecutionTime(time) {
        executionTimes.push(time);
    },

    getNextPageSet: function getNextPageSet() {

        var pageSet = [];
        var last = this.rows[this.rows.length - 1];

        for (var i = 0; i < this.pageSize; i++) {
            var id = (last ? last.id : 0) + 1;
            var row = {
                id: id,
                rowNum: id,
                artist: 'Artist ' + id,
                album: 'Album ' + id
            };

            last = row;

            pageSet.push(row);
        }

        return pageSet;
    },

    mean: function mean(sequence) {
        var sum = 0;
        sequence.forEach(function (val) {
            sum += val;
        });
        return sum / sequence.length;
    },

    median: function median(sequence) {
        //copy
        sequence = sequence.slice();
        // note that direction doesn't matter
        sequence.sort(this.sortAscending);
        if (sequence.length >= 3) {
            return sequence[Math.ceil(sequence.length / 2)];
        }
        return sequence[0];
    },

    printSummary: function printSummary() {

        executionTimes.sort(this.sortAscending);

        var meanValue = this.mean(executionTimes).toFixed(4);
        var medianValue = this.median(executionTimes).toFixed(4);
        var finalTime = performance.now();
        var totalTime = (finalTime - startTime).toFixed(4);

        var stats = ["------------------------------", "Execution completed with parameters: ", "maxRows: " + this.maxRows, "------------------------------", 'Execution times: ' + executionTimes, 'Avg. time: ' + meanValue + 'ms', 'Median time: ' + medianValue + 'ms', 'Total time: ' + totalTime + 'ms, ' + (totalTime / 1000).toFixed(2) + 's'];

        var div = document.createElement('div');
        div.innerHTML = stats.join('<br/>');
        document.body.appendChild(div);

        this.scrollToBottom();
    },

    scrollToBottom: function scrollToBottom() {
        var docHeight = document.body.offsetHeight;
        docHeight = docHeight == undefined ? window.document.documentElement.scrollHeight : docHeight;

        window.scrollTo(0, docHeight);
    },

    sortAscending: function sortAscending(a, b) {
        return a - b;
    }
};

},{}],2:[function(require,module,exports){
'use strict';

var lib = require('./common.js');

//////

var table = document.getElementById('item_table_body');

var rows = [];

lib.runApp(function (pageSet, allRows) {
    // simulate updating model with server results, after a scroll
    pageSet.forEach(function (row) {
        writeRow(row);
    });
});

function writeRow(row) {
    var tr = document.createElement('tr');
    tr.innerHTML = "<td>" + row.rowNum + "</td>" + "<td>&nbsp;</td>" + "<td>" + row.artist + "</td>" + "<td>" + row.album + "</td>";
    table.appendChild(tr);
}

},{"./common.js":1}]},{},[2]);
