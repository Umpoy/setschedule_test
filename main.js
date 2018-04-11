var map;
function initMap() {
    var marker_array = []
    map = new google.maps.Map(document.getElementById('map'),
        {
            zoom: 10,
            center: new google.maps.LatLng(33.650550, -117.747639)
        });
    var directionsService = new google.maps.DirectionsService;
    var directionsDisplay = new google.maps.DirectionsRenderer({ map: map });
    // map.controls[google.maps.ControlPosition.TOP_RIGHT].push(document.getElementById('pac-input'))
    var defaultBounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(33.650550, -117.747639),
        new google.maps.LatLng(33.700550, -117.837639)
    )
    var options = {
        bounds: defaultBounds
    }
    var input = document.getElementById('pac-input');
    var autocomplete = new google.maps.places.Autocomplete(input, options)
    var infowindow = new google.maps.InfoWindow();
    var infowindowContent = document.getElementById('infowindow-content');
    infowindow.setContent(infowindowContent);
    var marker = new google.maps.Marker({
        map: map,
        anchorPoint: new google.maps.Point(0, -29)
    });
    var circle = new google.maps.Circle({
        map: map,
        radius: 16093,    // 10 miles in metres
        fillColor: 'red'
    });
    var circle2 = new google.maps.Circle({
        map: map,
        radius: 32186,    // 20 miles in metres
        fillColor: 'blue'
    });
    autocomplete.addListener('place_changed', function () {
        infowindow.close();
        marker.setVisible(false);
        var place = autocomplete.getPlace();
        if (!place.geometry) {
            window.alert("No details available for input: '" + place.name + "'");
            return;
        }
        if (place.geometry.viewport) {
            map.fitBounds(place.geometry.viewport);
        } else {
            map.setCenter(place.geometry.location);
            mapOptions.zoom(10);
        }
        marker.setPosition(place.geometry.location);
        marker.setVisible(true);
        var address = '';
        if (place.address_components) {
            address = [
                (place.address_components[0] && place.address_components[0].short_name || ''),
                (place.address_components[1] && place.address_components[1].short_name || ''),
                (place.address_components[2] && place.address_components[2].short_name || '')
            ].join(' ');
        }
        infowindowContent.children['place-icon'].src = place.icon;
        infowindowContent.children['place-name'].textContent = place.name;
        infowindowContent.children['place-address'].textContent = address;
        infowindow.open(map, marker);
        circle.bindTo('center', marker, 'position');
        circle2.bindTo('center', marker, 'position');
        var center_point = {
            lat: place.geometry.viewport.f.f,
            long: place.geometry.viewport.b.b
        }
        for (var i = 0; i < 3; i++) {
            var tentotwenthy = Math.floor((Math.random() * ((32186 - 16093) + 1) + 16093));
            var hold_marker = randomGeo(center_point, 32186, i)
            var distance = getDistanceFromLatLonInKm(center_point.lat, center_point.long, hold_marker.lat, hold_marker.long)
            marker_array[i].distance = distance
            marker_array[i].lat = hold_marker.lat;
            marker_array[i].long = hold_marker.long;
            if (distance < 16094 || distance > 32186) {
                marker_array.splice(i, 1)
                i--
            }
        }
        marker_array = sort_array_by_distance(marker_array)
        for (var j = 1; j < 3; j++) {
            marker_array[j].distance = getDistanceFromLatLonInKm(marker_array[0].lat, marker_array[0].long, marker_array[j].lat, marker_array[j].long);
        }
        if (marker_array[2].distance < marker_array[1].distance) {
            var hold = marker_array[2]
            marker_array[2] = marker_array[1];
            marker_array[1] = hold
        }
        calculateAndDisplayRoute(directionsDisplay, directionsService, address, marker_array[0], marker_array[1], marker_array[2])
        for (var i = 0; i < 3; i++) {
            render_street_view(marker_array[i].lat, marker_array[i].long, i)
        }
    });

    function sort_array_by_distance(array) {
        var swapped = true;
        while (swapped) {
            swapped = false;
            for (var i = 0; i < array.length - 1; i++) {
                if (array[i].distance > array[i + 1].distance) {
                    var hold = array[i].distance
                    array[i].distance = array[i + 1].distance
                    array[i + 1].distance = hold
                    swapped = true
                }
            }
        }
        return array
    }

    function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
        var R = 6371000;
        var a = 0.5 - Math.cos((lat2 - lat1) * Math.PI / 180) / 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * (1 - Math.cos((lon2 - lon1) * Math.PI / 180)) / 2;
        return R * 2 * Math.asin(Math.sqrt(a));
    }

    function deg2rad(deg) {
        return deg * (Math.PI / 180)
    }

    function calculateAndDisplayRoute(directionsDisplay, directionsService, first_point, second_point, third_point, fourth_point) {

        directionsService.route({
            origin: first_point,
            destination: new google.maps.LatLng(second_point.lat, second_point.long),
            waypoints: [
                {
                    location: new google.maps.LatLng(fourth_point.lat, fourth_point.long),
                    stopover: true
                },
                {
                    location: new google.maps.LatLng(third_point.lat, third_point.long),
                    stopover: true
                }],
            provideRouteAlternatives: true,
            travelMode: 'DRIVING'
        }, function (response, status) {
            // Route the directions and pass the response to a function to create
            // markers for each step.
            if (status === 'OK') {

                directionsDisplay.setDirections(response);
                ;
            } else {
                window.alert('Directions request failed due to ' + status);
            }
        });
    }

    function randomGeo(center, radius, i) {
        var y0 = center.lat;
        var x0 = center.long;
        var rd = radius / 111300; //about 111300 meters in one degree
        var u = Math.random();
        var v = Math.random();
        var w = rd * Math.sqrt(u);
        var t = 2 * Math.PI * v;
        var x = w * Math.cos(t);
        var y = w * Math.sin(t);
        //Adjust the x-coordinate for the shrinking of the east-west distances
        var xp = x / Math.cos(y0);
        var newlat = y + y0;
        var newlon = x + x0;
        var newlon2 = xp + x0;
        var markerR = {
            position: { lat: newlat, lng: newlon },
        };
        marker_array.push(markerR)
        return {
            lat: newlat,
            long: newlon
        }
    }

    function render_street_view(lat, long, i) {
        map = new google.maps.Map(document.getElementById('pano' + (i + 1)),
            {
                zoom: 13,
                center: new google.maps.LatLng(lat, long)
            });

        var marker = new google.maps.Marker({
            map: map,
            position: new google.maps.LatLng(lat, long),
            anchorPoint: new google.maps.Point(0, -29)
        });
    }
}


