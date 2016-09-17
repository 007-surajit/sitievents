angular.module('durgaPuja.controllers')
// Shop controller.
.controller('VoteResultsCtrl', function($scope, $stateParams, $ionicPopover, $cordovaToast, BackendService, CartService, envService, $rootScope, $q, $ionicPopup, $cordovaDialogs,UserService,$filter,$ionicLoading) {
  
  $scope.doRefresh = function(){    
    
    BackendService.getResults()
    .then(function(data) {          
           $scope.results = data; 
           $ionicLoading.hide();
          //console.log($scope.orders);       
      }, function(error) {
          $ionicLoading.hide();
          $ionicPopup.alert({
               title: error               
             });          
      });
  };
  
  $ionicLoading.show();
  $scope.doRefresh();    

})