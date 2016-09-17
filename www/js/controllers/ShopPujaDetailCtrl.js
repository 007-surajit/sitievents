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