function activityindicator_win() {
    var customFont = 'HouschkaAlt';
    var win = Ti.UI.createWindow({
        backgroundColor : "black",
        opacity : 0.7
    }); 
    var osname = Ti.Platform.osname;
    var isIos = (osname === 'iphone' || osname === 'ipad');
    var sdkVersion = parseFloat(Ti.version);
    var ActivityIndicatorStyle;
    if (isIos) {
        ActivityIndicatorStyle = Titanium.UI.iPhone.ActivityIndicatorStyle;
    } else if (sdkVersion >= 3.0) {
        ActivityIndicatorStyle = Titanium.UI.ActivityIndicatorStyle;
    }
    var activityIndicator = Ti.UI.createActivityIndicator({
        color : 'white',
        font : {
            fontFamily : customFont,
            fontSize : 20,
            fontWeight : 'bold'
        },
        message : 'Loading...',
        style : ActivityIndicatorStyle.PLAIN,
        top : 0,
        left : 0,
        right : 0,
        bottom : 0,
        zIndex : 999
        //height : Ti.UI.SIZE,
        //width : Ti.UI.SIZE
    });

    win.add(activityIndicator);
    win.addEventListener("open", function(e) {
        activityIndicator.show();
    });
    win.addEventListener("close", function(e) {
        Ti.App.Properties.setString("daily_focus", false);
        activityIndicator.hide();
    });
    return win;
};

module.exports = activityindicator_win;
