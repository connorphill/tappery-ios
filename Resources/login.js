var Cloud = require('ti.cloud');

var fb = require('facebook');
fb.appid = "125520310866488";
//Production
fb.permissions = ['read_stream'];
fb.forceDialogAuth = true;
Ti.App.Properties.setString("is_login", true);

var db = Ti.Database.open('campustap');
var user = null;

 var flurry = require('sg.flurry');
 var tracker = require('analytics');
 var customFont = 'HouschkaAlt';

//login.js WINDOW SETTINGS
var win = Ti.UI.currentWindow;

win.backgroundColor = '#e9e7e7';
//END login.js WINDOW SETTINGS

 win.addEventListener('open', function(){
     tracker.trackScreen('Login');
        flurry.logPageView();
        Ti.API.info('Tracking Login');
});

var loginBox = Ti.UI.createImageView({
    image: '/images/login/loginSquare.png',
    top:100,
    width:300,
    left:10,
    height:300,
    zIndex: 0
});

win.add(loginBox);

//LOGO IMAGE
var tapperyLogo = Ti.UI.createImageView({
    image : '/images/login/tappery.png',
    top : 125,
    width : 250,
    height : 75,
    left: 35,
    zIndex:1
});
win.add(tapperyLogo);
//END LOGO IMAGE


var taglineLabel = Titanium.UI.createLabel({
    color:'#000',
    text:'Where are your friends tonight?',
    font:{fontSize:20,fontFamily:customFont},
    textAlign:'center',
    width:'auto',
    top:230
});

win.add(taglineLabel);

var lineBorder = Ti.UI.createImageView({
    image : '/images/login/lineBorder.png',
    top : 290,
    width : 280,
    height : 'auto',
    left: 20
});

win.add(lineBorder);

//FACEBOOK LOGIN BUTTON

// old COde====================================
var fbSignupBtn = fb.createLoginButton({
    width: 230,
    height: 40,
    bottom: 210,
    style : Ti.Facebook.BUTTON_STYLE_WIDE
    // backgroundImage : "/images/login/facebookLogin.png"
});
fb.createLoginButton.addEventListener('login', function(e) {
    if (e.success) {

        Cloud.SocialIntegrations.externalAccountLogin({
            type : 'facebook',
            token : fb.accessToken // need change here Ti.Facebook.accessToken
            //token : Ti.Facebook.accessToken
        }, function(e) {

            if (e.success) {
                user = e.users[0];
                var user_full_name = user.first_name.charAt(0).toUpperCase() + user.first_name.slice(1) + " " + user.last_name.charAt(0).toUpperCase() + user.last_name.slice(1);
                Ti.App.Properties.setString("user_full_name", user_full_name);
                Ti.App.Properties.setString("user", user);
                Ti.App.Properties.setString("fb_uid", fb.uid);
                Ti.App.Properties.setString('currentUser_id', user.id);
                Ti.App.Properties.setString('session_id', e.meta.session_id);
                Ti.App.Properties.setString('username', user.username);
                Ti.App.Properties.setString('photo', user.photo);

				 tracker.trackEvent({
    			category: "Login",
    			action: "Click",
    			label: "Login"
				});

				Ti.API.info('Tracker Event Tracking Fired');
			
                Cloud.Users.update({
                    first_name : user.first_name.charAt(0).toUpperCase() + user.first_name.slice(1),
                    last_name : user.last_name.charAt(0).toUpperCase() + user.last_name.slice(1)

                }, function(e) {
                    if (e.success) {

                        var db = Ti.Database.open('campustap');
                        var rows = db.execute("select goingoutTonightid from user_setting where user_id=?", Ti.App.Properties.getString('currentUser_id'));
                        if (rows != null) {

                            var rowCount = rows.rowCount;

                            if (rowCount > 0) {
                                Ti.App.Properties.setString('goingOutId', rows.fieldByName("goingoutTonightid"));

                                Cloud.Objects.query({
                                    classname : 'goingOutTonight',
                                    id : Ti.App.Properties.getString("goingOutId")

                                }, function(e) {
                                    if (e.success) {

                                        if (e.goingOutTonight.length == 0) {
                                            Cloud.Objects.create({
                                                classname : 'goingOutTonight',
                                                fields : {
                                                    event_id : 0,
                                                    user_id : Ti.App.Properties.getString('currentUser_id'),
                                                    user_full_name : Ti.App.Properties.getString("user_full_name"),
                                                    acl_id : 0,
                                                    here_clicked_time : 0,
                                                    bar_name : "",
                                                    top_event_id : 0,
                                                    going_out : 'No',
                                                    is_attending : false
                                                }
                                            }, function(e) {
                                                if (e.success) {
                                                    var goingOut = e.goingOutTonight[0];
                                                    Ti.App.Properties.setString("goingOutId", goingOut.id);

                                                }
                                            });
                                        } else {

                                            //Ti.API.info("user_id=" + Ti.App.Properties.getString('currentUser_id') + "||" + Ti.App.Properties.getString("goingOutId"));
                                        }
                                    }
                                });

                            } else {

                                Ti.App.Properties.setString('goingOutId', null);

                                //

                                Cloud.Objects.query({
                                    classname : 'goingOutTonight',
                                    where : {
                                        user_id : Ti.App.Properties.getString('currentUser_id')
                                    }

                                }, function(e) {
                                    if (e.success) {

                                        if (e.goingOutTonight.length > 0) {
                                            var goingOut = e.goingOutTonight[0];

                                            Ti.App.Properties.setString('goingOutId', goingOut.id);
                                            var db = Ti.Database.open('campustap');
                                            db.execute("INSERT INTO user_setting(user_id ,goingoutTonightid)  values(?,?)", Ti.App.Properties.getString('currentUser_id'), goingOut.id);
                                            db.close();

                                        } else {
                                            Cloud.Objects.create({
                                                classname : 'goingOutTonight',
                                                fields : {
                                                    event_id : 0,
                                                    user_id : Ti.App.Properties.getString('currentUser_id'),
                                                    user_full_name : Ti.App.Properties.getString("user_full_name"),
                                                    acl_id : 0,
                                                    here_clicked_time : 0,
                                                    bar_name : "",
                                                    top_event_id : 0,
                                                    going_out : 'No',
                                                    is_attending : false
                                                }
                                            }, function(e) {
                                                if (e.success) {
                                                    try {
                                                        var goingOut = e.goingOutTonight[0];
                                                        var db = Ti.Database.open('campustap');
                                                        db.execute("INSERT INTO user_setting(user_id ,goingoutTonightid)  values(?,?)", Ti.App.Properties.getString('currentUser_id'), goingOut.id);

                                                        Ti.App.Properties.setString("goingOutId", goingOut.id);
                                                    } catch(ex) {
                                                        alert("ex=" + ex);
                                                    }

                                                }
                                            });

                                        }
                                    }
                                });

                                //

                            }

                        } else {

                            Ti.API.info("Null rows found");
                        }

                        rows.close();
                        db.close();

                        //

                        // PUSH NOTIFICATION REGISTRATION

                        Titanium.Network.registerForPushNotifications({
                            types : [Titanium.Network.NOTIFICATION_TYPE_BADGE, Titanium.Network.NOTIFICATION_TYPE_ALERT, Titanium.Network.NOTIFICATION_TYPE_SOUND],
                            success : function(e) {
                                var deviceToken = e.deviceToken;
                                //Ti.App.Properties.setString('token', deviceToken);
                                Ti.API.info("Push notification device token is: " + deviceToken);

                                Cloud.PushNotifications.subscribe({
                                    channel : 'friend_request',
                                    device_token : deviceToken,
                                    type : 'ios'
                                }, function(e) {
                                    if (e.success) {
                                        Ti.API.info('Success');
                                    } else {
                                        alert('PushNotifications Error:\n' + ((e.error && e.message) || JSON.stringify(e)));
                                    }
                                });

                            },
                            error : function(e) {
                                alert("Error during registration: " + e.error);
                            },
                            callback : function(e) {

                                Ti.API.info("callback: " + JSON.stringify(e));
                                var badgeCount = Ti.UI.iPhone.getAppBadge();
                                badgeCount = badgeCount + 1;
                                Ti.UI.iPhone.setAppBadge(badgeCount);
                            }
                        });

                    }
                });
                var home_win = require("home");
                var obj = new home_win({
                    user : user
                });
                win.open(obj);

            } else {
                alert('Login: ' + ((e.error && e.message) || JSON.stringify(e)));

            }
        });
    } else if (e.error) {
        alert("Please check your internet connection");
        Ti.API.info(e.error);
    } else if (e.cancelled) {
        alert("cancelled");

    }
});

win.add(fbSignupBtn);

//END FACEBOOK LOGIN BUTTON

