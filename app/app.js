'use strict';

// Declare app level module which depends on views, and components
var app = angular.module('hindsightInvesting', [
  'ngRoute',
  'myApp.view1',
  'myApp.view2',
  'myApp.version',
  'ui.bootstrap',
  'chart.js',
  'hindsightInvesting.investments',
  'ngMaterial'
]).
config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
  $locationProvider.hashPrefix('!');

      $routeProvider
          .when('/investments', {
            controller: 'InvestmentsCtrl',
            templateUrl: '/investments/investments.html'
          })
          .otherwise({
            redirectTo: '/investments'
          });
}]);


app.run(function($rootScope) {
  //app util functions
  $rootScope.UTIL = {

    toFilename: function(filename) {
      return filename
          .toLowerCase()
          .replace(/ /g,'-')
          .replace(/[^\w-]+/g,'');
    },

    fromFilename: function(filename) {
      return filename
          .toLowerCase()
          .replace(/[^\w ]+/g,'')
          .replace(/ +/g,'-');
    },

    // Source: http://www.bennadel.com/blog/1504-Ask-Ben-Parsing-CSV-Strings-With-Javascript-Exec-Regular-Expression-Command.htm
    // This will parse a delimited string into an array of
    // arrays. The default delimiter is the comma, but this
    // can be overriden in the second argument.

    csv2Json: function CSV2JSON(csv) {

      function CSVToArray(strData, strDelimiter) {
        // Check to see if the delimiter is defined. If not,
        // then default to comma.
        strDelimiter = (strDelimiter || ",");
        // Create a regular expression to parse the CSV values.
        var objPattern = new RegExp((
          // Delimiters.
        "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +
          // Quoted fields.
        "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
          // Standard fields.
        "([^\"\\" + strDelimiter + "\\r\\n]*))"), "gi");
        // Create an array to hold our data. Give the array
        // a default empty first row.
        var arrData = [[]];
        // Create an array to hold our individual pattern
        // matching groups.
        var arrMatches = null;
        // Keep looping over the regular expression matches
        // until we can no longer find a match.
        while (arrMatches = objPattern.exec(strData)) {
          // Get the delimiter that was found.
          var strMatchedDelimiter = arrMatches[1];
          // Check to see if the given delimiter has a length
          // (is not the start of string) and if it matches
          // field delimiter. If id does not, then we know
          // that this delimiter is a row delimiter.
          if (strMatchedDelimiter.length && (strMatchedDelimiter != strDelimiter)) {
            // Since we have reached a new row of data,
            // add an empty row to our data array.
            arrData.push([]);
          }
          // Now that we have our delimiter out of the way,
          // let's check to see which kind of value we
          // captured (quoted or unquoted).
          if (arrMatches[2]) {
            // We found a quoted value. When we capture
            // this value, unescape any double quotes.
            var strMatchedValue = arrMatches[2].replace(
                new RegExp("\"\"", "g"), "\"");
          } else {
            // We found a non-quoted value.
            var strMatchedValue = arrMatches[3];
          }
          // Now that we have our value string, let's add
          // it to the data array.
          arrData[arrData.length - 1].push(strMatchedValue);
        }
        // Return the parsed data.
        return (arrData);
      }

      var array = CSVToArray(csv);
      var objArray = [];
      for (var i = 1; i < array.length; i++) {
        objArray[i - 1] = {};
        for (var k = 0; k < array[0].length && k < array[i].length; k++) {
          var key = array[0][k];
          objArray[i - 1][key] = array[i][k]
        }
      }

      var json = JSON.stringify(objArray);
      var str = json.replace(/},/g, "},\r\n");

      return str;
    },

    csvToArray: function CSVToArray(strData, strDelimiter) {
      // Check to see if the delimiter is defined. If not,
      // then default to comma.
      strDelimiter = (strDelimiter || ",");
      // Create a regular expression to parse the CSV values.
      var objPattern = new RegExp((
        // Delimiters.
      "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +
        // Quoted fields.
      "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
        // Standard fields.
      "([^\"\\" + strDelimiter + "\\r\\n]*))"), "gi");
      // Create an array to hold our data. Give the array
      // a default empty first row.
      var arrData = [[]];
      // Create an array to hold our individual pattern
      // matching groups.
      var arrMatches = null;
      // Keep looping over the regular expression matches
      // until we can no longer find a match.
      while (arrMatches = objPattern.exec(strData)) {
        // Get the delimiter that was found.
        var strMatchedDelimiter = arrMatches[1];
        // Check to see if the given delimiter has a length
        // (is not the start of string) and if it matches
        // field delimiter. If id does not, then we know
        // that this delimiter is a row delimiter.
        if (strMatchedDelimiter.length && (strMatchedDelimiter != strDelimiter)) {
          // Since we have reached a new row of data,
          // add an empty row to our data array.
          arrData.push([]);
        }
        // Now that we have our delimiter out of the way,
        // let's check to see which kind of value we
        // captured (quoted or unquoted).
        if (arrMatches[2]) {
          // We found a quoted value. When we capture
          // this value, unescape any double quotes.
          var strMatchedValue = arrMatches[2].replace(
              new RegExp("\"\"", "g"), "\"");
        } else {
          // We found a non-quoted value.
          var strMatchedValue = arrMatches[3];
        }
        // Now that we have our value string, let's add
        // it to the data array.
        arrData[arrData.length - 1].push(strMatchedValue);
      }
      // Return the parsed data.
      return (arrData);
    }

  };

});
