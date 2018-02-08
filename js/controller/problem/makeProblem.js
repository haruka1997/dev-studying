/**
 * makeProblemController as makeProblemCtrl
 * 問題を作成する
 */
(function() {

    angular
        .module('learnApp')
        .controller('makeProblemController', makeProblemController);

    makeProblemController.$inject = ['$scope','ApiService'];
    function makeProblemController($scope,ApiService) {
        var makeProblemCtrl = this;

        makeProblemCtrl.value = {
            problem: {},
            flag:{
                submiting: false
            }
        };

        makeProblemCtrl.method = {
            clickMake: clickMake, //問題作成
            goProblem: goProblem //問題ページへ
        };

        //グローバル変数の読み込み
        makeProblemCtrl.globalParam = require('./../module/problemParam');

        init();

        /**
         * 初期化メソッド
         * @return {[type]} [description]
         */
        function init(){
            $scope.indexCtrl.method.clickNav(1);
        }

        /**
         * 問題作成ボタンクリックメソッド
         * @return {[type]} [description]
         */
        function clickMake(){
            makeProblemCtrl.value.flag.submiting = true;
            //解説作成の場合
            var sendData = {};
            sendData.items = {};

           sendData.items.problem = makeProblemCtrl.globalParam.value.makeProblem.problem;
           sendData.items.answer = makeProblemCtrl.globalParam.value.makeProblem.answer;
           sendData.items.explain = makeProblemCtrl.globalParam.value.makeProblem.explain;
           sendData.items.openRange = makeProblemCtrl.globalParam.value.makeProblem.openRange;
           sendData.items.format = makeProblemCtrl.globalParam.value.makeProblem.format;
           //sendData.items.evalute = 0;
           if(makeProblemCtrl.globalParam.value.makeProblem.format == '選択肢'){
               var noArray = [];
               noArray.push(makeProblemCtrl.globalParam.value.makeProblem.No1);
               noArray.push(makeProblemCtrl.globalParam.value.makeProblem.No2);
               noArray.push(makeProblemCtrl.globalParam.value.makeProblem.No3);
               noArray.push(makeProblemCtrl.globalParam.value.makeProblem.No4);
               sendData.items.choiceNo = noArray;
           }
           sendData.items.userId = $scope.indexCtrl.value.userId;
           sendData.items.field = $scope.indexCtrl.value.field;
           sendData.items.menu = $scope.indexCtrl.value.menu;
           sendData.items.insertTime = new Date().getTime();

           var sendDataJSON = JSON.stringify(sendData);
           /*問題の投稿*/
           ApiService.postProblem(sendData).success(
               function () {
                   makeProblemCtrl.value.flag.submiting = false;
               }
           );
        }

        /**
         * 問題を解くボタンクリックメソッド
         * @return {[type]} [description]
         */
        function goProblem(){
            $scope.indexCtrl.method.directory("",1,"");
            window.location.href = './#/problem/' + 'null';
            $scope.indexCtrl.value.titleUrl[2] = './#/problem/' + 'null';
            document.cookie = 'titleUrl[2]=' + $scope.indexCtrl.value.titleUrl[2];
        }
    }
}());
