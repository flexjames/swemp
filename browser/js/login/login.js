app.config(function ($stateProvider) {

    $stateProvider.state('login', {
        url: '/login',
        templateUrl: 'js/login/login.html',
        controller: 'LoginCtrl'
    });

});

app.controller('LoginCtrl', function ($scope, AuthService, $state, AUTH_EVENTS, Session, CartFactory) {

    $scope.$on(AUTH_EVENTS.loginSuccess, function(){
      var user = Session.user;
      if (CartFactory.isCart()) //If anon user has begun filling cart
        CartFactory.sendCartToApi(); //TO DO: add merging of carts
      else if (!CartFactory.isCart() && user){
        CartFactory.fetchOrders(user._id).then(function(orders){
          if (orders.length)
            CartFactory.setCart(orders[0]);
        });
      }
    });

    $scope.login = {};
    $scope.error = null;

    $scope.sendLogin = function (loginInfo) {

        $scope.error = null;

        AuthService.login(loginInfo).then(function () {
            $state.go('home');
        }).catch(function () {
            $scope.error = 'Invalid login credentials.';
        });

    };

});
