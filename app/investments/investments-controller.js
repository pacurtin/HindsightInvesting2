
angular.module('hindsightInvesting.investments').controller('InvestmentsCtrl', ['$scope', '$window','InvestmentsService', function ($scope, $window, InvestmentsService) {
  'use strict';

  $scope.formFields = {};     //declaring my own scope to allow 2 way binding and form work together.
  $scope.formFields.stockTicker='GOOG'; //clear inputs. date picker seems to clear itself.
  $scope.formFields.amount=500;//todo delete
  $scope.formFields.date = new Date('2010-01-30T00:00:00.000Z');  //setting a default date avoids errors

  $scope.maxDate = new Date();
  $scope.dateSelectionTooOldFlag = false;

  var adjCloseArray = null;
  var datesArray  = null;
  var javaScriptDatesArray = null;
  var nearestDateIndex = null;
  var datesAndValuesDictionary = null;


  /*TODO
  1.Host on Heroku.
  2.Date cant be changed manually.
  3.Bootstrap CSS stuff. Make it look cool + make graph open and close depending on if any investments have been made or not.
  4.Ticker not on Yahoo check.
   */

  /*User investment choice input table*/

  $scope.investments = [];
  $scope.totalInvested = 0;
  $scope.currentValue = 0;

  $scope.addInvestment = function(){
    var results = retrieveStockData($scope.formFields.stockTicker).then(function (results) {   //.then uses promise chain to solve asynchronous call problem
      if(results == "Stock not found"){
        $window.alert("Entry not valid because stock not found on Yahoo finance. Examples of valid choices include 'Goog', 'AAPL' and 'MSFT'.");
      }else{
        $scope.totalInvested = $scope.totalInvested + $scope.formFields.amount;
        extractRelevantStockInfo(results);
        var investment = {
          name:$scope.formFields.stockTicker,                 //Abbreviation used to uniquely identify publicly traded shares of a particular stock on a particular stock market.
          date:$scope.formFields.date,                        //Date user has selected in the GUI.
          nearestDate:javaScriptDatesArray[nearestDateIndex], //Closest date in data to user selection. JS date object.
          amount:$scope.formFields.amount,                    //Amount in euro invested.
          sharesPurchased:$scope.formFields.amount/datesAndValuesDictionary[nearestMonday(javaScriptDatesArray[nearestDateIndex])],   //number of shares bought for "amount" euros on "date"
          adjCloseArray:adjCloseArray,                        //Stock data from Yahoo. Stock's closing price on any given day of trading that has been amended to include any distributions and corporate actions.
          datesArray:datesArray,                              //Dates corresponding to adjCloseArray entries.
          javaScriptDatesArray:javaScriptDatesArray,          //Same as datesArray except in JavaScript Date format. Needed for finding nearestDateIndex. Might be useful for other stuff too.
          nearestDateIndex:nearestDateIndex,                  //This stores the index of javaScriptDatesArray (and by extension of datesArray) which is closest to 'date'.
          datesAndValuesDictionary:datesAndValuesDictionary,  //Using date as a key will return the closing price of that day.
          dateSelectionTooOldFlag:$scope.dateSelectionTooOldFlag,  //Use to inform user they have selected a date that is too far in the past for their chosen stock.
          tickerDoesntExistFlag:false                         //Use to inform user they have selected a ticker that doesn't exist.
        };
        $scope.investments.push(investment);                  //Persist investment data
        var earliestDate = findEarliestDate($scope.investments);
        prepareGraphDataAndDrawGraph(earliestDate,$scope.investments);    //Create labels for graph. Need a date for every monday between the earliest investment and the current date. Then fill a second series corrosponding to portfolio values on each date.
        updateCurrentValue();
      }
      //$scope.formFields.stockTicker='';                   //clear inputs. date picker seems to clear itself.
      //$scope.formFields.amount='';
      $scope.formFields.stockTicker='GOOG'; //clear inputs. date picker seems to clear itself.
      $scope.formFields.amount=500;
    });
  };

  $scope.removeInvestment = function(index){
    $scope.totalInvested = $scope.totalInvested - $scope.investments[index].amount;
    $scope.investments.splice(index, 1);
    var earliestDate = findEarliestDate($scope.investments);
    prepareGraphDataAndDrawGraph(earliestDate,$scope.investments);
    updateCurrentValue();

  };


  /*Other Stuff*/

  function retrieveStockData(ticker) {
    //e.g. ticker = 'GOOG'
    return InvestmentsService.getStockData(ticker).then(function (results) {
      if(results.data == "Stock not found"){
        return "Stock not found";
      }else{
        return JSON.parse($scope.UTIL.csv2Json(results.data.slice(0, -1)));  //need to slice off a return at end of data.
      }

    });
    //return JSON.parse(JSON.stringify($scope.testJson));
  }


  function extractRelevantStockInfo(stockJsonArray){
    adjCloseArray =[];
    datesArray =[];
    datesAndValuesDictionary = {};

    for (var key in stockJsonArray) {
      if (stockJsonArray.hasOwnProperty(key)) {
        adjCloseArray.push(stockJsonArray[key]['Adj Close']);
        datesArray.push(stockJsonArray[key].Date);
        datesAndValuesDictionary[nearestMonday(convertStringDateToJsDate(stockJsonArray[key].Date))]=stockJsonArray[key]['Adj Close'];
        //datesAndValuesDictionary[convertStringDateToJsDate(stockJsonArray[key].Date)]=stockJsonArray[key]['Adj Close'];
      }
    }

    adjCloseArray = adjCloseArray.reverse();  //TODO Optimise. Surely this is unnecessary extra work.
    datesArray = datesArray.reverse();
    javaScriptDatesArray = convertStringDatesToJsDates(datesArray);
    nearestDateIndex = getNearestDateIndex(javaScriptDatesArray, new Date($scope.formFields.date));
    //$scope.nearestDate = stockObject.dataArray[0]; //it works!!!
  }

  function convertStringDatesToJsDates(datesArray){
    var dateObjects = [];
    for(var i=0;i<datesArray.length;i++){
      var date = new Date(datesArray[i]+'T00:00:00.000Z');
      dateObjects.push(date);
    }
    return dateObjects;
  }

  function convertStringDateToJsDate(dateString){
    var date = new Date(dateString+'T00:00:00.000Z');
    return date;
  }

  function convertJsDateToStringDate(jsDate){
    var dd = jsDate.getDate().toString();
    if(dd.length==1)dd=[0,dd].join('');
    var mm = (jsDate.getMonth()+1).toString();
    if(mm.length==1)mm=[0,mm].join('');
    var yyyy = jsDate.getFullYear().toString();

    return [dd,mm,yyyy].join("-");
  }

  function getNearestDateIndex(datesArray,datePickerDate){
    //Yahoo returns the entire history of the stock. We need to find the nearest entry in the data to the date of investment chosen by the user.
    $scope.dateSelectionTooOldFlag = false;
    var bestDate = datesArray.length;
    var bestDiff = -(new Date(0,0,0)).valueOf();
    var currDiff = 0;
    var i;

    for(i = 0; i < datesArray.length; ++i)
    {
      currDiff = Math.abs(datesArray[i] - datePickerDate);
      if(currDiff < bestDiff)
      {
        bestDate = i;
        bestDiff = currDiff;
      }
    }

    if(bestDate==0){
        $scope.dateSelectionTooOldFlag = true;              //user selected date predating the stocks earliest entry in Yahoos data. Warn them selection defaults to earliest available date.
        $scope.formFields.date = datesArray[0];
    }
    return bestDate;
  }

  function findEarliestDate(investments){
    var earliestDate = new Date();         //initialise earliest date to today.

    for(var i = 0; i < investments.length; ++i){
      if(investments[i].nearestDate < earliestDate){    //then cycle through investments to find chronologically earliest.
        earliestDate=investments[i].nearestDate;
      }
    }

    return earliestDate;
  }

  function prepareGraphDataAndDrawGraph(earliestDate,investments){
    //1.set labels array. start at earliest date. add label for every monday between earliest and today. Set data values array here too
    var dateLabel=nearestMonday(earliestDate); //date label must be a monday
    var dateLabels=[];  //dates for x axis
    var dateValues=[];  //portfolio value on this date, y axis.
    var value=0;
    var currDate= new Date();

    while(dateLabel<currDate){
      dateLabels.push(convertJsDateToStringDate(dateLabel));

      value=0;
      for(var i = 0; i < investments.length; ++i) {
        if(dateLabel >= investments[i].date){  //if date is before investment is made its not added to total for that date
          value = value + (investments[i].sharesPurchased * (investments[i].datesAndValuesDictionary[dateLabel]));    //need dictionary e.g. date1:adjClose1 , date2:adjClose2 etc...
        }
      }

      dateValues.push(value);
      dateLabel = addDays(dateLabel, 7);
    }

    //do a sweep setting any zero values to match previous. this should prevent days with missing data screwing up the graph.//TODO test with extended data

    $scope.data=[];
    $scope.labels=[];   //clear existing graph
    $scope.data.push(dateValues);  //chartJS data is in the form of [[series1],[series2]]. Effectively a multi dimensional array. Each array is a line series.
    $scope.labels=stripDownLabels(dateLabels);

  }

  function nearestMonday(date) {
    var day = date.getDay() || 7;
    if( day !== 1 )
        date.setHours(-24 * (day - 1));
    return new Date(date.setHours(0, 0, 0, 0));
  }

  function addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  /*ChartJS Stuff*/

  function stripDownLabels(labels){

    if(labels.length>50){
      var stepSize = Math.round(labels.length/50);     //this is to stop too many labels showing up on X-axis of graph. They should really build this into chartJS.
      for(var i= 0; i<labels.length; i++){
        if(i%stepSize!==0){
          labels[i]='';
        }
      }
    }

    return labels;
  }

  function updateCurrentValue() {
    if($scope.data[0].slice(-1)[0])
      $scope.currentValue=$scope.data[0].slice(-1)[0];
    else
      $scope.currentValue=0;
  }

  $scope.chartOptions= {
    bezierCurve : false,
    pointDot : false,
    animation: false,
    scaleShowHorizontalLines: false,
    scaleShowVerticalLines: false,
    showTooltips: false
  };

  $scope.series = ['Portfolio Value'];

  /*Some test data*/

  $scope.testJson=[
    {
      'Date':'2016-09-26',
      'Open':'31.690001',
      'High':'31.709999',
      'Low':'30.51',
      'Close':'30.790001',
      'Volume':'33991200',
      'Adj Close':'100'
    },
    {
      'Date':'2016-09-19',
      'Open':'31.690001',
      'High':'31.709999',
      'Low':'30.51',
      'Close':'37.790001',
      'Volume':'33991200',
      'Adj Close':'100'
    },
    {
      'Date':'2016-09-12',
      'Open':'31.690001',
      'High':'31.709999',
      'Low':'30.51',
      'Close':'50.790001',
      'Volume':'33991200',
      'Adj Close':'100'
    },
    {
      'Date':'2016-09-05',
      'Open':'31.690001',
      'High':'31.709999',
      'Low':'30.51',
      'Close':'32.790001',
      'Volume':'33991200',
      'Adj Close':'100'
    }
  ];

}]);
