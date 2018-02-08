/**
 * problemController as problemCtrl
 * 問題を解く
 */
(function() {

    angular
        .module('learnApp')
        .controller('problemController', problemController)

    problemController.$inject = ['$scope','$sce','$routeParams','ApiService'];
    function problemController($scope,$sce,$routeParams,ApiService) {
        var problemCtrl = this;

        problemCtrl.method = {
            clickComp: clickComp, //編集完了ボタンクリック
            deleteProblem: deleteProblem, //削除ボタンクリック
            clickBookmark:clickBookmark, //ブックマーククリック
            clickBookmarkComp:clickBookmarkComp, //ブックマーク選択完了クリック
            chooseBookmark:chooseBookmark, //ブックマーク選択
        };

        problemCtrl.value = {
            flag: {
                bookmarkLoading: false
            },
            bookmark: [] //ブックマークリスト
        };

        //スタイルの読み込み
        require('./../../../css/commonProblem.css');
        require('./../../../css/problem/showProblem.css');

        //グローバル変数の読み込み
        problemCtrl.globalParam = require('./../module/problemParam');

        init(); //初期化メソッド

        /**
         * 初期化メソッド
         * @return {[type]} [description]
         */
        function init(){
            problemCtrl.globalParam.value.problemList = undefined;
            problemCtrl.globalParam.flag.problemList = true; //問題リスト表示
            problemCtrl.globalParam.flag.problemListLoading = true; //問題リスト読み込み中オン
            $scope.indexCtrl.method.clickNav(1); //画面スタイル設定

            //パラメタが'null'でないときはシャッフル問題
            if($routeParams.problems !== 'null'){
                var problems = JSON.parse(base64url.decode($routeParams.problems)); //パラメタからシャッフル問題を取得
                problemCtrl.globalParam.value.problemList = problems; //問題リストにセット
                problemCtrl.globalParam.flag.problemListLoading = false; //問題リスト読み込み中オフ
                problemCtrl.globalParam.flag.problemList = true; //問題リスト表示
            }
        }

       /**
        * 編集完了ボタンクリックメソッド
        * @return {[type]} [description]
        */
       function clickComp(){
            var detailProblem = problemCtrl.globalParam.value.detailProblem; //問題の編集内容を退避
            //選択肢の配列化
            detailProblem.choiceNo[0] = detailProblem.No1;
            detailProblem.choiceNo[1] = detailProblem.No2;
            detailProblem.choiceNo[2] = detailProblem.No3;
            detailProblem.choiceNo[3] = detailProblem.No4;
           /**
            * 問題の更新
            * @type {Object} 問題の編集内容
            */
           ApiService.updateProblem(detailProblem).success(
               function(){
                   problemCtrl.globalParam.value.detailProblem = undefined; //問題の編集内容をリセット
                   init(); //初期化メソッド
               }
           );

       }

       /**
        * 削除ボタンクリックメソッド
        * @return {[type]} [description]
        */
       function deleteProblem(){
           var deleteProblem = problemCtrl.globalParam.value.showProblem; //削除対象(表示中)の問題を退避
           /**
            * 問題の削除
            * @type {Object} 削除する問題
            */
           ApiService.deleteProblem(deleteProblem).success(
               function(){
                   problemCtrl.globalParam.flag.showProblem = false; //問題非表示
                   problemCtrl.globalParam.value.showProblem = undefined; //表示中の問題をリセット
                   init();
               }
           );
       }

       /**
        * ブックマーク取得メソッド
        * @return {[type]} [description]
        */
       function clickBookmark(){
           problemCtrl.value.flag.bookmarkLoading = true;
           //ブックマークの登録
           ApiService.getBookmark($scope.indexCtrl.value.userId,"問題").success(
              function(data) {
                  // 通信成功時の処理
                  problemCtrl.value.bookmark = data.data;
                  for(var key in problemCtrl.value.bookmark){
                      problemCtrl.value.bookmark[key].flag = false;
                  }
                  problemCtrl.value.flag.bookmarkLoading = false;
              }
           );
       }

       /**
        * ブックマーク選択完了メソッド
        * @return {[type]} [description]
        */
       function clickBookmarkComp(){
           var postItem = {};
           for(var key in problemCtrl.value.bookmark){
               if(problemCtrl.value.bookmark[key].flag){
                   postItem.bookmarkId = problemCtrl.value.bookmark[key].id;
                   break;
               }
           }
           postItem.itemId = problemCtrl.value.problem.id;

           //ブックマーク追加
           ApiService.postBookmarkItem(postItem);
       }

       /**
        * ブックマーク選択メソッド
        * @param  {[Number]} id [ブックマークID]
        * @return {[type]} [description]
        */
       function chooseBookmark(id){
           for(var key in problemCtrl.value.bookmark){
               if(problemCtrl.value.bookmark[key].id === id){
                   problemCtrl.value.bookmark[key].flag = true;
               }else{
                   problemCtrl.value.bookmark[key].flag = false;
               }
           }
       }

    }

}());
