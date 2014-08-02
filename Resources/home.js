function home(arg) {
    var Cloud = require('ti.cloud');
    var fb = require('facebook');
    fb.appid = "125520310866488";
    //Production
    fb.permissions = ['read_stream'];
    var total_friends = 0;
    var win = Ti.UI.createWindow({

    });

    var customFont = 'HouschkaAlt';
    var flurry = require('sg.flurry');  
    var tracker = require('analytics');

flurry.startSession('SKMTWXPFTJ7V8YRB8FYD'); //this only needs to be called once in the entire app


    Ti.App.Properties.setString("daily_focus", true);

    var tabGroup = Titanium.UI.createTabGroup({
        tabsTintColor : '#3d6430',
        activeTabIconTint : '#3d6430',
        tabsTintColor : '#3d6430',
        backgroundColor : '#fff'

    });

    //dailySpecials.js WINDOW AND TAB

    var dailySpecials = require("dailySpecials");

    var dailySpecialsTab = Titanium.UI.createTab({
        icon : '/images/icons/todaysSpecialsIcon.png',
        title : 'Today\'s Specials',
        window : new dailySpecials()
    });



    if (tabGroup.activeTab = 1){
    dailySpecialsTab.addEventListener('focus', function(){
        tracker.trackScreen('Today\'s Specials');
        flurry.logPageView();
        Ti.API.info('Todays Specials Tracking');
    });
    } else   {  dailySpecialsTab.removeEventListener('focus', function(){
        tracker.trackScreen('Today\'s Specials');
        flurry.logPageView();
        Ti.API.info('Todays Specials Tracking Removed');
    });
    
    };

    //END dailySpecials.js

    var eventsFeed = require("eventsFeed");

    var eventsFeedTab = Titanium.UI.createTab({
        icon : '/images/icons/eventsFeedIcon.png',
        title : 'Events Feed',
        window : new eventsFeed()
    });


    if (tabGroup.activeTab = 2){
     eventsFeedTab.addEventListener('focus', function(){
        tracker.trackScreen('Events Feed');
        flurry.logPageView();
        Ti.API.info('Events Feed Tracking');

    });
    } else { eventsFeedTab.removeEventListener('focues', function(){
        tracker.trackScreen('Events Feed');
        flurry.logPageView();
        Ti.API.info('Events Feed Tracking Removed');

    });
    
    };



    //
    // create controls tab and root window
    //
    var bars = require("bars");

    var barsTab = Titanium.UI.createTab({
        icon : '/images/icons/barsIcon.png',
        title : 'Bars',
        color : '#000',
        window : new bars()
    });

    if (tabGroup.activeTab = 3){
     barsTab.addEventListener('focus', function(){
        tracker.trackScreen('Bars');
        flurry.logPageView();
        Ti.API.info('Bars Tracking');

    });
    } else { barsTab.removeEventListener('focus', function(){
        tracker.trackScreen('Bars');
        flurry.logPageView();
        Ti.API.info('Bars Tracking Removed');

    });
    };



    var profile = require("profile");
    
    var profileTab = Titanium.UI.createTab({
        icon : '/images/icons/profileIcon.png',
        title : 'Profile',
        color : '#000',
        window : new profile()

    });

if (tabGroup.activeTab = 4){
     profileTab.addEventListener('focus', function(){
        tracker.trackScreen('Profile');
        flurry.logPageView();
        Ti.API.info('Profile Tracking');

    });
    } else { profileTab.removeEventListener('focus', function(){
        tracker.trackScreen('Profile');
        flurry.logPageView();
        Ti.API.info('Profile Tracking Removed');

    });
    };




    //
    //  add tabs
    //
    tabGroup.addTab(dailySpecialsTab);
    tabGroup.addTab(eventsFeedTab);
    tabGroup.addTab(barsTab);
    tabGroup.addTab(profileTab);

    tabGroup.setActiveTab(0);

    // open tab group
    tabGroup.open();

    var xhr_operations = function(url, type, call_back) {
        try {
            var xhr = Ti.Network.createHTTPClient();
            campus_taps_friends = [];
            var _method = 'POST';

            if (type == "PUT") {
                _method = "PUT";
            } else if (type == "DELETE") {
                _method = "DELETE";
            } else {
                _method = "GET";
            }
            xhr.onload = function(e) {
                Ti.API.info("responseText=" + this.responseText);
                if (call_back && typeof (call_back) === 'function') {
                    var data = null;
                    var response = this.responseText;

                    if (response && response != null && response.trim().length > 0) {

                        data = JSON.parse(response);

                    } else {
                        data = [];
                    }
                    call_back(data);

                }

            };
            xhr.onerror = function(e) {
                alert("error=" + JSON.stringify(e));
            };

            xhr.open(type, url, true);
            xhr.setRequestHeader('X-HTTP-Method-Override', _method);
            xhr.setRequestHeader("Content-type", "application/json; charset=utf-8");
            xhr.send();

        } catch(ex) {
            alert(ex);
        }
    };

    var friend_status = function(user_id, campus_taps_friends) {
        var result = true;
        if (campus_taps_friends.length > 0) {
            for (var i = 0; i < campus_taps_friends.length; i++) {

                var obj = [];
                obj = campus_taps_friends[i].friendship;
               

                if (obj.friend_id == user_id && obj.status == "Rejected") {
                    result = false;
                } else if (obj.friend_id != user_id && obj.status == "Rejected") {
                    result = false;
                }
            }
        }

        Ti.API.info(JSON.stringify(result));

        return result;
    };

    var load_remote_friend_list_callback = function(e) {
        var campus_taps_friends = [];
        campus_taps_friends = e;

        Cloud.Friends.requests(function(e) {
            if (e.success) {

                Ti.API.info(JSON.stringify(e.friend_requests));

                if (e.friend_requests.length > 0) {

                    for (var i = 0; i < e.friend_requests.length; i++) {
                        var user = e.friend_requests[i].user;
                        if (friend_status(user.id, campus_taps_friends) == false) {

                            total_friends = 0;
                            total_friends = e.friend_requests.length;
                            if (total_friends > 0) {

                                total_friends = total_friends - 1;
                                profileTab.badge = (total_friends == 0) ? null : total_friends;
                                Ti.App.Properties.setString("total_friends", total_friends);
                            }

                        } else {

                            total_friends = 0;
                            total_friends = e.friend_requests.length;

                            profileTab.badge = total_friends;
                            Ti.App.Properties.setString("total_friends", total_friends);

                        }

                    }

                } else {
                    profileTab.badge = null;
                    Titanium.UI.iPhone.setAppBadge(null);
                    Ti.App.Properties.setString("total_friends", 0);
                }
            }
        });
    };

    var set_badge_subroutine = function() {

        var u_id = Ti.App.Properties.getString('currentUser_id');
        var url = "http://campustaps.com/friendships.json?user_id=" + u_id;
        Ti.API.info("notification url=" + url);
        xhr_operations(url, 'GET', load_remote_friend_list_callback);

    };
    set_badge_subroutine();

    Ti.App.addEventListener("set_badge", set_badge_subroutine);

    win.addEventListener("focus", function(e) {
        // Ti.API.info("ein foucs");
        //  set_badge_subroutine();
    });

    win.addEventListener("close", function(e) {
        Ti.App.removeEventListener("set_badge", set_badge_subroutine);
    });

    return home;
};
module.exports = home;
