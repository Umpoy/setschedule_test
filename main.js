var map;
function initMap() {
    // var mapOptions = {
    //     zoom: 10,
    //     center: new google.maps.LatLng(33.650550, -117.747639)
    // };

    map = new google.maps.Map(document.getElementById('map'),
        {
            zoom: 10,
            center: new google.maps.LatLng(33.650550, -117.747639)
        });


    // google.maps.event.addDomListener(window, 'load', initMap)


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
            // User entered the name of a Place that was not suggested and
            // pressed the Enter key, or the Place Details request failed.
            window.alert("No details available for input: '" + place.name + "'");
            return;
        }

        // If the place has a geometry, then present it on a map.
        if (place.geometry.viewport) {
            map.fitBounds(place.geometry.viewport);
        } else {
            map.setCenter(place.geometry.location);
            mapOptions.zoom(10);  // Why 17? Because it looks good.
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
            latitude: place.geometry.viewport.f.f,
            longitude: place.geometry.viewport.b.b
        }
        for (var i = 0; i < 3; i++) {
            var tentotwenthy = Math.floor((Math.random() * ((32186 - 16093) + 1) + 16093));
            randomGeo(center_point, tentotwenthy)
        }
    });
}

function randomGeo(center, radius) {
    var y0 = center.latitude;
    var x0 = center.longitude;
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

    var markerR = new google.maps.Marker({
        map: map,
        position: { lat: newlat, lng: newlon },
        draggable: true,
    });
    console.log(markerR.map)
}
