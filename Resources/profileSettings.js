exports.profileSettingsWin = function(args) {

    var Cloud = require('ti.cloud');
    var fb = require('facebook');
    fb.appid = '125520310866488';
    fb.permissions = ['read_stream'];
    //Permissions your app need


    var flurry = require('sg.flurry');
    var tracker = require('analytics');

    var customFont = 'HouschkaAlt';
    var counter = 0;

    //profileSettings.js WINDOW SETTINGS
    var settings = Ti.UI.createWindow({
        barColor : '#3d6430',
        title : "Profile Settings",
        backgroundColor : '#e9e7e7',
        translucent : false,
        navTintColor : 'white',
        leftNavButton : backButton,
        top : 0
    });

    //BACK BUTTON
    var backButton = Ti.UI.createButton();

    backButton.addEventListener('click', function() {
        settings.close({
            animated : true
        });
    });
    //END BACK BUTTON

    //PROFILE SETTINGS TABLE
    var table = Titanium.UI.createTableView({
        style : Titanium.UI.iPhone.TableViewStyle.GROUPED,
        backgroundColor : '#e9e7e7'
    });
    settings.add(table);

    //SOCIAL SETTINGS SECTION
    var socialSettings = Titanium.UI.createTableViewSection({
        top : 0

    });
    socialSettings.headerTitle = "SOCIAL SETTINGS";

    //findFriends.js BUTTON
    var findFriends = Titanium.UI.createTableViewRow({
        title : "Find Your Friends",
        font : {
            fontFamily : customFont
        },
        backgroundColor : '#fff'
    });
    //END findFriends.js BUTTON

    //BUTTON (WORK IN PROGRESS)

    var inviteFriends = Titanium.UI.createTableViewRow({
        title : "Invite Friends",
        font : {
            fontFamily : customFont
        },
        backgroundColor : '#fff'
    });
    //END BUTTON


    inviteFriends.addEventListener('click', function() {
        var emailDialog = Ti.UI.createEmailDialog();
        emailDialog.subject = "Join Your Friends on Tappery!";
        emailDialog.toRecipients = ['contact@campustaps.com'];
        emailDialog.messageBody = 'You have been invited to join your friends on Tappery! Head to http://tappery.com to download the app.';
        emailDialog.open();
        tracker.trackScreen('Invite Friends');
        flurry.logPageView();
        Ti.API.info('Tracking Invite Friends');
    });

    //notifications.js BUTTON
    var notifications = Titanium.UI.createTableViewRow({
        title : "Notifications",
        font : {
            fontFamily : customFont
        },
        height : 50,
        backgroundColor : '#fff'

    });
    var lbl_notification_icon = Ti.UI.createLabel({
        right : 10,
        borderRadius : 15,
        width : 30,
        height : 30,
        backgroundColor : "transparent",
        text : "",

        font : {
            fontFamily : customFont,
            fontWeight : "bold",
            fontSize : 15
        },
        textAlign : 'center',
        color : "white"

    });

    notifications.add(lbl_notification_icon);

    //END notifications.js BUTTON

    //ADD TO SOCIAL SETTINGS TABLE
    socialSettings.add(findFriends);
    socialSettings.add(inviteFriends);
    socialSettings.add(notifications);

    //SUPPORT SETTINGS TABLE
    var supportSettings = Titanium.UI.createTableViewSection();
    supportSettings.headerTitle = "SUPPORT SETTINGS";

    //emailDialog.js BUTTON
    var reportAnError = Ti.UI.createTableViewRow({
        title : "Report an Error",
        font : {
            fontFamily : customFont
        },
        backgroundColor : '#fff'
    });
    //END emailDialog.js BUTTON

    //PRIVACY POLICY WEB VIEW BUTTON
    var privacyPolicy = Titanium.UI.createTableViewRow({
        title : "Privacy Policy",
        font : {
            fontFamily : customFont
        },
        backgroundColor : '#fff'
    });
    //END PRIVACY POLICY WEB VIEW BUTTON

    //TERMS OF USE WEB VIEW BUTTON
    var termsOfUse = Titanium.UI.createTableViewRow({
        title : "Terms of Service",
        font : {
            fontFamily : customFont
        },
        backgroundColor : '#fff',
    });
    //END TERMS OF USE WEB VIEW BUTTON

    supportSettings.add(reportAnError);
    supportSettings.add(privacyPolicy);
    supportSettings.add(termsOfUse);

    //REPORT AN ERROR EMAIL DIALOG
    reportAnError.addEventListener('click', function() {
        var emailDialog = Ti.UI.createEmailDialog();
        emailDialog.subject = "Error/Bug Found in Campus Taps Mobile App";
        emailDialog.toRecipients = ['contact@campustaps.com'];
        emailDialog.messageBody = 'Please provide us with some information on the error/bug that you found.';
        emailDialog.open();
        tracker.trackScreen('Report an Error');
        flurry.logPageView();
        Ti.API.info('Tracking Report an Error');
    });
    //END REPORT AN ERROR EMAIL DIALOG

    //PRIVACY POLICY WEB VIEW WINDOW

    privacyPolicy.addEventListener('click', function() {

        var privacy_policy_win = require("webview");
        settings.tab.open(new privacy_policy_win({
            navBarHidden : false,
            modal : false,
            title : "Privacy Policy",
            url : "http://campustaps.com/privacy"
        }), {
            animated : true
        });
        tracker.trackScreen('Privacy Policy');
        flurry.logPageView();
        Ti.API.info('Tracking Privacy Policy');
    });

    //END PRIVACY POLICY WINDOW BACK BUTTON

    //TERMS OF USE WINDOW
    termsOfUse.addEventListener('click', function() {
        var termsOfUseWindow = require("webview");
        settings.tab.open(new termsOfUseWindow({
            navBarHidden : false,
            modal : false,
            title : "Terms of Use",
            url : "http://campustaps.com/terms-of-use"
        }), {
            animated : true
        });

    });

    //END TERMS OF USE WINDOW BACK BUTTON

    //LOG OUT TABLE
    var profileSettings = Titanium.UI.createTableViewSection();
    profileSettings.headerTitle = "Log Out";

    //LOG OUT BUTTON
    var logOut = Ti.UI.createTableViewRow({
        title : "Log Out",
        font : {
            fontFamily : customFont
        },
        backgroundColor : '#fff'
    });

    profileSettings.add(logOut);
    //END LOG OUT BUTTON

    //SET TABLE SECTION DATA
    table.setData([socialSettings, supportSettings, profileSettings]);

    //OPEN findFriends.js WINDOW
    findFriends.addEventListener('click', function() {

        var findFriends = require("findFriends");
        settings.tab.open(new findFriends({
            navBarHidden : false,
            modal : false
        }), {
            animated : true
        });

         tracker.trackScreen('Terms of Use');
        flurry.logPageView();
        Ti.API.info('Tracking Terms of Use');
    });

    //END OPEN findFriends.js WINDOW

    //OPEN notification.js WINDOW
    notifications.addEventListener('click', function() {

        var notification_win = require('notifications');
        var notifications = new notification_win({
            navBarHidden : false,
            modal : false
        });
        settings.tab.open(notifications, {
            animated : true
        });
    });
    //END OPEN notifications.js WINDOW

    //LOG OUT EVENT LISTENER
    logOut.addEventListener('click', function() {

        if (fb.loggedIn) {

            fb.logout();
            var url = 'https://login.facebook.com';
            var client = Titanium.Network.createHTTPClient();
            client.clearCookies(url);
            Cloud.Users.logout(function(e) {

                if (e.success) {

                    Ti.App.Properties.setString('session_id', null);
                    Ti.App.Properties.setString('currentUser_id', null);
                    Ti.App.Properties.setString("user", null);
                    Ti.App.Properties.setString("user_full_name", null);
                    Ti.App.Properties.setString("is_login", false);
                    Ti.App.Properties.setString("goingOutId", null);

                    var loginWindow = Ti.UI.createWindow({
                        url : 'login.js',
                        navBarHidden : true,
                        modal : false,

                    });
                    loginWindow.open({
                        animation : false
                    });

                } else {
                    Ti.API.info('Error:\n' + ((e.error && e.message) || JSON.stringify(e)));
                }
            });

        } else {
            fb.logout();
            var url = 'https://login.facebook.com';
            var client = Titanium.Network.createHTTPClient();
            client.clearCookies(url);
            Cloud.Users.logout(function(e) {
                if (e.success) {

                    Ti.App.Properties.setString('session_id', null);
                    Ti.App.Properties.setString("user", null);
                    Ti.App.Properties.setString("user_full_name", null);
                    Ti.App.Properties.setString("is_login", false);
                    Ti.App.Properties.setString("goingOutId", null);

                    var loginWindow = Ti.UI.createWindow({
                        url : 'login.js',
                        navBarHidden : true,
                        modal : false,

                    });
                    loginWindow.open({
                        animation : false
                    });
                } else {
                    Ti.API.info('Error:\n' + ((e.error && e.message) || JSON.stringify(e)));
                }
            });

        }

    });

    settings.addEventListener("focus", function(e) {
        counter = Ti.App.Properties.getString("total_friends");

        if (counter > 0) {
            //notifications.add(lbl_notification_icon);
            lbl_notification_icon.backgroundColor = "red";
            lbl_notification_icon.text = counter;
        } else {
            lbl_notification_icon.backgroundColor = "transparent";
            lbl_notification_icon.text = "";
        }
    });
    return settings;
};
//END LOG OUT EVENT LISTENER