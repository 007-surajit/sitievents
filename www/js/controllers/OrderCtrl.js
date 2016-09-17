angular.module('durgaPuja.controllers')
// Shop controller.
.controller('OrderCtrl', function($scope, $stateParams, $ionicPopover, $cordovaToast, BackendService, CartService, envService, $rootScope, $q, $ionicPopup, $cordovaDialogs,UserService,$filter,$ionicLoading) {
  
  $scope.doRefresh = function(){
    var user = UserService.getUser('facebook');
    var total = 0;
    //$rootScope.user = JSON.parse(localStorage.getItem("user"));
    
    BackendService.getOrderDetailsByUserId()
    .then(function(data) {          
           $scope.orders = data; 
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