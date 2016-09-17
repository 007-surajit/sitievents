angular.module('durgaPuja', ['ionic', 'ngCordova', 'durgaPuja.controllers', 'durgaPuja.services','environment',
  'durgaPuja.configuration','ionic.ion.autoListDivider'])

.run(function($ionicPlatform, $rootScope, $timeout, $state, envService,$ionicPopup,$ionicHistory,$cordovaToast,UserService) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

    /* 
      #SIMPLIFIED-IMPLEMENTATION:
      Example access control.
      A real app would probably call a service method to check if there
      is a logged user.

      #IMPLEMENTATION-DETAIL: views that require authorizations have an
      "auth" key with value = "true".
    */
    /*if(localStorage.getItem("loggedIn") !== "undefined" && localStorage.getItem("loggedIn") !== null){               
      $rootScope.user = JSON.parse(localStorage.getItem("user"));
    }*/

    

    $rootScope.$on('$stateChangeStart', 
      function(event, toState, toParams, fromState, fromParams){
        var user = UserService.getUser('facebook');
        //console.log($ionicHistory.backView());
        if(toState.data && toState.data.auth == true && !user.email){//!$rootScope.user.email){
            event.preventDefault();
            alert('here');
            $state.go('login');   
        }        
    });

    var countTimerForCloseApp = false;
    $ionicPlatform.registerBackButtonAction(function(e) {
       e.preventDefault();
       
       function showConfirm() {
        var confirmPopup = $ionicPopup.show({
         title : 'Exit AppName?',
         template : 'Are you sure you want to exit AppName?',
         buttons : [{
          text : 'Cancel',
          type : 'button-royal button-outline',
         }, {
          text : 'Ok',
          type : 'button-royal',
          onTap : function() {
           ionic.Platform.exitApp();
          }
         }]
        });
       };

       function showConfirmCordova() {
        if (countTimerForCloseApp) {
         ionic.Platform.exitApp();
        } else {
         countTimerForCloseApp = true;
          $cordovaToast
          .show('Press again to exit.', 3000, 'bottom')
          .then(function(success) {
            // success
          }, function (error) {
            // error
          });         
         $timeout(function() {
          countTimerForCloseApp = false;
         }, 3000);
        }

       };

       //console.log(JSON.stringify($ionicHistory.viewHistory()));
       // Is there a page to go back to?
       if ($ionicHistory.backView()) {
        // Go back in history
        $ionicHistory.backView().go();
       } else {
        // This is the last page: Show confirmation popup
        var isWebView = ionic.Platform.isWebView();
        if(isWebView){
          showConfirmCordova();
        }else{
          showConfirm();
        }
        
       }

       return false;
      }, 101);

    });
})

.constant('$ionicLoadingConfig', {
  template: '<p>Please wait...</p><ion-spinner></ion-spinner>'
})

/*.directive('imageUrl', function () {
    return {
        scope: {
            imageUrl: '='
        },
        link: function (scope, element, attrs) {
            var imageObj;
            if (angular.isUndefined(scope.imageUrl)) { //No image
                imageObj = "img/placeholder.png"; //We want to show placeholderImage
            }
            else {
                imageObj = scope.imageUrl; // Set the src attribute
            }
            element.attr("src", imageObj); // Set the src attribute
        }
    };
})*/

/*.directive('imageUrl', function() {
  return {
    restrict: 'A',
    scope: {  imageUrl : '=' },
    link: function(scope, element, attrs) {
        element.bind('load', function() {
            console.log('loaded');
            console.log(element);
            element.attr('src', scope.imageUrl);
            element.unbind('load');            
        });
        element.bind('error', function() {
          element.attr('src', 'img/placeholder.png');
          element.unbind('error');          
        });
    }
  };
})*/


.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider,envServiceProvider,appConfig) {

  // set the domains and variables for each environment
    //console.log(appConfig);
    
     /*var appID = 1797718487141229;
      var version = "v2.0"; // or leave blank and default is v2.0
      $cordovaFacebookProvider.browserInit(appID, version);
     */

    envServiceProvider.config({
          domains: appConfig.domains,
          vars: appConfig.vars
    });

    // run the environment check, so the comprobation is made
    // before controllers and services are built
    envServiceProvider.check();
  /*

    Here we setup the views of our app.
    In this case:
    - feed, account, shop, checkout, cart will require login
    - app will go to the "start view" when launched.

    #IMPLEMENTATION-DETAIL: views that require authorizations have an
    "auth" key with value = "true".

  */

  // Disable view transition
  //$ionicConfigProvider.views.transition('none');

  // Disable view caching
  //$ionicConfigProvider.views.maxCache(0);
  
  $stateProvider

  .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppController'
  })
  
  .state('start', {
    url: '/start',
    templateUrl: 'templates/start.html',
    controller: 'AppController',
    onEnter: function($state){            
            if(localStorage.getItem("loggedIn") !== "undefined" && localStorage.getItem("loggedIn") !== null){               
               $state.go('app.home');
            }
    }
    /*views: {
      'menuContent': {
        templateUrl: 'templates/start.html'
      }
    }*/
  })

  .state('login', {
    url: '/login',
    cached : false,
    templateUrl: 'templates/login.html',
    controller : 'UserCtrl'
    /*views: {
      'menuContent': {
        templateUrl: 'templates/login.html',
        controller : 'UserCtrl'
      }
    }*/
  })

  .state('forgot', {
    url: '/forgot',
    templateUrl: 'templates/forgot.html',
    controller : 'UserCtrl' 
    /*views: {
      'menuContent': {
        templateUrl: 'templates/forgot.html'
      }
    }*/
  })

  .state('signup', {
    url: '/signup',
    templateUrl: 'templates/signup.html',
    controller : 'UserCtrl',
    /*views: {
      'menuContent': {
        templateUrl: 'templates/signup.html',
        controller : 'UserCtrl'        
      }
    }*/
  })

  .state('app.account', {
      url: '/account',
      data : { auth : true },
      views: {
        'menuContent': {
          templateUrl: 'templates/account.html',
          controller : 'AccountCtrl'
        }
      }
  })

  .state('app.orders', {
    url: '/orders',
    data : { auth : true },
    cache : false,
    views: {
      'menuContent': {
        templateUrl: 'templates/orders.html',
        controller : 'OrderCtrl'
      }
    }
  })

  .state('app.voteResults', {
    url: '/voteResults',
    data : { auth : true },
    cache : false,
    views: {
      'menuContent': {
        templateUrl: 'templates/voteResults.html',
        controller : 'VoteResultsCtrl'
      }
    }
  })

  .state('app.home', {
    url: '/home',
    data : { auth : true },
    cache : false,
    views: {
      'menuContent': {
        templateUrl: 'templates/home.html',
        controller: 'HomeCtrl'        
      }
    }
  })

  .state('app.contact', {
    url: '/contact',
    data : { auth : true },
    cache : false,
    views: {
      'menuContent': {
        templateUrl: 'templates/contactus.html'        
      }
    }
  })


  .state('app.pujaList', {
    url: '/puja/list',
    data : { auth : true },
    cache : false,
    views: {
      'menuContent': {
        templateUrl: 'templates/shopPuja.html',
        controller : 'ShopPujaCtrl'
      }
    }
  })

  .state('app.pujaListByPackage', {
    url: '/puja/list/:packageId',
    data : { auth : true },
    cache : false,
    views: {
      'menuContent': {
        templateUrl: 'templates/shopPuja.html',
        controller : 'ShopPujaCtrl'
      }
    }
  })

  .state('app.pujaDetail', {
    url: '/puja/detail/:productId',
    data : { auth : true },
    cache : false,
    views: {
      'menuContent': {
        templateUrl: 'templates/shopPujaDetail.html',
        controller : 'ShopPujaDetailCtrl'
      }
    }
  })
  

  // If none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/start');

});
