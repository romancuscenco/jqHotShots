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

            api.event.addListener(marker, "dragend", markerDrag);

            api.event.trigger(map, "locationAdd", e);
        }
        else {
            api.event.removeListener(mapClick);
            return false;
        }        
    }

    var mapClick = api.event.addListener(map, "click", addMarker);

    api.event.addListener(map, "locationAdd", function (e) {
        var journeyEl = $("#journey"),
            outer = (journeyEl.length) ? journeyEl : $("<div />", { id: "journey" });

        new api.Geocoder().geocode({ "latLng": e.latLng }, function (results) {
            $("<h3 />", { text: (clicks === 0) ? "Start" : "End" }).appendTo(outer);
            $("<p />", {
                text: results[0].formatted_address,
                id: (clicks === 0) ? "StartPoint" : "EndPoint",
                "data-latLng": e.latLng
            }).appendTo(outer);

            if (!journeyEl.length) {
                outer.appendTo(ui);
            } else {
                $("<button />", {
                    id: "getQuote",
                    text: "Get quote"
                }).prop("disabled", true).appendTo(journeyEl);
            }

            clicks++;
        });
    });

    var markerDrag = function (e) {
        var elId = ["#", this.get("id"), "Point"].join("");

        new api.Geocoder().geocode({ "latLng": e.latLng }, function (results) {
            $(elId).text(results[0].formatted_address);
        });
    };

    $("#weight").on("keyup", function () {
        if (timeout) {
            clearTimeout(timeout);
        }

        var field = $(this),
            enableButton = function () {
                if (field.val()) {
                    $("#getQuote").removeProp("disabled");
                } else {
                    $("#getQuote").prop("disabled", true);
                }
            },
            timeout = setTimeout(enableButton, 250);
    });

    $("body").on("click", "#getQuote", function (e) {
        e.preventDefault();
        $(this).remove();

        new api.DistanceMatrixService().getDistanceMatrix({
            origins: [$("#StartPoint").attr("data-latLng")],
            destinations: [$("#EndPoint").attr("data-latLng")],
            travelMode: google.maps.TravelMode.DRIVING,
            unitSystem: google.maps.UnitSystem.IMPERIAL
        },
        function (response) {
            var list = $("<dl />", { "class": "clearfix", id: "quote" }),
                format = function (number) {
                    var rounded = Math.round(number * 100) / 100,
                        fixed = rounded.toFixed(2);

                    return fixed;
                },
                term = $("<dt />"),
                desc = $("<dd />"),
                distance = response.rows[0].elements[0].distance,
                weight = $("#weight").val(),
                distanceString = distance.text + "les",
                distanceNum = parseFloat(distance.text.split(" ")[0]),
                distanceCost = format(distanceNum * 3),
                weightCost = format(distanceNum * 0.25 * distanceNum),
                totalCost = format(+distanceCost + +weightCost);
                
            $("<h3 />", { text: "Your quote", id: "quoteHeading" }).appendTo(ui);

            term.clone().html("Distance:").appendTo(list);
            desc.clone().text(distanceString).appendTo(list);
            term.clone().text("Distance cost:").appendTo(list);
            desc.clone().text("$" + distanceCost).appendTo(list);
            term.clone().text("Weight cost:").appendTo(list);
            desc.clone().text("$" + weightCost).appendTo(list);
            term.clone().addClass("total").text("Total:").appendTo(list);
            desc.clone().addClass("total").text("$" + totalCost).appendTo(list);

            list.appendTo(ui);
        });
    });

});