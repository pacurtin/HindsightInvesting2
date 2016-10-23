/**
 * Created by padraig.curtin on 06/04/2016.
 */

angular.module('hindsightInvesting.investments').factory('InvestmentsService',['$http',function InvestmentsService($http) {
  'use strict';

  return {
    /*getStockData: function (stockTicker) {
      return $http.jsonp('http://jsonplaceholder.typicode.com/posts/1?callback=JSON_CALLBACK"').success(function(data){
        console.log(data);});
    }*/
    getStockData: function (stockTicker) {
      //return $http.get('http://localhost:3000/getIndividualStockData', {params: { stockTicker: stockTicker }}).success(function(data){
      return $http.get('http://hindsightinvesting.herokuapp.com:3000/getIndividualStockData', {params: { stockTicker: stockTicker }}).success(function(data){
        data=data.substring(42,data.length);
        //console.log(data);
      });
    }
  };

}]);
