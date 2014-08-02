//WINDOW SETTINGS
function bars() {

    var all_data = [];
    var Johne_Hopkins_data = [];
    var Loyala_data = [];
    var Towson_data = [];
    var Downtown_data = [];
    var Federal_Hill_data = [];
    var Fells_Points_data = [];
    var customFont = 'HouschkaAlt';
    var data = [];
    var main_Data = [];
    var json = null;
    var region_id = 0;
    var last_selected_region_id = 0;

    var win = Ti.UI.createWindow({
        barColor : '#3d6430',
        titleImage : 'tap.png',
        translucent : false

    });

    //END WINDOW SETTINGS

    // This requires the detail window that you will
    // open each time a row is clicked.
    Detail = require('barDetail');

    //BAR TABLE VIEW
    // new code for pull to refresh

    var barList = Titanium.UI.createTableView({
        height : Ti.UI.FILL,
        width : Ti.UI.FILL,
        top : 0,
        left : 0,
        footerTitle : ""
    });
    win.add(barList);
    //END BAR TABLE VIEW

    // PICKER CUSTOM VIEW

    var bnt_bar_selection = Ti.UI.createLabel({
        top : 0,
        right : 10,
        //width : 63,
        // height : 45,
        color : "white",
        text : "Filter",
        font : {
            fontSize : 15,
            fontWeight : 'bold',
            fontFamily : customFont
        }
        //backgroundImage : "/images/settingsIconNEW.png"
    });

    win.rightNavButton = bnt_bar_selection;

    var picker_win = Ti.UI.createWindow({
        top : 0,
        left : 0,
        right : 0,
        bottom : 0,
        backgroundColor : "transparent",

    });
    var view = Ti.UI.createView({
        zIndex : 999,
        top : 0,
        bottom : 0,
        backgroundColor : "black",
        opacity : 0.9
    });

    bnt_bar_selection.addEventListener("click", function(e) {

        picker_win.open({
            bottom : 0,
            duration : 500
        });
        var btn_done = Ti.UI.createLabel({
            top : 20,
            left : 10,
            text : "Done",
            width : 70,
            height : 30,
            textAlign : "center",
            color : "white",
            font : {
                fontSize : 15,
                fontWeight : 'bold',
                fontFamily : customFont
            }
        });
        var btn_cancel = Ti.UI.createLabel({
            right : 10,
            top : 20,
            text : "Cancel",
            width : 70,
            height : 30,
            textAlign : "center",
            color : "white",
            font : {
                fontFamily : customFont,
                fontSize : 15,
                fontWeight : 'bold'
            }

        });

        btn_done.addEventListener("click", function(e) {

            data = [];
            lastRow = 0;
            barList.setData(data);
            picker_win.close({
                bottom : -(Ti.Platform.displayCaps.platformHeight),
                duration : 500
            });

            switch(region_id) {
                case 0:
                    set_bar_data(all_data);
                    break;
                case 1:
                    set_bar_data(Loyala_data);
                    break;
                case 2:
                    set_bar_data(Towson_data);
                    break;
                case 3:
                    set_bar_data(Johne_Hopkins_data);
                    break;
                case 4:
                    set_bar_data(Downtown_data);
                    break;
                case 5:
                    set_bar_data(Fells_Points_data);
                    break;
                case 6:
                    set_bar_data(Federal_Hill_data);
                    break;

            };

        });
        btn_cancel.addEventListener("click", function(e) {

            picker_win.close({
                bottom : -(Ti.Platform.displayCaps.platformHeight),
                duration : 500
            });

        });

        view.add(btn_done);
        view.add(btn_cancel);

        var picker = Ti.UI.createPicker({

        });

        var selection_data = [];

        selection_data[0] = Ti.UI.createPickerRow({
            title : 'All',
            id : 0

        });
        selection_data[1] = Ti.UI.createPickerRow({
            title : 'Johns Hopkins',
            id : 3

        });
        selection_data[2] = Ti.UI.createPickerRow({
            title : 'Loyola',
            id : 1

        });
        selection_data[3] = Ti.UI.createPickerRow({
            title : 'Towson',
            id : 2

        });
        selection_data[4] = Ti.UI.createPickerRow({
            title : 'Downtown',
            id : 4

        });
        selection_data[5] = Ti.UI.createPickerRow({
            title : 'Federal Hill',
            id : 6

        });
        selection_data[6] = Ti.UI.createPickerRow({
            title : 'Fells Point',
            id : 5
        });

        picker.add(selection_data);
        picker.selectionIndicator = true;

        picker.setSelectedRow(0, last_selected_region_id, true);
        picker.addEventListener("change", function(e) {
            region_id = e.row.id;
            last_selected_region_id = e.rowIndex;

        });
        view.add(picker);
        picker_win.add(view);

    });

    // END PICKER CUSTOM VIEW

    //BAR ROW CLICK EVENT LISTENER
    barList.addEventListener('click', function(e) {
        var detail = new Detail(e.rowData.data);
        win.tab.open(detail, {
            animated : true
        });
    });

    //END BAR ROW CLICK EVENT LISTENER

    // LOAD BAR AS PER REGION

    var create_bar_row = function(region_id, json, local_counter) {

        for (var i = 0; i < json.length; i++) {
            var row = Titanium.UI.createTableViewRow({
                className : 'bar-row',
                data : json[i].bar, // pass everything because you also use name later on
                hasChild : true,
                filter : json[i].bar.name
            });

            //BAR NAME
            var titleLabel = Titanium.UI.createLabel({
                text : json[i].bar.name,
                font : {
                    fontSize : 14,
                    fontWeight : 'bold',
                    fontFamily : customFont
                },
                left : 70,
                top : 5,
                height : 20,
                width : 210
            });
            row.add(titleLabel);

            //END BAR NAME

            //BAR ADDRESS
            var addressLabel = Titanium.UI.createLabel({
                text : json[i].bar.address + ", " + json[i].bar.city + ", MD",
                font : {
                    fontSize : 10,
                    fontWeight : 'normal',
                    fontFamily : customFont
                },
                left : 70,
                top : 25,
                height : 40,
                width : 200
            });
            row.add(addressLabel);
            //END BAR ADDRESS

            //BAR IMAGE
            var iconImage = Titanium.UI.createImageView({
                image : encodeURI(json[i].bar.logo_url),
                width : 50,
                height : 50,
                left : 10,
                top : 10
            });
            row.add(iconImage);
            //END BAR IMAGE
            data.push(row);

        }
        barList.setData(data);

    };
    //END LOAD BAR AS PER REGION

    var set_bar_data = function(bar) {

        main_Data = [];
        barList.setData(main_Data);
        main_Data = bar;
        barList.setData(main_Data);

    };

    var create_bar = function(json) {

        var region_id = json.bar.region_id;
        var dt = new Date();
        var dt_utc_day = dt.getUTCDay();

        if (region_id && region_id != null) {
            var row = Titanium.UI.createTableViewRow({
                className : 'bar-row',
                data : json.bar, // pass everything because you also use name later on
                hasChild : true,
                filter : json.bar.name
            });

            //BAR NAME
            var titleLabel = Titanium.UI.createLabel({
                text : json.bar.name,
                font : {
                    fontSize : 14,
                    fontWeight : 'bold',
                    fontFamily : customFont
                },
                left : 70,
                top : 5,
                height : 20,
                width : 210
            });
            row.add(titleLabel);

            //END BAR NAME

            //BAR ADDRESS
            var addressLabel = Titanium.UI.createLabel({
                text : json.bar.address + ", " + json.bar.city + ", MD",
                font : {
                    fontSize : 10,
                    fontWeight : 'normal',
                    fontFamily : customFont
                },
                left : 70,
                top : 25,
                height : 40,
                width : 200
            });
            row.add(addressLabel);
            //END BAR ADDRESS

            //BAR IMAGE
            var iconImage = Titanium.UI.createImageView({
                image : encodeURI(json.bar.logo_url),
                width : 50,
                height : 50,
                left : 10,
                top : 10
            });
            row.add(iconImage);
            //END BAR IMAGE

            switch(region_id) {

                case 1:
                    Loyala_data.push(row);
                    break;
                case 2:
                    Towson_data.push(row);
                    break;
                case 3:
                    Johne_Hopkins_data.push(row);
                    break;
                case 4:
                    Downtown_data.push(row);
                    break;
                case 5:
                    Fells_Points_data.push(row);
                    break;
                case 6:
                    Federal_Hill_data.push(row);
                    break;

            }

            all_data.push(row);
            barList.setData(all_data);
        }

    };

    var bar_load = function(win) {
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

                        if (json[i].bar.region_id) {
                            create_bar(json[i]);
                        }
                    }

                };

                var url = "http://campustaps.com/bars.json?region_id=all";
                xhr.open('GET', url);
                xhr.send();

            } else {
                obj_win.close();
                alert("Please check your internet connenction");
            }

        } catch(ex) {
            obj_win.close();
            alert(ex);
        }
    };

    win.addEventListener("open", function(e) {
        var act_ind_win = null;
        // default null value
        bar_load(act_ind_win);
    });

    return win;
};
module.exports = bars;

