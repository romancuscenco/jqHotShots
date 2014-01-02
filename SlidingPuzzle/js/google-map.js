$(function () {

    var api = google.maps,
        mapCenter = new api.LatLng(50.91710, -1.40419),
        mapOptions = {
            zoom: 13,
            center: mapCenter,
            mapTypeId: api.MapTypeId.ROADMAP,
            disableDefaultUI: true
        },
        map = new api.Map(document.getElementById("map"), mapOptions),
        ui = $("#ui"),
        clicks = 0,
        positions = [];

    var homeMarker = new api.Marker({
        position: mapCenter,
        map: map,
        icon: "img/hq.png"
    });

    var infoWindow = new api.InfoWindow({
        content: document.getElementById("hqInfo")
    });

    api.event.addListener(homeMarker, "click", function () {
        infoWindow.open(map, homeMarker);
    });

    var addMarker = function (e) {
        if (clicks <= 1) {
            positions.push(e.latLng);

            var marker = new api.Marker({
                map: map,
                position: e.latLng,
                flat: (clicks === 0) ? true : false,
                animation: api.Animation.DROP,
                title: (clicks === 0) ? "Start" : "",
                icon: (clicks === 0) ? "img/start.png" : "",
                draggable: true,
                id: (clicks === 0) ? "Start" : "End"
            });

            api.event.trigger(map, "locationAdd", e);
        }
        else {
            api.event.removeListener(mapClick);
            return false;
        }
    }

    var mapClick = api.event.addListener(map, "click", addMarker);

});