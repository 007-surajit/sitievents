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

angular.module('durgaPuja.controllers')
// Shop controller.
.controller('ShopPujaDetailCtrl', function($scope, $stateParams, $ionicActionSheet, BackendService, CartService, envService, $rootScope, $q, $ionicPopup, $filter,$timeout) {
  
  // In this example feeds are loaded from a json file.
  // (using "getProducts" method in BackendService, see services.js)
  // In your application you can use the same approach or load 
  // products from a web service.
  
  //using the CartService to load cart from localStorage   

  $scope.cart = CartService.loadCart();

  $scope.allPuja = CartService.loadAllPuja();

  
  $scope.product = $filter('filter')($scope.allPuja, {PujaID: $stateParams.productId })[0];

  $scope.product.Quantity = $stateParams.quantity; 

  $scope.loadMap = function(){
    var latLng = new google.maps.LatLng($scope.product.PujaLatitude, $scope.product.PujaLongitude);

    //var latLng = new google.maps.LatLng(37.3000, -120.4833);

    var mapOptions = {
      center: latLng,
      zoom: 17,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };    
 
    $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);

    //Wait until the map is loaded
    google.maps.event.addListenerOnce($scope.map, 'idle', function(){   
      
      var marker = new google.maps.Marker({
          map: $scope.map,
          animation: google.maps.Animation.DROP,
          position: latLng
      });      
     
      var infoWindow = new google.maps.InfoWindow({
          content: $scope.product.PujaName
      });
     
      google.maps.event.addListener(marker, 'click', function () {
          infoWindow.open($scope.map, marker);
      });
   
    });
  } 

  $timeout($scope.loadMap);   

  // private method to add a product to cart
  var addProductToCart = function(product){
    $scope.cart.products.push(product);
    CartService.saveCart($scope.cart);
  };

  // method to add a product to cart via $ionicActionSheet
  $scope.addProduct = function(product){
    $ionicActionSheet.show({
       buttons: [
         { text: '<b>Add to cart</b>' }
       ],
       titleText: 'Buy Pass for ' + product.PujaName,
       cancelText: 'Cancel',
       cancel: function() {
          // add cancel code if needed ..
       },
       buttonClicked: function(index) {
         if(index == 0){
           addProductToCart(product);
           return true;
         }
         return true;
       }
     });
  };

})
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