/*  
  file: services.js
  description: this file contains all services of the DurgaPuja app.
*/
angular.module('durgaPuja.services', [])

// UserService is an example of service using localStorage 
// to store user credentials.
.service('UserService', function() {
  // For the purpose of this example I will store user data on ionic local storage but you should save it on a database
  var setUser = function(user_data) {
    window.localStorage.user = JSON.stringify(user_data);    
  };

  var getUser = function(){
    return JSON.parse(window.localStorage.user || '{}');
  };

  var logoutUser = function(){
    window.localStorage.removeItem('user');
    console.log(window.localStorage.getItem('user'));
  };

  return {
    getUser: getUser,
    setUser: setUser,
    logoutUser: logoutUser
  };
})

// CartService is an example of service using localStorage 
// to persist items of the cart.
.factory('CartService', [function () {

  var svc = {};

  svc.saveCart = function(cart){
    window.localStorage.setItem('cart', JSON.stringify(cart));
  };

  svc.saveProductDetail = function(product){
    window.localStorage.setItem('product', JSON.stringify(product));
  };

  svc.loadProductDetail = function(){
    var product = window.localStorage.getItem('product');
    if(!product){
      return {}
    }
    return JSON.parse(product);
  };

  svc.loadCart = function(){
    var cart = window.localStorage.getItem('cart');
    if(!cart){
      return { products : [ ] }
    }
    return JSON.parse(cart);
  };

  svc.resetCart = function(){
    var cart =  { products : [ ] };
    svc.saveCart(cart);
    return cart;
  };

  svc.getTotal = function(cart){
    var out = 0;
    if(!cart || !cart.products || !angular.isArray(cart.products)){
      return out;
    }
    for(var i=0; i < cart.products.length; i++){
      if(cart.products[i].PujaPassPrice) {
        out += cart.products[i].PujaPassPrice * cart.products[i].Quantity;
      }else{
        out += cart.products[i].PackagePassPrice * cart.products[i].Quantity;
      }
      
    }
    return out;
  }

  svc.setUser = function(user_data) {
    window.localStorage.starter_facebook_user = JSON.stringify(user_data);
  };

  svc.getUser = function(){
    return JSON.parse(window.localStorage.starter_facebook_user || '{}');
  };

  svc.saveAllPuja = function(pujaList){
    window.localStorage.setItem('allPuja', JSON.stringify(pujaList));
  };

  svc.loadAllPuja = function(){
    var pujaList = window.localStorage.getItem('allPuja');
    if(!pujaList){
      return [];
    }
    return JSON.parse(pujaList);
  };   

  return svc;

}])

// #SIMPLIFIED-IMPLEMENTATION
// This is an example if backend service using $http to get
// data from files.
// In this example, files are shipped with the application, so 
// they are static and cannot change unless you deploy an application update
// Other possible implementations (not covered by this kit) include:
// - loading dynamically json files from the web 
// - calling a web service to fetch data dinamically
// in those cases be sure to handle url whitelisting (specially in android)
// (https://cordova.apache.org/docs/en/5.0.0/guide_appdev_whitelist_index.md.html)
// and handle network errors in your interface
.factory('BackendService', ['$http','$q','$rootScope','envService','CartService','UserService','$cordovaNetwork', function ($http,$q,$rootScope,envService,CartService,UserService,$cordovaNetwork) {

  var svc = {};

  // For transforming the successful response, unwrapping the application data
  // from the API response payload.
  function handleSuccess( response ) {
      return( response.data );
  }

  // For transforming the error response, unwrapping the application dta from
  // the API response payload.
  function handleError( response ) {
      // The API response from the server should be returned in a
      // nomralized format. However, if the request was not handled by the
      // server (or what not handles properly - ex. server error), then we
      // may have to normalize it on our end, as best we can.
      if (! angular.isObject( response.data ) || ! response.data.message) {
          return( $q.reject( "An unknown error occurred." ) );
      }
      // Otherwise, use expected error message.
      return( $q.reject( response.data.message ) );
  }

  svc.getPujaList = function(){
    var deferred = $q.defer();        
    $http({
          method: 'POST',
          url: svc.getUrl('pujaDetails'),
          headers: {'Content-Type': 'application/x-www-form-urlencoded'},
          transformRequest: function(obj) {
                    var str = [];
                    for(var p in obj)
                    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                    return str.join("&");
          },
          data: {'userID' : UserService.getUser().email}
      }) 
      .then(function successCallback(response) {
        // this callback will be called asynchronously
        // when the response is available
        //console.log(response);      
        if (typeof response.data === 'object' && Array.isArray(response.data)) {
          $rootScope.products = response.data;
          deferred.resolve(response.data);
        } else {
          // invalid response
          deferred.reject(response.data);
        }
      }, function errorCallback(response) {
        // called asynchronously if an error occurs
        // or server returns response with an error status.
        //console.log(response);
        if($cordovaNetwork.getNetwork().toUpperCase()  === "NONE") {
           deferred.reject( "Please check network connection" );
        }else{
          if (! angular.isObject( response.data ) || ! response.data.message) {
                  deferred.reject( "An unknown error occurred." );
              }
              // Otherwise, use expected error message.
              deferred.reject( response.data.message );                  
        }     
     });                            
    return deferred.promise;
  }

  svc.getText = function(){
    var deferred = $q.defer();    
    $http({
          method: 'GET',
          url: svc.getUrl('text')            
      }) 
      .then(function successCallback(response) {
        // this callback will be called asynchronously
        // when the response is available
        //console.log(response);      
        if (typeof response.data === 'object' && Array.isArray(response.data)) {            
          deferred.resolve(response.data[0]);
        } else {
          // invalid response
          deferred.reject(response.data);
        }
      }, function errorCallback(response) {
        // called asynchronously if an error occurs
        // or server returns response with an error status.
        //console.log(response);
        if($cordovaNetwork.getNetwork().toUpperCase()  === "NONE") {
           deferred.reject( "Please check network connection" );
        }else{
          if (! angular.isObject( response.data ) || ! response.data.message) {
                  deferred.reject( "An unknown error occurred." );
              }
              // Otherwise, use expected error message.
              deferred.reject( response.data.message );                  
        }                       
    });                          
    return deferred.promise;
  }

  svc.getResults = function(){
    var deferred = $q.defer();    
    $http({
          method: 'GET',
          url: svc.getUrl('voteResult')            
      }) 
      .then(function successCallback(response) {
        // this callback will be called asynchronously
        // when the response is available
        //console.log(response);      
        if (typeof response.data === 'object' && Array.isArray(response.data)) {            
          deferred.resolve(response.data);
        } else {
          // invalid response
          deferred.reject(response.data);
        }
      }, function errorCallback(response) {
        // called asynchronously if an error occurs
        // or server returns response with an error status.
        //console.log(response);
        if($cordovaNetwork.getNetwork().toUpperCase()  === "NONE") {
           deferred.reject( "Please check network connection" );
        }else{
          if (! angular.isObject( response.data ) || ! response.data.message) {
                  deferred.reject( "An unknown error occurred." );
              }
              // Otherwise, use expected error message.
              deferred.reject( response.data.message );                  
        }                 
      });                          
    return deferred.promise;
  }
  
  svc.checkLogin = function(userObj){
    var deferred = $q.defer();     
    $http({
          method: 'POST',
          url: svc.getUrl('login'),
          headers: {'Content-Type': 'application/x-www-form-urlencoded'},
          transformRequest: function(obj) {
                      var str = [];
                      for(var p in obj)
                      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                      return str.join("&");
          },
          data: userObj
      })  
    .then(function successCallback(response) {
      // this callback will be called asynchronously
      // when the response is available
      //console.log(response);      
      if (typeof response.data === 'object' && Array.isArray(response.data)) {
        deferred.resolve(response.data[0]);
      } else {
        // invalid response
        deferred.reject(response.data);
      }
    }, function errorCallback(response) {
      // called asynchronously if an error occurs
      // or server returns response with an error status.
      //console.log(response);
      if($cordovaNetwork.getNetwork().toUpperCase()  === "NONE") {
           deferred.reject( "Please check network connection" );
        }else{
          if (! angular.isObject( response.data ) || ! response.data.message) {
                  deferred.reject( "An unknown error occurred." );
              }
              // Otherwise, use expected error message.
              deferred.reject( response.data.message );                  
        }                  
    });                         
    return deferred.promise;  
  }

  svc.getOrderDetailsByUserId = function(){
    var deferred = $q.defer();            
      $http({
            method: 'POST',
            url: svc.getUrl('allOrderDetails'),
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            transformRequest: function(obj) {
                        var str = [];
                        for(var p in obj)
                        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                        return str.join("&");
            },
            data: {'userEmail' : UserService.getUser().email}
        }) 
        .then(function successCallback(response) {
          // this callback will be called asynchronously
          // when the response is available
          //console.log(response);      
          if (typeof response.data === 'object' && Array.isArray(response.data)) {            
            deferred.resolve(response.data);
          } else {
            // invalid response
            deferred.reject(response.data);
          }
        }, function errorCallback(response) {
          // called asynchronously if an error occurs
          // or server returns response with an error status.
          //console.log(response);
          if($cordovaNetwork.getNetwork().toUpperCase()  === "NONE") {
           deferred.reject( "Please check network connection" );
        }else{
          if (! angular.isObject( response.data ) || ! response.data.message) {
                  deferred.reject( "An unknown error occurred." );
              }
              // Otherwise, use expected error message.
              deferred.reject( response.data.message );                  
        }                  
    });                            
    return deferred.promise;
  }

  svc.registerUser = function(userObj){
    var deferred = $q.defer();     
    $http({
          method: 'POST',
          url: svc.getUrl('signup'),
          headers: {'Content-Type': 'application/x-www-form-urlencoded'},
          transformRequest: function(obj) {
                      var str = [];
                      for(var p in obj)
                      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                      return str.join("&");
          },
          data: userObj
      })  
    .then(function successCallback(response) {
      // this callback will be called asynchronously
      // when the response is available
      //console.log(response);      
      if (typeof response.data === 'object' && Array.isArray(response.data)) {
        deferred.resolve(response.data[0]);
      } else {
        // invalid response
        deferred.reject(response.data);
      }
    }, function errorCallback(response) {
      // called asynchronously if an error occurs
      // or server returns response with an error status.
      //console.log(response);
      if($cordovaNetwork.getNetwork().toUpperCase()  === "NONE") {
           deferred.reject( "Please check network connection" );
        }else{
          if (! angular.isObject( response.data ) || ! response.data.message) {
                  deferred.reject( "An unknown error occurred." );
              }
              // Otherwise, use expected error message.
              deferred.reject( response.data.message );                  
        }                 
    });                         
    return deferred.promise;  
  }  

  svc.saveVote = function(id){
    var deferred = $q.defer();      
    $http({
          method: 'POST',
          url: svc.getUrl('saveVote') , 
          headers: {'Content-Type': 'application/x-www-form-urlencoded'},
          transformRequest: function(obj) {
                      var str = [];
                      for(var p in obj)
                      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                      return str.join("&");
          },
          data: {'userid' : UserService.getUser().email, 'pujaid' : id}
      })  
    .then(function successCallback(response) {          
      if (typeof response.data === 'object' && Array.isArray(response.data)) {
        deferred.resolve(response.data[0]);
      } else {
        // invalid response
        deferred.reject(response.data);
      }
    }, function errorCallback(response) {      
      if($cordovaNetwork.getNetwork().toUpperCase()  === "NONE") {
           deferred.reject( "Please check network connection" );
        }else{
          if (! angular.isObject( response.data ) || ! response.data.message) {
                  deferred.reject( "An unknown error occurred." );
              }
              // Otherwise, use expected error message.
              deferred.reject( response.data.message );                  
        }                  
    });                         
    return deferred.promise;  
  } 

  svc.saveOrder = function(){
    var deferred = $q.defer();      
    $http({
          method: 'POST',
          url: svc.getUrl('saveOrder') , 
          headers: {'Content-Type': 'application/x-www-form-urlencoded'},
          transformRequest: function(obj) {
                      var str = [];
                      for(var p in obj)
                      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                      return str.join("&");
          },
          data: {'userEmail' : UserService.getUser().email}
      })  
    .then(function successCallback(response) {          
      if (typeof response.data === 'object' && Array.isArray(response.data)) {
        deferred.resolve(response.data[0]);
      } else {
        // invalid response
        deferred.reject(response.data);
      }
    }, function errorCallback(response) {
      if($cordovaNetwork.getNetwork().toUpperCase()  === "NONE") {
           deferred.reject( "Please check network connection" );
        }else{
          if (! angular.isObject( response.data ) || ! response.data.message) {
                  deferred.reject( "An unknown error occurred." );
              }
              // Otherwise, use expected error message.
              deferred.reject( response.data.message );                  
        }      
    });                         
    return deferred.promise;  
  } 

  svc.recoverPassword = function(email){
    var deferred = $q.defer();     
    $http({
          method: 'POST',
          url: svc.getUrl('recoverPassword') , 
          headers: {'Content-Type': 'application/x-www-form-urlencoded'},
          transformRequest: function(obj) {
                      var str = [];
                      for(var p in obj)
                      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                      return str.join("&");
          },
          data: {user_id: email}
      })  
    .then(function successCallback(response) {          
      if (typeof response.data === 'object' && Array.isArray(response.data)) {
        deferred.resolve(response.data[0]);
      } else {
        // invalid response
        deferred.reject(response.data);
      }
    }, function errorCallback(response) {      
         if($cordovaNetwork.getNetwork().toUpperCase()  === "NONE") {
           deferred.reject( "Please check network connection" );
         }else{
          if (! angular.isObject( response.data ) || ! response.data.message) {
                  deferred.reject( "An unknown error occurred." );
              }
              // Otherwise, use expected error message.
              deferred.reject( response.data.message );                  
        }              
    });                         
    return deferred.promise;  
  }  

  svc.getUrl = function(methodName){
    return envService.read('baseUrl') + '/' + envService.read(methodName);
  }

  return svc;
}])
