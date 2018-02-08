angular.module('learnApp')
    .filter("timeFilter", function() {
    return function(number) {
        var seconds;
        var minutes = 0;
        var hours = 0;

        if (number < 60) {
            seconds = number;
        }
        else if (number >= 60 && number <= 3600) {
            minutes = Math.floor(number / 60);
            seconds = number % 60;
        }
        else {
            hours = Math.floor(number / 3600);
            minutes = Math.floor((number % 3600) / 60);
            seconds = Math.floor((number % 3600) % 60);
        }
        seconds = seconds < 10 ? "0" + seconds : seconds;
        minutes = minutes < 10 ? "0" + minutes : minutes;
        hours = hours < 10 ? "0" + hours: hours;

        return hours + ":" + minutes + ":" + seconds;
    }
});
