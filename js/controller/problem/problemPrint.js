(function() {
    'use strict';

    angular
        .module('learnApp')
        .controller('problemPrintController', problemPrintController);

    problemPrintController.$inject = ['$scope', '$sce','$routeParams','$http','ApiService'];
    function problemPrintController($scope,$sce, $routeParams, $http,ApiService) {
        var problemPrintCtrl = this;

        problemPrintCtrl.value = {
            flag:{
                problem: true,
                answer: false
            },
            content: {},
            title: ""
        };

        problemPrintCtrl.method = {
            clickMenu: clickMenu,
            clickPrint: clickPrint
        };

        require('./../../../css/print.css');
        init();

        function init(){
            $scope.indexCtrl.value.flag.print = true;
            $scope.indexCtrl.method.clickNav(3);
            problemPrintCtrl.value.content = JSON.parse(base64url.decode($routeParams.item));
            problemPrintCtrl.value.title = base64url.decode($routeParams.title);
            var explain = require('./../module/markChange.js');
            //問題文
            for(var i=0; i<problemPrintCtrl.value.content.length;i++){
                problemPrintCtrl.value.content[i].problem = explain.markupChange(problemPrintCtrl.value.content[i].problem);
                problemPrintCtrl.value.content[i].sceProblem = $sce.trustAsHtml(problemPrintCtrl.value.content[i].problem); //ng-bind-view/*
            }
        }

        /*メニュークリック*/
        function clickMenu(menu){
            if(menu == 'problem'){
                problemPrintCtrl.value.flag.problem = true;
                problemPrintCtrl.value.flag.answer = false;
            }else if(menu == 'answer'){
                problemPrintCtrl.value.flag.problem = false;
                problemPrintCtrl.value.flag.answer = true;
            }
        };

        /*印刷*/
        function clickPrint(){
            window.print();
        };
    }

}());
