function events(args) {
	var Cloud = require('ti.cloud');
	var activityindicator_win = require("activityindicator_win");
	var obj_win = new activityindicator_win();
	var customFont = 'HouschkaAlt';
	var top_event_data = [];
	var search_friend_data = [];
	var friend_details_array = [];
	var arr_bar_name = [];
	var tmp_arr = [];
	var arr_friend_details = [];
	var arr_data = [];
	var photo_url = "/images/profilePlaceholder.png";
	search_friend_data = [{
		title : "None of your friends are currently attending events",
		font : {
			fontFamily : customFont,
			fontSize : 12,
			fontWeight : 'bold'
		}
	}];

	var events = Ti.UI.createWindow({
		barColor : '#3b5e34',
		backgroundColor : '#fff',
		translucent : false
	});
	var tabbedBar = Ti.UI.iOS.createTabbedBar({
		labels : ['Friends', 'Top Events'],
		backgroundColor : '#fff',
		style : Titanium.UI.iPhone.SystemButtonStyle.BAR,
		index : 0
	});
	events.setTitleControl(tabbedBar);

	//END REFRESH BUTTON FOR RELOAD DATA
	var refresh = Titanium.UI.createButton({

	});
	refresh.systemButton = Titanium.UI.iPhone.SystemButton.REFRESH;
	events.leftNavButton = refresh;

	refresh.addEventListener('click', function() {

		try {

			refresh.enabled = false;

			top_event_data = [];
			topEventsFeed.setData(top_event_data);
			friendsFeed.setData(search_friend_data);

			if (tabbedBar.index == 0) {
				search_friend_data = [];
				search_friend_data = [{
					title : "None of your friends are currently attending events",
					font : {
						fontFamily : customFont,
						fontSize : 12,
						fontWeight : 'bold'
					}
				}];
				friendsFeed.setData(search_friend_data);
				load_friends_list(null);

			} else {

				total_events = 0;
				total_events_array = [];
				top_event_data = [];
				top_event_data = [{
					title : "No one is currently attending an event",

					font : {
						fontFamily : customFont,
						fontSize : 12,
						fontWeight : 'bold'
					}
				}];

				topEventsFeed.setData(top_event_data);

				load_event_list(null);
			}

		} catch(ex) {
			refresh.enabled = true;

		}

	});

	//END REFRESH BUTTON FOR RELOAD DATA

	var friendsFeed = Ti.UI.createTableView({
		top : 0,
		height : '100%',
		width : '100%',
		id : 0,
		data : [],
		footerTitle : "",
		minRowHeight : 50

	});

	var topEventsFeed = Ti.UI.createTableView({
		top : 0,
		height : '100%',
		width : '100%',
		id : 1,
		data : [],
		footerTitle : "",
		minRowHeight : 50
	});

	events.add(topEventsFeed);
	events.add(friendsFeed);

	// SEARCH FRIEND SECTION
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

	var event_time_calculation = function(date) {

		var offset = -5.0;
		//  parsing event-iso-8601-date-string-to-est-date-time
		var datestring = date;
		var c = datestring.split("+");
		var datestring = c[0] + ".0Z";
		var d = new Date(parseISO8601(datestring));
		var server_utc = d.getTime() + (d.getTimezoneOffset() * 60000);
		var event_create_date = new Date(server_utc + (3600000 * offset));

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

		var clientDate = new Date();
		var event_time = null;

		var utc = clientDate.getTime() + (clientDate.getTimezoneOffset() * 60000);
		var current_date = new Date(utc + (3600000 * offset));

		var current_date_year = current_date.getFullYear();
		var current_date_mounth = current_date.getMonth();
		var current_date_day = current_date.getDate();
		var current_date_hours = current_date.getHours();
		if (current_date_hours >= 12) {
			current_date_hours = (current_date_hours - 12);
		}

		var current_date_minutes = current_date.getMinutes();
		var current_date_seconds = current_date.getSeconds();

		//  parsing current-date-string-to-est-date-time

		if (current_date_year > current_event_year) {

			var diff_year = (current_date_year - current_event_year);
			if (diff_year && diff_year > 0) {
				if (diff_year > 1) {
					event_time = diff_year + " " + "years ago.";
				} else {
					event_time = diff_year + " " + "year ago.";
				}
			}

		} else if (current_date_year == current_event_year) {

			if ((current_date_mounth + 1) == current_event_month) {

				if (current_date_day == current_event_day) {

					if (current_date_hours == current_event_hours) {

						if (current_date_minutes <= current_event_minutes) {
							event_time = "1" + " " + "minute ago.";

						} else if (current_date_minutes > current_event_minutes) {
							var diff_min = (current_date_minutes - current_event_minutes);
							if (diff_min && diff_min > 1) {
								event_time = diff_min + " " + "minutes ago.";
							} else {
								event_time = diff_min + " " + "minute ago.";

							}
						}
					} else if (current_date_hours > current_event_hours) {

						var diff_hour = current_date_hours - current_event_hours;
						var diff_min = (current_date_minutes - current_event_minutes);
						event_time = ((diff_hour * 60) + diff_min);

						if (event_time < 60) {
							event_time = event_time + " " + "minutes ago.";
						} else if (Math.round(event_time / 60) == 1) {

							event_time = diff_hour + " " + "hour ago.";
						} else {
							event_time = diff_hour + " " + "hours ago.";
						}

					}

				} else if (current_date_day > current_event_day) {

					var diff_day = (current_date_day - current_event_day);
					if (diff_day && diff_day > 1) {
						event_time = diff_day + " " + "days ago.";
					} else {
						event_time = diff_day + " " + "day ago.";
					}

				}

			} else if ((current_date_mounth + 1) > current_event_minutes) {

				var diff_month = ((current_date_mounth + 1) - current_event_minutes);
				event_time = diff_month + " " + "month ago.";

			} else {
				//Ti.API.info("what happamns");
			}
		}

		return event_time;

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

		// Ti.API.info("Event_created_est="+event_create_date+"||" +"Local_est="+current_date);

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

		// Ti.API.info("active_event=" + JSON.stringify(active_event));

		return active_event;

	};

	var get_user_photo = function(user, call_back) {

		var id = user.user_id;
		var user_full_name = user.user_full_name;
		var bar_name = user.bar_name;
		var created_at = user.created_at;

		var photo_url = null;
		Cloud.Photos.search({
			user_id : id
		}, function(e) {
			if (e.success) {

				if (e.photos.length > 0) {
					var photo = e.photos[0];
					photo_url = photo.urls.square_75;

				} else {
					photo_url = "/images/profilePlaceholder.png";
				}
			} else {
				photo_url = "/images/profilePlaceholder.png";

			}
			call_back(user);
		});

	};

	function comp(a, b) {

		var offset = -5.0;

		var datestring_a = a.event_start_time;
		var c_a = datestring_a.split("+");
		var datestring_a = c_a[0] + ".0Z";
		var d_a = new Date(parseISO8601(datestring_a));
		var server_utc_a = d_a.getTime() + (d_a.getTimezoneOffset() * 60000);
		var event_create_date_a = new Date(server_utc_a + (3600000 * offset));

		var datestring_b = b.event_start_time;
		var c_b = datestring_b.split("+");
		var datestring_b = c_b[0] + ".0Z";
		var d_b = new Date(parseISO8601(datestring_b));
		var server_utc_b = d_b.getTime() + (d_b.getTimezoneOffset() * 60000);
		var event_create_date_b = new Date(server_utc_b + (3600000 * offset));

		Ti.API.info("a=" + new Date(event_create_date_a).getTime());
		Ti.API.info("b=" + new Date(event_create_date_b).getTime());

		return new Date(event_create_date_a).getTime() - new Date(event_create_date_b).getTime();

	}

	function compdate(a, b) {

		var offset = -5.0;

		var datestring_a = a.event_start_time;
		var c_a = datestring_a.split("+");
		var datestring_a = c_a[0] + ".0Z";
		var d_a = new Date(parseISO8601(datestring_a));
		var server_utc_a = d_a.getTime() + (d_a.getTimezoneOffset() * 60000);
		var event_create_date_a = new Date(server_utc_a + (3600000 * offset));

		var datestring_b = b.event_start_time;
		var c_b = datestring_b.split("+");
		var datestring_b = c_b[0] + ".0Z";
		var d_b = new Date(parseISO8601(datestring_b));
		var server_utc_b = d_b.getTime() + (d_b.getTimezoneOffset() * 60000);
		var event_create_date_b = new Date(server_utc_b + (3600000 * offset));

		

		return new Date(event_create_date_a).getTime() < new Date(event_create_date_b).getTime();

	}


	var arr_data = [];
	var load_friends_photo = function(user) {

		Ti.API.info("IN SIDE load_friends_photo");

		Cloud.Photos.search({
			user_id : user.user_id
		}, function(e) {
			if (e.success) {

				if (e.photos.length > 0) {
					var photo = e.photos[0];
					photo_url = photo.urls.square_75;

				} else {
					photo_url = "/images/profilePlaceholder.png";
				}

				var dataSet = {

					user_id : user.user_id,
					photo_url : photo_url,
					user_full_name : user.user_full_name,
					event_name : user.bar_name,
					event_start_time : user.created_at,
					user_event : event_time_calculation(user.created_at)

				};
				var data_tmp=[];
				search_friend_data=[];
				friendsFeed.setData(data_tmp);

				arr_data.push(dataSet);
				arr_data.sort(compdate);
				
				Ti.API.info("Length after sort="+arr_data.length);
				
			
				
					
					if (arr_data.length > 0) {

					//alert("helll");
					/*var j = (arr_data.length-1);
					if(j<0){
						
						j=0;
					}*/
					
					
					
					
					for( var k=0; k<arr_data.length;k++){
						
						
						Ti.API.info("J="+k +"||"+JSON.stringify(arr_data[k]));
						
						var row = Titanium.UI.createTableViewRow({
						//event_start_time : event_start_time
					});

					var user_image_view = Titanium.UI.createImageView({
						defaultImage : '/images/profilePlaceholder.png',
						image : arr_data[k].photo_url,
						width : 40,
						height : 40,
						left : 5,
						layout : "horizontal"
					});
					var container_view = Ti.UI.createView({
						top : 0,
						width : 270,
						left : 45,
						height : 50,
						layout : "vertical"
					});
					row.add(user_image_view);
					row.add(container_view);

					var user_text = arr_data[k].user_full_name + " " + "is attending" + " " + arr_data[k].event_name + ".";

					var lbl_user_text = Ti.UI.createLabel({
						left : 5,
						top : 2,
						height : 30,
						width : 260,
						text : user_text,
						color : "black",
						font : {
							fontFamily : customFont,
							fontSize : 12,
							fontWeight : 'bold'
						}
					});
					var lbl_user_event_text = Ti.UI.createLabel({
						left : 5,
						top : 0,
						height : 15,
						width : 265,
						text : arr_data[k].user_event,
						color : "#E75480",
						font : {
							fontFamily : customFont,
							fontSize : 12,
							fontWeight : 'normal'
						}
					});
					container_view.add(lbl_user_text);
					container_view.add(lbl_user_event_text);

					search_friend_data.push(row);
						
						
						
						
					}
					

					//friendsFeed.appendRow(row);
					
					//friendsFeed.getData().reverse();

					//alert("friendsFeed.data=" +JSON.stringify(friendsFeed.data[0]));

					friendsFeed.setData(search_friend_data);

				} else {

					Ti.API.info("NO need to check");
				}
					
					
					
				
				
				
				
				

			}

		});

	};

	//TODAY

	var load_friends_list = function(win) {

		try {
			if (Ti.Network.online) {
				var arr = [];
				arr_friend_details = [];
				arr_data = [];
				friendsFeed.data = [];
				Cloud.Friends.search({
					user_id : Ti.App.Properties.getString("currentUser_id")
				}, function(e) {
					if (e.success) {
						if (e.users.length > 0) {

							tmp_arr = [];
							for (var j = 0; j < e.users.length; j++) {
								var user = e.users[j];
								arr.push(user.id);
								Cloud.Objects.query({
									classname : 'goingOutTonight',
									where : {
										user_id : user.id

									},
								}, function(e) {
									if (e.success) {

										if (e.goingOutTonight.length == 0) {
										} else {

											for (var i = 0; i < e.goingOutTonight.length; i++) {
												var goingOutTonight = e.goingOutTonight[i];

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

													},
													"order" : "make,-id"

												}, function(e) {

													if (e.success) {

														if (e.event_occurrences.length > 0) {
															search_friend_data = [];
															arr_bar_name = [];
															for (var i = 0; i < e.event_occurrences.length; i++) {
																var event = e.event_occurrences[i].event;

																if ((event.custom_fields.goingOutTonight_custom_id == goingOutTonight.id)) {

																	if (event_timeout(event.created_at) == true) {

																		var user_id = goingOutTonight.user_id;
																		var user_full_name = goingOutTonight.user_full_name;
																		if (goingOutTonight.event_id != 0) {

																			Ti.API.info(i + "=" + JSON.stringify(user));

																			var user = {
																				user_id : user_id,
																				user_full_name : user_full_name,
																				bar_name : goingOutTonight.bar_name,
																				created_at : goingOutTonight.updated_at

																			};

																			load_friends_photo(user);

																		}

																		Ti.API.info("**************FINAL --4***************");

																	} else {
																		//Ti.API.info("Timer out");
																		if (win && win != null) {

																			win.close();
																		}
																	}

																} else {
																	// alert("sf");
																}

															}

															refresh.enabled = true;

															Ti.API.info("**************FINAL --1 ***************");

														} else {
															search_friend_data = [];
															search_friend_data = [{
																title : "None of your friends are currently attending events",
																font : {
																	fontFamily : customFont,
																	fontSize : 12,
																	fontWeight : 'bold'
																}
															}];
															friendsFeed.setData(search_friend_data);
															refresh.enabled = true;

														}

														//

													} else {
														if (win && win != null) {

															win.close();
														}
													}

												});

											}

											Ti.API.info("**************FINAL --2 ***************");

										}
									}

								});

							}
							Ti.API.info("**************FINAL --3 ***************");
						} else {
							refresh.enabled = true;

							return;
						}

					} else {

						Ti.API.info('Error:\n' + ((e.error && e.message) || JSON.stringify(e)));
					}
				});

			} else {

				alert("No one is currently attending an event");
			}

		} catch(ex) {
			Ti.API.info(ex);
		}

	};

	//END SEARCH FRIEND SECTION

	// TOP EVENT SECTION
	//var create_event_row = function(image, event_num_occurrences, event_name) {

	//FIRST WAY

	var create_event_row_data = function(image, event_num_occurrences, event_name) {

		var row = Titanium.UI.createTableViewRow({
			layout : "horizontal"
		});

		var user_image_view = Titanium.UI.createImageView({
			defaultImage : '/images/profilePlaceholder.png',
			image : encodeURI(image),
			top : 5,
			width : 40,
			height : 40,
			left : 5,
			layout : "horizontal"
		});
		row.add(user_image_view);

		var event_text = null;
		if (event_num_occurrences == 1) {

			event_text = event_num_occurrences + " " + "person attending" + " " + event_name;
		} else {
			event_text = event_num_occurrences + " " + "people attending" + " " + event_name;
		}

		var lbl_event_text = Ti.UI.createLabel({
			left : 10,
			top : 5,
			height : 20,
			text : event_text,
			color : "black",
			font : {
				fontFamily : customFont,
				fontSize : 12,
				fontWeight : 'bold'
			}
		});

		row.add(lbl_event_text);

		top_event_data.push(row);

		//top_event_data = top_event_data.reverse();
		topEventsFeed.setData(top_event_data);

		//Ti.API.info("create_event_row");
		Ti.API.info("Second =" + event_name);

	};

	var create_event_row = function(data) {

		var image = "/image/profilePlaceholder.png";
		var bar_name = "";
		var counter = 0;

		while (data[counter]) {

			Ti.API.info("counter=" + counter + "||" + data[counter].name);

			if (tmp_arr.indexOf(data[counter].name) == -1) {

				tmp_arr.push(data[counter].name);

				//alert("if=" +tmp_arr);

				Ti.API.info("Zero =" + counter + "||" + data[counter].name);

				Cloud.Objects.query({
					classname : 'topEvents',
					where : {
						bar_name : data[counter].name
					}

				}, function(e) {
					if (e.success) {

						Ti.API.info(JSON.stringify(e.topEvents));

						if (e.topEvents.length > 0) {

							var top_event = e.topEvents[0];
							Ti.API.info("First");
							create_event_row_data(top_event.bar_image, e.topEvents.length, top_event.bar_name);
							Ti.API.info("Third");

							/////
							refresh.enabled = true;

						}

					} else {
						Ti.API.info('Error:\n' + ((e.error && e.message) || JSON.stringify(e)));
					}
				});

				counter++;
			} else {

				Ti.API.info("else=" + tmp_arr);
				break;

			}
		}

	};

	// SECOND WAY

	/*	var create_event_row = function(image, event_num_occurrences, event_name) {

	 var image = "/image/profilePlaceholder.png";

	 Cloud.Objects.query({
	 classname : 'topEvents',
	 where : {
	 bar_name : bar_name // event.custom_fields.bar_name
	 }
	 //"order" : name
	 // "order": "-id"
	 //"order": "make,-id"

	 }, function(e) {
	 if (e.success) {

	 if (e.topEvents.length > 0) {

	 var top_event = e.topEvents[0];
	 Ti.API.info("First");
	 create_event_row_data(top_event.bar_image, e.topEvents.length, top_event.bar_name);
	 Ti.API.info("Third");

	 for (var i = 0; i < e.topEvents.length; i++) {

	 var top_event = e.topEvents[i];

	 if (top_event.bar_name == bar_name) {
	 var counter = e.topEvents.length;

	 var image = top_event.bar_image;
	 var event_num_occurrences = counter;
	 var event_name = top_event.bar_name;

	 if (win && win != null) {
	 // win.close();
	 }

	 } else {

	 alert("?");
	 }

	 }////

	 /////
	 refresh.enabled = true;

	 }

	 } else {
	 Ti.API.info('Error:\n' + ((e.error && e.message) || JSON.stringify(e)));
	 }
	 });

	 };

	 var load_event_details = function(event, win) {

	 //Ti.API.info("load_event_details");

	 var image = "/image/profilePlaceholder.png";
	 var id = (event.user) ? (event.user.id) : null;

	 Cloud.Objects.query({
	 classname : 'topEvents',
	 where : {
	 bar_name : event.name // event.custom_fields.bar_name
	 },
	 "order" : event.name
	 // "order": "-id"
	 //"order": "make,-id"

	 }, function(e) {
	 if (e.success) {

	 alert("e.topEvents.length="+e.topEvents.length);

	 //Ti.API.info("e.topEvents =" +JSON.stringify(e.topEvents));

	 if (e.topEvents.length > 0) {

	 for (var i = 0; i < e.topEvents.length; i++) {

	 var top_event = e.topEvents[i];

	 if (top_event.bar_name == event.name) {
	 var counter = e.topEvents.length;

	 // Ti.API.info("top_event.bar_name="+ event.name +"||" +JSON.stringify(top_event.bar_name));

	 create_event_row_data(top_event.bar_image, counter, top_event.bar_name);

	 } else {

	 alert("?");
	 }

	 }

	 /////
	 refresh.enabled = true;

	 }

	 } else {
	 Ti.API.info('Error:\n' + ((e.error && e.message) || JSON.stringify(e)));
	 }
	 });

	 };*/

	var load_event_list = function(win, call_back) {
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

					},
					// "order":"id, created_at"
					"order" : "make,-id"

				}, function(e) {

					if (e.success) {

						friend_details_array = [];

						if (e.event_occurrences.length == 0) {
							top_event_data = [];
							top_event_data = [{
								title : "No one is currently attending an event",

								font : {
									fontFamily : customFont,
									fontSize : 12,
									fontWeight : 'bold'
								}
							}];

							topEventsFeed.setData(top_event_data);

							if (win && win != null) {
								win.close();
							}
							refresh.enabled = true;

						} else {
							top_event_data = [];
							arr_bar_name = [];
							tmp_arr = [];
							var default_rows = e.event_occurrences.length;

							for (var i = 0; i < default_rows; i++) {

								var event = e.event_occurrences[i].event;

								if (event_timeout(event.created_at) == true) {

									if (event && event != null) {

										arr_bar_name.push(event);

										//load_event_details(event);

									}

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
												} else {
													refresh.enabled = true;
													top_event_data = [];
													top_event_data = [{
														title : "No one is currently attending an event",

														font : {
															fontFamily : customFont,
															fontSize : 12,
															fontWeight : 'bold'
														}
													}];

													topEventsFeed.setData(top_event_data);

												}

											} else {
												if (win && win != null) {
													win.close();
												}
												Ti.API.info('Error:\n' + ((e.error && e.message) || JSON.stringify(e)));
											}
										});

									}
									if (win && win != null) {
										win.close();
									}

									//// END REMOVE EVENTS
								}

							}// END FOR LOOP

							// CREATE EVENT ROW CODE
							Ti.API.info("arr_bar_name=" + JSON.stringify(arr_bar_name));

							if (arr_bar_name.length > 0) {

								///

								create_event_row(arr_bar_name);

							}

							// END CREATE EVENT ROW CODE

						}

					} else {

						if (win && win != null) {
							win.close();
						}
						Ti.API.info('Event:\n' + ((e.error && e.message) || JSON.stringify(e)));
					}

				});

			} else {

				top_event_data = [];
				top_event_data = [{
					title : "No one is currently attending an event"
				}];
				topEventsFeed.setData(top_event_data);
				refresh.enabled = true;

			}
		} catch(ex) {
			alert(ex);
		}

	};

	// END TOP EVENT SECTION

	tabbedBar.addEventListener('click', function(e) {
		obj_win.open();
		switch(e.index) {
			case 0:
				events.animate({
					view : friendsFeed,
					transition : Ti.UI.iPhone.AnimationStyle.FLIP_FROM_RIGHT
				});
				search_friend_data = [];
				search_friend_data = [{
					title : "None of your friends are currently attending events",
					font : {
						fontFamily : customFont,
						fontSize : 12,
						fontWeight : 'bold'
					}
				}];

				friendsFeed.setData(search_friend_data);
				load_friends_list(null);
				break;

			case 1:

				events.animate({
					view : topEventsFeed,
					transition : Ti.UI.iPhone.AnimationStyle.FLIP_FROM_LEFT,

				});
				top_event_data = [];

				topEventsFeed.setData(top_event_data);

				load_event_list(null);

				break;
		}
		obj_win.close();
	});
	events.addEventListener("focus", function(e) {
		refresh.enabled = true;
	});

	events.addEventListener("open", function(e) {
		friendsFeed.setData(search_friend_data);
		var act_ind_win = null;
		// default null value
		load_friends_list(act_ind_win);

	});

	return events;
};
module.exports = events;
