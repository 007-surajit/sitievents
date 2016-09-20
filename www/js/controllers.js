/*  
  file: controllers.js
  description: this file contains all controllers of the DurgaPuja app.
*/

//controllers are packed into a module
angular.module('durgaPuja.controllers', [])

//top view controller
.controller('AppController', ['$scope','$state','CartService','BackendService','$ionicPlatform','$ionicHistory','$cordovaToast','UserService','$ionicLoading','$timeout','envService','$cordovaInAppBrowser','$rootScope','$ionicPopup', function($scope, $state, CartService,BackendService,$ionicPlatform,$ionicHistory,$cordovaToast,UserService,$ionicLoading,$timeout,envService,$cordovaInAppBrowser,$rootScope,$ionicPopup) {
  
  // #SIMPLIFIED-IMPLEMENTATION:
  // Simplified handling and logout function.
  // A real app would delegate a service for organizing session data
  // and auth stuff in a better way.
  
  //$rootScope.user = {};
 
  //$scope.cart = CartService.loadCart();
  //$scope.getTotal = CartService.getTotal; 
  $scope.user = UserService.getUser('facebook');

  $scope.logout = function(){    
    //$rootScope.user = {};
    if($scope.user.userID) {
      $ionicLoading.show();
      // Facebook logout
        facebookConnectPlugin.logout(function(){
          $ionicLoading.hide();          
        },
        function(fail){
          $ionicLoading.hide();
        });
    }
    UserService.logoutUser();        
    localStorage.removeItem("loggedIn");                
    $ionicHistory.clearHistory();
    $ionicHistory.removeBackView();
    $ionicHistory.nextViewOptions({ 
      disableBack: true,                     
      historyRoot: true
    });
    $state.go('start')
  };

  var countTimerForCloseApp = false;
    /*$ionicPlatform.registerBackButtonAction(function(e) {
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

       // Is there a page to go back to?
       //console.log(JSON.stringify($ionicHistory.viewHistory()));
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
      }, 101);*/

}])

// This controller is bound to the "app.home" view
.controller('HomeCtrl', ['$scope','$state','BackendService','$ionicLoading','$ionicPopup','$ionicPlatform', function($scope, $state, BackendService,$ionicLoading,$ionicPopup,$ionicPlatform) {
    $ionicPlatform.ready(function() { 
      BackendService.getText()
        .then(function(data) {          
              //console.log(data);
              $scope.footerText = data.returnMessage;
          }, function(error) {
              //console.log(error);
              $ionicPopup.alert({
                 title: 'Error',
                 template: error            
              });          
      }); 
    });
}])

// This controller is bound to the "app.account" view
.controller('AccountCtrl', function($scope) {
  
  //readonly property is used to control editability of account form
  $scope.readonly = true;

  // #SIMPLIFIED-IMPLEMENTATION:
  // We act on a copy of the root user
  $scope.accountUser = JSON.parse(localStorage.getItem("user"));
  $scope.user = angular.copy($scope.accountUser);
  //console.log($scope.accountUser);
  var userCopy = {};

  $scope.startEdit = function(){
    $scope.readonly = false;
    userCopy = angular.copy($scope.user);    
  };

  $scope.cancelEdit = function(){
    $scope.readonly = true;
    $scope.user = userCopy;
  };
  
  // #SIMPLIFIED-IMPLEMENTATION:
  // this function should call a service to update and save 
  // the data of current user.
  // In this case we'll just set form to readonly and copy data back to $rootScope.
  $scope.saveEdit = function(){
    $scope.readonly = true;
    localStorage.setItem("user",JSON.stringify($scope.accountUser));     
  };
})


.controller('UserCtrl', function ($scope, $state, $ionicPopup, CartService, $cordovaDialogs,
 BackendService,envService,$ionicLoading,$timeout,$ionicHistory,$q,UserService) { 

  $scope.user = {};

  /*$scope.user = {email : "007.surajit@gmail.com",
                password : "123"};*/

  // This is the success callback from the login method
  var fbLoginSuccess = function(response) {
    if (!response.authResponse){
      fbLoginError("Cannot find the authResponse");
      return;
    }

    var authResponse = response.authResponse;

    getFacebookProfileInfo(authResponse)
    .then(function(profileInfo) {
      // For the purpose of this example I will store user data on local storage
      UserService.setUser({
        authResponse: authResponse,
        userID: profileInfo.id,
        name: profileInfo.name,
        email: profileInfo.email,
        picture : "http://graph.facebook.com/" + authResponse.userID + "/picture?type=large"
      });
      $ionicLoading.hide();
      $ionicHistory.clearHistory();
      $ionicHistory.removeBackView();
      $ionicHistory.nextViewOptions({ 
        disableBack: true,                     
        historyRoot: true
      });
      $state.go('app.home');
    }, function(fail){
      // Fail get profile info
      console.log('profile info fail', fail);
    });
  };

  // This is the fail callback from the login method
  var fbLoginError = function(error){
    console.log('fbLoginError', error);
    $ionicLoading.hide();
  };

  // This method is to get the user profile info from the facebook api
  var getFacebookProfileInfo = function (authResponse) {
    var info = $q.defer();

    facebookConnectPlugin.api('/me?fields=email,name&access_token=' + authResponse.accessToken, null,
      function (response) {
        console.log(response);
        info.resolve(response);
      },
      function (response) {
        console.log(response);
        info.reject(response);
      }
    );
    return info.promise;
  };

  //This method is executed when the user press the "Login with facebook" button
  $scope.facebookSignIn = function() {
    facebookConnectPlugin.getLoginStatus(function(success){
      if(success.status === 'connected'){
        // The user is logged in and has authenticated your app, and response.authResponse supplies
        // the user's ID, a valid access token, a signed request, and the time the access token
        // and signed request each expire
        console.log('getLoginStatus', success.status);

        // Check if we have our user saved
        var user = UserService.getUser('facebook');

        if(!user.userID){
          getFacebookProfileInfo(success.authResponse)
          .then(function(profileInfo) {
            // For the purpose of this example I will store user data on local storage
            UserService.setUser({
              authResponse: success.authResponse,
              userID: profileInfo.id,
              name: profileInfo.name,
              email: profileInfo.email,
              picture : "http://graph.facebook.com/" + success.authResponse.userID + "/picture?type=large"
            });
            localStorage.setItem("loggedIn","true");
            $ionicHistory.clearHistory();
            $ionicHistory.removeBackView();
            $ionicHistory.nextViewOptions({ 
              disableBack: true,                     
              historyRoot: true
            });                            
            $state.go('app.home');
          }, function(fail){
            // Fail get profile info
            console.log('profile info fail', fail);
          });
        }else{
          //alert('connected');
          localStorage.setItem("loggedIn","true");
          console.log(JSON.stringify(user));
          $ionicHistory.clearHistory();
          $ionicHistory.removeBackView();
          $ionicHistory.nextViewOptions({ 
            disableBack: true,                     
            historyRoot: true
          });
          $state.go('app.home');
        }
      } else {
        // If (success.status === 'not_authorized') the user is logged in to Facebook,
        // but has not authenticated your app
        // Else the person is not logged into Facebook,
        // so we're not sure if they are logged into this app or not.

        console.log('getLoginStatus', success.status);

        $ionicLoading.show({
          template: 'Logging in...'
        });

        // Ask the permissions you need. You can learn more about
        // FB permissions here: https://developers.facebook.com/docs/facebook-login/permissions/v2.4
        facebookConnectPlugin.login(['email', 'public_profile'], fbLoginSuccess, fbLoginError);
      }
    });
  };


  $scope.login = function(user){
    
    $ionicLoading.show();

    $scope.user = angular.copy(user);
    //in this case we just set the user in $rootScope
    var userObj = {'user_id': $scope.user.email, 'user_password' : $scope.user.password};

    $timeout( function(){ 
        BackendService.checkLogin(userObj)
           .then(function(data) {
                if(data.returnMessage === 'TRUE'){
                  UserService.logoutUser();            
                  localStorage.setItem("loggedIn","true");                
                  /*$rootScope.user = {
                      email : $scope.user.email,
                      name : data.LoginName,
                      phone : data.PhoneNumber                
                    };*/
                    UserService.setUser({
                      email : $scope.user.email,
                      name : data.LoginName,
                      phone : data.PhoneNumber                
                    });
                    //localStorage.setItem("user",JSON.stringify($rootScope.user));
                    loginForm.reset(); 
                    $ionicHistory.clearHistory();
                    $ionicHistory.removeBackView();
                    $ionicHistory.nextViewOptions({ 
                      disableBack: true,                     
                      historyRoot: true
                    });
                    //finally, we route our app to the 'app.shop' view
                    $state.go('app.home');
                    $ionicLoading.hide();
                  }else{
                    $ionicLoading.hide();
                  if(ionic.Platform.isWebView()){              
                    $cordovaDialogs.alert('Please check your credentials!', 'Login Failed', 'Ok')
                      .then(function() {
                        // callback success
                      });
                    }else{                      
                      $ionicPopup.alert({
                       title: 'Login Failed',
                       template: 'Please check your credentials!'
                     });
                    } 
                  }                                       
            }, function(error) {
              console.log(error);
              $ionicLoading.hide();
                $ionicPopup.alert({
                     title: 'Login Failed',
                     template: 'Could not authenticate your credentials'
                   });          
            });
     }, 1500);        
  };

  $scope.signup = function(user){

    $scope.user = angular.copy(user);
    //in this case we just set the user in $rootScope
    var userObj = {'yourName': $scope.user.name, 'yourEmail' : $scope.user.email,
                   'yourPhone' : $scope.user.phone, 'yourPassword' : $scope.user.password
                  };

    $timeout( function(){ 
      BackendService.registerUser(userObj)
       .then(function(data) {
            if(data.returnMessage === 'TRUE'){
              localStorage.setItem("loggedIn","true");                
              /*$rootScope.user = {
                  email : $scope.user.email,
                  name : "Surajit Sarkar"                
                };*/
                UserService.setUser({
                  email : $scope.user.email,
                  name : $scope.user.name                
                });
                //localStorage.setItem("user",JSON.stringify($rootScope.user)); 
                //finally, we route our app to the 'app.shop' view
                $ionicHistory.clearHistory();
                $ionicHistory.removeBackView();
                $ionicHistory.nextViewOptions({ 
                  disableBack: true,                     
                  historyRoot: true
                });
                $state.go('app.home');
                $ionicLoading.hide();
              }else{
                $ionicLoading.hide();
                $ionicPopup.alert({
                 title: 'Login Failed',
                 template: 'Please check your credentials!'
               });
              }                                        
        }, function(error) {
            console.log(error);
            $ionicLoading.hide();
            $ionicPopup.alert({
                 title: 'Login Failed',
                 template: JSON.stringify(error)
               });          
        });
      }, 1500);     
  }

  $scope.recoverPassword = function(recoverEmail){
    
    BackendService.recoverPassword(recoverEmail)
      .then(function(data) {
        if (data.returnMessage === 'TRUE') {
          $ionicPopup.alert({
           title: 'Password reset email sent.',
           subTitle: 'Follow the directions in the email to reset your password.'           
          });
        } else {          
            $ionicPopup.alert({
              title: 'Forgot password',
              template: 'Recovery email not found.'            
          });
        }
      }, function(error) {
        console.log(error);
        $ionicPopup.alert({
          title: 'Forgot password',
          template: 'An error occured in recovering your password'
        });
      });
  }
  
})