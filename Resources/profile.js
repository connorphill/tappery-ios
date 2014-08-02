function profile(args) {

    var Cloud = require('ti.cloud');
    var fb = require('facebook');
    fb.appid = '125520310866488';
    fb.permissions = ['read_stream'];
    var activityindicator_win = require("activityindicator_win");
    var obj_win = new activityindicator_win();

    var customFont = 'HouschkaAlt';  
    var flurry = require('sg.flurry');
    var tracker = require('analytics');

    var top_event_data_yes = [];
    var top_event_data_no = [];
    var top_event_data_maybe = [];
    var goingOut_event = [];
    var current_index = 0;
    var current_arry_name = "top_event_data_yes";

    //profile.js SETTINGS

    var profile = Ti.UI.createWindow({
        barColor : '#3d6430',
        titleImage : 'tap.png',
        backgroundColor : '#e9e7e7',
        translucent : false
    });

    var refresh = Titanium.UI.createButton({
        //backgroundImage:"/images/refresh.png",
        // width:39,
        //height:41
        enabled : false
    });
    refresh.systemButton = Titanium.UI.iPhone.SystemButton.REFRESH;
    profile.leftNavButton = refresh;
    refresh.addEventListener('click', function() {
        try {

            refresh.enabled = false;
            var act_ind_win = null;
            var friend_array = [];

            profile_load(act_ind_win);
        } catch(ex) {
            alert(ex);
            Ti.API.info(ex);
        }
    });

    //OPEN profileSettings.js BUTTON
    var rightButton = Ti.UI.createImageView({
        image : '/images/settingsIcon.png',
        width : 50,
        height : 36
    });

    //OPEN profileSettings.js EVENT LISTENER
    rightButton.addEventListener('click', function() {

        var win = require('profileSettings').profileSettingsWin;

        top_event_data_yes = [];
        top_event_data_no = [];
        top_event_data_maybe = [];
        goingOut_event = [];
        friendsGoingOutYesTable.setData(top_event_data_yes);
        friendsGoingOutNoTable.setData(top_event_data_no);
        friendsGoingOutMaybeTable.setData(top_event_data_maybe);

        var profileSettingsDetail = new win({
            parent_win : profile,
            badge_counter : profile.tab.badge

        });
        profile.tab.open(profileSettingsDetail, {
            animated : true
        });
    });

    profile.rightNavButton = rightButton;

    //PROFILE VIEW CONTAINS (Profile Picture, User Name and Icon Indicator of Going Out Status)
    var userProfileView = Ti.UI.createView({
        backgroundColor : '#fff',
        top : 5,
        left : 10,
        right : 10,
        width : 300,
        height : 80
    });

    profile.add(userProfileView);
    //END PROFILE VIEW

    //USER PROFILE

    var profilePicture = Ti.UI.createImageView({
        defaultImage : '/images/profilePlaceholder.png',
        top : 15,
        width : 50,
        height : 50,
        left : 10
    });
    userProfileView.add(profilePicture);

    //END USER PROFILE

    //GOING OUT STATUS ICON INDICATOR
    var profileGoingOutStatus = Ti.UI.createImageView({
        top : 30,
        left : 70,
        // image : '/images/statusNo.png'
    });

    userProfileView.add(profileGoingOutStatus);
    //END GOING OUT STATUS ICON INDICATOR

    //USERNAME

    var profileName = Ti.UI.createLabel({
        text : "",
        top : 30,
        left : 110
    });
    userProfileView.add(profileName);

    //END USERNAME

    //GOING OUT STATUS VIEW
    var goingOutView = Ti.UI.createView({
        backgroundColor : '#fff',
        width : 300,
        right : 10,
        left : 10,
        height : 30,
        top : 105,

    });

    profile.add(goingOutView);
    //END GOING OUT STATUS VIEW

    //ARE YOU ATTENDING LABEL
    var attendingLabel = Ti.UI.createLabel({
        text : "Are you going out:",
        font : {
            size : 14,
            fontFamily : customFont
        },
        top : 5,
        left : 10
    });

    goingOutView.add(attendingLabel);
    //END ARE YOU ATTENDING LABEL

    //BUTTON TOGGLE SYSTEM FOR ARE YOU GOING OUT STATUS

    var toggledButton;
    var toggleButton = function(e) {

        if (e.source.isToggled === false) {
            // reset previous button to off
            toggledButton.setBackgroundImage(toggledButton.imageOff);
            toggledButton.isToggled = false;
            // set new button to on
            e.source.setBackgroundImage(e.source.imageOn);
            profileGoingOutStatus.setImage(e.source.status);
            e.source.isToggled = true;

            // cache current button as previous button
            toggledButton = e.source;
            
             tracker.trackEvent({
    category: "Profile",
    action: "Going Out",
    label: e.source.title
});
  flurry.logEvent('Profile',  {goingOutFriendsTab: e.source.title});
    Ti.API.info('Tracking Going Out Selected Event ' + e.source.title);

        }

        Cloud.Friends.search({
            user_id : Ti.App.Properties.getString('currentUser_id')

        }, function(e1) {
            if (e1.success) {

                if (e1.users.length > 0) {
                    // alert(" ln =" + JSON.stringify(goingOut_event));

                    if (goingOut_event && goingOut_event != null) {

                        // obj_win.open();
                        switch (e.source.id) {

                            //START "No" Button State functions
                            case 1:

                                Cloud.Objects.query({
                                    classname : 'goingOutTonight',
                                    where : {
                                        id : goingOut_event.id
                                    }
                                }, function(e) {
                                    if (e.success) {
                                        if (e.goingOutTonight.length > 0) {

                                            var goingOutTonight = e.goingOutTonight[0];
                                            Cloud.Objects.update({
                                                classname : 'goingOutTonight',
                                                id : goingOut_event.id,
                                                fields : {
                                                    going_out : 'No',
                                                    is_attending : false,
                                                    event_id : goingOut_event.event_id,
                                                    user_id : goingOutTonight.user_id,
                                                    user_full_name : goingOutTonight.user_full_name,
                                                    acl_id : goingOut_event.acl_id,
                                                    here_clicked_time : goingOutTonight.here_clicked_time,
                                                    bar_name : goingOutTonight.barname,

                                                }

                                            }, function(e1) {
                                                if (e1.success) {
                                                    // obj_win.close();
                                                    //   alert(Ti.App.Properties.getString("user_full_name") + " " + "is not attending" + " " + goingOutTonight.bar_name);

                                                } else {
                                                    // obj_win.close();
                                                    Ti.API.info('Event: ' + ((e1.error && e1.message) || JSON.stringify(e1)));
                                                }
                                            });

                                        }

                                    } else {
                                        Ti.API.info('Error:\n' + ((e.error && e.message) || JSON.stringify(e)));
                                    }
                                });

                                break;

                            //END "No" Button State functions

                            //START "Maybe" Button State functions
                            case 2:

                                //

                                Cloud.Objects.query({
                                    classname : 'goingOutTonight',
                                    where : {
                                        id : goingOut_event.id
                                    }
                                }, function(e) {
                                    if (e.success) {
                                        if (e.goingOutTonight.length > 0) {

                                            var goingOutTonight = e.goingOutTonight[0];
                                            Cloud.Objects.update({
                                                classname : 'goingOutTonight',
                                                id : goingOut_event.id,
                                                fields : {
                                                    going_out : 'Maybe',
                                                    is_attending : true,
                                                    event_id : goingOut_event.event_id,
                                                    user_id : goingOutTonight.user_id,
                                                    user_full_name : goingOutTonight.user_full_name,
                                                    acl_id : goingOut_event.acl_id,
                                                    here_clicked_time : goingOutTonight.here_clicked_time,
                                                    bar_name : goingOutTonight.barname,

                                                }

                                            }, function(e1) {
                                                if (e1.success) {
                                                    obj_win.close();
                                                    // alert(Ti.App.Properties.getString("user_full_name") + " " + "maybe attending" + " " + goingOutTonight.bar_name);

                                                } else {
                                                    // obj_win.close();
                                                    Ti.API.info('Event: ' + ((e1.error && e1.message) || JSON.stringify(e1)));
                                                }
                                            });

                                        }

                                    } else {
                                        Ti.API.info('Error:\n' + ((e.error && e.message) || JSON.stringify(e)));
                                    }
                                });

                                ///

                                break;

                            //END "Maybe" Button State functions

                            //START "Yes" Button State functions
                            case 3:
                                Cloud.Objects.query({
                                    classname : 'goingOutTonight',
                                    where : {
                                        id : goingOut_event.id
                                    }
                                }, function(e) {
                                    if (e.success) {

                                        if (e.goingOutTonight.length > 0) {

                                            var goingOutTonight = e.goingOutTonight[0];

                                            Cloud.Objects.update({
                                                classname : 'goingOutTonight',
                                                id : goingOut_event.id,
                                                fields : {
                                                    going_out : 'Yes',
                                                    is_attending : true,
                                                    event_id : goingOut_event.event_id,
                                                    user_id : goingOutTonight.user_id,
                                                    user_full_name : goingOutTonight.user_full_name,
                                                    acl_id : goingOut_event.acl_id,
                                                    here_clicked_time : goingOutTonight.here_clicked_time,
                                                    bar_name : goingOutTonight.bar_name

                                                }
                                            }, function(e1) {
                                                if (e1.success) {
                                                    //obj_win.close();
                                                    // alert(Ti.App.Properties.getString("user_full_name") + " " + "is attending" + " " + goingOutTonight.bar_name);

                                                } else {
                                                    //obj_win.close();
                                                    Ti.API.info('Event: ' + ((e1.error && e1.message) || JSON.stringify(e1)));
                                                }
                                            });

                                            //END "YES" Button State functions

                                        }

                                    } else {
                                        Ti.API.info('Error:\n' + ((e.error && e.message) || JSON.stringify(e)));
                                    }
                                });

                        }

                    }

                } else {

                    // redirect to find friend

                    var opts = {
                        cancel : 1,
                        options : ['Find your Friends', 'Cancel'],
                        selectedIndex : 1,
                        destructive : 0,
                        title : "You Need Friends to Access This Feature"
                    };

                    var dialog = Ti.UI.createOptionDialog(opts);
                    dialog.addEventListener("click", function(e) {
                        if (e.index == 0) {
                            var findFriends = require("findFriends");
                            profile.tab.open(new findFriends({
                                navBarHidden : false,
                                modal : false
                            }), {
                                animated : true
                            });
                        }
                    });

                    dialog.show();

                }

            } else {
                Ti.API.info('Error:\n' + ((e1.error && e1.message) || JSON.stringify(e1)));
            }
        });

        //CUSTOM OBJECT EVENTS FOR EACH STATE

    };

    //END CUSTOM OBJECT EVENTS FOR EACH STATE

    //GOING OUT - NO BUTTON = RED BUTTON
    var goingOutNo = Ti.UI.createButton({
        title : 'No',
        touchEnable : false,
        backgroundImage : '/images/noSelected.png',
        imageOff : '/images/nobg.png',
        imageOn : '/images/noSelected.png',
        isToggled : true,
        status : '/images/statusNo.png',
        font : {
            fontFamily : customFont
        },
        width : 55,
        height : 30,
        right : 110,
        id : 1,

    });

    goingOutView.add(goingOutNo);

    //END GOING OUT - NO BUTTON = RED BUTTON

    //GOING OUT - MAYBE BUTTON = YELLOW BUTTON

    var goingOutMaybe = Ti.UI.createButton({
        title : 'Maybe',
        touchEnable : false,
        backgroundImage : '/images/maybebg.png',
        imageOff : '/images/maybebg.png',
        imageOn : '/images/maybeSelected.png',
        isToggled : false,
        status : '/images/statusMaybe.png',
        font : {
            fontFamily : customFont
        },
        width : 55,
        height : 30,
        right : 55,
        id : 2,

    });

    goingOutView.add(goingOutMaybe);

    //END GOING OUT - MAYBE BUTTON = YELLOW BUTTON

    //GOING OUT - YES BUTTON = GREEN BUTTON

    var goingOutYes = Ti.UI.createButton({
        title : 'Yes',
        touchEnable : false,
        backgroundImage : '/images/yesbg.png',
        imageOff : '/images/yesbg.png',
        imageOn : '/images/yesSelected.png',
        isToggled : false,
        status : '/images/statusYes.png',
        font : {
            fontFamily : customFont
        },
        width : 55,
        height : 30,
        right : 0,
        id : 3,

    });

    goingOutView.add(goingOutYes);

    //END GOING OUT - YES BUTTON = GREEN BUTTON

    //GOING OUT BUTTONS EVENT LISTENERS
    goingOutNo.addEventListener('click', toggleButton);
    goingOutMaybe.addEventListener('click', toggleButton);
    goingOutYes.addEventListener('click', toggleButton);
    //END GOING OUT BUTTONS EVENT LISTENERS

    toggledButton = goingOutNo;
    // set to GOING OUT - NO BUTTON

    //END GOING OUT STATUS

    //GOING OUT FRIENDS TAB (BUTTONS) VIEW

    var friendsGoingOutButtons = Ti.UI.createView({
        backgroundColor : '#e9e7e7',
        width : 300,
        height : 30,
        top : 155,
        left : 10,
        right : 10
    });

    profile.add(friendsGoingOutButtons);

    //END GOING OUT FRIENDS TAB (BUTTONS) VIEW

    //GOING OUT TABLE VIEW BACKGROUND
    var friendsGoingOutStatus = Ti.UI.createView({
        backgroundColor : '#fff',
        height : 250,
        width : 300,
        top : 185,
        left : 10,
        right : 10,

    });

    profile.add(friendsGoingOutStatus);

    //END GOING OUT TABLE VIEW BACKGROUND

    //TOGGLE FOR FRIENDS TAB BUTTONS

    var selectedButton;

    var toggle = function(e) {

        if (e.source.isSelected === false) {
            selectedButton.setBackgroundImage('/images/profile/friendsGoingOutBg.png');
            selectedButton.isSelected = false;

            e.source.setBackgroundImage('/images/profile/friendsGoingOutSelected.png');
            e.source.isSelected = true;

            selectedButton = e.source;
            
            tracker.trackEvent({
    category: "Profile",
    action: "Going Out Friends Tab",
    label: e.source.title
});
  flurry.logEvent('Profile',  {goingOutFriendsTab: e.source.id});
    Ti.API.info('Tracking Going Out Friends Tab Selected Event ' + e.source.title);
        }
        switch (e.source.id) {
            case 1:
                friendsGoingOutYesTable.opacity = 1;
                friendsGoingOutNoTable.opacity = 0;
                friendsGoingOutMaybeTable.opacity = 0;
                current_arry_name = "top_event_data_yes";
                friendsGoingOutYesTable.setData(top_event_data_yes);
                break;
            case 2:
                friendsGoingOutYesTable.opacity = 0;
                friendsGoingOutNoTable.opacity = 0;
                friendsGoingOutMaybeTable.opacity = 1;
                current_arry_name = "top_event_data_maybe";
                friendsGoingOutMaybeTable.setData(top_event_data_maybe);
                break;
            case 3:
                friendsGoingOutYesTable.opacity = 0;
                friendsGoingOutNoTable.opacity = 1;
                friendsGoingOutMaybeTable.opacity = 0;
                current_arry_name = "top_event_data_no";
                friendsGoingOutNoTable.setData(top_event_data_no);
                break;
        }
    };

    //END TOGGLE FOR FRIENDS TAB BUTTONS

    //FRIENDS "Yes" BUTTON TAB
    var friendsGoingOutYes = Ti.UI.createButton({
        backgroundImage : '/images/profile/friendsGoingOutSelected.png',
        title : 'Yes',
        isSelected : true,
        font : {
            fontFamily : customFont
        },
        height : 30,
        width : 99,
        top : 0,
        left : 0,
        id : 1
    });

    friendsGoingOutButtons.add(friendsGoingOutYes);

    //END FRIENDS "Yes" BUTTON TAB

    //FRIENDS "Maybe" BUTTON TAB
    var friendsGoingOutMaybe = Ti.UI.createButton({
        backgroundImage : '/images/profile/friendsGoingOutBg.png',
        title : 'Maybe',
        isSelected : false,
        font : {
            fontFamily : customFont
        },
        height : 30,
        width : 99,
        top : 0,
        left : 100.5,
        right : 100.5,
        id : 2
    });

    friendsGoingOutButtons.add(friendsGoingOutMaybe);

    //END FRIENDS "Maybe" BUTTON TAB

    //FRIENDS "No" BUTTON TAB
    var friendsGoingOutNo = Ti.UI.createButton({
        backgroundImage : '/images/profile/friendsGoingOutBg.png',
        title : 'No',
        isSelected : false,
        font : {
            fontFamily : customFont
        },
        height : 30,
        width : 99,
        top : 0,
        left : 201,
        id : 3
    });

    friendsGoingOutButtons.add(friendsGoingOutNo);

    //END FRIENDS "No" BUTTON TAB

    //BLACK SPACER BETWEEN TAB BUTTONS AND TABLE
    var friendsSpacer = Ti.UI.createImageView({
        image : '/images/profile/spacer.png',
        height : 4,
        width : 300,
        left : 0,
        top : 26
    });

    friendsGoingOutButtons.add(friendsSpacer);
    //END BLACK SPACER BETWEEN TAB BUTTONS AND TABLE

    //
    friendsGoingOutYes.addEventListener('click', toggle);
    friendsGoingOutMaybe.addEventListener('click', toggle);
    friendsGoingOutNo.addEventListener('click', toggle);
    selectedButton = friendsGoingOutYes;
    //Set to Selected Button

    //FRIENDS GOING OUT TABLE (BOTTOM TABLE WITH THREE TABS)
    var friendsGoingOutYesTable = Ti.UI.createTableView({
        width : 300,
        top : 0,
        data : [],
        height : 300,
        footerTitle : "",
        minRowHeight : 50,
        opacity : 1
    });
    var friendsGoingOutMaybeTable = Ti.UI.createTableView({
        width : 300,
        top : 0,
        data : [],
        height : 300,
        footerTitle : "",
        minRowHeight : 50,
        opacity : 0

    });
    var friendsGoingOutNoTable = Ti.UI.createTableView({
        width : 300,
        top : 0,
        data : [],
        height : 300,
        footerTitle : "",
        minRowHeight : 50,
        opacity : 0

    });

    friendsGoingOutStatus.add(friendsGoingOutYesTable);
    friendsGoingOutStatus.add(friendsGoingOutMaybeTable);
    friendsGoingOutStatus.add(friendsGoingOutNoTable);

    //================== CUSTOM FUNCTION======================

    var get_Fb_profile = function(e) {

        //GRAB PROFILE PICTURE AND USE AS (ACS) USER IMAGE

        profileName.text = Ti.App.Properties.getString("user_full_name");
        var Facebook_uid = Ti.App.Properties.getString("fb_uid");
        if (Ti.Network.online && Facebook_uid) {

            if (Ti.App.Properties.getString('session_id')) {
                profilePicture.image = 'https://graph.facebook.com/' + Facebook_uid + '/picture';

                setTimeout(function(st) {
                    Cloud.Photos.create({
                        photo : profilePicture.toImage()
                    }, function(e) {
                        if (e.success) {
                            var photo = e.photos[0];
                        } else {
                            Ti.API.info('Photos:' + ((e.error && e.message) || JSON.stringify(e)));
                        }
                    });
                }, 2000);
            }

            //END GRAB PROFILE PICTURE AND USE AS (ACS) USER IMAGE

        }

    };
    // EVENT ROW
    var create_event_row = function(going_out, image, win) {

        var friendsGoingOutTableRow = Titanium.UI.createTableViewRow({
            layout : "horizontal",
            current_event : going_out

        });

        var user_event_status = Titanium.UI.createImageView({
            image : (going_out.going_out != "Yes") ? ((going_out.going_out == "No") ? "images/statusNo.png" : "images/statusMaybe.png") : "/images/statusYes.png",
            top : 5,
            width : 22,
            height : 22,
            left : 5,
            name : "status_img",
            layout : "horizontal"
        });
        friendsGoingOutTableRow.add(user_event_status);

        var user_image_view = Titanium.UI.createImageView({
            defaultImage : '/images/profilePlaceholder.png',
            image : encodeURI(image),
            top : 5,
            width : 30,
            height : 30,
            left : 5,
            name : "img",
            layout : "horizontal"
        });
        friendsGoingOutTableRow.add(user_image_view);

        var lbl_user_text = Ti.UI.createLabel({
            left : 10,
            top : 5,
            height : 20,
            width : 200,
            text : going_out.user_full_name,
            color : "black",
            name : "lbl",
            font : {
                fontFamily : customFont,
                fontSize : 12,
                fontWeight : 'bold'
            }
        });

        friendsGoingOutTableRow.add(lbl_user_text);

        switch (going_out.going_out) {
            case "Yes" :

                top_event_data_yes.push(friendsGoingOutTableRow);
                friendsGoingOutYesTable.setData(top_event_data_yes);

                break;
            case "No":
                top_event_data_no.push(friendsGoingOutTableRow);
                friendsGoingOutNoTable.setData(top_event_data_no);

                break;
            case "Maybe":
                top_event_data_maybe.push(friendsGoingOutTableRow);
                friendsGoingOutMaybeTable.setData(top_event_data_maybe);

                break;

        };

        goingOutNo.touchEnable = true;
        goingOutYes.touchEnable = true;
        goingOutMaybe.touchEnable = true;

        if (win && win != null) {
            win.close();
        }

        //

        setTimeout(function(e1) {
            // refresh.enabled = true;
            //Ti.API.info(JSON.stringify(goingOut_event));

        }, 2000);

    };
    //END EVENT ROW
    //END LOAD EVENTS DETAILS
    var load_event_details = function(goingOutTonight, win) {

        var image = "/image/profilePlaceholder.png";
        var id = (goingOutTonight.user_id) ? (goingOutTonight.user_id) : null;

        Cloud.Photos.search({
            user_id : id
        }, function(e) {

            if (e.success) {
                if (e.photos.length > 0) {
                    var photo = e.photos[0];
                    if (photo && photo.urls) {
                        image = (photo.urls) ? photo.urls.square_75 : photo.urls.original;
                        create_event_row(goingOutTonight, image, win);
                    }
                }

            } else {
                Ti.API.info('Photos:' + ((e.error && e.message) || JSON.stringify(e)));
                image = "/image/profilePlaceholder.png";
                create_event_row(goingOutTonight, image, win);

            }

        });

    };
    //END LOAD EVENTS DETAILS

    function parseISO8601(str) {
        var parts = str.split('T');
        dateParts = parts[0].split('-');
        timeParts = parts[1].split('Z');
        timeSubParts = timeParts[0].split(':');
        timeSecParts = timeSubParts[2].split('.');
        timeHours = Number(timeSubParts[0]);
        var _date = new Date();

        _date.setUTCFullYear(Number(dateParts[0]));
        _date.setUTCMonth(Number(dateParts[1]) - 1);
        _date.setUTCDate(Number(dateParts[2]));
        _date.setUTCHours(Number(timeHours));
        _date.setUTCMinutes(Number(timeSubParts[1]));
        _date.setUTCSeconds(Number(timeSecParts[0]));
        if (timeSecParts[1])
            _date.setUTCMilliseconds(Number(timeSecParts[1]));

        return _date;

    };

    //======================END CUSTOM FUNCTION======================

    var profile_load = function(win) {
        friend_array = [];
        try {

            if (Ti.Network.online) {
                if (Ti.App.Properties.getString('session_id')) {
                    top_event_data_yes = [];
                    top_event_data_no = [];
                    top_event_data_maybe = [];
                    goingOut_event = [];
                    friendsGoingOutYesTable.setData(top_event_data_yes);
                    friendsGoingOutNoTable.setData(top_event_data_no);
                    friendsGoingOutMaybeTable.setData(top_event_data_maybe);
                    friend_array.push(Ti.App.Properties.getString("currentUser_id"));
                    Cloud.Friends.search({
                        user_id : Ti.App.Properties.getString('currentUser_id')

                    }, function(e1) {
                        if (e1.success) {
                            if (e1.users.length > 0) {

                                for (var i = 0; i < e1.users.length; i++) {
                                    var friend = e1.users[i];
                                    friend_array.push(friend.id);
                                }

                            }
                            ////// my condition

                            Cloud.Objects.query({
                                classname : 'goingOutTonight'

                            }, function(e) {
                                if (e.success) {
                                    //Ti.API.info("e.goingOutTonight.length=" + e.goingOutTonight.length);
                                    if (e.goingOutTonight.length > 0) {

                                        // alert(e.goingOutTonight.length);

                                        for (var i = 0; i < e.goingOutTonight.length; i++) {
                                            var goingOutTonight = e.goingOutTonight[i];

                                            if (goingOutTonight.updated_at != 0) {

                                                var offset = -5.0;
                                                //  parsing event-iso-8601-date-string-to-est-date-time
                                                var datestring = goingOutTonight.updated_at;
                                                var c = datestring.split("+");
                                                var datestring = c[0] + ".0Z";
                                                var d = new Date(parseISO8601(datestring));
                                                var server_utc = d.getTime() + (d.getTimezoneOffset() * 60000);
                                                var goingout_update_date = new Date(server_utc + (3600000 * offset));
                                                var hours = goingout_update_date.getHours();
                                                var ampm = hours >= 12 ? 'pm' : 'am';
                                                var event_hours = hours % 12;
                                                event_hours = event_hours ? event_hours : 12;
                                                if (event_hours == 12) {
                                                    event_hours = (event_hours - 12);
                                                }
                                                var event_minutes = goingout_update_date.getMinutes();

                                                //  parsing event-iso-8601-date-string-to-est-date-time

                                                //  parsing current-date-string-to-est-date-time
                                                var clientDate = new Date();
                                                var utc = clientDate.getTime() + (clientDate.getTimezoneOffset() * 60000);

                                                var current_date = new Date(utc + (3600000 * offset));
                                                var dt_utc_hours = current_date.getHours();
                                                var dt_utc_minuts = current_date.getMinutes();
                                                var dt_utc_day_old = current_date.getDay();
                                                var dt_utc_day = current_date.getDate();

                                                //  parsing current-date-string-to-est-date-time

                                                // **************************Current Login 8***********************************

                                                if (dt_utc_day == goingout_update_date.getDate()) {

                                                    
                                                    if (event_hours < 4) {

                                                        if (friend_array.indexOf(goingOutTonight.user_id) > -1) {
                                                            var ind = friend_array.indexOf(goingOutTonight.user_id);

                                                            if (goingOutTonight.user_id == friend_array[ind]) {

                                                                if (goingOutTonight.user_id == Ti.App.Properties.getString("currentUser_id")) {
                                                                    goingOut_event = goingOutTonight;
                                                                    profileGoingOutStatus.image = (goingOut_event.going_out != "Yes") ? ((goingOut_event.going_out == "No") ? "images/statusNo.png" : "images/statusMaybe.png") : "/images/statusYes.png";

                                                                } else {
                                                                    //alert("direct load");
                                                                    load_event_details(goingOutTonight, win);
                                                                }
                                                            }
                                                        }

                                                    } else if (event_hours == 3 && event_minutes > 55) {

                                                        var event_id = goingOutTonight.event_id;
                                                        var top_event_id = goingOutTonight.top_event_id;
                                                        var acl_id = goingOutTonight.acl_id;
                                                        var user_id = goingOutTonight.user_id;

                                                        if (goingOutTonight.user_id == Ti.App.Properties.getString("currentUser_id")) {
                                                            //alert("same day remove now");
                                                            Cloud.Objects.update({
                                                                classname : "goingOutTonight",
                                                                id : goingOutTonight.id,
                                                                fields : {
                                                                    event_id : 0,
                                                                    acl_id : 0,
                                                                    here_clicked_time : 0,
                                                                    bar_name : null,
                                                                    going_out : 'No',
                                                                    is_attending : false
                                                                }

                                                            }, function(e) {
                                                                if (e.success) {
                                                                    var goingOut = e.goingOutTonight[0];

                                                                    if (friend_array.indexOf(goingOut.user_id) > -1) {
                                                                        var ind = friend_array.indexOf(goingOut.user_id);

                                                                        if (goingOut.user_id == friend_array[ind]) {

                                                                            if (goingOut.user_id == Ti.App.Properties.getString("currentUser_id")) {
                                                                                goingOut_event = goingOut;
                                                                                profileGoingOutStatus.image = (goingOut_event.going_out != "Yes") ? ((goingOut_event.going_out == "No") ? "images/statusNo.png" : "images/statusMaybe.png") : "/images/statusYes.png";

                                                                            } else {
                                                                                alert("wait remove next day");
                                                                                load_event_details(goingOutTonight, win);
                                                                            }
                                                                        }
                                                                    } else {
                                                                        // alert("condition not matched");
                                                                        //  Ti.API.info("friends=" + JSON.stringify(friend_array));
                                                                    }

                                                                } else if (e.error) {
                                                                    Ti.API.info(JSON.stringify(e));
                                                                }
                                                            });
                                                        } else {

                                                            //refresh.enabled = true;
                                                            if (friend_array.indexOf(goingOutTonight.user_id) > -1) {
                                                                var ind = friend_array.indexOf(goingOutTonight.user_id);

                                                                if (goingOutTonight.user_id == friend_array[ind]) {

                                                                    if (goingOutTonight.user_id == Ti.App.Properties.getString("currentUser_id")) {
                                                                        goingOut_event = goingOutTonight;
                                                                        profileGoingOutStatus.image = (goingOut_event.going_out != "Yes") ? ((goingOut_event.going_out == "No") ? "images/statusNo.png" : "images/statusMaybe.png") : "/images/statusYes.png";

                                                                    } else {
                                                                        // alert("wait remove next day");
                                                                        load_event_details(goingOutTonight, win);
                                                                    }
                                                                }
                                                            }

                                                        }

                                                    } else if (event_hours > 4 || event_hours == 4) {

                                                        if (friend_array.indexOf(goingOutTonight.user_id) > -1) {
                                                            var ind = friend_array.indexOf(goingOutTonight.user_id);

                                                            if (goingOutTonight.user_id == friend_array[ind]) {

                                                                if (goingOutTonight.user_id == Ti.App.Properties.getString("currentUser_id")) {
                                                                    goingOut_event = goingOutTonight;

                                                                    profileGoingOutStatus.image = (goingOut_event.going_out != "Yes") ? ((goingOut_event.going_out == "No") ? "images/statusNo.png" : "images/statusMaybe.png") : "/images/statusYes.png";

                                                                } else {
                                                                    //alert("wait remove next day");
                                                                    load_event_details(goingOutTonight, win);
                                                                }
                                                            }
                                                        }
                                                    }

                                                } else if (dt_utc_day > goingout_update_date.getDate()) {

                                                    if (event_hours < 4) {

                                                        if (friend_array.indexOf(goingOutTonight.user_id) > -1) {
                                                            var ind = friend_array.indexOf(goingOutTonight.user_id);

                                                            if (goingOutTonight.user_id == friend_array[ind]) {

                                                                if (goingOutTonight.user_id == Ti.App.Properties.getString("currentUser_id")) {
                                                                    goingOut_event = goingOutTonight;
                                                                    profileGoingOutStatus.image = (goingOut_event.going_out != "Yes") ? ((goingOut_event.going_out == "No") ? "images/statusNo.png" : "images/statusMaybe.png") : "/images/statusYes.png";

                                                                } else {
                                                                    //  alert("prev day direct load");
                                                                    load_event_details(goingOutTonight, win);
                                                                }
                                                            }
                                                        }

                                                    } else if (event_hours == 4 || event_hours > 4) {

                                                        var event_id = goingOutTonight.event_id;
                                                        var top_event_id = goingOutTonight.top_event_id;
                                                        var acl_id = goingOutTonight.acl_id;
                                                        var user_id = goingOutTonight.user_id;

                                                        if (goingOutTonight.user_id == Ti.App.Properties.getString("currentUser_id")) {
                                                            Cloud.Objects.update({
                                                                classname : "goingOutTonight",
                                                                id : goingOutTonight.id,
                                                                fields : {
                                                                    event_id : 0,
                                                                    acl_id : 0,
                                                                    here_clicked_time : 0,
                                                                    bar_name : null,
                                                                    going_out : 'No',
                                                                    is_attending : false
                                                                }

                                                            }, function(e) {
                                                                if (e.success) {
                                                                    var goingOut = e.goingOutTonight[0];

                                                                    // alert("prev day remove now ");

                                                                    if (friend_array.indexOf(goingOut.user_id) > -1) {
                                                                        var ind = friend_array.indexOf(goingOut.user_id);

                                                                        if (goingOut.user_id == friend_array[ind]) {

                                                                            if (goingOut.user_id == Ti.App.Properties.getString("currentUser_id")) {
                                                                                goingOut_event = goingOut;
                                                                                profileGoingOutStatus.image = (goingOut_event.going_out != "Yes") ? ((goingOut_event.going_out == "No") ? "images/statusNo.png" : "images/statusMaybe.png") : "/images/statusYes.png";

                                                                            } else {
                                                                                load_event_details(goingOutTonight, win);
                                                                            }
                                                                        }
                                                                    } else {
                                                                        // alert("condition not matched");
                                                                        //Ti.API.info("friends=" + JSON.stringify(friend_array));
                                                                    }

                                                                } else if (e.error) {
                                                                    Ti.API.info(JSON.stringify(e));
                                                                }
                                                            });
                                                        } else {

                                                            // refresh.enabled = true;
                                                            if (friend_array.indexOf(goingOutTonight.user_id) > -1) {
                                                                var ind = friend_array.indexOf(goingOutTonight.user_id);

                                                                if (goingOutTonight.user_id == friend_array[ind]) {

                                                                    if (goingOutTonight.user_id == Ti.App.Properties.getString("currentUser_id")) {
                                                                        goingOut_event = goingOutTonight;
                                                                        profileGoingOutStatus.image = (goingOut_event.going_out != "Yes") ? ((goingOut_event.going_out == "No") ? "images/statusNo.png" : "images/statusMaybe.png") : "/images/statusYes.png";

                                                                    } else {
                                                                        load_event_details(goingOutTonight, win);
                                                                    }
                                                                }
                                                            }

                                                        }

                                                    }

                                                }

                                                // **************************Current Logic 8***********************************

                                                ////// my condition

                                            }// end if condition
                                            else {

                                                if (friend_array.indexOf(goingOutTonight.user_id) > -1) {
                                                    var ind = friend_array.indexOf(goingOutTonight.user_id);

                                                    if (goingOutTonight.user_id == friend_array[ind]) {

                                                        if (goingOutTonight.user_id == Ti.App.Properties.getString("currentUser_id")) {
                                                            goingOut_event = goingOutTonight;
                                                            profileGoingOutStatus.image = (goingOut_event.going_out != "Yes") ? ((goingOut_event.going_out == "No") ? "images/statusNo.png" : "images/statusMaybe.png") : "/images/statusYes.png";

                                                        } else {
                                                            load_event_details(goingOutTonight, win);
                                                        }
                                                    }
                                                }

                                            }

                                        } // End for loop

                                    } else {

                                        // Ti.API.info("No goingout founded" + JSON.stringify(friend_array));
                                    }

                                } else {
                                    if (win && win != null) {
                                        win.close();
                                    }
                                    Ti.API.info('Error:\n' + ((e.error && e.message) || JSON.stringify(e)));
                                }
                            });

                            setTimeout(function(t) {
                                refresh.enabled = true;
                            }, 10000);

                        } else {
                            Ti.API.info('Error:\n' + ((e1.error && e1.message) || JSON.stringify(e1)));
                        }
                    });
                }
            } else {
                refresh.enabled = true;
                alert("No one is currently attending an event");
            }
        } catch(ex) {
            alert(ex);
        }

    };

    profile.addEventListener("focus", function(e) {

        //refresh.enabled = true;
        refresh.enabled = false;
        profileName.text = Ti.App.Properties.getString("user_full_name");

        if (Ti.Network.online) {

            Cloud.Photos.search({
                user_id : Ti.App.Properties.getString('currentUser_id'),
            }, function(e) {
                if (e.success) {

                    if (e.photos.length > 0) {
                        var photo = e.photos[0];
                        if (photo) {
                            profilePicture.image = photo.urls.square_75;
                        }

                    } else {
                        profilePicture.image = null;
                        get_Fb_profile();
                    }
                } else {
                    Ti.API.info('Error:\n' + ((e.error && e.message) || JSON.stringify(e)));
                    profilePicture.image = null;
                    get_Fb_profile();
                }
            });

            if (Ti.App.Properties.getString("is_login") == true) {
                var act_ind_win = null;
                var friend_array = [];
                profile_load(act_ind_win);
            }

        } else {
            alert("Please check your internet connection");
        }

    });

    return profile;
};
module.exports = profile;
