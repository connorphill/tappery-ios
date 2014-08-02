function notifications(args) {
    var Cloud = require('ti.cloud');
    var customFont = 'HouschkaAlt';
    var friendRequest = [];
    var total_friends = 0;
    var current_row_index = 0;
    var campus_taps_friends = [];
    var global_index = 0;
    var already_friend_index = 0;
    var obj = null;
    var tracker = require('analytics');
    var flurry = require('sg.flurry');

    var notifications = Ti.UI.createWindow({
        barColor : '#3b5e34',
        title : "Notifications",
        barImage : '/images/navBar.png',
        backgroundColor : '#fff',
        translucent : false,
        navTintColor : '#fff',
        color : "#fff"
    });

    notifications.leftNavButton = ButtonRetour;

    var ButtonRetour = Ti.UI.createImageView();

    ButtonRetour.addEventListener('click', function() {
        notifications.close();
    });

    notifications.addEventListener('open', function(){
        tracker.trackScreen('Notification');
        flurry.logPageView();
        Ti.API.info('Tracking Notification');

    });
    
    var approvalTable = Titanium.UI.createTableView({
        height : 366,
        width : 320,
        top : 0,
        left : 0
    });
    notifications.add(approvalTable);

    var approve_remote_friend_callback = function(e) {

        // xhr update with status = Friend
        approvalTable.deleteRow(current_row_index, {
            animationStyle : Titanium.UI.iPhone.RowAnimationStyle.UP
        });

        alert('Friend(s) approved');
    };
    var approve_remote_friend_errorback = function(e) {
       // alert(JSON.stringify(e));
    };

    var delete_remote_friend_callback = function(e) {
        alert('Friend(s) removed');

        approvalTable.deleteRow(current_row_index, {
            animationStyle : Titanium.UI.iPhone.RowAnimationStyle.UP
        });
         Ti.App.fireEvent("set_badge");
    };
    var delete_remote_friend_errorback = function(e) {
        alert("delete friend" + JSON.stringify(e));
    };

   /* Cloud.Friends.requests(function(e) {
        if (e.success) {
            var photo_url = null;
                      

            if (e.friend_requests.length == 0) {
                var row = Ti.UI.createTableViewRow({
                    height : 60,
                    title : "No new notifications"
                });
                friendRequest.push(row);
                approvalTable.setData(friendRequest);
                Ti.App.fireEvent("set_badge");
            } else {
                
                alert("else part");
                  
                if (Ti.App.Properties.getString("total_friends") == 0 || Ti.App.Properties.getString("total_friends") == null) {
                    var row = Ti.UI.createTableViewRow({
                        height : 60,
                        title : "No new notifications"
                    });
                    friendRequest=[];
                    friendRequest.push(row);
                    approvalTable.setData(friendRequest);
                } else {
                    total_friends = e.friend_requests.length;
                    for (var i = 0; i < e.friend_requests.length; i++) {
                        Ti.API.info("e.friend_requestse=" + JSON.stringify(e.friend_requests));

                        var user = e.friend_requests[i].user;
                        var touchEnabled = false;
                                              
                       
                        if (friend_status(user.id) == true) {
                            
                            obj = campus_taps_friends[global_index].friendship;

                            already_friend_index = (obj.friend_id == user.id) ? obj.id : 0;

                            var row = Ti.UI.createTableViewRow({
                                height : 60,
                                id : (i + 1),
                                user_id : user.id,
                                selectedBackgroundColor:"white"
                            });
                            friendRequest.push(row);
                            var user_image_view = Titanium.UI.createImageView({
                                defaultImage : '/images/profilePlaceholder.png',
                                image : photo_url,
                                width : 40,
                                height : 40,
                                left : 10,
                                layout : "horizontal"
                            });

                            Cloud.Photos.search({
                                user_id : user.id
                            }, function(e) {
                                if (e.success) {

                                    if (e.photos.length > 0) {
                                        var photo = e.photos[0];
                                        photo_url = photo.urls.square_75;

                                    } else {
                                        photo_url = "/images/profilePlaceholder.png";
                                    }
                                    user_image_view.image = photo_url;
                                    row.add(user_image_view);

                                } else {
                                    user_image_view.image = "/images/profilePlaceholder.png";
                                    row.add(user_image_view);
                                }
                            });

                            var name = Ti.UI.createLabel({
                                text : user.first_name + " " + user.last_name,
                                width : 175,
                                height : 20,
                                font : {
                                    fontSize : 15
                                },
                                left : 60
                            });

                            row.add(name);

                            var reject = Ti.UI.createButton({
                                backgroundImage : '/images/notification/friendNotificationReject.png',
                                height : 30,
                                width : 30,
                                right : 50,
                                name : "reject",
                                zIndex : 10,
                                friend_id : user.id,
                                already_friend_index : already_friend_index,
                                touchEnabled : touchEnabled

                            });
                            row.add(reject);

                            var approve = Ti.UI.createButton({
                                backgroundImage : '/images/notification/friendNotificationAccept.png',
                                height : 30,
                                width : 30,
                                right : 10,
                                name : "approve",
                                zIndex : 10,
                                friend_id : user.id,
                                already_friend_index : already_friend_index
                            });

                            row.add(approve);

                        } else {
                            touchEnabled = true;
                            alert("what to do");
                        }

                    }

                    approvalTable.addEventListener("click", function(e) {
                        var index = e.index;

                        var badgeCount = Ti.UI.iPhone.getAppBadge();
                        badgeCount = badgeCount - 1;
                        Ti.UI.iPhone.setAppBadge(badgeCount);
                        
                        

                        switch(e.source.name) {
                            case "approve":
                                var friend_id = e.source.friend_id;
                                current_row_index = index;
                                var id = e.source.already_friend_index;

                                if (friend_id) {

                                    Cloud.Friends.approve({
                                        user_ids : friend_id
                                    }, function(e) {
                                        if (e.success) {
                                            if (total_friends > 0) {
                                                Ti.App.fireEvent("set_badge");
                                            }
                                            var user_id = Ti.App.Properties.getString('currentUser_id');
                                            var url = null;

                                            url = "http://campustaps.com/friendships/update?user_id=" + user_id + "&friend_id=" + friend_id + "&status=Friend";

                                            Ti.API.info("IRLLL=" + url);
                                            xhr_operations(url, 'PUT', approve_remote_friend_callback, approve_remote_friend_errorback);

                                            Ti.API.info("url=" + url);

                                        } else {
                                            Ti.API.info('Error:\n' + ((e.error && e.message) || JSON.stringify(e)));
                                        }
                                    });
                                }
                                break;
                            ///
                            case "reject":
                                var friend_id = e.source.friend_id;
                                var id = e.source.already_friend_index;
                                var user_id = Ti.App.Properties.getString('currentUser_id');
                                current_row_index = index;
                                if (friend_id) {
                                    Cloud.Friends.remove({
                                        user_ids : friend_id
                                    }, function(e) {
                                        if (e.success) {

                                            Ti.App.fireEvent("set_badge");

                                            var url = null;
                                            url = "http://campustaps.com/friendships/update?user_id=" + user_id + "&friend_id=" + friend_id + "&status=Rejected";

                                            Ti.API.info("update url=" + url);

                                            xhr_operations(url, 'PUT', delete_remote_friend_callback, delete_remote_friend_errorback);

                                        } else {
                                            alert('Error:\n' + ((e.error && e.message) || JSON.stringify(e)));
                                        }
                                    });
                                }

                                break;

                            //

                        };

                    });
                    approvalTable.setData(friendRequest);

                }

            }

        } else {
            Ti.API.info('Error:\n' + ((e.error && e.message) || JSON.stringify(e)));
        }

    });*/

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

    var friend_status = function(user_id) {
        var result = false;
        
        

        if (campus_taps_friends.length > 0) {
            for (var i = 0; i < campus_taps_friends.length; i++) {

                var obj = [];
                obj = campus_taps_friends[i].friendship;
                
                if (obj.friend_id == user_id && obj.status != "Rejected") {
                    global_index = i;
                    result = true;
                } else if (obj.friend_id == user_id && obj.status == "Rejected") {
                    result = false;
                }
            }
        }

        Ti.API.info(JSON.stringify(result));

        return result;
    };

    var load_remote_friend_list_callback = function(e) {
        campus_taps_friends = [];
        campus_taps_friends = e;
        
        
        // Add Cloud Logic
         Cloud.Friends.requests(function(e) {
        if (e.success) {
            var photo_url = null;
                      

            if (e.friend_requests.length == 0) {
                var row = Ti.UI.createTableViewRow({
                    height : 60,
                    title : "No new notifications"
                });
                friendRequest.push(row);
                approvalTable.setData(friendRequest);
                Ti.App.fireEvent("set_badge");
            } else {
                
                
                  
                if (Ti.App.Properties.getString("total_friends") == 0 || Ti.App.Properties.getString("total_friends") == null) {
                    var row = Ti.UI.createTableViewRow({
                        height : 60,
                        title : "No new notifications"
                    });
                    friendRequest=[];
                    friendRequest.push(row);
                    approvalTable.setData(friendRequest);
                } else {
                    total_friends = e.friend_requests.length;
                    for (var i = 0; i < e.friend_requests.length; i++) {
                        Ti.API.info("e.friend_requestse=" + JSON.stringify(e.friend_requests));

                        var user = e.friend_requests[i].user;
                       // var touchEnabled = false;
                        var touchEnabled = true;
                                              
                       
                        if (friend_status(user.id) == true) {
                            
                            obj = campus_taps_friends[global_index].friendship;

                            already_friend_index = (obj.friend_id == user.id) ? obj.id : 0;

                            var row = Ti.UI.createTableViewRow({
                                height : 60,
                                id : (i + 1),
                                user_id : user.id,
                                selectedBackgroundColor:"white"
                            });
                            friendRequest.push(row);
                            var user_image_view = Titanium.UI.createImageView({
                                defaultImage : '/images/profilePlaceholder.png',
                                image : photo_url,
                                width : 40,
                                height : 40,
                                left : 10,
                                layout : "horizontal"
                            });

                            Cloud.Photos.search({
                                user_id : user.id
                            }, function(e) {
                                if (e.success) {

                                    if (e.photos.length > 0) {
                                        var photo = e.photos[0];
                                        photo_url = photo.urls.square_75;

                                    } else {
                                        photo_url = "/images/profilePlaceholder.png";
                                    }
                                    user_image_view.image = photo_url;
                                    row.add(user_image_view);

                                } else {
                                    user_image_view.image = "/images/profilePlaceholder.png";
                                    row.add(user_image_view);
                                }
                            });

                            var name = Ti.UI.createLabel({
                                text : user.first_name + " " + user.last_name,
                                width : 175,
                                height : 20,
                                font : {
                                    fontSize : 15
                                },
                                left : 60
                            });

                            row.add(name);

                            var reject = Ti.UI.createButton({
                                backgroundImage : '/images/notification/friendNotificationReject.png',
                                height : 30,
                                width : 30,
                                right : 50,
                                name : "reject",
                                zIndex : 10,
                                friend_id : user.id,
                                already_friend_index : already_friend_index,
                                touchEnabled : touchEnabled

                            });
                            row.add(reject);

                            var approve = Ti.UI.createButton({
                                backgroundImage : '/images/notification/friendNotificationAccept.png',
                                height : 30,
                                width : 30,
                                right : 10,
                                name : "approve",
                                zIndex : 10,
                                friend_id : user.id,
                                already_friend_index : already_friend_index
                            });

                            row.add(approve);

                        } else {
                            touchEnabled = false;
                           
                        }

                    }

                    approvalTable.addEventListener("click", function(e) {
                        var index = e.index;

                        var badgeCount = Ti.UI.iPhone.getAppBadge();
                        badgeCount = badgeCount - 1;
                        Ti.UI.iPhone.setAppBadge(badgeCount);
                        
                        Ti.API.info("e.source.name=",e.source.name);

                        switch(e.source.name) {
                            case "approve":
                                var friend_id = e.source.friend_id;
                                current_row_index = index;
                                var id = e.source.already_friend_index;

                                if (friend_id) {

                                    Cloud.Friends.approve({
                                        user_ids : friend_id
                                    }, function(e) {
                                        if (e.success) {
                                            if (total_friends > 0) {
                                                Ti.App.fireEvent("set_badge");
                                            }
                                            var user_id = Ti.App.Properties.getString('currentUser_id');
                                            var url = null;

                                            url = "http://campustaps.com/friendships/update?user_id=" + user_id + "&friend_id=" + friend_id + "&status=Friend";

                                            Ti.API.info("IRLLL=" + url);
                                            xhr_operations(url, 'PUT', approve_remote_friend_callback, approve_remote_friend_errorback);

                                            Ti.API.info("url=" + url);

                                        } else {
                                            Ti.API.info('Error:\n' + ((e.error && e.message) || JSON.stringify(e)));
                                        }
                                    });
                                }
                                break;
                            ///
                            case "reject":
                                var friend_id = e.source.friend_id;
                                var id = e.source.already_friend_index;
                                var user_id = Ti.App.Properties.getString('currentUser_id');
                                current_row_index = index;
                                if (friend_id) {
                                    Cloud.Friends.remove({
                                        user_ids : friend_id
                                    }, function(e) {
                                        if (e.success) {

                                           // Ti.App.fireEvent("set_badge");

                                            var url = null;
                                            url = "http://campustaps.com/friendships/update?user_id=" + user_id + "&friend_id=" + friend_id + "&status=Rejected";

                                            Ti.API.info("update url=" + url);

                                            xhr_operations(url, 'PUT', delete_remote_friend_callback, delete_remote_friend_errorback);

                                        } else {
                                            alert('Error:\n' + ((e.error && e.message) || JSON.stringify(e)));
                                        }
                                    });
                                }

                                break;

                            //

                        };

                    });
                    approvalTable.setData(friendRequest);

                }

            }

        } else {
            Ti.API.info('Error:\n' + ((e.error && e.message) || JSON.stringify(e)));
        }

    });
        // Cloud Logic
        
        
        
        
    };

    notifications.addEventListener("focus", function(e) {
        var u_id = Ti.App.Properties.getString('currentUser_id');
        var url = "http://campustaps.com/friendships.json?user_id=" + u_id;

        Ti.API.info("notification url=" + url);
        xhr_operations(url, 'GET', load_remote_friend_list_callback);
    });

    return notifications;
};
module.exports = notifications;

