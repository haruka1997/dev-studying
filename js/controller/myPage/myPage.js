/**
 * myPageController as myPageCtrl
 * マイページ
 */

(function() {

    angular
        .module('learnApp')
        .controller('myPageController', myPageController)
        .directive('fileModel',fileModel);

    myPageController.$inject = ['$scope','ApiService'];
    fileModel.$inject = ['$parse'];

    function myPageController($scope,ApiService) {
        var myPageCtrl = this;

        myPageCtrl.method = {
            init: init, //初期化
            styleChange: styleChange, //タブスタイルの変更
            clickExplain: clickExplain, //解説のクリック
            clickProblem: clickProblem, //問題のクリック
            clickDetailComp:clickDetailComp, //プロフィール編集完了
            clickCreateBookmark:clickCreateBookmark, //ブックマーク作成クリック
            clickBookmark: clickBookmark, //ブックマーククリック
            clickStudyRecord:clickStudyRecord, //学習記録メニュークリック
            clickPost:clickPost //ポストメニュークリック
        }

        myPageCtrl.value = {
            style: {
                report: "", //レポートスタイル
                studyRecord: "", //学習記録スタイル
                post: "", //ポストスタイル
                bookmark: "" //ブックマークスタイル
            },
            flag: {
                reportFlag: true, //レポートフラグ
                studyRecordFlag: false, //学習記録フラグ
                postFlag: false, //ポストフラグ
                bookmarkFlag: false, //ブックマークフラグ
                loading: true, //読み込み中フラグ
                commentEmpty: false, //コメント空フラグ
                compliting: false, //編集完了中フラグ
                bookmarkList: true, //ブックマークリスト表示フラグ
                bookmarkLoading: false, //ブックマーク読み込み中フラグ
                bookmarkItemEmpty: false, //ブックマークのアイテム空フラグ
                showStudyRecord:false, //学習記録一覧表示フラグ
                showPost: false, //ポスト表示フラグ
                studyRecordLoading: false, //学習記録読み込み中フラグ
                postLoading: false, //ポスト読み込み中フラグ
                showExplainList: false, //解説リスト表示フラグ
                showProblemList: false, //問題リスト表示フラグ
            },
            userInfo: {}, //ユーザ情報
            userReport: [], //ユーザレポート
            userExplain: [], //作成した解説
            userProblem: [], //作成した問題
            explainEvalute: [], //評価した解説
            problemEvalute: [], //評価した問題
            comment: [], //コメント情報
            srcUrl: undefined, //アップロード画像
            detailUserInfo: {}, //編集ユーザ情報
            createBookmark: {}, //新規ブックマーク
            bookmark: [], //ブックマークリスト
            selectBookmark: {}, //選択したブックマーク
            studyRecordList: [], //学習記録リスト,
            postTitle: "", //ポストタブのタイトル
            img: {
                makeExplain: "",
                makeProblem: "",
                evaluteExplain: "",
                evaluteProblem: "",
                postExplain: "",
                postProblem: ""
            }
         }


        //画像ロード
        myPageCtrl.value.img.makeExplain = require('./../../../img/makeExplain.jpg');
        myPageCtrl.value.img.makeProblem = require('./../../../img/makeProblem.jpg');
        myPageCtrl.value.img.evaluteExplain = require('./../../../img/evaluteExplain.jpg');
        myPageCtrl.value.img.evaluteProblem = require('./../../../img/evaluteProblem.jpg');
        myPageCtrl.value.img.postExplain = require('./../../../img/postExplain.jpg');
        myPageCtrl.value.img.postProblem = require('./../../../img/postProblem.jpg');

        init();

        /**
         * 初期化メソッド
         * @return {[type]} [description]
         */
        function init(){
            $scope.indexCtrl.method.check(); //ユーザログインチェック
            $scope.indexCtrl.method.clickNav(2); //画面デザイン2
            $scope.indexCtrl.value.flag.explainList = false; //解説リスト表示オフ
            //タブスタイルセット
            myPageCtrl.value.style.report = {background: '#fff',color: '#4790BB'};
            myPageCtrl.value.style.studyRecord = {background:'#4790BB',color: '#fff'};
            myPageCtrl.value.style.post = {background:'#4790BB',color: '#fff'};
            myPageCtrl.value.style.bookmark = {background:'#4790BB',color: '#fff'};
            //トップページ読み込み中
            myPageCtrl.value.flag.loading = true;

           /**
            * ユーザ情報取得
            * @type {[String]} ユーザId
            */
           ApiService.getUserInfo($scope.indexCtrl.value.userId).success(
               function(data) {
                   console.log(data)
                   // 通信成功時の処理
                   myPageCtrl.value.userInfo = data.data.user; //ユーザ情報(プロフィール)
                   myPageCtrl.value.userReport = data.data.report; //ユーザレポート(グラフ)
                   myPageCtrl.value.userExplain = data.data.explain; //ユーザが作成した解説
                   myPageCtrl.value.userProblem = data.data.problem; //ユーザが作成した問題
                   chart(); //グラフ描画メソッド呼び出し
               },
               function(data) {
                  console.log("取得失敗")
               }
            );
       }

       /**
        * グラフ描画メソッド
        * @return {[type]} [description]
        */
       function chart(){
           //今週の月曜日の月日
           var day = require('./../module/calcDate');
           var count = day.calcDate(myPageCtrl.value.userExplain,myPageCtrl.value.userProblem);

           //解説・問題数の棒グラフ
           var line = document.getElementById("countChart");
           var countChart = new Chart(line, {
           //グラフの種類
           type: 'line',
           //データの設定
           data: {
              //データ項目のラベル
              labels: ["月", "火", "水", "木", "金", "土", "日"],
              //データセット
              datasets: [
                  {
                      label: "解説", //凡例
                      fill: false,//面の表示
                      lineTension: 0,//線のカーブ
                      backgroundColor: "#8bbdbe",//背景色
                      borderColor: "#8bbdbe",//枠線の色
                      pointBorderColor: "#8bbdbe",//結合点の枠線の色
                      pointBackgroundColor: "#fff",//結合点の背景色
                      pointRadius: 5,//結合点のサイズ
                      pointHoverRadius: 8, //結合点のサイズ（ホバーしたとき）
                      pointHoverBackgroundColor: "#8bbdbe", //結合点の背景色（ホバーしたとき）
                      pointHoverBorderColor: "#8bbdbe",//結合点の枠線の色（ホバーしたとき）
                      pointHitRadius: 15,//結合点より外でマウスホバーを認識する範囲（ピクセル単位）
                      //グラフのデータ
                      data: [count.explain.monday, count.explain.tuesday, count.explain.wednesday, count.explain.thursday, count.explain.friday, count.explain.saturday, count.explain.sunday]
                  },
                  {
                      label: "問題",//凡例
                      fill: false,//面の表示
                      lineTension: 0,//線のカーブ
                      backgroundColor: "#8bbe96",//背景色
                      borderColor: "#8bbe96",//枠線の色
                      pointBorderColor: "#8bbe96",//結合点の枠線の色
                      pointBackgroundColor: "#fff",//結合点の背景色
                      pointRadius: 5,//結合点のサイズ
                      pointHoverRadius: 8,//結合点のサイズ（ホバーしたとき）
                      pointHoverBackgroundColor: "#8bbe96", //結合点の背景色（ホバーしたとき）
                      pointHoverBorderColor: "#8bbe96",//結合点の枠線の色（ホバーしたとき）
                      pointHitRadius: 10,//結合点より外でマウスホバーを認識する範囲（ピクセル単位）
                      //グラフのデータ
                      data: [count.problem.monday, count.problem.tuesday, count.problem.wednesday, count.problem.thursday, count.problem.friday, count.problem.saturday, count.problem.sunday]
                  }
              ]
          },
          //オプションの設定
          options: {
              //グラフの見出し
              title: {
                  display: true,
                  text: '作成した解説・問題数',
                  padding:3
              },
              //軸の設定
              scales: {
                  //縦軸の設定
                  yAxes: [{
                      //目盛りの設定
                      ticks: {
                          //最小値を0にする
                          beginAtZero: true
                      }
                  }]
              },
              //ホバーの設定
              hover: {
                  //ホバー時の動作（single, label, dataset）
                  mode: 'single'
              }
          }
        });

        /*勉強時間の日別集計*/
        if(myPageCtrl.value.userReport[0] !== undefined){
            //メニュー名の抽出
            var menus = [];
            menus.push(myPageCtrl.value.userReport[0].studyTime.menu); //最初のメニュー名を入れる
            for(var key in myPageCtrl.value.userReport){
                if(menus.indexOf(myPageCtrl.value.userReport[key].studyTime.menu) == -1){
                    menus.push(myPageCtrl.value.userReport[key].studyTime.menu);
                }
            }
            //オブジェクト整形
            var sumTime = {};
            for(var i=0; i<menus.length; i++){
                //勉強時間の初期化
                sumTime[menus[i]] = {
                    0:0, 1:0, 2:0, 3:0, 4:0, 5:0, 6:0
                };
            }
            //勉強時間の曜日別集計
            for(var i=0; i<myPageCtrl.value.userReport.length; i++){
                for(var key in sumTime){
                    if(key === myPageCtrl.value.userReport[i].studyTime.menu){ //メニュー名が一致したら
                        sumTime[key][myPageCtrl.value.userReport[i].studyTime.week] += myPageCtrl.value.userReport[i].studyTime.time;
                    }
                }
            }

            //図のデータセット作成
            var studyTimeData = [];
            var dataColor = ["#8bbdbe","#8bbe96","#8b93be","#be8bad","#be8b8b","#beaf8b","#bcbe8b"];
            for(var key in sumTime){
                var colorIndex = Math.floor(Math.random() * dataColor.length);
                var color = dataColor[colorIndex];
                dataColor.splice(colorIndex,1);
                studyTimeData.push({
                    label: key,
                    borderWidth: 1,
                    backgroundColor:　color,
                    borderColor: color,
                    data: [sumTime[key][1],sumTime[key][2],sumTime[key][3],sumTime[key][4],sumTime[key][5],sumTime[key][6],sumTime[key][0]]
                });
            }
        　}
        　//作図
        　var time = document.getElementById("studyTimeChart");
          var studyTimeChart = new Chart(time, {
              type: 'bar',
              data: {
                  labels: ["月", "火", "水", "木", "金", "土", "日"],
                  datasets: studyTimeData

              },
              options: {
                  title: {
                      display: true,
                      text: '分野別学習時間(分)', //グラフの見出し
                      padding:3
                  },
                  scales: {
                      xAxes: [{
                            stacked: true, //積み上げ棒グラフにする設定
                            categoryPercentage:0.4 //棒グラフの太さ
                      }],
                      yAxes: [{
                            stacked: true //積み上げ棒グラフにする設定
                      }]
                  },
                  legend: {
                      labels: {
                            boxWidth:30,
                            padding:20 //凡例の各要素間の距離
                      },
                      display: true
                  },
                  tooltips:{
                    mode:'label' //マウスオーバー時に表示されるtooltip
                  }
              }
          });
        //トップ表示
        myPageCtrl.value.flag.loading = false;
       }

       /**
        * ファイルアップロード監視
        * @return {[type]} [description]
        */
       $scope.$watch("file",function(file){
           if(!file || !file.type.match("image.*")){
               return;
           }
           var reader = new FileReader();
           reader.onload = function(){
               $scope.$apply(function(){
                   myPageCtrl.value.detailUserInfo.userIcon = reader.result;
               });
           };
           reader.readAsDataURL(file)
       });

       /**
        * タブスタイルの変更
        * @param  {[Number]} style [0:新着情報,1:学習記録]
        * @return {[type]} [description]
        */
        function styleChange(style){
            var idx = style - 1;

            var flagAndStyleData = {
                "reportFlag":[true, false, false, false],
                "studyRecordFlag":[false, true, false, false],
                "postFlag":[false,false,true,false],
                "bookmarkFlag":[false,false,false,true],
                "report":[
                    {background: '#fff',color: '#4790BB'},
                    {background: '#4790BB',color: '#fff'},
                    {background: '#4790BB',color: '#fff'},
                    {background: '#4790BB',color: '#fff'}
                ],
                "studyRecord":[
                    {background:'#4790BB',color: '#fff'},
                    {background:'#fff',color: '#4790BB'},
                    {background:'#4790BB',color: '#fff'},
                    {background:'#4790BB',color: '#fff'}
                ],
                "bookmark":[
                    {background:'#4790BB',color: '#fff'},
                    {background:'#4790BB',color: '#fff'},
                    {background:'#4790BB',color: '#fff'},
                    {background:'#fff',color: '#4790BB'},
                ],
                "post":[
                    {background:'#4790BB',color: '#fff'},
                    {background:'#4790BB',color: '#fff'},
                    {background:'#fff',color: '#4790BB'},
                    {background:'#4790BB',color: '#fff'}
                ]
            }

            myPageCtrl.value.flag.reportFlag = flagAndStyleData["reportFlag"][idx];
            myPageCtrl.value.flag.studyRecordFlag = flagAndStyleData["studyRecordFlag"][idx];
            myPageCtrl.value.flag.postFlag = flagAndStyleData["postFlag"][idx];
            myPageCtrl.value.flag.bookmarkFlag = flagAndStyleData["bookmarkFlag"][idx];
            myPageCtrl.value.style.report = flagAndStyleData["report"][idx];
            myPageCtrl.value.style.studyRecord = flagAndStyleData["studyRecord"][idx];
            myPageCtrl.value.style.bookmark = flagAndStyleData["bookmark"][idx];
            myPageCtrl.value.style.post = flagAndStyleData["post"][idx];

            //ブックマークタブ選択
            if(style === 4){
                getBookmark();
            }
        }


        /**
         * 問題ページの遷移メソッド
         * @param  {[Array]} problem [遷移対象の問題]
         * @param  {[boolean]} flag [選択したのは作成した問題か評価した問題か]
         * @return {[type]} [description]
         */
        function clickProblem(problem,flag){
            $rootScope.problem = problem;
            if(flag){
                $rootScope.problems = myPageCtrl.value.userProblem; //作成した問題
            }else{
                $rootScope.problems = myPageCtrl.value.problemEvalute; //評価した問題
            }
            $scope.indexCtrl.value.flag.showProblem = true;
        }


        /**
         * プロフィール編集メソッド
         * @return {[type]} [description]
         */
        function clickDetailComp(){
            myPageCtrl.value.flag.compliting = true;
            //変更内容の登録
            ApiService.updateUserInfo($scope.indexCtrl.value.userId,myPageCtrl.value.detailUserInfo).success(
               function(data) {
                   // 通信成功時の処理
                   myPageCtrl.value.flag.compliting = false;
               },
               function(data) {
                  console.log("取得失敗")
               }
           );
        }

        /**
         * 新規ブックマーク作成メソッド
         * @param  {[String]} type  [ブックマークの種類]
         * @param  {[String]} range [ブックマークの公開範囲]
         * @return {[type]} [description]
         */
        function clickCreateBookmark(type,range){
            myPageCtrl.value.flag.compliting = true;
            myPageCtrl.value.createBookmark.type = type;
            myPageCtrl.value.createBookmark.openRange = range;

            //ブックマークの登録
            ApiService.postBookmark(myPageCtrl.value.createBookmark,$scope.indexCtrl.value.userId).success(
               function(data) {
                   // 通信成功時の処理
                   myPageCtrl.value.flag.compliting = false;
               },
               function(data) {
                  console.log("取得失敗")
               }
           );
        }

        /**
         * ブックマークの取得メソッド
         * @return {[type]} [description]
         */
        function getBookmark(){
            myPageCtrl.value.flag.bookmarkLoading = true;
            myPageCtrl.value.flag.bookmarkList = true;
            //ブックマークの登録
            ApiService.getBookmark($scope.indexCtrl.value.userId).success(
               function(data) {
                   // 通信成功時の処理
                   myPageCtrl.value.bookmark = data.data;
                   myPageCtrl.value.flag.bookmarkLoading = false;
               },
               function(data) {
                  console.log("取得失敗")
               }
            );
        }

        /**
         * ブックマークアイテム取得メソッド
         * @param  {[Array]} bookmark [選択したブックマーク]
         * @return {[type]} [description]
         */
        function clickBookmark(bookmark){
            myPageCtrl.value.selectBookmark = bookmark;
            myPageCtrl.value.flag.bookmarkList = false;
            myPageCtrl.value.flag.bookmarkLoading = true;
            //ブックマークアイテム取得
            ApiService.getBookmarkItem(bookmark.id,bookmark.type).success(
               function(data) {
                   // 通信成功時の処理
                   if(data !== null){
                       if(bookmark.type == '解説'){
                           $rootScope.explainList = data.data;
                       }else{
                           $rootScope.problemList = data.data;
                       }
                       myPageCtrl.value.flag.bookmarkItemEmpty = false;
                   }else{
                       myPageCtrl.value.flag.bookmarkItemEmpty = true;
                   }
                   myPageCtrl.value.flag.bookmarkLoading = false;
               },
               function(data) {
                  console.log("取得失敗")
               }
            );
        }

        /**
         * 解説クリックメソッド
         * @param  {[Array]} explain [クリックした解説]
         * @return {[type]} [description]
         */
        function clickExplain(explain,flag) {
            $rootScope.explainModal = explain;
            $scope.indexCtrl.value.flag.showExplain = true;
        }

        /**
         * 学習記録タブクリックメソッド
         * @param  {[String]} type [選択したメニュー種類]
         * @return {[type]} [description]
         */
        function clickStudyRecord(type){
            //初期化処理
            $scope.indexCtrl.value.flag.explainList = false;
            myPageCtrl.value.flag.showProblemList = false;
            myPageCtrl.value.flag.showStudyRecord = true;

            if(type == 'makeExplain'){
                $scope.indexCtrl.value.explainList = myPageCtrl.value.userExplain;
                myPageCtrl.value.studyRecordTitle = "作成した解説";
                $scope.indexCtrl.value.flag.explainList = true;
            }else if(type == 'makeProblem'){
                $scope.indexCtrl.value.problemList = myPageCtrl.value.userProblem;
                myPageCtrl.value.studyRecordTitle = "作成した問題";
                myPageCtrl.value.flag.showProblemList = true;
            }else if(type == 'evaluteExplain'){
                $scope.indexCtrl.value.flag.explainListLoading = true;
                myPageCtrl.value.studyRecordTitle = "評価した解説";
                getEvalute($scope.indexCtrl.value.userId,type);
            }else{
                $scope.indexCtrl.value.flag.problemListLoading = true;
                myPageCtrl.value.studyRecordTitle = "評価した問題";
                getEvalute($scope.indexCtrl.value.userId,type);
            }
        }

        /**
         * 評価情報の取得メソッド
         * @param  {[String]} userId [ユーザID]
         * @param  {[String]} type   [選択したのは解説か問題か]
         * @return {[type]} [description]
         */
        function getEvalute(userId, type){
            //評価情報の取得
            ApiService.getEvalute(userId,type).success(
               function(data) {
                   // 通信成功時の処理
                   if(type == 'evaluteExplain'){
                       $scope.indexCtrl.value.explainList = data.data;
                       $scope.indexCtrl.value.flag.explainListLoading = false;
                       $scope.indexCtrl.value.flag.explainList = true;
                   }else{
                       $scope.indexCtrl.value.problemList = data.data;
                       $scope.indexCtrl.value.flag.problemListLoading = false;
                       myPageCtrl.value.flag.showProblemList = true;
                   }
               },
               function(data) {
                  console.log("取得失敗")
               }
           );
        }

        /**
         * ポストタブクリックメソッド
         * @param  {[String]} type [選択したのは解説か問題か]
         * @return {[type]} [description]
         */
        function clickPost(type){
            if(type == 'explain'){
                myPageCtrl.value.postTitle = '解説宛てのコメント';
            }else{
                myPageCtrl.value.postTitle = '問題宛てのコメント'
            }
            myPageCtrl.value.flag.showPost = true;
            myPageCtrl.value.flag.postLoading = true;
            //ポスト情報の取得
            ApiService.getPost($scope.indexCtrl.value.userId,type).success(
               function(data) {
                   if(data.status == 0){
                       // 通信成功時の処理
                       var postData = data.data.postData;
                       var itemData = data.data.itemData;

                       for(var i=0; i<postData.length; i++){
                           myPageCtrl.value.comment[i] = {
                               post: postData[i],
                               item: itemData[i]
                           }
                       }
                   }
                myPageCtrl.value.flag.postLoading = false;
               },
               function(data) {
                  console.log("取得失敗")
               }
           );
        }
    }

    function fileModel($parse){
        return{
            restrict: 'A',
            link: function(scope,element,attrs){
                var model = $parse(attrs.fileModel);
                element.bind('change',function(){
                    scope.$apply(function(){
                        model.assign(scope,element[0].files[0]);
                    });
                });
            }
        };
    }
}());
