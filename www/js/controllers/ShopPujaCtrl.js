angular.module('durgaPuja.controllers')
// Shop controller.
.controller('ShopPujaCtrl', function($scope, $stateParams, $cordovaToast, BackendService, CartService, envService, $rootScope,$q,$ionicPopup,$filter,$ionicLoading,$timeout,$cordovaNetwork) {

  $scope.getAllPuja = function(){
    BackendService.getPujaList()
    .then(function(data) {
          //console.log(data);
          $scope.products = data;
          $ionicLoading.hide();
          CartService.saveAllPuja(data);
      }, function(error) {
        $ionicLoading.hide();
          $ionicPopup.alert({
               title: 'Error',
               template: error
             });
      });
  };

  $scope.motionFab = function(id) {
        var type = 'drop';
        var shouldAnimate = false;
        var fab = document.getElementById('puja_'+id);
        var classes = type instanceof Array ? type : [type];
        for (var i = 0; i < classes.length; i++) {
            fab.classList.toggle(classes[i]);
            shouldAnimate = fab.classList.contains(classes[i]);
            if (shouldAnimate) {
                (function(theClass) {
                    $timeout(function() {
                        fab.classList.toggle(theClass);
                    }, 300);
                })(classes[i]);
            }
        }
    };


  // private method to add a product to cart
  var addProductToCart = function(product){
    product.Quantity = 1;
    $scope.cart.products.push(product);
    CartService.saveCart($scope.cart);
  };

  $scope.saveVote = function(id){
     $scope.motionFab(id);
     $timeout(function() {
      BackendService.saveVote(id)
      .then(function(data) {
        if (data.returnMessage === 'TRUE') {
           $ionicPopup.alert({
            title: 'Vote Puja.',
            subTitle: 'Success.'
          }).then(function(res) {
                $("#puja_"+id).prop("disabled",true);
           });
        } else {
            $ionicPopup.alert({
              title: 'Vote Puja.',
              subTitle: 'Pls try again.'
          });
        }
       },
       function(error) {
        console.log('error occured');
      });
     }, 400);

    }

  $scope.openContact = function(){    
      $ionicLoading.show();
      $timeout( function(){
      BackendService.saveOrder()
         .then(function(data) {
              $ionicLoading.hide();
              if(data.orderStatus === "TRUE"){
                  $ionicPopup.alert({
                    title: 'Order placed successfully.',
                    cssClass: 'contactPopup',
                    subTitle: '<p>Please collect pass from the below address.</p><p>201, New Park Street, Radiant Park Apartment,</p><p>5th Floor, Block - 5h</p><p> Kolkata&nbsp;-&nbsp;700 017</p><p>Siticable: +91 8335836660 (10 a.m - 7 p.m)</p><p><strong>Profits from sale of Tickets will be donated to NGO - Snehalaya</strong></p>'
                  })
              }else{
                  $ionicPopup.alert({
                    title: 'Order could not be placed.',
                    cssClass: 'contactPopup',
                    subTitle: '<p>Please try again</p>'
                  })
              }
         }, function(error) {
            console.log(error);
             $ionicLoading.hide();
              $ionicPopup.alert({
                   title: 'Login Failed',
                   template: error
           });
      });
   });
  };

  $ionicLoading.show();
  $scope.getAllPuja();

})
