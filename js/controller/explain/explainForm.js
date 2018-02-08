(function() {

    angular
        .module('learnApp')
        .controller('explainFormController', explainFormController)
        .directive('explainFormDirective',explainFormDirective);

    explainFormController.$inject = ['$scope'];
    explainFormDirective.$inject = ['$parse'];

    function explainFormController($scope) {
        var explainFormCtrl = this;

        explainFormCtrl.value = {
            explain: {}, //入力した解説
            flag: {
                alert: false, //アラートフラグ
            },
            alert: [], //アラート文
        };

        explainFormCtrl.method = {
            clickPreview: clickPreview, //プレビューボタンクリック
            clickCodeExplain: clickCodeExplain, //解説コードボタンクリック
            dataCheck: dataCheck, //入力データのチェック
        };

        //スタイルロード
        require('./../../../css/commonExplain.css');

        //グローバル変数の読み込み
        explainFormCtrl.globalParam = require('./explainParam');

        init(); //初期化メソッド

        /**
         * 初期化メソッド
         * @return {[type]} [description]
         */
        function init(){
            //解説編集の時
            if(explainFormCtrl.globalParam.flag.detailExplain){
                explainFormCtrl.value.explain = explainFormCtrl.globalParam.value.detailExplain; //編集する解説のセット
            }else{
                explainFormCtrl.value.explain = {}; //解説をリセット
            }
        }

        /**
         * プレビューボタンクリックメソッド
         * @return {[type]} [description]
         */
        function clickPreview(){
            dataCheck(); //入力データのチェック
            //入力エラーがなかったとき
            if(!explainFormCtrl.value.flag.alert){
                var explain = {};
                //プレビューする解説のセット
                explain.content = explainFormCtrl.value.explain.content;
                explain.title = explainFormCtrl.value.explain.title;
                explain.imgUrl = explainFormCtrl.value.explain.imgUrl;
                explainFormCtrl.globalParam.value.previewExplain = explain;
                explainFormCtrl.globalParam.flag.detailExplain = false; //解説編集画面のオフ
                explainFormCtrl.globalParam.flag.previewExplain = true; //解説プレビュー画面のオン
            }
        }

        /**
         * 画像アップロード検知メソッド
         * @param  {[file]} img [アップロード画像]
         * @return {[type]} [description]
         */
        $scope.$watch("img",function(img){
            if(!img || !img.type.match("image.*")){
                return;
            }
            var reader = new FileReader();
            reader.onload = function(){
                $scope.$apply(function(){
                    explainFormCtrl.value.explain.imgUrl = reader.result; //base64画像データのセット
                    var title = "[アップロード画像]"; //解説内容表示用の文章セット
                    //解説内容がないとき
                    if(explainFormCtrl.value.explain.content == undefined){
                        explainFormCtrl.value.explain.content = title; //文章を解説内容に挿入
                    }else{
                        explainFormCtrl.value.explain.content += title; //文章を解説内容に付け足し
                    }
                });
            };
            reader.readAsDataURL(img)
        });

        /**
         * 入力データのチェックメソッド
         * @param  {[String]} value [公開範囲の値]
         * @return {[type]} [description]
         */
        function dataCheck(value){
            explainFormCtrl.value.alert = []; //アラート文の初期化
            //タイトルがなかった時
            if(explainFormCtrl.value.explain.title == undefined){
                explainFormCtrl.value.alert.push('タイトルを入力してください');
            }
            //解説文がなかった時
            if(explainFormCtrl.value.explain.content == undefined){
                explainFormCtrl.value.alert.push('解説を入力してください');
            }
            //アラートがあったとき
            if(explainFormCtrl.value.alert.length != 0){
                explainFormCtrl.value.flag.alert = true; //アラート画面オン
            }else{
                explainFormCtrl.value.flag.alert = false; //アラート画面オフ
                //解説編集の時
                if(explainFormCtrl.globalParam.flag.detailExplain){
                    explainFormCtrl.globalParam.value.detailExplain = explainFormCtrl.value.explain; //解説編集に編集内容をセット
                //解説作成の時
                }else{
                    explainFormCtrl.globalParam.value.explainForm = explainFormCtrl.value.explain; //解説作成に作成内容をセット
                }
            }
            explainFormCtrl.value.explain.openRange = value; //公開範囲のセット
        }

        /**
         * 解説コードクリックメソッド
         * @return {[type]} [description]
         */
        function clickCodeExplain(){
            window.open('./#/codeExplain/', 'subwin','width=530 height=400' ); //解説コード画面の表示
        }
    }

    /**
     * [explainFormDirective ファイルアップロード]
     * @param  {[type]} $parse [description]
     * @return {[type]}        [descriptions]
     */
    function explainFormDirective($parse){
        return{
            restrict: 'A',
            link: function(scope,element,attrs){
                var model = $parse(attrs.explainFormDirective);
                element.bind('change',function(){
                    scope.$apply(function(){
                        model.assign(scope,element[0].files);
                    });
                });
            }
        };
    }
}());
