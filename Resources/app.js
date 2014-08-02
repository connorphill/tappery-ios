var Cloud = require('ti.cloud');
var fb = require('facebook');
fb.appid = "125520310866488";
//Production
fb.permissions = ['read_stream'];
fb.forceDialogAuth = true;
var install_db = Titanium.Database.install('campustapDB.sqlite', 'campustap');

//login.js WINDOW SETTINGS
var win = Ti.UI.createWindow({
    backgroundColor : '#fff'
});

//END login.js WINDOW SETTINGS

var customFont = 'HouschkaAlt';


var tapperyLogo = Ti.UI.createImageView({
    image : '/images/login/tappery.png',
    top : 100,
    width : 250,
    height : 75,
    left: 37
});
win.add(tapperyLogo);

var tagLine = Titanium.UI.createLabel({
    color:'#000',
    text:'Where are your friends tonight?',
    font:{fontSize:20, fontFamily: customFont},
    textAlign:'center',
    width:'auto',
    top:190
});

win.add(tagLine);

win.addEventListener("open", function(e) {

    try {
        if (Ti.Network.online) {
            var cloud_sessionId = Ti.App.Properties.getString('session_id');

            

            // END PUSH NOTIFICATION REGISTRATION

            if (cloud_sessionId && cloud_sessionId != null) {
                Cloud.Users.showMe(function(e) {
                    if (e.success) {
                        var user = e.users[0];
                        var home_win = require("home");
                        var obj = new home_win({
                            user : user
                        });
                        win.open(obj);
                        win.close();

                    } else {

                        Ti.App.Properties.setString('session_id', null);
                        Ti.App.Properties.setString("user_full_name", null);
                        Ti.App.Properties.setString("user", null);

                        var loginWindow = Ti.UI.createWindow({
                            url : 'login.js',
                            navBarHidden : true,
                            modal : false,

                        });
                        loginWindow.open({
                            animation : false
                        });
                        win.close();

                    }
                });
            } else {

                Ti.App.Properties.setString('session_id', null);
                Ti.App.Properties.setString("user_full_name", null);
                Ti.App.Properties.setString("user", null);

                var loginWindow = Ti.UI.createWindow({
                    url : 'login.js',
                    navBarHidden : true,
                    modal : false,

                });
                loginWindow.open({
                    animation : false
                });
                win.close();
            }
        } else {
            alert("Please check your internet connection");
        }
    } catch(ex) {

    }

});

win.open();

