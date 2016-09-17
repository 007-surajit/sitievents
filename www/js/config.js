'use strict';

/* Configuration */

var constantsModule = angular.module("durgaPuja.configuration", []);

constantsModule.constant('appConfig',
	{   
		domains: {
	        development : ['localhost'],
	        production: ['siti.homepaints123.com']
	        // anotherStage: []
	      },

	    vars: {
        development: {
          baseUrl: 'http://siti.homepaints123.com/Service/sitiservice.asmx',
          login: 'CheckLoginCredentials',
          signup: 'InsertRegistrations',
          pujaDetails: 'GetAllPujaDetailsByUser',          
          counterList: 'GetAllCounterDetails',
          saveVote: 'VotePuja',
          recoverPassword : 'ForgotPassword',
          text : 'GetAddText',
          saveOrder : 'SaveOrder',
          allOrderDetails : 'GetOrderDetails',
          voteResult : 'GetVoteResult',
          //atomUrl : 'https://payment.atomtech.in/paynetz/epi/fts',
          atomUrl : 'https://paynetzuat.atomtech.in/paynetz/epi/fts'
          // antoherCustomVar: ''
        },
        production: {
          baseUrl: '//api.acme.com/v2',
          staticUrl: '//static.acme.com'
          // antoherCustomVar: ''
        }
      }	
	}
);