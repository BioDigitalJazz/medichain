require('angular');
require('angular-ui-bootstrap');
// let apiURL = 'http://127.0.0.1/api';
// let appURL = window.location.origin;

import '../style/app.css';
import '../../node_modules/bootstrap/dist/css/bootstrap.min.css'
import '../../node_modules/angular-ui-bootstrap/dist/ui-bootstrap-csp.css'

angular.module('app', []);


let app = () => {
  return {
    template: require('./app.jade'),
    controller: ['$scope', '$http', AppCtrl],
    controllerAs: 'app'
  }
};

let sec1data = {name: "John Smith", data1: 1, data2: 2, data3: 3, data4: 4, data5: 5}
let sec1list = [sec1data,sec1data,sec1data,sec1data,sec1data,sec1data]

class AppCtrl {
  constructor($scope, $http) {
    let self = this;

    $scope.pages = {
      sec1: "sec1",
      sec2: "sec2",
      sec3: "sec3"
    };
    $scope.state = {currentPage: $scope.pages.sec1};
    $scope.modals = {
      login: "Login",
      signup: "Signup"
    }
    $scope.sec1 = {list: sec1list};
    // $scope.interface = {};
    // $scope.userLogin = {email: '', password: ''};

    
    // this.userLogin = function() {
    //   console.log($scope.userLogin)
    //   // let postData = querystring.stringify($scope.userLogin);
    //   $http({
    //     method: 'POST',
    //     url: apiURL + '/Login',
    //     data: $scope.userLogin
    //   })
    //   .then(function(response) {
    //     console.log(response);

    //   }, function(errorResponse) {
    //     console.log(errorResponse);
    //   });
    // }

  }
}


angular.module('app', ['ui.bootstrap'])
  .directive('app', app)
  .controller('AppCtrl', AppCtrl)
;

export default 'app';
