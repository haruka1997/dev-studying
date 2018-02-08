(function() {

    angular
        .module('learnApp')
        .controller('explainModalController', explainModalController);

    explainModalController.$inject = ['$scope','$sce','ApiService'];
    function explainModalController($scope,$sce,ApiService) {
        var explainModalCtrl = this;

        explainModalCtrl.value = {
            showExplain: {}, //表示する解説
            flag: {
                sameUser: false, //自分が作成した解説
                previewUser: false, //解説プレビュー
                showComment: false, //コメント表示
                commentLoading: false //コメント読み込み中
            },
            explainContent: "", //解説内容
            comments: [] //解説宛のコメント
        };

        explainModalCtrl.method = {
            init: init, //初期化
            clickPrintButton: clickPrintButton, //印刷ボタンクリック
            clickEditButton:clickEditButton, //編集ボタンクリック
            clickFinishButton: clickFinishButton, //終了ボタンクリック
            clickPreviewCompleteButton:clickPreviewCompleteButton, //プレビュー完了クリック
            clickDeleteButton:clickDeleteButton, //削除クリック
            clickCommentButton: clickCommentButton //コメント表示クリック
        };

        //スタイルロード
        require('./../../../css/explain/explainModal.css');

        //グローバル変数の読み込み
        explainModalCtrl.globalParam = require('./explainParam');

        //jquery読み込み
        const jquery = require('./../../../node_modules/jquery/dist/jquery.min.js');

        //初期化メソッド
        init();

        /**
         * 初期化メソッド
         * @return {[type]} [description]
         */
        function init(){
            //解説モーダル表示の時
            if(explainModalCtrl.globalParam.flag.showExplain){
                explainModalCtrl.value.showExplain = explainModalCtrl.globalParam.value.showExplain; //表示する解説のセット
            //解説プレビュー表示の時
            }else{
                explainModalCtrl.value.showExplain = explainModalCtrl.globalParam.value.previewExplain; //プレビューする解説のセット
            }
            //表示する解説はユーザが作成したものか
            if(explainModalCtrl.value.showExplain.userId == $scope.indexCtrl.value.userId){
                explainModalCtrl.value.flag.sameUser = true;
            }else{
                //作成した解説のユーザIDが未定義の時(まだ解説を作成していない時)
                if(explainModalCtrl.value.showExplain.userId===undefined){
                    explainModalCtrl.value.flag.previewUser = true;
                }else{
                    explainModalCtrl.value.flag.sameUser = false;
                }
            }
            //解説のマークアップ
            var explain = require('./../module/markChange'); //マークチェンジモジュールの呼び出し
            explainModalCtrl.value.explainContent = explain.markupChange(explainModalCtrl.value.showExplain.content,explainModalCtrl.value.showExplain.imgUrl);
            explainModalCtrl.value.explainContent = $sce.trustAsHtml(explainModalCtrl.value.explainContent); //ng-bind-view
        }


        /**
         * 印刷ボタンクリックメソッド
         * @return {[type]} [description]
         */
        function clickPrintButton(){
           var itemsString = JSON.stringify(explainModalCtrl.value.showExplain); //印刷する解説の文字列化
           var itemsStringBase64 = base64url.encode(itemsString); //印刷する解説のbase64化
           var url = './#/explainPrint/' + itemsStringBase64; //画面遷移先のURL設定
           window.open(url); //印刷画面の表示
        }

        /**
         * 編集ボタンクリックメソッド
         * @return {[type]} [description]
         */
        function clickEditButton(){
            explainModalCtrl.globalParam.flag.showExplain = false; //解説モーダル非表示
            explainModalCtrl.globalParam.flag.detailExplain = true; //解説編集画面の表示
            explainModalCtrl.globalParam.value.detailExplain = explainModalCtrl.value.showExplain; //表示中の解説を解説編集にセット
        }

        /**
         * 終了ボタンクリックメソッド
         * @return {[type]} [description]
         */
        function clickFinishButton(){
            //解説モーダル表示の時
            if(explainModalCtrl.globalParam.flag.showExplain){
                explainModalCtrl.globalParam.flag.showExplain = false; //解説モーダル非表示
            //解説プレビュー表示の時
            }else{
                explainModalCtrl.globalParam.flag.previewExplain = false; //解説プレビュー非表示
            }
        }

        /**
         * プレビュー完了メソッド
         * @return {[type]} [description]
         */
        function clickPreviewCompleteButton(){
            explainModalCtrl.globalParam.flag.previewExplain = false; //解説プレビュー非表示
            explainModalCtrl.globalParam.flag.detailExplain = true; //解説編集画面の表示
        }

        /**
         * 削除クリックメソッド
         * @return {[type]} [description]
         */
        function clickDeleteButton(){
            explainModalCtrl.globalParam.value.showExplain = explainModalCtrl.value.showExplain; //表示中の解説を表示解説にセット
            explainModalCtrl.globalParam.flag.showExplain = false; //解説モーダル非表示
        }

        /**
         * コメント表示クリックメソッド
         * @return {[type]} [description]
         */
        function clickCommentButton(){
            if(!explainModalCtrl.value.flag.showComment){
                jquery('#comment').css(
                    {
                        'display': 'block'
                    }
                );
                jquery('#comment').animate(
                    {
                        'width':'30%'
                    },
                    {
                        'duration': 300
                    }
                );
                jquery('#content').animate(
                    {
                        'width':'60%'
                    },
                    {
                        'duration': 300
                    }
                );
                explainModalCtrl.value.flag.showComment = true;
                if(explainModalCtrl.value.comments.length === 0){
                    explainModalCtrl.value.flag.commentLoading = true;
                    //コメントの取得
                    ApiService.getComment(explainModalCtrl.globalParam.value.showExplain.id, 'explain').success(
                       function(data) {
                           if(data.data.length !== 0){
                               explainModalCtrl.value.comments = data.data;
                           }
                           explainModalCtrl.value.flag.commentLoading = false;
                       }
                    );
                }
           }else{
               jquery('#comment').animate(
                   {
                       'width':'20%'
                   },
                   {
                       'duration': 300
                   }
               );
               jquery('#content').animate(
                   {
                       'width':'75%'
                   },
                   {
                       'duration': 300
                   }
               );
              jquery('#comment').css(
                  {
                      'display': 'none'
                  }
              );

              explainModalCtrl.value.flag.showComment = false;
           }
        }
    }
}());
