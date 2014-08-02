function webview(args) {
    var win_title = args.title;
    var web_url = args.url;
    var privacyPolicyWindow = Ti.UI.createWindow({
        backgroundColor : "white",
        title : win_title,
        barColor : '#3d6430',
        translucent : false,
        navTintColor : 'white',
        // leftNavButton : ButtonRetour,
        color : "#fff",
        backButtonTitle : "Back"

    });
    var webPrivacyPolicy = Ti.UI.createWebView({
        url : web_url,
        top : 0,
        bottom : 10,
        left : 0,
        right : 0
    });
    privacyPolicyWindow.add(webPrivacyPolicy);
    privacyPolicyWindow.leftNavButton = ButtonRetour;
    var ButtonRetour = Ti.UI.createButton();

    /*var ButtonRetour = Ti.UI.createButton({
     image : '/images/backButton.png',
     title : "Back",
     width : 50,
     height : 36
     });*/

    ButtonRetour.addEventListener('click', function() {
        privacyPolicyWindow.close();
    });

    return privacyPolicyWindow;

};
module.exports = webview;
