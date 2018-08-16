(function() {
    // Create the connector object
    var myConnector = tableau.makeConnector();
    var Auth = false;

    myConnector.init = function(initCallback) {
        tableau.authType = tableau.authTypeEnum.custom;

        if (tableau.phase == tableau.phaseEnum.interactivePhase || tableau.phase == tableau.phaseEnum.authPhase) {
            console.log("Tableau WDC Detected");
            var curURL = window.location.href;
            curURL = curURL.replace("#", "?");
            var query = getQueryParams(curURL);
            if (query["http://files.tableaujunkie.com/fitbit/html/fitbitconnect.html?access_token"]) {
                var access_token = query["http://files.tableaujunkie.com/fitbit/html/fitbitconnect.html?access_token"];
                Auth = true;
                tableau.password = access_token;
                $('.section-description').html("Thanks for authenticating!</br>Please specify the number of days you would like to retrive data for (max 150).<p class='centre'></br><label for='days'>Number of days:  </label><input type='number' name='days' id='days' min='0' max='150' step='1' value='7' style='width: 70px;'/></p>Now press the button below to extract your Fitbit data.</br>You will get access to your intra-day heart rate, activities, and sleep data.</br></br><button type='button' class='btn btn-primary' id='getData'>Get Data</a>");
                $('#getData').bind('click', function() {
                    days = $('#days').val()
                    myConnector.setConnection("", query["user_id"], days);
                    if (tableau.phase == tableau.phaseEnum.authPhase) {
                        // Auto-submit here if we are in the auth phase
                        console.log("Entering Auth Phase");
                        tableau.submit();
                    }
                })
            }
        }

        if (tableau.phase == tableau.phaseEnum.interactivePhase) {
            console.log("Entering Interactive Phase");
            if (!Auth) {
                $('.section-description').html("Press the button below to allow Tableau to connect to your Fitbit data.</br></br><button type='button' class='btn btn-primary' id='authenticate'>Authenticate</a>");
                $('#authenticate').bind('click', function() {
                    $('.ajax-loading').show();
                    window.location.href = "https://www.fitbit.com/oauth2/authorize?response_type=token&client_id=22CXJJ&redirect_uri=http://files.tableaujunkie.com/fitbit/html/fitbitconnect.html&scope=activity%20nutrition%20heartrate%20location%20nutrition%20profile%20settings%20sleep%20social%20weight&expires_in=2592000";
                });
            }
        }
        initCallback();
    }

    myConnector.setConnection = function(refresh_token, user_id, days) {
        var connData = [refresh_token, user_id, days];
        tableau.connectionData = JSON.stringify(connData);
        tableau.connectionName = 'Fitbit Activity'; // name the data source. This will be the data source name in Tableau
        tableau.submit();
    };

    //Define the schema
    myConnector.getSchema = function(schemaCallback) {
        var stepCols = [{
            id: "activityMinute",
            alias: "activityMinute",
            dataType: tableau.dataTypeEnum.datetime
        }, {
            id: "steps",
            alias: "steps",
            dataType: tableau.dataTypeEnum.int
        }];

        var caloriesCols = [{
            id: "activityMinute",
            alias: "activityMinute",
            dataType: tableau.dataTypeEnum.datetime
        }, {
            id: "calories",
            alias: "calories",
            dataType: tableau.dataTypeEnum.float
        }];

        var distanceCols = [{
            id: "activityMinute",
            alias: "activityMinute",
            dataType: tableau.dataTypeEnum.datetime
        }, {
            id: "distance",
            alias: "distance",
            dataType: tableau.dataTypeEnum.float
        }];

        var elevationCols = [{
            id: "activityMinute",
            alias: "activityMinute",
            dataType: tableau.dataTypeEnum.datetime
        }, {
            id: "elevation",
            alias: "elevation",
            dataType: tableau.dataTypeEnum.float
        }];

        var sleepCols = [{
            id: "activityMinute",
            alias: "activityMinute",
            dataType: tableau.dataTypeEnum.datetime
        }, {
            id: "activitySecond",
            alias: "activitySecond",
            dataType: tableau.dataTypeEnum.datetime
        }, {
            id: "level",
            alias: "level",
            dataType: tableau.dataTypeEnum.string
        }, {
            id: "seconds",
            alias: "seconds",
            dataType: tableau.dataTypeEnum.int
        }];

        var floorCols = [{
            id: "activityMinute",
            alias: "activityMinute",
            dataType: tableau.dataTypeEnum.datetime
        }, {
            id: "floors",
            alias: "floors",
            dataType: tableau.dataTypeEnum.int
        }];

        var heartRateCols = [{
            id: "activityMinute",
            alias: "activityMinute",
            dataType: tableau.dataTypeEnum.datetime
        }, {
            id: "activitySecond",
            alias: "activitySecond",
            dataType: tableau.dataTypeEnum.datetime
        }, {
            id: "heart",
            alias: "heart",
            dataType: tableau.dataTypeEnum.float
        }];

        var stepTable = {
            id: "stepMinutes",
            alias: "stepMinutes",
            columns: stepCols
        };
        var floorTable = {
            id: "floorMinutes",
            alias: "floorMinutes",
            columns: floorCols
        };
        var distanceTable = {
            id: "distanceMinutes",
            alias: "distanceMinutes",
            columns: distanceCols
        };
        var elevationTable = {
            id: "elevationMinutes",
            alias: "elevationMinutes",
            columns: elevationCols
        };
        var caloriesTable = {
            id: "caloriesMinutes",
            alias: "caloriesMinutes",
            columns: caloriesCols
        };
        var heartRateTable = {
            id: "heartRateSeconds",
            alias: "heartRateSeconds",
            columns: heartRateCols
        };
        var sleepTable = {
            id: "sleepSeconds",
            alias: "sleepSeconds",
            columns: sleepCols
        };

        schemaCallback([stepTable, elevationTable, floorTable, caloriesTable, distanceTable, heartRateTable, sleepTable]);
    };

    myConnector.getData = function(table, doneCallback) {

        var connectionAuth = JSON.parse(tableau.connectionData);
        var access_token = tableau.password;
        var user_id = connectionAuth[1];
        var days = connectionAuth[2];

        var floors = {
            category: 'floors',
            activities: 'activities-floors-intraday'
        };
        var steps = {
            category: 'steps',
            activities: 'activities-steps-intraday'
        };
        var elevation = {
            category: 'elevation',
            activities: 'activities-elevation-intraday'
        };
        var distance = {
            category: 'distance',
            activities: 'activities-distance-intraday'
        };
        var calories = {
            category: 'calories',
            activities: 'activities-calories-intraday'
        };
        var heartRate = {
            category: 'heart',
            activities: 'activities-heart-intraday'
        };

        if (table.tableInfo.id == 'stepMinutes') {
            activity = steps;
            var activityDetail = '1min'
        }
        if (table.tableInfo.id == 'floorMinutes') {
            activity = floors;
            var activityDetail = '1min'
        }
        if (table.tableInfo.id == 'elevationMinutes') {
            activity = elevation;
            var activityDetail = '1min'
        }
        if (table.tableInfo.id == 'distanceMinutes') {
            activity = distance;
            var activityDetail = '1min'
        }
        if (table.tableInfo.id == 'caloriesMinutes') {
            activity = calories;
            var activityDetail = '1min'
        }
        if (table.tableInfo.id == 'heartRateSeconds') {
            activity = heartRate;
            activityDetail = '1sec' //get heart rate at the second level
        }

        var counter = 0;
        getFitbitData = function(counter) {
            var activityArray = [];
            var date = new Date();
            date.setDate(date.getDate() - counter);
            var d = date.toISOString().substring(0, 10);

            //get sleep data
            if (table.tableInfo.id == 'sleepSeconds') {
                url = 'https://api.fitbit.com/1.2/user/-/sleep/date/' + d + '.json';
                $.ajax({
                    url: url,
                    dataType: 'json',
                    type: 'GET',
                    headers: {
                        'Authorization': 'Bearer ' + access_token,
                    },
                    success: function(data) {
                        if (data.sleep.length > 0) {
                            var sleepData = [];
                            var sleepShortData = [];

                            if (data.sleep[0].levels.hasOwnProperty('data')) {
                                sleepData = data.sleep[0].levels.data;
                            }
                            if (data.sleep[0].levels.hasOwnProperty('shortData')) {
                                sleepShortData = data.sleep[0].levels.shortData;
                            }
                            var sleepAllData = sleepData.concat(sleepShortData);
                            for (var i = 0; i < sleepAllData.length; i++) {
                                var entry = {};
                                time = new Date(sleepAllData[i].dateTime);
                                entry.seconds = sleepAllData[i].seconds;
                                entry.activitySecond = new Date(time);
                                time.setSeconds(0);
                                entry.activityMinute = new Date(time);
                                entry.level = sleepAllData[i].level;
                                activityArray.push(entry);
                            }
                            table.appendRows(activityArray)
                        }
                        counter++;
                        if (counter == days) {
                            //if (counter == 100) {
                            doneCallback();
                        } else {
                            getFitbitData(counter);
                        }
                    },
                    error: function(xhr, status, error) {
                        tableau.log("Error: " + xhr.status + " " + error);
                        tableau.abortWithError("Error: " + xhr.status + " " + error);
                    }
                });
            }

            //get activity data
            else {
                //get activity
                url = 'https://api.fitbit.com/1/user/-/activities/' + activity.category + '/date/' + d + '/1d/' + activityDetail + '.json';
                $.ajax({
                    url: url,
                    dataType: 'json',
                    type: 'GET',
                    headers: {
                        'Authorization': 'Bearer ' + access_token,
                    },
                    success: function(data) {
                        var activities = data[activity.activities].dataset;
                        for (var i = 0; i < activities.length; i++) {
                            var entry = {};
                            //entry.ActivityDate = activities[i].dateTime;
                            time = activities[i].time;
                            date.setHours(time.substring(0, 2));
                            date.setMinutes(time.substring(3, 5));
                            date.setSeconds(0);
                            entry.activityMinute = new Date(date);
                            entry[activity.category] = activities[i].value;

                            //if getting rate rate then materialise column at the minute level 
                            if (table.tableInfo.id == 'heartRateSeconds') {
                                date.setSeconds(time.substring(6, 8));
                                entry.activitySecond = new Date(date);
                            }
                            activityArray.push(entry);
                        }
                        table.appendRows(activityArray)
                        counter++;
                        if (counter == days) {
                            //if (counter == 100) {
                            doneCallback();
                        } else {
                            getFitbitData(counter);
                        }
                    },
                    error: function(xhr, status, error) {
                        tableau.log("Error: " + xhr.status + " " + error);
                        tableau.abortWithError("Error: " + xhr.status + " " + error);
                    }
                });
            }
        }
        getFitbitData(counter);
    };

    tableau.registerConnector(myConnector);

    function getQueryParams(qs) {
        qs = qs.split("+").join(" ");

        var params = {},
            tokens,
            re = /[?&]?([^=]+)=([^&]*)/g;

        while (tokens = re.exec(qs)) {
            params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
        }

        return params;
    }

    $(document).ready(function() {
        $('.button').hide();
    });
})();