const {ipcRenderer} = require('electron')

ipcRenderer.on('message', (event, arg) => {
    switch(arg[0]) {
        case "chart":
            window.location.href='https://www.tradingview.com/chart/'+arg[1]+'/';
            break;
        case "go":
            window.location.href=arg[1];
            break;
    }
});

document.addEventListener('DOMContentLoaded', function() {


    ipcRenderer.send('message', ['system','pageloaded']);
    ipcRenderer.send('message', ['path',window.location.pathname]);

    setInterval(function(){
        getCharts();
    },10000);

    setTimeout(function(){
        getCharts();
    }, 1500);

    // this is healthy
    if (Notification.permission !== "granted"){
        Notification.requestPermission();
    }

    // override notifications
    // override favorites

}, false);

function getCharts() {
    $.ajax({url: "https://www.tradingview.com/my-charts/", success: function(result){
        if(result.length) {
            ipcRenderer.send('message', ['charts', result]);
        }
    }});
}
