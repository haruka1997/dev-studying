module.exports.calcDate = function(userExplain,userProblem){
    var day = new Date().getDay();
    var date = new Date();
    switch(day){
        case 2:
        date.setDate(date.getDate() - 1);
        break;
        case 3:
        date.setDate(date.getDate() - 2);
        break;
        case 4:
        date.setDate(date.getDate() - 3);
        break;
        case 5:
        date.setDate(date.getDate() - 4);
        break;
        case 6:
        date.setDate(date.getDate() - 5);
        break;
        case 0:
        date.setDate(date.getDate() - 6);
        break;
    }

    var monday_month = date.getMonth() + 1;
    var monday_date = date.getDate();
    var explainCount = {
        "monday": 0,
        "tuesday": 0,
        "wednesday": 0,
        "thursday": 0,
        "friday": 0,
        "saturday": 0,
        "sunday": 0
    };
    var problemCount = {
        "monday": 0,
        "tuesday": 0,
        "wednesday": 0,
        "thursday": 0,
        "friday": 0,
        "saturday": 0,
        "sunday": 0
    };
    for(var i=0; i<userExplain.length; i++){
        var month = new Date(userExplain[i].insertTime).getMonth() + 1;
        if(month == monday_month){
            var explain_date = new Date(userExplain[i].insertTime).getDate();
            if(explain_date - monday_date == 0){
                explainCount.monday++;
            }else if(explain_date - monday_date == 1){
                explainCount.tuesday++;
            }else if(explain_date - monday_date == 2){
                explainCount.wednesday++;
            }else if(explain_date - monday_date == 3){
                explainCount.thursday++;
            }else if(explain_date - monday_date == 4){
                explainCount.friday++;
            }else if(explain_date - monday_date == 5){
                explainCount.saturday++;
            }else if(explain_date - monday_date == 6){
                explainCount.sunday++;
            }
        }
    }

    for(var i=0; i<userProblem.length; i++){
        var month = new Date(userProblem[i].insertTime).getMonth() + 1;
        if(month == monday_month){
            var date = new Date(userProblem[i].insertTime).getDate();
            if(date - monday_date == 0){
                problemCount.monday++;
            }else if(date - monday_date == 1){
                problemCount.tuesday++;
            }else if(date - monday_date == 2){
                problemCount.wednesday++;
            }else if(date - monday_date == 3){
                problemCount.thursday++;
            }else if(date - monday_date == 4){
                problemCount.friday++;
            }else if(date - monday_date == 5){
                problemCount.saturday++;
            }else if(date - monday_date == 6){
                problemCount.sunday++;
            }
        }
    }
    var count = [];
    count.explain = explainCount;
    count.problem = problemCount;
    return count;

}
