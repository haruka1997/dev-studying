(function() {
    angular
        .module('learnApp')
        .factory('ApiService', ApiService);

    ApiService.$inject = ['$http'];
    function ApiService($http) {
        var service = {
            //解説を見る
            getExplain: getExplain,
            upDateExplain: upDateExplain,
            postEvalute: postEvalute,
            postComment: postComment,
            deleteExplain: deleteExplain,
            getComment: getComment,
            //問題を解く
            getProblem: getProblem,
            updateProblem: updateProblem,
            getShuffleProblem: getShuffleProblem,
            deleteProblem: deleteProblem,
            //解説を作成する
            postExplain: postExplain,
            //問題を作成する
            postProblem: postProblem,
            //マイページ
            getUserInfo: getUserInfo,
            getEvalute: getEvalute,
            updateUserInfo: updateUserInfo,
            postBookmark: postBookmark,
            getBookmark:getBookmark,
            postBookmarkItem:postBookmarkItem,
            getBookmarkItem:getBookmarkItem,
            getPost:getPost,
            //ログイン
            login: login,
            registLoginRecord:registLoginRecord,
            //グループ学習
            postGroup: postGroup,
            postUserGroup: postUserGroup,
            withdrawGroup:withdrawGroup,
            getmyGroup: getmyGroup,
            getUserGroup:getUserGroup,
            upDateGroup:upDateGroup,
            postQuestion:postQuestion,
            getQuestion:getQuestion,
            postAnswer:postAnswer,
            getAnswer:getAnswer,
            getGroups:getGroups,
            //新規登録
            signUp:signUp,
            //勉強記録
            registUserReport:registUserReport
        };

        return service;

        //ヘッダの設定
        var header = {};
        header['Content-Type'] = 'application/json;charset=utf-8';
        var url = 'https://qukmygm8ai.execute-api.ap-northeast-1.amazonaws.com/dev/data/';


        /*解説の取得*/
        function getExplain(field, menu, userId) {

            // パラメータの設定
            var param = {};
            param.field = field;
            param.menu = menu;
            param.userId = userId

            // ajax通信
            return $http({
                method: 'GET',
                url: 'https://qukmygm8ai.execute-api.ap-northeast-1.amazonaws.com/dev/data/explain',
                headers: header,
                params: param
            });
        };

        /*問題の取得*/
        function getProblem(field, menu,userId) {

            // パラメータの設定
            var param = {};
            param.field = field;
            param.menu = menu;
            param.userId = userId;

            // ajax通信
            return $http({
                method: 'GET',
                url: 'https://qukmygm8ai.execute-api.ap-northeast-1.amazonaws.com/dev/data/problem',
                headers: header,
                params: param
            });
        };

        /*解説の投稿*/
        function postExplain(item,userId,field,menu) {
            var sendData = {};
            sendData.items = {};
            sendData.items.title = item.title;
            sendData.items.content = item.content;
            sendData.items.openRange = item.openRange;
            if(item.imgUrl !== undefined){
                sendData.items.imgUrl = item.imgUrl;
            }
            sendData.items.evalute = 0;
            sendData.items.userId = userId;
            sendData.items.field = field;
            sendData.items.menu = menu;
            sendData.insertTime = new Date().getTime();

            var sendDataJSON = JSON.stringify(sendData);

            return $http({
                method: "POST",
                url: 'https://qukmygm8ai.execute-api.ap-northeast-1.amazonaws.com/dev/data/explain',
                headers: header,
                data: sendDataJSON
            });
        };


        /*解説の更新*/
        function upDateExplain(item) {
            var sendData = {};
           sendData.id = item.id;
           sendData.title = item.title;
           sendData.content = item.content;
           if(item.imgUrl !== undefined){
               sendData.imgUrl = item.imgUrl;
           }else{
               sendData.imgUrl = "";
           }
           sendData.evalute = item.evalute;

           var sendDataJSON = JSON.stringify(sendData);

            return $http({
                method: "POST",
                url: 'https://qukmygm8ai.execute-api.ap-northeast-1.amazonaws.com/dev/data/explain/update',
                headers: header,
                data: sendDataJSON
            });
        };

        /**
         * 問題の投稿
         * @param  {[Array]} item [投稿する問題]
         */
        function postProblem(item){
           var sendDataJSON = JSON.stringify(item);

           return $http({
                method: "POST",
                url: 'https://qukmygm8ai.execute-api.ap-northeast-1.amazonaws.com/dev/data/problem',
                headers: header,
                data: sendDataJSON
            });
        };

        /**
         * 問題の更新
         * @param  {[Array]} item [編集後の問題]
         */
        function updateProblem(item){
            var sendData = {};
            sendData.items = {};
            sendData.id = item.id;
            sendData.items.problem = item.problem;
            sendData.items.choiceNo = item.choiceNo;
            sendData.items.answer = item.answer;
            sendData.items.explain = item.explain;
            sendData.items.openRange = item.openRange;
            sendData.items.evalute = item.evalute;
            sendData.items.format = item.format;
            sendData.items.userId = item.userId;
            sendData.items.field = item.field;
            sendData.items.menu = item.menu;
            sendData.items.insertTime = item.insertTime;

           var sendDataJSON = JSON.stringify(sendData);

            return $http({
                method: "POST",
                url: 'https://qukmygm8ai.execute-api.ap-northeast-1.amazonaws.com/dev/data/problem',
                headers: header,
                data: sendDataJSON
            });
        }

        /*評価登録*/
        function postEvalute(item,userId,evalute,flag){
            /*評価情報の登録*/
            var sendData = {};
            sendData.items = {};
            sendData.items.evaluteId = item.id;
            sendData.items.evalute = evalute;
            sendData.items.userId = userId;
           if(flag){
               sendData.items.explainFlag = true;
           }else{
               sendData.items.explainFlag = false;
           }
           var sendDataJSON = JSON.stringify(sendData);

            return $http({
                method: "POST",
                url: 'https://qukmygm8ai.execute-api.ap-northeast-1.amazonaws.com/dev/data/evalute',
                headers: header,
                data: sendDataJSON
            });
        };

        /*コメント投稿*/
        function postComment(item){
            return $http({
                method: "POST",
                url: 'https://qukmygm8ai.execute-api.ap-northeast-1.amazonaws.com/dev/data/comment',
                headers: header,
                data: item
            });
        };

        /*解説の削除*/
        function deleteExplain(id){
            var sendData = {};
           sendData.id = id;
           var sendDataJSON = JSON.stringify(sendData);

           return $http({
               method: "POST",
               url: 'https://qukmygm8ai.execute-api.ap-northeast-1.amazonaws.com/dev/data/explain/delete',
               headers: header,
               data: sendDataJSON
           });
       };

       /*ユーザ情報の取得*/
       function getUserInfo(userId){
           var param = {};
           param.userId = userId;

           // ajax通信
           return $http({
               method: "GET",
               url: 'https://qukmygm8ai.execute-api.ap-northeast-1.amazonaws.com/dev/data/user/info',
               headers: header,
               params: param
           });
       };

       /*評価情報の取得*/
       function getEvalute(userId,type){
           var param = {};
           param.userId = userId;
           param.type = type;

           // ajax通信
           return $http({
               method: "GET",
               url: 'https://qukmygm8ai.execute-api.ap-northeast-1.amazonaws.com/dev/data/evalute',
               headers: header,
               params: param
           });
       }

       function updateUserInfo(userId, item){
           var sendData = {};
           sendData.updateItem = {};
           sendData.userId = userId;
           sendData.updateItem.userName = item.userName;
           sendData.updateItem.introduction = item.introduction;
           sendData.updateItem.goal = item.goal;
           sendData.updateItem.userIcon = item.userIcon;

           var sendDataJSON = JSON.stringify(sendData);
           return $http({
               method: "POST",
               url: 'https://qukmygm8ai.execute-api.ap-northeast-1.amazonaws.com/dev/data/user/update',
               headers: header,
               data: sendDataJSON
           });
       }

       function postBookmark(item, userId){
           var sendData = {};
           sendData.items = {};
           sendData.items.userId = userId;
           sendData.items.name = item.name;
           sendData.items.explain = item.explain;
           sendData.items.type = item.type;
           sendData.items.openRange = item.openRange;

           var sendDataJSON = JSON.stringify(sendData);
           return $http({
               method: "POST",
               url: 'https://qukmygm8ai.execute-api.ap-northeast-1.amazonaws.com/dev/data/bookmark',
               headers: header,
               data: sendDataJSON
           });
       }

       function getBookmark(userId,type){
           var param = {};
           param.userId = userId;
           if(type === undefined){
               param.type = "全て";
           }else{
               param.type = type;
           }

           // ajax通信
           return $http({
               method: "GET",
               url: 'https://qukmygm8ai.execute-api.ap-northeast-1.amazonaws.com/dev/data/bookmark',
               headers: header,
               params: param
           });
       }

       function postBookmarkItem(item){
          var sendData = {};
          sendData.bookmarkId = item.bookmarkId;
          sendData.itemId = item.itemId;

          var sendDataJSON = JSON.stringify(sendData);

           return $http({
               method: "POST",
               url: 'https://qukmygm8ai.execute-api.ap-northeast-1.amazonaws.com/dev/data/bookmark/item',
               headers: header,
               data: sendDataJSON
           });
       }

       function getBookmarkItem(id, type){
           var param = {};
           param.bookmarkId = id;
           param.type = type;

           // ajax通信
           return $http({
               method: "GET",
               url: 'https://qukmygm8ai.execute-api.ap-northeast-1.amazonaws.com/dev/data/bookmark/item',
               headers: header,
               params: param
           });
       }

       function getComment(id, type){
           var param = {};
           param.id = id;
           param.type = type;

           // ajax通信
           return $http({
               method: "GET",
               url: 'https://qukmygm8ai.execute-api.ap-northeast-1.amazonaws.com/dev/data/comment',
               headers: header,
               params: param
           });
       }

       function getPost(userId,type){
           var param = {};
           param.userId = userId;
           param.type = type;

           // ajax通信
           return $http({
               method: "GET",
               url: 'https://qukmygm8ai.execute-api.ap-northeast-1.amazonaws.com/dev/data/comment/post',
               headers: header,
               params: param
           });
       }

       /*ログイン*/
       function login(item){
           var sendData = {};
          sendData.userId = item.email;
          sendData.password = sha256(item.password);

          var sendDataJSON = JSON.stringify(sendData);

           return $http({
               method: "POST",
               url: 'https://qukmygm8ai.execute-api.ap-northeast-1.amazonaws.com/dev/data/login',
               headers: header,
               data: sendDataJSON
           });
       };

       /*ログイン履歴の更新*/
       function registLoginRecord(item,loginRecord){
           var sendData = {};
          sendData.items = {};
          sendData.items.email = item.email;
          sendData.items.userName = item.userName;
          sendData.items.birthday = item.birthday;
          sendData.items.password = item.password;
          sendData.items.srcUrl = item.srcUrl;
          sendData.items.goal = item.goal;
          sendData.items.loginRecord = loginRecord;

          var sendDataJSON = JSON.stringify(sendData);
          console.log(sendDataJSON)

           return $http({
               method: "POST",
               url: 'https://qukmygm8ai.execute-api.ap-northeast-1.amazonaws.com/dev/data/login/record',
               headers: header,
               data: sendDataJSON
           });
       }

       /*シャッフル問題の取得*/
       function getShuffleProblem(fields,menu,num){
           var param = {};
           param.fields = String(fields);
           param.menu = menu;
           param.num = num;

           // ajax通信
           return $http({
               method: "GET",
               url: 'https://qukmygm8ai.execute-api.ap-northeast-1.amazonaws.com/dev/data/problem/shuffle',
               headers: header,
               params: param
           });
       };

       /*問題の削除*/
       function deleteProblem(id){
           var sendData = {};
          sendData.id = id;
          var sendDataJSON = JSON.stringify(sendData);

          return $http({
              method: "POST",
              url: 'https://qukmygm8ai.execute-api.ap-northeast-1.amazonaws.com/dev/data/problem/delete',
              headers: header,
              data: sendDataJSON
          });
       }

       /*グループ作成*/
       function postGroup(item){
           var sendData = {};
           sendData.items = {};
           sendData.items.groupName = item.groupName;
           sendData.items.introduction = item.introduction;

           var sendDataJSON = JSON.stringify(sendData);
           return $http({
               method: "POST",
               url: 'https://qukmygm8ai.execute-api.ap-northeast-1.amazonaws.com/dev/data/group',
               headers: header,
               data: sendDataJSON
           });
       };

       function postUserGroup(groupId,userId){
           var sendData = {};
           sendData.items = {};
           sendData.items.groupId = groupId;
           sendData.items.userId = userId;

           var sendDataJSON = JSON.stringify(sendData);
           return $http({
               method: "POST",
               url: 'https://qukmygm8ai.execute-api.ap-northeast-1.amazonaws.com/dev/data/group/user',
               headers: header,
               data: sendDataJSON
           });
       }

       function withdrawGroup(id){
           var sendData = {};
           sendData.id = id;

           var sendDataJSON = JSON.stringify(sendData);
           return $http({
               method: "POST",
               url: 'https://qukmygm8ai.execute-api.ap-northeast-1.amazonaws.com/dev/data/group/user/delete',
               headers: header,
               data: sendDataJSON
           });
       };

       /*マイグループの取得*/
       function getmyGroup(userId){
           var param = {};
           param.userId = userId;
           // ajax通信
           return $http({
               method: "GET",
               url: 'https://qukmygm8ai.execute-api.ap-northeast-1.amazonaws.com/dev/data/group',
               headers: header,
               params: param
           });
       };

       function getUserGroup(groupId){
           var param = {};
           param.groupId = groupId;
           // ajax通信
           return $http({
               method: "GET",
               url: 'https://qukmygm8ai.execute-api.ap-northeast-1.amazonaws.com/dev/data/group/user',
               headers: header,
               params: param
           });
       }

       /*グループ更新*/
       function upDateGroup(item){
           var sendData = {};
           sendData.items = {};
           sendData.insertTime = item.insertTime;
           sendData.id = item.id;
           sendData.items.groupName = item.groupName;
           sendData.items.introduction = item.introduction;
           sendData.items.createUserId = item.createUserId;
           sendData.items.createUserName = item.createUserName;
           sendData.items.joinUserId= item.joinUserId;
           sendData.items.joinUserName = item.joinUserName;

           var sendDataJSON = JSON.stringify(sendData);
           return $http({
               method: "POST",
               url: 'https://qukmygm8ai.execute-api.ap-northeast-1.amazonaws.com/dev/data/group',
               headers: header,
               data: sendDataJSON
           });
       };

       /*質問投稿*/
       function postQuestion(item){
           var sendData = {};
           sendData.items = {};
           sendData.items.title = item.title;
           sendData.items.content = item.content;
           sendData.items.userId = item.userId;
           sendData.items.groupId = item.groupId;

           var sendDataJSON = JSON.stringify(sendData);
           return $http({
               method: "POST",
               url: 'https://qukmygm8ai.execute-api.ap-northeast-1.amazonaws.com/dev/data/question',
               headers: header,
               data: sendDataJSON
           });
       };

       /*質問の取得*/
       function getQuestion(groupId){
           var param = {};
           param.groupId = groupId;
           // ajax通信
           return $http({
               method: "GET",
               url: 'https://qukmygm8ai.execute-api.ap-northeast-1.amazonaws.com/dev/data/question',
               headers: header,
               params: param
           });
       };

       /*回答投稿*/
       function postAnswer(item){
           var sendData = {};
           sendData.items = {};
           sendData.id = item.id;
           sendData.items.answer = item.answer;
           sendData.items.userId = item.userId;
           sendData.items.questionId = item.questionId;
           sendData.items.good = item.good;
           sendData.items.bad = item.bad;

           var sendDataJSON = JSON.stringify(sendData);
           return $http({
               method: "POST",
               url: 'https://qukmygm8ai.execute-api.ap-northeast-1.amazonaws.com/dev/data/question/answer',
               headers: header,
               data: sendDataJSON
           });
       };

       /*回答の取得*/
       function getAnswer(questionId){
           var param = {};
           param.questionId = questionId;
           // ajax通信
           return $http({
               method: "GET",
               url: 'https://qukmygm8ai.execute-api.ap-northeast-1.amazonaws.com/dev/data/question/answer',
               headers: header,
               params: param
           });
       };

       /*回答の取得*/
       function getGroups(){
           // ajax通信
           return $http({
               method: "GET",
               url: 'https://qukmygm8ai.execute-api.ap-northeast-1.amazonaws.com/dev/data/group/groups',
               headers: header,
           });
       };

       /**
        * 新規登録メソッド
        * @param  {[String]} name     [ユーザ名]
        * @param  {[String]} email    [メールアドレス]
        * @param  {[String]} password [パスワード]
        */
       function signUp(name,email,password){
           var sendData = {};
           sendData.items = {};
           sendData.items.userName = name;
           sendData.items.userId = email;
           sendData.items.password = password;

           var sendDataJSON = JSON.stringify(sendData);
           return $http({
               method: "POST",
               url: 'https://qukmygm8ai.execute-api.ap-northeast-1.amazonaws.com/dev/data/user/regist',
               headers: header,
               data: sendDataJSON
           });
       };

       function registUserReport(userId, studyTime, week,menu){
           var sendData = {};
           sendData.items = {};
           sendData.userId = userId;
           sendData.items.time = studyTime;
           sendData.items.week = week;
           sendData.items.menu = menu;

           var sendDataJSON = JSON.stringify(sendData);
           return $http({
               method: "POST",
               url: 'https://qukmygm8ai.execute-api.ap-northeast-1.amazonaws.com/dev/data/user/regist/report',
               headers: header,
               data: sendDataJSON
           });
       }
    }
})();
