// import 'babel-polyfill';
require('angular');
require('angular-ui-bootstrap');
const fileDialog = require('file-dialog');
require('file-saver');
import { saveAs } from 'file-saver';
let sodium = require('sodium-javascript');
let keyReader = new FileReader();
let docReader = new FileReader();
let apiURL = 'http://127.0.0.1/api';
// let appURL = window.location.origin;
let ipfsAPI = require('ipfs-api');
// let ipfsAPI = require('../../node_modules/ipfs-api/src/index.js');
let ipfs = ipfsAPI('localhost', '5001');

let privateKey, publicKey;

import '../style/app.css';
import '../../node_modules/bootstrap/dist/css/bootstrap.min.css'
import '../../node_modules/angular-ui-bootstrap/dist/ui-bootstrap-csp.css'

angular.module('app', [fileDialog]);


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

    $scope.documents = [];
    $scope.pages = {
      createKey: "Load/Create Key",
      upload: "Upload Document",
      mineBlock: "Mine Block",
      viewDocs: "View Documents"
      // healthRecords: "Health Records",
      // labRecords: "Lab Records",
      // appointments: "Appointments",
      // prescriptions: "Prescriptions",
      // payments: "Payments",
      // feedback: "Feedback"
    };
    $scope.state = {currentPage: $scope.pages.createKey, pubKeyString: null};
    $scope.modals = {
      login: "Login",
      signup: "Signup"
    }
    $scope.sec1 = {list: sec1list};
    // $scope.interface = {};
    // $scope.userLogin = {email: '', password: ''};

    keyReader.onload = function(e) {
      let keys = JSON.parse(keyReader.result);
      privateKey = Buffer.from(keys.privateKey, 'hex');
      publicKey = Buffer.from(keys.publicKey, 'hex');
      $scope.state.pubKeyString =  publicKey.toString('hex');
      $scope.state.pubKeyMessage = "User Private Key Loaded!  -  Public Key: " + $scope.state.pubKeyString;
      $scope.$apply();
    };

    this.setPage = function(pageName) {
      $scope.state.currentPage = pageName;
      if (pageName === $scope.pages.mineBlock) {
        $http({
          method: 'GET',
          url: apiURL + '/mine'
          // headers: {"Content-Type": "application/json"},
          // data: $scope.state.docDetails
        })
        .then(function(response) {
          console.log(response);
          $scope.state.mineSuccess = true;
          $scope.documents = $scope.documents.concat(response.data.documents);
          // $scope.$apply();
          setTimeout(function() {
            $scope.state.mineSuccess = null;
          }, 8000)
        }, function(errorResponse) {
          console.log(errorResponse);
        });
      }
    };

    this.openKeyFile = function() {
      fileDialog()
      .then(file => {
        keyReader.readAsText(file[0]);
      })
    };

    this.createNewKey = function() {
      publicKey = Buffer.alloc(sodium.crypto_sign_PUBLICKEYBYTES);
      privateKey = Buffer.alloc(sodium.crypto_sign_SECRETKEYBYTES);
      sodium.crypto_sign_keypair(publicKey, privateKey);
      $scope.state.pubKeyString = "User Private Key Created!  -  Public Key: " + publicKey.toString('hex');
      let fileJSON = {
        publicKey: publicKey.toString('hex'),
        privateKey: privateKey.toString('hex')
      }

      let fileBlob = new Blob([JSON.stringify(fileJSON)]);
      saveAs(fileBlob, "MediChain Keys.json");
    }

    let cipher;
    docReader.onload = function(e) {
      console.log(docReader.result);
      let docBuffer = Buffer.from(docReader.result);
      cipher = Buffer.alloc(docBuffer.length + sodium.crypto_secretbox_MACBYTES);
      let nonce = Buffer.alloc(sodium.crypto_secretbox_NONCEBYTES);
      sodium.randombytes_buf(nonce);
      sodium.crypto_secretbox_easy(cipher, docBuffer, nonce, privateKey);

      let docDetails = {
        "user": publicKey.toString('hex'),
        "nonce": nonce.toString('hex'),
        "description": ""
      }
      $scope.state.docDetails = docDetails;

      $scope.state.readyForUpload = true;
      $scope.$apply();
    }

    this.selectDocument = function() {
      fileDialog()
      .then(file => {
        console.log(file[0]);
        // docReader.readAsArrayBuffer(file[0]);
        docReader.readAsBinaryString(file[0]);
      })

    }

    this.docToBlock = function() {
      ipfs.add(cipher, function(err, filesAdded) {
        let file = filesAdded[0];
        $scope.state.docDetails.docLocation = file.path
        $scope.state.docDetails.docHash = file.hash;
        // console.log(file.path);
        console.log(file.hash);

        $http({
          method: 'POST',
          url: apiURL + '/documents/new',
          headers: {"Content-Type": "application/json"},
          data: $scope.state.docDetails
        })
        .then(function(response) {
          console.log(response);
          $scope.state.readyForUpload = null;
          $scope.state.uploadSuccess = true;
          setTimeout(function() {
            $scope.state.uploadSuccess = false;
          }, 8000)
        }, function(errorResponse) {
          console.log(errorResponse);
        });

      })


      
    }

  }
}




// angular.module('app', ['ui.bootstrap')
angular.module('app', [])
  .directive('app', app)
  .controller('AppCtrl', AppCtrl)
;

export default 'app';
