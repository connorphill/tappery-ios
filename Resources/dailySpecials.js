function dailySpecials(args) {
    var Cloud = require('ti.cloud');
    var customFont = 'HouschkaAlt';
    var fb = require('facebook');
    fb.appid = "125520310866488";
    fb.permissions = ['read_stream'];
    var activityindicator_win = require("activityindicator_win");
    var obj_win = new activityindicator_win();
    var utc_day = 0;
    var tracker = require('analytics');
    var flurry = require('sg.flurry');

    var current_button_filter = 0;

    var dict = {
        "0" : 1,
        "1" : 1,
        "2" : 1,
        "3" : 1,
        "4" : 1,
        "5" : 1,
        "6" : 1
    };

    var all_data = [];

    var Johne_Hopkins_data = [];
    var Loyala_data = [];
    var Towson_data = [];
    var Downtown_data = [];
    var Federal_Hill_data = [];
    var Fells_Points_data = [];
    var str_user_id = "";
    var contentSlider = null;
    var index = 0;
    var prev_index = 0;
    var friends_arry = [];

    //END dailySpecials.js WINDOW SETTINGS

    var daily = Ti.UI.createWindow({
        barColor : '#3d6430',
        titleImage : 'tap.png',
        backgroundColor : '#e9e7e7',
        translucent : false
    });

    contentSlider = Ti.UI.createScrollableView({
        scrollType : 'horizontal',
        views : [],
        height : 185,
        top : 0,
    });
    contentSlider.addEventListener("scrollend", function(e) {

        index = contentSlider.currentPage;
        dict[current_button_filter] = index;

        if (index > -1) {

            if (prev_index != index) {
                check_user_ACLs();
                change_date_wise_bar_description();

            } else {
                check_user_ACLs();
            }

            prev_index = index;
        }
    });

    daily.add(contentSlider);
    // CUSTOM FUNCTIONS
    var countDown = function(m, s, fn_tick, fn_end) {
        return {
            total_sec : m * 60 + s,
            timer : this.timer,
            set : function(m, s) {
                this.total_sec = parseInt(m) * 60 + parseInt(s);
                this.time = {
                    m : m,
                    s : s
                };
                return this;
            },
            start : function() {
                var self = this;
                this.timer = setInterval(function() {
                    if (self.total_sec) {
                        self.total_sec--;
                        self.time = {
                            m : parseInt(self.total_sec / 60),
                            s : (self.total_sec % 60)
                        };
                        fn_tick();
                    } else {
                        self.stop();
                        fn_end();
                    }
                }, 1000);
                return this;
            },
            stop : function() {
                clearInterval(this.timer);
                this.time = {
                    m : 0,
                    s : 0
                };
                this.total_sec = 0;
                return this;
            }
        };
    };

    var my_timer = new countDown(2, 60, function() {

    }, function() {

        daily_special_text(utc_day);

    });

    var chnage_text_function = function(dt_utc_hours, dt_utc_minuts, dt_utc_seconds, dt_utc_day) {

        utc_day = dt_utc_day;
        // Ti.API.info("chnage_text_function=" + "dt_utc_hours=" + dt_utc_hours + "||" + "dt_utc_minuts=" + dt_utc_minuts);
        if ((dt_utc_hours == 3 && dt_utc_hours < 12) && dt_utc_minuts == 60) {

            daily_special_text(dt_utc_day);

        } else if ((dt_utc_hours == 3 && dt_utc_hours < 12) && dt_utc_minuts < 60) {

            daily_special_text(dt_utc_day - 1);
        } else if ((dt_utc_hours == 4 || dt_utc_hours > 4) && dt_utc_hours < 12) {
            daily_special_text(dt_utc_day);
        } else if (dt_utc_hours < 4) {

            var tmp_hrs = (3 - dt_utc_hours);
            var tmp_min = (60 - dt_utc_minuts);

            var tmp_sec = (60 - dt_utc_seconds);
            if (tmp_min == 60) {
                var tmp = (tmp_hrs * 60) - 1;
            } else {
                var tmp = (tmp_hrs * 60) + (tmp_min);
            }

            my_timer.stop();
            my_timer.set(tmp, 00);
            my_timer.start();

        }

    };

    var change_date_wise_bar_description = function() {

        var offset = -5.0;

        var clientDate = new Date();
        var utc = clientDate.getTime() + (clientDate.getTimezoneOffset() * 60000);
        var serverDate = new Date(utc + (3600000 * offset));
        var dt_utc_hours = serverDate.getHours();
        var dt_utc_minuts = serverDate.getMinutes();
        var dt_utc_seconds = serverDate.getSeconds();
        var dt_utc_day = serverDate.getDay();

        chnage_text_function(dt_utc_hours, dt_utc_minuts, dt_utc_seconds, dt_utc_day);
    };

    var intial_daily_sepcial_text = function(dt_utc_hours, dt_utc_minuts, dt_utc_day, data) {
        var id = dt_utc_day;
        var sepecial_Text = data.mon_special;
        var am = dt_utc_hours < 12 ? 'a.m.' : 'p.m.';

        // Ti.API.info(" intial_daily_sepcial_text=" + dt_utc_hours + "||" + "ets min=" + dt_utc_minuts + "||" + "AM/PM=" + am);

        if (dt_utc_hours == 4 && dt_utc_hours < 12) {
            id = dt_utc_day;
        } else if (dt_utc_hours > 4 && dt_utc_hours < 12) {
            id = dt_utc_day;
        } else if ((dt_utc_hours == 3 && dt_utc_hours < 12) && dt_utc_minuts == 60) {
            id = dt_utc_day;
        } else if ((dt_utc_hours == 3 && dt_utc_hours < 12) && dt_utc_minuts < 60) {
            id = dt_utc_day - 1;
        } else if (dt_utc_hours < 4) {
            id = dt_utc_day - 1;
            // Ti.API.info("correct");
        } else {

            id = dt_utc_day;
        }

        switch(id) {
            case 1:
                sepecial_Text = data.mon_special;
                break;
            case 2:
                sepecial_Text = data.tue_special;
                break;
            case 3:
                sepecial_Text = data.wed_special;

                break;
            case 4:
                sepecial_Text = data.thu_special;

                break;
            case 5:
                sepecial_Text = data.fri_special;
                break;
            case 6:
                sepecial_Text = data.sat_special;
                break;
            case 0:
                sepecial_Text = data.sun_special;
                break;
            default :
                sepecial_Text = data.mon_special;
                break;
        };

        return sepecial_Text;
    };

    // daily_special_text change bar desc as per 4AM
    var daily_special_text = function(id) {

        if (index >= 0) {
            var obj = contentSlider.views[index];

            if (obj && obj.children[2]) {
                var daily_special_text_lbl = obj.children[2].children[0];
                switch(id) {
                    case 1:
                        daily_special_text_lbl.text = obj.data.mon_special;
                        break;
                    case 2:
                        daily_special_text_lbl.text = obj.data.tue_special;
                        break;
                    case 3:
                        daily_special_text_lbl.text = obj.data.wed_special;

                        break;
                    case 4:
                        daily_special_text_lbl.text = obj.data.thu_special;

                        break;
                    case 5:
                        daily_special_text_lbl.text = obj.data.fri_special;
                        break;
                    case 6:
                        daily_special_text_lbl.text = obj.data.sat_special;
                        break;
                    case 7:
                        daily_special_text_lbl.text = obj.data.sun_special;
                        break;
                    default :
                        daily_special_text_lbl.text = obj.data.mon_special;
                        break;
                };

            }
        }
    };
    //END daily_special_text change bar desc as per 4AM

    //END CUSTOM FUNCTIONS

    // XHR CALL FOR FETCH DYNAMIC DATA
    var all_data_property = {
        all_data : [],
        Johne_Hopkins_data : [],
        Loyala_data : [],
        Towson_data : [],
        Downtown_data : [],
        Federal_Hill_data : [],
        Fells_Points_data : [],
    };

    var create_bar = function(bar_data) {

        var region_id = bar_data.region_id;

        var offset = -5.0;

        var clientDate = new Date();
        var utc = clientDate.getTime() + (clientDate.getTimezoneOffset() * 60000);

        var serverDate = new Date(utc + (3600000 * offset));
        //  Ti.API.info(" usa date=" + serverDate.toLocaleString());

        var dt_utc_hours = serverDate.getHours();
        var dt_utc_minuts = serverDate.getMinutes();
        var dt_utc_day = serverDate.getDay();

        if (region_id && region_id != null) {
            //SCROLLABLE VIEW DATA
            var barView = Ti.UI.createView({
                backgroundColor : '#123',
                data : bar_data,
                filter : bar_data.name
            });
            //END SCROLLABLE VIEW DATA

            //BAR NAME
            var barNameLabel = Ti.UI.createLabel({
                text : bar_data.name,
                textAlign : Ti.UI.TEXT_ALIGNMENT_CENTER,
                backgroundColor : '#000',
                font : {
                    fontFamily : customFont
                },
                opacity : 0.7,
                color : '#fff',
                height : 50,
                width : 320,
                top : 0,
                zIndex : 2
            });

            barView.add(barNameLabel);

            //END BAR NAME

            //BAR IMAGE
            var barImage = Ti.UI.createImageView({
                defaultImage : "/images/dailySpecials/brand.placeholder.png",
                image : encodeURI(bar_data.logo_url),
                height : 185,
                width : 320,
                zIndex : 1
            });
            barView.add(barImage);

            //END BAR IMAGE

            //DAILY DRINK SPECIALS VIEW

            var drinkSpecialsView = Ti.UI.createScrollView({
                backgroundColor : '#000',
                contentHeight : 'auto',
                showVerticalScrollIndicator : true,
                opacity : 0.7,
                height : 70,
                width : 320,
                bottom : 0,
                zIndex : 2,
            });
            //DAILY DRINK SPECIALS DATA LABEL

            var drinkSpecialsLabel = Ti.UI.createLabel({
                text : intial_daily_sepcial_text(dt_utc_hours, dt_utc_minuts, dt_utc_day, bar_data),
                textAlign : Ti.UI.TEXT_ALIGNMENT_LEFT,
                font : {
                    fontFamily : customFont
                },
                color : '#fff',
                top : 0
            });

            drinkSpecialsView.add(drinkSpecialsLabel);

            //END DAILY DRINK SPECIALS DATA LABEL

            barView.add(drinkSpecialsView);

            //END DAILY DRINK SPECIALS VIEW

            switch(region_id) {

                case 1:
                    Loyala_data.push(barView);
                    break;
                case 2:
                    Towson_data.push(barView);
                    break;
                case 3:
                    Johne_Hopkins_data.push(barView);
                    break;
                case 4:
                    Downtown_data.push(barView);
                    break;
                case 5:
                    Federal_Hill_data.push(barView);
                    break;
                case 6:
                    Fells_Points_data.push(barView);
                    break;

            }

            all_data.push(barView);
        }

    };

    var load_bars_details = function(data, obj_win) {
        try {
            if (Titanium.Network.online) {
                var xhr = Ti.Network.createHTTPClient();
                //LOAD JSON DATA
                xhr.onload = function() {
                    var all_region = [];
                    var Johne_Hopkins_region = [];
                    var Loyala_region = [];
                    var Towson_region = [];
                    var Downtown_region = [];
                    var Federal_Hill_region = [];
                    var Fells_Points_region = [];

                    var json = JSON.parse(this.responseText);

                    for (var i = 0; i < json.length; i++) {

                        switch(json[i].bar.region_id) {

                            case 1:
                                Loyala_region.push(json[i]);
                                create_bar(json[i].bar);
                                break;
                            case 2:
                                Towson_region.push(json[i]);
                                create_bar(json[i].bar);
                                break;
                            case 3:
                                Johne_Hopkins_region.push(json[i]);
                                create_bar(json[i].bar);
                                break;
                            case 4:
                                Downtown_region.push(json[i]);
                                create_bar(json[i].bar);
                                break;
                            case 6:
                                Federal_Hill_region.push(json[i]);
                                create_bar(json[i].bar);
                                break;
                            case 5:
                                Fells_Points_region.push(json[i]);
                                create_bar(json[i].bar);
                                break;
                        }

                    }

                    //CONTENT SLIDER ELEMENT (Element #1)
                    contentSlider.views = [];
                    contentSlider.views = all_data;
                    contentSlider.currentPage = 0;
                    prev_index = 0;

                    obj_win.close();

                };

                var url = "http://campustaps.com/bars.json?region_id=all";
                xhr.open('GET', url);
                xhr.send();

                //END CONTENT SLIDER ELEMENT (Element #1)

            } else {
                obj_win.close();
                alert("No one is currently attending an event");
            }

        } catch(ex) {
            obj_win.close();
            alert(ex);
        }
    };
    // END XHR CALL FOR FETCH DYNAMIC DATA
    //ATTENDING VIEW (Element #2)

    var attendingView = Ti.UI.createView({
        backgroundColor : '#fff',
        height : 40,
        width : 310,
        borderRadius : 5,
        top : 190,
        left : 5,
        right : 5
    });

    daily.add(attendingView);

    //END ATTENDING VIEW (Element #2)

    //"WHERE ARE YOU HEADING TONIGHT?" LABEL

    var attendingLabel = Ti.UI.createLabel({
        text : 'Where are you heading tonight?',
        font : {
            fontFamily : customFont
        },
        top : 10,
        left : 15
    });

    attendingView.add(attendingLabel);

    //END "WHERE ARE YOU HEADING TONIGHT?" LABEL

    //"HERE" BUTTON

    var attendingButton = Ti.UI.createButton({
        backgroundImage : '/images/dailySpecials/attendingButton.png',
       
        title : 'Here',
        font : {
            fontFamily : customFont
        },
        height : Ti.UI.FILL,
        width : 90,
        // top : 1,
        top : 0,
        right : 0
    });

    attendingButton.addEventListener("click", function(e) {

        try {

            if (Ti.Network.online) {
                if (Ti.App.Properties.getString('session_id')) {
                    Cloud.Friends.search({
                        user_id : Ti.App.Properties.getString('currentUser_id')

                    }, function(e1) {
                        if (e1.success) {
                            str_user_id = "";
                            friends_arry = [];

							
							
                            for (var i = 0; i < e1.users.length; i++) {
                                var friend = e1.users[i];

                                if (friend.id) {
                                    friends_arry.push(friend.id);
                                    str_user_id += friend.id + ",";

                                }

                            }
                            var strLen = str_user_id.length;

                            str_user_id = str_user_id.slice(0, strLen - 1);

                            ////

                            if (str_user_id.trim().length == 0) {
                                attendingButton.title = "Here";
                                attendingButton.touchEnabled = true;
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
                                        daily.tab.open(new findFriends({
                                            navBarHidden : false,
                                            modal : false
                                        }), {
                                            animated : true
                                        });
                                    }
                                });

                                dialog.show();

                                //alert("You do not have any friends currently attending events");

                            } else {

                                attendingButton.title = "Your're Here";
                                attendingButton.touchEnabled = false;
                                var index = contentSlider.currentPage;
                                obj_win.open();

                                var offset = -5.0;
                                var clientDate = new Date();

                                var utc = clientDate.getTime() + (clientDate.getTimezoneOffset() * 60000);
                                var here_clicked_time = new Date(utc + (3600000 * offset));

                                var current_utc_date = new Date(here_clicked_time.getFullYear(), here_clicked_time.getMonth(), here_clicked_time.getDate(), here_clicked_time.getHours(), here_clicked_time.getMinutes(), here_clicked_time.getSeconds(), here_clicked_time.getMilliseconds());
                                var next_day_time = new Date(here_clicked_time.getFullYear(), here_clicked_time.getMonth(), (here_clicked_time.getDate() + 1), 4, 0, 0, 0);

                                var dt_diff = (next_day_time.getTime() - current_utc_date.getTime());

                                // REMOVBE ALL EXISTING EVENTS

                                Cloud.Events.searchOccurrences({
                                    user_id : Ti.App.Properties.getString('currentUser_id')
                                }, function(e) {
                                    if (e.success) {

                                        if (e.event_occurrences.length > 0) {
                                            for (var i = 0; i < e.event_occurrences.length; i++) {
                                                var event = e.event_occurrences[i].event;

                                                Ti.API.info('Success goingOutTonight remove');
                                                Cloud.Objects.remove({
                                                    classname : "topEvents",
                                                    event_id : event.event_id,
                                                    id : event.custom_fields.top_event_custom_id
                                                }, function(e) {
                                                    if (e.success) {

                                                        Cloud.ACLs.show({
                                                            name : event.custom_fields.acls.name
                                                        }, function(e) {
                                                            if (e.success) {
                                                                Cloud.ACLs.remove({
                                                                    name : event.custom_fields.acls.name
                                                                }, function(e) {
                                                                    if (e.success) {
                                                                        Ti.API.info('Cloud.ACLs remove');
                                                                        if (Ti.App.Properties.getString('currentUser_id') == event.user.id) {
                                                                            Cloud.Events.remove({
                                                                                event_id : event.id
                                                                            }, function(e) {
                                                                                if (e.success) {
                                                                                    Ti.API.info(' Cloud.Events.remove');
                                                                                } else {

                                                                                    Ti.API.info('Error:\n' + ((e.error && e.message) || JSON.stringify(e)));
                                                                                }
                                                                            });
                                                                        }

                                                                    } else {

                                                                        Ti.API.info('Error:\n' + ((e.error && e.message) || JSON.stringify(e)));
                                                                    }
                                                                });

                                                            } else {

                                                                Ti.API.info('Error:\n' + ((e.error && e.message) || JSON.stringify(e)));
                                                            }
                                                        });

                                                    }

                                                });

                                            }
                                        }

                                    } else {
                                        Ti.API.info('Error:\n' + ((e.error && e.message) || JSON.stringify(e)));
                                    }
                                });

                                //REMOVBE ALL EXISTING EVENTS
                                // ACLS OBJECT

                                Cloud.ACLs.create({
                                    name : contentSlider.views[index].filter + "_" + Ti.App.Properties.getString('currentUser_id'),
                                    reader_ids : str_user_id,
                                    writer_ids : Ti.App.Properties.getString('currentUser_id'),
                                    public_read : true,
                                    public_write : true
                                }, function(e) {
                                    if (e.success) {
                                        var acls = e.acls[0];
                                        Cloud.Events.create({
                                            name : contentSlider.views[index].filter,

                                            start_time : current_utc_date,
                                            duration : (dt_diff / 1000),
                                            Users : Ti.App.Properties.getString("user"),
                                            custom_fields : {
                                                acls : acls,
                                                user_id : Ti.App.Properties.getString('currentUser_id'),
                                                bar_name : contentSlider.views[index].filter,
                                                top_event_custom_id : 0,
                                                goingOutTonight_custom_id : 0,
                                                custom_event_id : 0,
                                                friends : friends_arry

                                            },
                                            recurring : 'daily',
                                            recurring_count : 1,
                                            recurring_until : next_day_time
                                        }, function(e) {
                                            if (e.success) {
                                                var event = e.events[0];
											

                                                Cloud.Objects.create({
                                                    classname : "topEvents",
                                                    acl_name : acls.name,
                                                    acl_id : acls.id,
                                                    fields : {
                                                        here_clicked_time : current_utc_date,
                                                        bar_name : contentSlider.views[index].filter,
                                                        default_counter : 1,
                                                        user_id : Ti.App.Properties.getString('currentUser_id'),
                                                        acl_id : acls.id,
                                                        bar_image : contentSlider.views[index].data.logo_url,
                                                        event_id : event.id

                                                    }
                                                }, function(e) {

                                                    if (e.success) {

                                                        var top_event = e.topEvents[0];

                                                        if (Ti.App.Properties.getString("goingOutId") == null) {
                                                            Cloud.Objects.create({
                                                                classname : 'goingOutTonight',

                                                                fields : {
                                                                    event_id : event.id,
                                                                    user_id : Ti.App.Properties.getString('currentUser_id'),
                                                                    user_full_name : Ti.App.Properties.getString("user_full_name"),
                                                                    acl_id : event.custom_fields.acls.id,
                                                                    here_clicked_time : here_clicked_time,
                                                                    bar_name : top_event.bar_name,
                                                                    top_event_id : top_event.id,
                                                                    going_out : 'No',
                                                                    is_attending : false
                                                                }
                                                                
                                                               
                                                                
                                                            }, function(e) {
                                                                if (e.success) {

                                                                    var goingOut = e.goingOutTonight[0];
                                                                    Ti.App.Properties.setString('goingOutId', goingOut.id);
                                                                    var db = Ti.Database.open('campustap');
                                                                    db.execute("update user_setting set goingoutTonightid=? where id=? ", goingOut.id, Ti.App.Properties.getString('currentUser_id'));
                                                                    db.close();

                                                                    Cloud.Events.update({
                                                                        event_id : event.id,
                                                                        custom_fields : {
                                                                            top_event_custom_id : top_event.id,
                                                                            goingOutTonight_custom_id : goingOut.id,
                                                                            custom_event_id : event.id,
                                                                            top_event_id : top_event.id
                                                                        }

                                                                    }, function(e) {
                                                                        if (e.success) {
                                                                            obj_win.close();
                                                                            //Ti.API.info('Event created successfully');
																			 
                                                                        } else {
                                                                            obj_win.close();

                                                                            //  Ti.API.info('Error Event update:' + ((e.error && e.message) || JSON.stringify(e)));
                                                                        }
                                                                    });
                                                                    Ti.App.Properties.setString("goingOutId", goingOut.id);
                                                                }

                                                            });
                                                        } else {

                                                            Cloud.Objects.update({
                                                                classname : 'goingOutTonight',
                                                                id : Ti.App.Properties.getString("goingOutId"),
                                                                fields : {
                                                                    event_id : event.id,
                                                                    user_id : Ti.App.Properties.getString('currentUser_id'),
                                                                    user_full_name : Ti.App.Properties.getString("user_full_name"),
                                                                    acl_id : event.custom_fields.acls.id,
                                                                    here_clicked_time : here_clicked_time,
                                                                    bar_name : top_event.bar_name,
                                                                    top_event_id : top_event.id,
                                                                    going_out : 'Yes',
                                                                    is_attending : false
                                                                }
                                                            }, function(e) {
                                                                if (e.success) {


                                                                    var goingOut = e.goingOutTonight[0];

                                                                    Cloud.Events.update({
                                                                        event_id : event.id,
                                                                        custom_fields : {
                                                                            top_event_custom_id : top_event.id,
                                                                            goingOutTonight_custom_id : goingOut.id,
                                                                            custom_event_id : event.id
                                                                        }

                                                                    }, function(e) {
                                                                        if (e.success) {
                                                                            obj_win.close();
                                                                            Ti.API.info('Event created successfully');
                                                                      

                                                                        } else {
                                                                            obj_win.close();
                                                                            Ti.API.info('Error:\n' + ((e.error && e.message) || JSON.stringify(e)));
                                                                        }
                                                                    });

                                                                } else {
                                                                    obj_win.close();

                                                                    Ti.API.info('Update custom goingout obj Error:' + ((e.error && e.message) || JSON.stringify(e)));
                                                                }
                                                            });

                                                        }

                                                    } else {
                                                        Ti.API.info('Error:\n' + ((e.error && e.message) || JSON.stringify(e)));
                                                    }
                                                });

                                            } else {
                                                obj_win.close();
                                                Ti.API.info('Error e4:\n' + ((e.error && e.message) || JSON.stringify(e)));
                                                attendingButton.title = "Here";
                                                attendingButton.touchEnabled = true;
                                            }
                                        });

                                    } else {
                                        obj_win.close();
                                        Ti.API.info('Error:\n' + ((e.error && e.message) || JSON.stringify(e)));
                                        attendingButton.title = "Here";
                                        attendingButton.touchEnabled = true;
                                    }
                                });
                            }

                            ////

                        }
                        else {
                            Ti.API.info('Error:\n' + ((e1.error && e1.message) || JSON.stringify(e1)));
                        }
                    });

                    //  return str_user_id;
                }
            } else {
                alert("No one is currently attending an event");
            }
        } catch(ex) {
            alert(ex);
        }

        // END ACLS OBJECT
        Ti.App.Properties.setString("daily_focus", true);

    });

    attendingView.add(attendingButton);

    //END "HERE" BUTTON

    //AREA BUTTONS VIEW (Element #3)

    var scrollView = Ti.UI.createScrollView({
        contentWidth : Ti.UI.FILL, // changed
        contentHeight : Ti.UI.SIZE, // changed
        layout : 'vertical', // new
        showVerticalScrollIndicator : true,
        showHorizontalScrollIndicator : false,
        height : '40%',
        width : Ti.UI.FILL, // changed
        bottom : 0
    });

    daily.add(scrollView);

    //END AREA BUTTONS VIEW (Element #3)

    //AREA BUTTON TOGGLE

    var toggledButton;
    var toggleButton = function(e) {
        if (e.source.isToggled === false) {
            // reset previous button to off
            toggledButton.setBackgroundImage(toggledButton.imageOff);
            toggledButton.setColor(toggledButton.fontOff);
            toggledButton.isToggled = false;
            // set new button to on
            e.source.setBackgroundImage(e.source.imageOn);
            e.source.setColor(e.source.fontOn.color);
            e.source.isToggled = true;

            // cache current button as previous button
            toggledButton = e.source;
        }
        

        attendingButton.touchEnabled = true;
        current_button_filter = e.source.id;

        switch (e.source.id) {

            case 0:

                if (all_data.length > 0) {
                    contentSlider.views = all_data;
                    contentSlider.currentPage = dict[current_button_filter];
                    setTimeout(function(et) {
                        check_user_ACLs_with_id(contentSlider.views[dict[current_button_filter]].filter);

                    }, 500);

                } else {

                    load_bar_Data();

                }
                break;

            case 1:
                if (Loyala_data.length > 0) {
                    contentSlider.views = Loyala_data;

                    /// alert(dict[current_button_filter]);
                    contentSlider.currentPage = dict[current_button_filter];
                    setTimeout(function(et) {
                        check_user_ACLs_with_id(contentSlider.views[dict[current_button_filter]].filter);

                    }, 300);

                } else {

                    Loyala_data = [];
                    load_bars_details(1, Loyala_data);

                }
                break;
            case 2:
                if (Towson_data.length > 0) {
                    contentSlider.views = Towson_data;
                    contentSlider.currentPage = dict[current_button_filter];
                   
                    setTimeout(function(et) {
                        check_user_ACLs_with_id(contentSlider.views[dict[current_button_filter]].filter);

                    }, 300);
                } else {
                    Towson_data = [];
                    load_bars_details(2, Towson_data);

                }
                break;
            case 3:
                if (Johne_Hopkins_data.length > 0) {
                    contentSlider.views = Johne_Hopkins_data;
                    contentSlider.currentPage = dict[current_button_filter];
                    setTimeout(function(et) {
                        check_user_ACLs_with_id(contentSlider.views[dict[current_button_filter]].filter);

                    }, 300);
                } else {
                    Johne_Hopkins_data = [];
                    load_bars_details(3, Johne_Hopkins_data);

                }
                break;
            case 4:
                if (Downtown_data.length > 0) {
                    contentSlider.views = Downtown_data;
                    contentSlider.currentPage = dict[current_button_filter];
                    setTimeout(function(et) {
                        check_user_ACLs_with_id(contentSlider.views[dict[current_button_filter]].filter);

                    }, 300);
                } else {

                    Downtown_data = [];
                    load_bars_details(4, Downtown_data);

                }
                break;
            case 5:
                if (Fells_Points_data.length > 0) {
                    contentSlider.views = Fells_Points_data;
                    contentSlider.currentPage = dict[current_button_filter];
                   setTimeout(function(et) {
                        check_user_ACLs_with_id(contentSlider.views[dict[current_button_filter]].filter);

                    }, 300);
                } else {

                    Fells_Points_data = [];
                    load_bars_details(5, Fells_Points_data);

                }
                break;
            case 6:
                if (Federal_Hill_data.length > 0) {
                    contentSlider.views = Federal_Hill_data;
                    contentSlider.currentPage = dict[current_button_filter];
                   setTimeout(function(et) {
                        check_user_ACLs_with_id(contentSlider.views[dict[current_button_filter]].filter);

                    }, 300);

                } else {
                    Federal_Hill_data = [];
                    load_bars_details(6, Federal_Hill_data);

                }
                break;

        }
        check_user_ACLs();
    };

    //END AREA BUTTON TOGGLE

    //ALL BARS BUTTON
    var allBars = Ti.UI.createButton({
        backgroundImage : '/images/dailySpecials/generalAreaSelected.png',
        imageOff : '/images/dailySpecials/generalArea.png',
        imageOn : '/images/dailySpecials/generalAreaSelected.png',
        fontOff : {
            color : '#fff'
        },
        fontOn : {
            color : '#fff'
        },
        isToggled : true,
        height : 30,
        width : '100%',
        title : 'All',
        font : {
            fontFamily : customFont
        },
        top : 0,
        id : 0
    });

    scrollView.add(allBars);

    //END ALL BARS BUTTON

    //JOHNS HOPKINS BUTTON
    var johnsHopkinsBars = Ti.UI.createButton({
        backgroundImage : '/images/dailySpecials/generalArea.png',
        imageOff : '/images/dailySpecials/generalArea.png',
        imageOn : '/images/dailySpecials/generalAreaSelected.png',
        fontOff : {
            color : '#fff'
        },
        fontOn : {
            color : '#fff'
        },
        isToggled : false,
        height : 30,
        width : '100%',
        title : 'Johns Hopkins',
        font : {
            fontFamily : customFont
        },
        color : '#000',
        top : 0,
        id : 3
    });

    scrollView.add(johnsHopkinsBars);

    //END JOHNS HOPKINS BUTTON

    //LOYOLA BUTTON
    var loyolaBars = Ti.UI.createButton({
        backgroundImage : '/images/dailySpecials/generalArea.png',
        imageOff : '/images/dailySpecials/generalArea.png',
        imageOn : '/images/dailySpecials/generalAreaSelected.png',
        fontOff : {
            color : '#fff'
        },
        fontOn : {
            color : '#fff'
        },
        isToggled : false,
        height : 30,
        width : '100%',
        title : 'Loyola',
        font : {
            fontFamily : customFont
        },
        color : '#000',
        top : 0,
        id : 1
    });

    scrollView.add(loyolaBars);
    //END LOYOLA BUTTON

    //TOWSON BUTTON
    var towsonBars = Ti.UI.createButton({
        backgroundImage : '/images/dailySpecials/generalArea.png',
        imageOff : '/images/dailySpecials/generalArea.png',
        imageOn : '/images/dailySpecials/generalAreaSelected.png',
        fontOff : {
            color : '#fff'
        },
        fontOn : {
            color : '#fff'
        },
        isToggled : false,
        height : 30,
        width : '100%',
        title : 'Towson',
        font : {
            fontFamily : customFont
        },
        color : '#000',
        top : 0,
        id : 2
    });

    scrollView.add(towsonBars);
    //END TOWSON BUTTON

    //DOWNTOWN BUTTON
    var downtownBars = Ti.UI.createButton({
        backgroundImage : '/images/dailySpecials/generalArea.png',
        imageOff : '/images/dailySpecials/generalArea.png',
        imageOn : '/images/dailySpecials/generalAreaSelected.png',
        fontOff : {
            color : '#fff'
        },
        fontOn : {
            color : '#fff'
        },
        isToggled : false,
        height : 30,
        width : '100%',
        title : 'Downtown',
        font : {
            fontFamily : customFont
        },
        color : '#000',
        top : 0,
        id : 4
    });

    scrollView.add(downtownBars);
    //END DOWNTOWN BUTTON

    //FEDERAL HILL BUTTON
    var federalHillBars = Ti.UI.createButton({
        backgroundImage : '/images/dailySpecials/generalArea.png',
        imageOff : '/images/dailySpecials/generalArea.png',
        imageOn : '/images/dailySpecials/generalAreaSelected.png',
        fontOff : {
            color : '#fff'
        },
        fontOn : {
            color : '#fff'
        },
        isToggled : false,
        height : 30,
        width : '100%',
        title : 'Federal Hill',
        font : {
            fontFamily : customFont
        },
        color : '#000',
        top : 0,
        id : 5
    });

    scrollView.add(federalHillBars);
    //FEDERAL HILL BUTTON

    //FELLS POINT BUTTON
    var fellsPointBars = Ti.UI.createButton({
        backgroundImage : '/images/dailySpecials/generalArea.png',
        imageOff : '/images/dailySpecials/generalArea.png',
        imageOn : '/images/dailySpecials/generalAreaSelected.png',
        fontOff : {
            color : '#fff'
        },
        fontOn : {
            color : '#fff'
        },
        isToggled : false,
        height : 30,
        width : '100%',
        title : 'Fells Point',
        font : {
            fontFamily : customFont
        },
        color : '#000',
        top : 0,
        id : 6
    });

    scrollView.add(fellsPointBars);
    //END FELLS POINT BUTTON

    //AREA BUTTONS EVENT LISTENER
    allBars.addEventListener('click', toggleButton);
    loyolaBars.addEventListener('click', toggleButton);
    johnsHopkinsBars.addEventListener('click', toggleButton);
    towsonBars.addEventListener('click', toggleButton);
    downtownBars.addEventListener('click', toggleButton);
    federalHillBars.addEventListener('click', toggleButton);
    fellsPointBars.addEventListener('click', toggleButton);
    //END AREA BUTTONS EVENT LISTENER

    //TOGGLE ALL BARS BUTTON
    toggledButton = allBars;
    // set to on button

    //END TOGGLE ALL BARS BUTTON

    // LOAD BAR DATA
    var load_bar_Data = function(win) {

        all_data = [];
        Loyala_data = [];
        Towson_data = [];
        Johne_Hopkins_data = [];
        Downtown_data = [];
        Federal_Hill_data = [];
        Fells_Points_data = [];
        load_bars_details(all_data, win);

        prev_index = contentSlider.currentPage;

    };
    // END LOAD BAR DATA

    var check_user_ACLs_with_id = function(id) {

        try {

            if (Ti.Network.online) {
             

                Cloud.ACLs.checkUser({
                    name : id + "_" + Ti.App.Properties.getString('currentUser_id'),
                    user_id : Ti.App.Properties.getString('currentUser_id'),

                }, function(e1) {
                    if (e1.success) {
                         attendingButton.backgroundImage = '/images/dailySpecials/yourHereButton.png';
                        attendingButton.title = "Your're Here";
                        attendingButton.touchEnabled = false;
                       

                    } else {
                         attendingButton.backgroundImage = '/images/dailySpecials/attendingButton.png';
                        attendingButton.title = "Here";
                        attendingButton.touchEnabled = true;
                       
                    }
                });
            } else {
                alert("Please check your internet connection");
            }
        } catch(ex) {("ex=" + ex);
        }

    };

    var check_user_ACLs = function() {

        try {

            if (Ti.Network.online) {

                Cloud.ACLs.checkUser({
                    name : contentSlider.views[index].filter + "_" + Ti.App.Properties.getString('currentUser_id'),
                    user_id : Ti.App.Properties.getString('currentUser_id'),

                }, function(e1) {
                    if (e1.success) {

                        attendingButton.title = "Your're Here";
                        attendingButton.touchEnabled = false;
                        attendingButton.backgroundImage = '/images/dailySpecials/yourHereButton.png';

                    } else {
                        attendingButton.title = "Here";
                        attendingButton.touchEnabled = true;
                        attendingButton.backgroundImage = '/images/dailySpecials/attendingButton.png';
                    }
                });
            } else {
                alert("Please check your internet connection");
            }
        } catch(ex) {("ex=" + ex);
        }

    };
    daily.addEventListener("focus", function(e) {

        load_event_list();

        if (Ti.App.Properties.getString("daily_focus") == true) {

            if (all_data.length > 0) {
                contentSlider.views = all_data;
                change_date_wise_bar_description();
                check_user_ACLs();
            } else if (Loyala_data.length > 0 && Towson_data.length > 0 && Johne_Hopkins_data.length > 0 && Downtown_data.length > 0 && Federal_Hill_data.length > 0 && Fells_Points_data.length > 0) {

                contentSlider.views = all_data;
                change_date_wise_bar_description();
                check_user_ACLs();
            }

        } else {
            check_user_ACLs();
        }

    });
    daily.addEventListener("open", function(e) {

        var activityindicator_win = require("activityindicator_win");
        var obj_win = new activityindicator_win();
        obj_win.open();
        load_bar_Data(obj_win);

    });
    daily.addEventListener("blur", function(e) {
        my_timer.stop();
    });
    Ti.App.addEventListener("resume", function(e) {
        Ti.App.fireEvent("set_badge");
        my_timer.stop();

        var offset = -5.0;

        var clientDate = new Date();
        var utc = clientDate.getTime() + (clientDate.getTimezoneOffset() * 60000);
        var serverDate = new Date(utc + (3600000 * offset));
        var dt_utc_hours = serverDate.getHours();
        var dt_utc_minuts = serverDate.getMinutes();
        var dt_utc_seconds = serverDate.getSeconds();
        var dt_utc_day = serverDate.getDay();

        chnage_text_function(dt_utc_hours, dt_utc_minuts, dt_utc_seconds, dt_utc_day);

    });
    
    // Check 5 AM login
    
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
      var event_timeout = function(dd) {

        var offset = -5.0;
        var active_event = false;
        //  parsing event-iso-8601-date-string-to-est-date-time
        var datestring = dd;

        var c = datestring.split("+");
        var datestring = c[0] + ".0Z";

        var event_create_date = new Date(parseISO8601(datestring));
        ///

        var new_date = new Date();
        var localOffset = (new_date.getTimezoneOffset() * 60000);

        var fooUTC = (event_create_date.getTime() + localOffset);

        var EAST = (3600000 * offset);
        event_create_date = new Date(fooUTC + EAST);

        ///

        var current_event_year = event_create_date.getFullYear();
        var current_event_month = event_create_date.getMonth();
        current_event_month += 1;
        var current_event_day = event_create_date.getDate();
        var current_event_hours = event_create_date.getHours();

        var hh_12_formate = current_event_hours - 12;
        current_event_hours = ((current_event_hours - 12) > -1) ? hh_12_formate : current_event_hours;
        var current_event_minutes = event_create_date.getMinutes();
        var current_event_seconds = event_create_date.getSeconds();

        //  parsing event-iso-8601-date-string-to-est-date-time

        //  parsing current-date-string-to-est-date-time
        var event_Date = new Date();

        var utc = event_Date.getTime() + (event_Date.getTimezoneOffset() * 60000);
        var current_date = new Date(utc + (3600000 * offset));

        var current_date_year = current_date.getFullYear();
        var current_date_mounth = current_date.getMonth();
        var current_date_day = current_date.getDate();
        var current_date_hours = current_date.getHours();
        var current_date_minutes = current_date.getMinutes();
        var current_date_seconds = current_date.getSeconds();
       // var current_utc_date = new Date(current_date_year, current_date_mounth, current_date_day, current_date_hours, current_date_minutes, current_date_seconds);

        //new changes

        var hh_12_formate_current_date = current_date_hours - 12;
        current_date_hours = ((current_date_hours - 12) > -1) ? hh_12_formate_current_date : current_date_hours;

        ///

        Ti.API.info("Event_created_est="+event_create_date+"||" +"Local_est="+current_date);

        if (current_date_day == current_event_day) {

            if (current_event_hours < 4 && current_event_hours >= 0) {

                if (current_date_hours < 4) {
                    active_event = true;
                } else if (current_date_hours == 3 && current_date_minutes > 55) {
                    active_event = false;
                } else if (current_date_hours > 4 || current_date_hours == 4) {
                    active_event = false;
                }

            } else if (current_event_hours == 3 && current_date_minutes > 55) {

                if (current_date_hours < 4) {
                    active_event = true;
                } else if (current_date_hours == 3 && current_date_minutes > 55) {
                    active_event = false;
                } else if ((current_date_hours == 4) && current_date_minutes <= 60) {
                    active_event = false;
                } else if (current_date_hours > 4) {
                    active_event = true;
                }
            } else if (current_event_hours > 4 || current_event_hours == 4) {

                if (current_date_hours < 4) {
                    active_event = true;
                } else if (current_date_hours == 3 && current_date_minutes > 55) {
                    active_event = false;
                } else if ((current_date_hours == 4) && current_date_minutes <= 60) {

                    active_event = true;
                } else if (current_date_hours > 4) {
                    active_event = true;
                }
            } else if (current_event_hours == 0) {
                active_event = true;
            }

        } else if (current_date_day > current_event_day) {
            
            if (current_event_hours < 4) {
                if (current_date_hours < 4) {
                    active_event = true;
                } else if (current_date_hours == 3 && current_date_minutes > 55) {
                    active_event = false;
                } else if (current_date_hours > 4 || current_date_hours == 4) {
                    active_event = false;
                }

            } else if (current_event_hours == 4 || current_event_hours > 4) {
                if (current_date_hours < 4) {
                    active_event = true;
                } else if (current_date_hours == 3 && current_date_minutes > 55) {
                    active_event = false;
                } else if (current_date_hours > 4 || current_date_hours == 4) {
                    active_event = false;
                }
            }
        }

        Ti.API.info("active_event=" + JSON.stringify(active_event));

        return active_event;

    };
    
     var load_event_list = function(win) {
        try {

            if (Ti.Network.online) {

                var offset = -5.0;
                var current_date = new Date();

                var utc = current_date.getTime() + (current_date.getTimezoneOffset() * 60000);
                var event_Date = new Date(utc + (3600000 * offset));

                var current_utc_date = new Date(event_Date.getFullYear(), event_Date.getMonth(), event_Date.getDate(), event_Date.getHours(), event_Date.getMinutes(), event_Date.getSeconds(), event_Date.getMilliseconds());
                var previous_day_date = new Date(event_Date.getFullYear(), event_Date.getMonth(), (event_Date.getDate() - 1), event_Date.getHours(), event_Date.getMinutes(), event_Date.getSeconds(), event_Date.getMilliseconds());
                var next_day_date = new Date(current_utc_date.getFullYear(), current_utc_date.getMonth(), (current_utc_date.getDate() + 1), current_utc_date.getHours(), current_utc_date.getMinutes(), current_utc_date.getSeconds(), current_utc_date.getMilliseconds());

                var cd = previous_day_date.toISOString().split(".");

                previous_day_date = cd[0] + "+0000";

                Cloud.Events.queryOccurrences({
                    where : {
                        "start_time" : {
                            $gte : previous_day_date
                        }

                    }

                }, function(e) {

                    if (e.success) {
                        
                     
                            var default_rows = e.event_occurrences.length;

                            for (var i = 0; i < default_rows; i++) {

                                var event = e.event_occurrences[i].event;

                                if (event_timeout(event.created_at) == true) {

                                    // NO NEED TO CHECK 5AM LOGIC
                                    Ti.API.info("NO need to check 5 AM logic");

                                } else {

                                    var event = e.event_occurrences[i].event;

                                    //// REMOVE EVENTS

                                    if (event && event != null && (event.custom_fields.user_id == Ti.App.Properties.getString('currentUser_id'))) {

                                        Cloud.Objects.query({
                                            classname : 'goingOutTonight',
                                            where : {
                                                event_id : event.id
                                            }
                                        }, function(e) {
                                            if (e.success) {

                                                if (e.goingOutTonight.length > 0) {
                                                    for (var i = 0; i < e.goingOutTonight.length; i++) {

                                                        var goingOutTonight = e.goingOutTonight[i];

                                                        var event_id = goingOutTonight.event_id;
                                                        var top_event_id = goingOutTonight.top_event_id;
                                                        var acl_id = goingOutTonight.acl_id;
                                                        var bar_name = goingOutTonight.bar_name;

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
                                                                    Ti.API.info('Success goingOutTonight remove');

                                                                    Cloud.ACLs.show({
                                                                        name : bar_name + "_" + Ti.App.Properties.getString('currentUser_id'),
                                                                    }, function(e) {
                                                                        if (e.success) {
                                                                            Cloud.ACLs.remove({
                                                                                name : bar_name + "_" + Ti.App.Properties.getString('currentUser_id'),
                                                                            }, function(e) {
                                                                                if (e.success) {
                                                                                    Ti.API.info('Cloud.ACLs remove');
                                                                                    Cloud.Objects.remove({
                                                                                        classname : 'topEvents',
                                                                                        id : top_event_id
                                                                                    }, function(e) {
                                                                                        if (e.success) {
                                                                                            if (Ti.App.Properties.getString('currentUser_id') == event.user.id) {
                                                                                                Cloud.Events.remove({
                                                                                                    event_id : event_id,
                                                                                                    user_id : Ti.App.Properties.getString('currentUser_id')
                                                                                                }, function(e) {
                                                                                                    if (e.success) {
                                                                                                        Ti.API.info(' Cloud.Events.remove');
                                                                                                    } else {
                                                                                                        if (win && win != null) {
                                                                                                            //win.close();
                                                                                                        }
                                                                                                        Ti.API.info('Error:\n' + ((e.error && e.message) || JSON.stringify(e)));
                                                                                                    }
                                                                                                });
                                                                                            }
                                                                                        } else {
                                                                                            Ti.API.info('Error:\n' + ((e.error && e.message) || JSON.stringify(e)));
                                                                                        }
                                                                                    });

                                                                                }
                                                                            });
                                                                        }
                                                                    });

                                                                } else {

                                                                    if (win && win != null) {
                                                                        win.close();
                                                                    }
                                                                    Ti.API.info('Cloud.Objects.remove Error:\n' + ((e.error && e.message) || JSON.stringify(e)));
                                                                }
                                                            });

                                                        }

                                                    }
                                                } 

                                            } else {
                                                
                                                Ti.API.info('Error:\n' + ((e.error && e.message) || JSON.stringify(e)));
                                            }
                                        });

                                    }
                                    
                                    //// END REMOVE EVENTS
                                }

                            }

                        

                    } else {
                        
                        Ti.API.info('Event:\n' + ((e.error && e.message) || JSON.stringify(e)));
                    }

                });

            } 
        } catch(ex) {
            alert(ex);
        }

    };

    
    // Check 5 AM login

    return daily;
};

module.exports = dailySpecials;
