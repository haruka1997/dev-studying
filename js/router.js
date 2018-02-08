(function () {
    'use strict';

    // ルーティング設定
    angular
        .module('learnApp',['ngRoute'])
        .config(['$routeProvider', function($routeProvider) {
    	$routeProvider
    	.when('/',{
    		templateUrl: './view/main.html',
    		controller: 'mainController',
            controllerAs: 'mainCtrl',
    	})
        .when('/course', {
            templateUrl: './view/course.html',
            controller: 'courseController',
            controllerAs: 'courseCtrl'
        })
        .when('/fieldList', {
            templateUrl: './view/fieldList.html',
            controller: 'fieldListController',
            controllerAs: 'fieldListCtrl'
        })
        .when('/problem/:problems', {
            templateUrl: './view/problem/problem.html',
            controller: 'problemController',
            controllerAs: 'problemCtrl'
        })
        .when('/referExplain', {
            templateUrl: './view/explain/referExplain.html',
            controller: 'referExplainController',
            controllerAs: 'referExplainCtrl'
        })
        .when('/makeExplain', {
            templateUrl: './view/explain/makeExplain.html',
            controller: 'makeExplainController',
            controllerAs: 'makeExplainCtrl'
        })
        .when('/makeProblem', {
            templateUrl: './view/problem/makeProblem.html',
            controller: 'makeProblemController',
            controllerAs: 'makeProblemCtrl'
        })
        .when('/codeExplain', {
            templateUrl: './view/codeExplain.html',
            controller: 'codeExplainController',
            controllerAs: 'codeExplainCtrl'
        })
        .when('/myPage', {
            templateUrl: './view/myPage/myPage.html',
            controller: 'myPageController',
            controllerAs: 'myPageCtrl'
        })
        .when('/signUp', {
            templateUrl: './view/signUp.html',
            controller: 'signUpController',
            controllerAs: 'signUpCtrl'
        })
        .when('/login', {
            templateUrl: './view/login.html',
            controller: 'loginController',
            controllerAs: 'loginCtrl'
        })
        .when('/explainPrint/:item', {
            templateUrl: './view/explain/explainPrint.html',
            controller: 'explainPrintController',
            controllerAs: 'explainPrintCtrl'
        })
        .when('/problemPrint/:item/:title', {
            templateUrl: './view/problem/problemPrint.html',
            controller: 'problemPrintController',
            controllerAs: 'problemPrintCtrl'
        })
    	.otherwise({
    		redirectTo: '/'
    	});
        }])
}());
