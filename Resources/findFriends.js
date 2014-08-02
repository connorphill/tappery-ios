function findFriends(args) {

    var Cloud = require('ti.cloud');
    var data = [];
    var customFont = 'HouschkaAlt';
    var local_counter = 0;
    var campus_taps_friends = [];
    var global_index = 0;
    var current_row_index = 0;
    var global_button_object = null;


    var tracker = require('analytics');
    var flurry = require('sg.flurry');
    //END WINDOW SETTINGS

    //WINDOW SETTINGS

    var friends = Ti.UI.createWindow({
        barColor : '#3b5e34',
        title : "Friends",
        barImage : '/images/navBar.png',
        backgroundColor : '#fff',
        translucent : false,
        navTintColor : '#fff',
        color : "#fff"
    });

    friends.addEventListener('open', function(){
        tracker.trackScreen('Find Friends');
        flurry.logPageView();
        Ti.API.info('Tracking Find Friends');

    });

    //BACK BUTTON
    friends.leftNavButton = ButtonRetour;
    var ButtonRetour = Ti.UI.createButton();

    ButtonRetour.addEventListener('click', function() {
        friends.close();
    });
    //END BACK BUTTON

    //FRIENDS LIST TABLE
    var barList = Titanium.UI.createTableView({
        height : 366,
        width : 320,
        top : 0,
        left : 0
    });
    friends.add(barList);

    //FIND FRIENDS WHO HAVE APP INSTALLED

    var add_friend = function(button_status, user_id, friend_id, e) {

        if (local_counter == 1) {

            switch(button_status) {
                case 1:
                    Cloud.Friends.add({
                        user_ids : friend_id
                    }, function(e1) {
                        if (e1.success) {

                            global_button_object = e;

                            var url = "http://campustaps.com/friendships.json?user_id=" + user_id + "&friend_id=" + friend_id + "&status=Pending";

                            Ti.API.info("url=" + url);

                            xhr_operations(url, 'POST', add_remote_friend_callback, add_remote_friend_errorback);

                            Cloud.PushNotifications.query({
                                user_id : friend_id,
                                channel : 'friend_request',
                                type : 'ios'
                            }, function(e2) {
                                if (e2.success) {
                                    e2.subscriptions.forEach(function(subscription) {

                                        Ti.API.info(JSON.stringify(subscription));
                                        var friend_device_token = subscription.device_token;
                                        if (friend_device_token) {
                                            var payload = {
                                                badge : 1,
                                                alert : 'Campus Taps friend request from' + " " + Ti.App.Properties.getString("user_full_name")
                                            };
                                            Cloud.PushNotifications.notifyTokens({
                                                channel : 'friend_request',
                                                to_tokens : friend_device_token,
                                                payload : payload,
                                                title : 'Campus Taps ',

                                            }, function(e3) {
                                                if (e3.success) {
                                                    Ti.API.info('Success');
                                                } else {
                                                    alert('e-3Error:\n' + ((e3.error && e3.message) || JSON.stringify(e3)));
                                                }
                                            });
                                        }

                                    });
                                } else {
                                    alert('e-2-Error:\n' + ((e2.error && e2.message) || JSON.stringify(e2)));
                                }
                            });

                        } else {
                            Ti.API.info('e-1-Error\n' + ((e1.error && e1.message) || JSON.stringify(e1)));
                        }
                    });
                    break;
            };

        }

    };

    var update_remote_friend_callback = function(e) {
        barList.deleteRow(current_row_index, {
            animationStyle : Titanium.UI.iPhone.RowAnimationStyle.UP
        });

        alert('Friend(s) removed');
        local_counter = 0;
    };
    var update_remote_friend_errorback = function(e) {
        alert("Error=" + e);
    };

    var remove_friend = function(index, user_full_name, user_id, friend_id, already_friend_index) {
        if (local_counter == 1) {
            var dialog = Ti.UI.createAlertDialog({
                cancel : 1,
                buttonNames : ['Remove', 'Cancel'],
                message : 'Are you sure you want to remove' + " " + user_full_name + "?",
                title : 'Campus Taps'
            });
            dialog.addEventListener("click", function(e) {
                if (e.index === 0) {
                    Cloud.Friends.remove({
                        user_ids : friend_id
                    }, function(e) {
                        if (e.success) {

                            Ti.App.fireEvent("set_badge");

                            // var url = "http://campustaps.com/friendships/" + already_friend_index + "?status=XFriend";
                            var url = "http://campustaps.com/friendships/" + already_friend_index;

                            Ti.API.info("update url=" + url);

                            xhr_operations(url, 'DELETE', update_remote_friend_callback, update_remote_friend_errorback);

                        } else {
                            alert('Error:\n' + ((e.error && e.message) || JSON.stringify(e)));
                        }
                    });

                } else {
                    local_counter = 0;
                }
            });
            dialog.show();
        }
    };

    var friend_status = function(user_id) {
        var result = false;

        if (campus_taps_friends.length > 0) {
            for (var i = 0; i < campus_taps_friends.length; i++) {

                var obj = [];
                obj = campus_taps_friends[i].friendship;
                if (obj.friend_id == user_id) {
                    global_index = i;
                    result = true;
                }
            }
        }

        return result;
    };

    var load_firend_details = function(user) {
        var photo_url = null;
        Cloud.Photos.search({
            user_id : user.id

        }, function(e) {
            if (e.success) {

                if (e.photos.length > 0) {
                    var photo = e.photos[0];
                    photo_url = photo.urls.square_75;
                    var user_image_view = Titanium.UI.createImageView({
                        defaultImage : '/images/profilePlaceholder.png',
                        image : photo_url,
                        width : 40,
                        height : 40,
                        left : 10,
                        layout : "horizontal"
                    });

                } else {
                    photo_url = '/images/profilePlaceholder.png';
                    var user_image_view = Titanium.UI.createImageView({
                        defaultImage : '/images/profilePlaceholder.png',
                        image : photo_url,
                        width : 40,
                        height : 40,
                        left : 10,
                        layout : "horizontal"
                    });

                }

                var row = Ti.UI.createTableViewRow({
                    height : 60,
                    id : user.id,
                    user_id : user.id,
                    selectedBackgroundColor:"white"
                });
                row.add(user_image_view);

                //FRIEND NAME
                var name = Ti.UI.createLabel({
                    text : user.first_name + " " + user.last_name,
                    height : 20,
                    font : {
                        fontSize : 15
                    },
                    left : 60
                });

                row.add(name);

                if (friend_status(user.id) == true) {
                    var obj = campus_taps_friends[global_index].friendship;
                    var index = global_index;
                    var status = (obj.friend_id == user.id) ? obj.status : '+Friend';
                    var bg_image = (obj.status == "Friend") ? '/images/findFriends/friends.png' : (obj.status == "Pending") ? '/images/findFriends/pending.png' : '/images/findFriends/friendButton.png';
                    var already_friend_index = (obj.friend_id == user.id) ? obj.id : 0;
                        Ti.API.info("bg_image="+bg_image);
                    var addFriend = Ti.UI.createButton({
                        backgroundImage : bg_image,
                        zIndex:10,
                        title : (status != "Friend") ? ((status == "Pending") ? 'Pending' : '+Friend') : 'Friend',
                        name : (status != "Friend") ? ((status == "Pending") ? 'Pending' : '+Friend') : 'Friend',
                        user_full_name : user.first_name + " " + user.last_name,
                        font : {
                            fontFamily : customFont
                        },
                        button_status : 1,
                        status : status,
                        friend_id : user.id,
                        already_friend_index : already_friend_index,
                        height : 30,
                        width : 60,
                        top : 15,
                        bottom : 15,
                        right : 10
                    });
                    row.add(addFriend);

                } else {

                    var bg_image = '/images/findFriends/friendButton.png';

                    var addFriend = Ti.UI.createButton({
                        backgroundImage : bg_image,
                        zIndex :10,
                        title : '+Friend',
                        status : "",
                        friend_id : user.id,
                        already_friend_id : 0,
                        name : "+Friend",
                        user_full_name : user.first_name + " " + user.last_name,
                        font : {
                            fontFamily : customFont
                        },
                        button_status : 1,
                        height : 30,
                        width : 60,
                        top : 15,
                        bottom : 15,
                        right : 10
                    });
                    row.add(addFriend);
                }

                data.push(row);
                barList.setData(data);

                barList.addEventListener("click", function(e) {

                    var index = e.index;
                  
                    switch(e.source.name) {

                        case "+Friend":
                            local_counter += 1;

                            var user_id = Ti.App.Properties.getString('currentUser_id');
                            var friend_id = user.id;
                            var button_status = e.source.button_status;

                            // Add
                            add_friend(button_status, user_id, friend_id, e);

                            break;
                        case "Friend":
                            if (e.source.friend_id) {
                                local_counter += 1;
                                current_row_index = index;
                                var user_full_name = e.source.user_full_name;
                                var friend_id = e.source.friend_id;
                                var user_id = Ti.App.Properties.getString('currentUser_id');
                                var already_friend_id = e.source.already_friend_index;
                                remove_friend(index, user_full_name, user_id, friend_id, already_friend_id);

                            }

                            break;
                        case  "default" :
                            Ti.API.info("hi");
                            break;
                    };

                });

            }
        });

    };

    Cloud.SocialIntegrations.searchFacebookFriends(function(e) {
        if (e.success) {

            Ti.API.info("social=" + JSON.stringify(e.users));

            if (e.users.length > 0) {
                data = [];
                for (var i = 0; i < e.users.length; i++) {
                    var user = e.users[i];
                    load_firend_details(user);

                }

            } else {
                var row = Ti.UI.createTableViewRow({
                    height : 60,
                    title : "No friends are found"
                });
                data = [];
                data.push(row);
                barList.setData(data);

            }

        } else {
            Ti.API.info((e.error && e.message) || JSON.stringify(e));
        }

    });

    var xhr_operations = function(url, type, call_back, error_back) {
        try {
            var xhr = Ti.Network.createHTTPClient();
            var _method = 'POST';

            if (type == "PUT") {
                _method = "PUT";
            } else if (type == "DELETE") {
                _method = "DELETE";
            }else if(type=="GET"){
                _method="GET";
            }
            campus_taps_friends = [];
            xhr.onload = function(e) {

                if (call_back && typeof (call_back) === 'function') {
                    var data = null;
                    Ti.API.info("this.responseText=" + this.responseText);
                    var response = this.responseText;
                    Ti.API.info(response);
                    if (response && response != null && response != "" && response.trim().length > 0) {

                        data = JSON.parse(response);

                    } else {
                        data = [];
                    }
                    call_back(data);

                }

            };
            xhr.onerror = function(e) {

                Ti.API.info("error=" + JSON.stringify(e));
                if (error_back && typeof (error_back) === 'function') {
                    error_back(e);
                }

            };

            xhr.open(type, url, true);
            xhr.setRequestHeader('X-HTTP-Method-Override', _method);
            xhr.setRequestHeader("Content-type", "application/json; charset=utf-8");
            xhr.timeout = 4000;
            xhr.send();

        } catch(ex) {
            alert(ex);
        }
    };
    var add_remote_friend_callback = function(e) {

        global_button_object.source.backgroundImage = '/images/findFriends/pending.png';
        global_button_object.source.title = 'Pending';
        alert('Friend(s) added');

    };
    var add_remote_friend_errorback = function(e) {
        // alert(JSON.stringify(e));
    };

    var load_remote_friend_list_callback = function(e) {

        campus_taps_friends = [];
        // campus_taps_friends = JSON.stringify(e);
        campus_taps_friends = e;
        Ti.API.info("Friend=" + JSON.stringify(campus_taps_friends));

    };
    var load_remote_friend_list_error_back = function(e) {
          alert(JSON.stringify(e));
    };

    friends.addEventListener("focus", function(e) {
        var u_id = Ti.App.Properties.getString('currentUser_id');
        var url = "http://campustaps.com/friendships.json?user_id=" + u_id;
        Ti.API.info("URL=" + url);
        xhr_operations(url, 'GET', load_remote_friend_list_callback, load_remote_friend_list_error_back);
    });

    return friends;

};
module.exports = findFriends;

