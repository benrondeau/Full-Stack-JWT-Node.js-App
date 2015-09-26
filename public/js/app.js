var app = angular.module('JWTapp', ['ngRoute']);

app.controller('LoginController', function($scope, $http, $window, $location) {

    //Submit the Form Data
    $scope.login = function(){
        //Submit event request to DB
        $http.post('/authenticate', {'username': $scope.username, 'password': $scope.password})
            .then(function(response){
            	console.log(response.data);
            	$window.localStorage.JWTtoken = response.data.token; //store token in Local Storage
            	$location.path('/admin');//Redirect to admin home
            }, function(response){
            	alert('Incorrect Credentials. Please Try Again.');
            	console.log(response);
            }
        );
    };
});

app.controller('NavbarController', function($scope, $location, AuthAPI){

	$scope.home = function(){
		$location.path('/');
	};

	$scope.logout = function(){
		AuthAPI.removeToken();
		$location.path('/');
	};
});

app.controller('AdminHomeController', function($scope, $http, $location, AuthAPI) {
	'use strict';

	if(AuthAPI.authCheck()){
		$scope.token = AuthAPI.parseToken(); // get token claim values
	}
	else{
		$location.path('/'); //redirect user back to homepage if token not present.
	}

	(function(){

		var request = {
			method: 'GET',
			url: '/api',
			headers: {
			'token': AuthAPI.getToken()
			}
		};

		$http(request)
            .then(function(response){
            	$scope.message = response.data;
            }, function(response){
            	alert('Incorrect Credentials. Please Try Again.');
            	console.log(response);
            }
        );
	})();
	

});


app.factory('AuthAPI', function($window, $location){

	var API = {
		removeToken : function(){
			$window.localStorage.removeItem('JWTtoken');
		},
		getToken : function(){
			return $window.localStorage.JWTtoken;
		},
		authCheck : function(){
			if($window.localStorage.JWTtoken)return true;
				else return false;
		},
		parseToken : function() {
			var token = $window.localStorage.JWTtoken;
			var base64Url = token.split('.')[1];
			var base64 = base64Url.replace('-', '+').replace('_', '/');
			var decodedJWT = JSON.parse($window.atob(base64));
			return decodedJWT;
		}
	};

	return API;

});



app.config(function($routeProvider) {
    'use strict';

    $routeProvider.
        when('/', {
            templateUrl: 'views/login.html',
            controller: 'LoginController'
        }).
        when('/admin', {
            templateUrl: 'views/admin.html',
            controller: 'AdminHomeController'
        });
});