angular.module('userControllers', ['userServices'])
.controller('regCtrl', function($http, $location, $timeout, User, $scope) {
    var app = this;
    this.regUser = function(regData, valid, confirmed) {
        app.disabled = true;
        app.loading = true; 
        app.errorMsg = false;

        if (valid && confirmed) {
            app.regData.name = app.regData.firstName + " " + app.regData.lastName; 
            User.create(app.regData).then(function(data) {
                if (data.data.success) {
                    app.loading = false;
                    $scope.alert = 'alert alert-success'; 
                    app.successMsg = data.data.message + '...Redirecting';
                    $timeout(function() {
                        $location.path('/login');
                    }, 2000);
                } else {
                    app.loading = false;
                    app.disabled = false;
                    $scope.alert = 'alert alert-danger'; 
                    app.errorMsg = data.data.message;
                }
            });
        } else {
            app.disabled = false;
            app.loading = false;
            $scope.alert = 'alert alert-danger';
            app.errorMsg = 'Please ensure form is filled our properly'; 
        }
    };
    this.checkUsername = function(regData) {
        app.checkingUsername = true;
        app.usernameMsg = false;
        app.usernameInvalid = false;

        User.checkUsername(app.regData).then(function(data) {
            if (data.data.success) {
                app.checkingUsername = false;
                app.usernameMsg = data.data.message;
            } else {
                app.checkingUsername = false;
                app.usernameInvalid = true;
                app.usernameMsg = data.data.message;
            }
        });
    }; 
    this.checkEmail = function(regData) {
        app.checkingEmail = true;
        app.emailMsg = false;
        app.emailInvalid = false;
        User.checkEmail(app.regData).then(function(data) {
            if (data.data.success) {
                app.checkingEmail = false;
                app.emailMsg = data.data.message;
            } else {
                app.checkingEmail = false;
                app.emailInvalid = true;
                app.emailMsg = data.data.message;
            }
        });
    };
})
.directive('match', function() {
    return {
        restrict: 'A',
        controller: function($scope) {
            $scope.confirmed = false;
            $scope.doConfirm = function(values) {
                values.forEach(function(ele) {
                    if ($scope.confirm == ele) {
                        $scope.confirmed = true;
                    } else {
                        $scope.confirmed = false;
                    }
                });
            };
        },

        link: function(scope, element, attrs) {

            attrs.$observe('match', function() {
                scope.matches = JSON.parse(attrs.match);
                scope.doConfirm(scope.matches);
            });

            scope.$watch('confirm', function() {
                scope.matches = JSON.parse(attrs.match);
                scope.doConfirm(scope.matches);
            });
        }
    };
})

.controller('facebookCtrl', function($routeParams, Auth, $location, $window, $scope) {

    var app = this;
    app.errorMsg = false;
    app.expired = false;
    app.disabled = true;

    if ($window.location.pathname == '/facebookerror') {
        $scope.alert = 'alert alert-danger'; 
        app.errorMsg = 'Facebook e-mail not found in database.';
    } else if ($window.location.pathname == '/facebook/inactive/error') {
        app.expired = true;
        $scope.alert = 'alert alert-danger';
        app.errorMsg = 'Account is not yet activated. Please check your e-mail for activation link.'; 
    } else {
        Auth.socialMedia($routeParams.token);
        $location.path('/');
    }
})

.controller('twitterCtrl', function($routeParams, Auth, $location, $window, $scope) {

    var app = this;
    app.errorMsg = false;
    app.expired = false; 
    app.disabled = true;
        
    if ($window.location.pathname == '/twittererror') {
        $scope.alert = 'alert alert-danger';
        app.errorMsg = 'Twitter e-mail not found in database.'; 
    } else if ($window.location.pathname == '/twitter/inactive/error') {
        app.expired = true;
        $scope.alert = 'alert alert-danger'; 
        app.errorMsg = 'Account is not yet activated. Please check your e-mail for activation link.'; 
    } else if ($window.location.pathname == '/twitter/unconfirmed/error') {
        $scope.alert = 'alert alert-danger';
        app.errorMsg = 'Your twitter account is either inactive or does not have an e-mail address attached to it.'; 
    } else {
        Auth.socialMedia($routeParams.token);
        $location.path('/');
    }
})

.controller('googleCtrl', function($routeParams, Auth, $location, $window, $scope) {

    var app = this;
    app.errorMsg = false;
    app.expired = false;
    app.disabled = true;

    if ($window.location.pathname == '/googleerror') {
        $scope.alert = 'alert alert-danger';
        app.errorMsg = 'Google e-mail not found in database.'; 
    } else if ($window.location.pathname == '/google/inactive/error') {
        app.expired = true;
        $scope.alert = 'alert alert-danger';
        app.errorMsg = 'Account is not yet activated. Please check your e-mail for activation link.';
    } else {
        Auth.socialMedia($routeParams.token);
        $location.path('/');
    }
});
