module.exports.calcEvalute = function(data){
    //画像ロード
    var dif_img = require('./../../../img/difficult.png');
    var und_img = require('./../../../img/understand.png');
    var dif_sum = 0;
    var und_sum = 0;
    var averageEvalute = {
        difficult: 0,
        understand: 0
    };
    //平均評価値の算出
    for(var i=0; i<data.length;i++){
        if(typeof data[i].evalute !== 'object'){
            data[i].evalute = {};
            data[i].evalute.difficult = 0;
            data[i].evalute.understand = 0;
        }
        dif_sum += data[i].evalute.difficult;
        und_sum += data[i].evalute.understand;
    }
    averageEvalute.difficult = Math.floor(dif_sum / data.length);
    averageEvalute.understand = Math.floor(und_sum / data.length);
    //表示する評価の形式
    for(var i=0; i<data.length; i++){
        data[i].showEvalute = {
            difficult: [],
            understand: []
        };
        //難易度
        if(data[i].evalute.difficult > averageEvalute.difficult){ //難易度!!!
            for(var j=0; j<3; j++){
                data[i].showEvalute.difficult.push(dif_img);
            }
        }else if(data[i].evalute.difficult == averageEvalute.difficult){//難易度!!
            for(var j=0; j<2; j++){
                data[i].showEvalute.difficult.push(dif_img);
            }
        }else if(data[i].evalute.difficult < averageEvalute.difficult){ //難易度!
            data[i].showEvalute.difficult.push(dif_img);
        }
        //理解度
        if(data[i].evalute.understand > averageEvalute.understand){ //理解度・・・
            for(var j=0; j<3; j++){
                data[i].showEvalute.understand.push(und_img);
            }
        }else if(data[i].evalute.understand == averageEvalute.understand){//理解度・・
            for(var j=0; j<2; j++){
                data[i].showEvalute.understand.push(und_img);
            }
        }else if(data[i].evalute.understand < averageEvalute.understand){ //理解度・
            data[i].showEvalute.understand.push(und_img);
        }
    }
    return data;
};
