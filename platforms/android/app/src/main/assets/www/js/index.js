/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */



var NetworkAtlas = NetworkAtlas || {};
var networkData = {
    networkName: null,
    email: null,
    signal: null,
    longitude: null,
    latitude: null,
    color: null,
    location: null
};

var app = {
    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
        document.getElementById("getPosition").addEventListener("click", getPosition);
        document.getElementById("networkInfo").addEventListener("click", networkInfo);
        document.getElementById("getStrength").addEventListener("click", signalStrength);
        document.getElementById("getData").addEventListener("click", myData);
        document.getElementById("getMap").addEventListener("click", myMap);
        document.getElementById("exit").addEventListener("click", exitFromApp);

    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function() {
        this.receivedEvent('deviceready');



    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};


function signalStrength() {
    window.SignalStrength.dbm(function(db){networkData.signal=db;
        if(db>=-60){alert('Good Strength'+db+'dBm');}
        else if(db<-60 && db>-90){
            alert('Average Strength'+db+'dBm');
        }
        else
            alert('Poor Strength'+db+'dBm');


    });
}

function myMap() {
    $('#map-data > div').html('<iframe src="https://networkreception.herokuapp.com/map" width="300" height="550"/>');

            $.mobile.navigate("#map-data");
}


function myData() {
    $('#user-data-table').empty();
    var user =NetworkAtlas.Session.getInstance().get();
    var email=user.email;

    $.ajax({
        type: 'GET',
        url: "https://networkreception.herokuapp.com/network/user/"+email,
        dataType: 'json',
        data: {},
        success: function (resp) {

            var tbl=$("<table />").attr("id","mytable");

            var heading = "<tr><th>Network Name</th><th>Signal Value</th><th>Location</th>";
            $("#user-data-table").append(tbl);
            $("#mytable").append(heading);
            for(var i=0;i<resp.length;i++)
            {
                var tr="<tr>";
                var td1="<td>"+resp[i]["networkName"]+"</td>";
                var td2="<td>"+resp[i]["signal"]+" dBm"+"</td>";
                var td3="<td>"+resp[i]["location"]+"</td></tr>"


                $("#mytable").append(tr+td1+td2+td3);
            }

            $.mobile.navigate("#user-data");



        },
        error: function (e) {
            console.log(e.message);
            // TODO: Use a friendlier error message below.

        }
    });
}

function exitFromApp()
{
    navigator.app.exitApp();
}

function networkInfo() {
    window.SignalStrength.dbm(function(db){networkData.signal=db;
    if(db>=-60){networkData.color='green';}
    else if(db<-60 && db>-90){
        networkData.color='yellow';
        }
    else
    networkData.color='red';


    });

    myPosition();

    window.plugins.sim.requestReadPermission(successCallback, errorCallback);

    window.plugins.sim.getSimInfo(successCallback, errorCallback);
    function successCallback(result) {

        networkData.networkName=result.carrierName;
    }

    function errorCallback(error) {
        console.log(JSON.stringify(result));
    }

    var user =NetworkAtlas.Session.getInstance().get();
    networkData.email=user.email;

    if(networkData.networkName==null){networkData.networkName='Undefined';}
    if(networkData.longitude==null){networkData.longitude=0;}
    if(networkData.latitude==null){networkData.latitude=0;}

    $.ajax({
        type: 'POST',
        url: "https://networkreception.herokuapp.com/network",
        dataType: 'json',
        data: {"networkName":networkData.networkName,"email":networkData.email, "signal":networkData.signal,"longitude":networkData.longitude,"latitude":networkData.latitude,"color":networkData.color,"location":networkData.location},
        success: function (resp) {
            if (resp.success == 'true') {
                alert('Data sent'+networkData.latitude+networkData.longitude+networkData.signal+networkData.email+networkData.networkName+networkData.location);
                console.log(' Data sent inside');
                return;
            }
        },
        error: function (e) {
            console.log(e.message);
            // TODO: Use a friendlier error message below.

        }
    });



}
function getPosition() {
    var options = {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 10000
    }
    var watchID = navigator.geolocation.getCurrentPosition(onSuccess, onError, options);

    function onSuccess(position) {
        var address;
        var geocoder = new google.maps.Geocoder();
        var geolocate = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

        console.log(position.coords.latitude + ', ' + position.coords.longitude);

        geocoder.geocode({'latLng': geolocate}, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                var result;
                if (results.length > 1) {
                    result = results[1];
                } else {
                    result = results[0];
                }
                //console.log(result);
                address=result.address_components[2].long_name + ', ' + result.address_components[3].long_name;
                networkData.location = address;
            }
            alert('Latitude: '          + position.coords.latitude          + '\n' +
            'Longitude: '         + position.coords.longitude         + '\n'+'Address:' + address);
    });
    }

    function onError(error) {
        alert('code: '    + error.code    + '\n' + 'message: ' + error.message + '\n');
    }
}

function myPosition() {
    var options = {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 10000
    }
    var watchID = navigator.geolocation.getCurrentPosition(onSuccess, onError, options);

    function onSuccess(position) {
        var address;
        var geocoder = new google.maps.Geocoder();
        var geolocate = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        networkData.latitude=position.coords.latitude;
        networkData.longitude=position.coords.longitude;
        console.log(position.coords.latitude + ', ' + position.coords.longitude);

        geocoder.geocode({'latLng': geolocate}, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                var result;
                if (results.length > 1) {
                    result = results[1];
                } else {
                    result = results[0];
                }
                //console.log(result);
                address=result.address_components[2].long_name + ', ' + result.address_components[3].long_name;
                networkData.location = address;
            }

        });
    }

    function onError(error) {
        alert('code: '    + error.code    + '\n' + 'message: ' + error.message + '\n');
    }
}


app.initialize();



$(document).on("mobileinit", function (event, ui) {
    $.mobile.defaultPageTransition = "slide";
});

app.signupController = new NetworkAtlas.SignUpController();
app.signinController = new NetworkAtlas.SignInController();

//$(document).delegate("#page-signup", "pagebeforeshow", function () {
//    // Reset the signup form.
//    app.signupController.resetSignUpForm();
//});

$(document).on("pagecontainerbeforeshow", function (event, ui) {
    if (typeof ui.toPage == "object") {
        switch (ui.toPage.attr("id")) {
            case "page-signup":
                // Reset the signup form.
                app.signupController.resetSignUpForm();
                break;
        }
    }
});

$(document).delegate("#page-signin", "pagebeforecreate", function () {

    app.signinController.init();


    app.signinController.$btnSubmit.off("tap").on("tap", function () {
        app.signinController.onSignInCommand();

    });

});

$(document).delegate("#page-signup", "pagebeforecreate", function () {

    app.signupController.init();


    app.signupController.$btnSubmit.off("tap").on("tap", function () {
        app.signupController.onSignupCommand();

    });

});

setInterval(function () {if($('#activate > div').hasClass("ui-flipswitch-active")){
    networkInfo();

}
    },1000000);

var user =NetworkAtlas.Session.getInstance().get();
emailId=user.email;
$.ajax({
    type: 'GET',
    url: "https://networkreception.herokuapp.com/network/user/"+emailId,
    dataType: 'json',
    data: {},
    success: function (resp) {

        $('#score').text('My Score:'+resp.length);




    },
    error: function (e) {
        console.log(e.message);
        // TODO: Use a friendlier error message below.

    }
});