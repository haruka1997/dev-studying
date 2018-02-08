/*配列並べ替え*/

module.exports.order = function(array, order,mark){
    var orderArray = JSON.parse(array);
    console.log(orderArray);
    if(order == '作成日'){
        if(mark.insertTime == '▲'){ //現在の並びが古い順の場合は,新しい順に並び替え
            mark.insertTime = '▼';
            orderArray.sort(function(a,b){
                    if( a.insertTime < b.insertTime ) return 1;
                    if( a.insertTime > b.insertTime ) return -1;
                    return 0;
            });
        }else{ //現在の並びが新しい順の場合は,古い順に並び替え
            mark.insertTime = '▲';
            orderArray.sort(function(a,b){
                    if( a.insertTime < b.insertTime ) return -1;
                    if( a.insertTime > b.insertTime ) return 1;
                    return 0;
            });
        }
    }else if(order == '難易度'){
        if(mark.difficult == '▲' || mark.difficult == '●'){ //現在が難易度が低い順の場合は,高い順に並び替え
            mark.difficult = '▼';
            orderArray.sort(function(a,b){
                    if( a.evalute.difficult < b.evalute.difficult ) return 1;
                    if( a.evalute.difficult > b.evalute.difficult ) return -1;
                    return 0;
            });
        }else{ //現在が難易度が高い順の場合は,低い順に並び替え
            mark.difficult = '▲';
            orderArray.sort(function(a,b){
                    if( a.evalute.difficult < b.evalute.difficult ) return -1;
                    if( a.evalute.difficult > b.evalute.difficult ) return 1;
                    return 0;
            });
        }
    }else if(order == '理解度'){
        if(mark.understand == '▲' || mark.understand == '●'){ //現在が理解度が低い順の場合は,高い順に並び替え
            mark.understand = '▼';
            orderArray.sort(function(a,b){
                    if( a.evalute.understand < b.evalute.understand ) return 1;
                    if( a.evalute.understand > b.evalute.understand ) return -1;
                    return 0;
            });
        }else{ //現在が理解度が高い順の場合は,低い順に並び替え
            mark.understand = '▲';
            orderArray.sort(function(a,b){
                    if( a.evalute.understand < b.evalute.understand ) return -1;
                    if( a.evalute.understand > b.evalute.understand ) return 1;
                    return 0;
            });
        }
    }
    var returnObject = {
        order: orderArray,
        mark: mark
    };
    return returnObject;
};
