var map;
var locationBounds;
var googleMapsInfoWindow;

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: 51.227741, lng: 6.773456},
      zoom: 14
    });

    locationBounds = new google.maps.LatLngBounds();
    googleMapsInfoWindow = new google.maps.InfoWindow();

    ko.applyBindings(new FilterFunction());
}

//This function alerts the user when a map error has occured.
function googleMapsError() {
    alert('Sorry, a problem has occured with Google maps.');
}
var location_marker = function(location_data) {
    var self = this;
    this.title = location_data.title;
    this.position = location_data.location;
    this.visible = ko.observable(true);
    // This is making the markers have a new style.
    var customIcon = makeMarkerIcon('8E44AD');
    // Create a "highlighted location" marker color for when the user mouses over the marker.
    var mousedOverIcon = makeMarkerIcon('FF69B4');
    //Below, the link was gotten from this page: https://developer.foursquare.com/docs/api/venues/search. This is using the information from foursquare in the Infowindows.
    var foursquareLoadURL = 'https://api.foursquare.com/v2/venues/search?ll=' + this.position.lat + ',' + this.position.lng + '&client_id=' + 'LQJXUKZGT1PSCM5XWUNUGZ2TFHDDGPRGEEQYZ25UTO1Y52BL' + '&client_secret=' + 'Q0PGEVE4PWWZONSBBRLFWDFXEKR3N5G0HKHKWA5HM2V2E2MX' + '&v=20160118' + '&query=' + this.title;
    $.getJSON(foursquareLoadURL).done(function(location_data) {  //I used this link (https://api.jquery.com/jquery.getjson/) to find out more information about the The jqXHR Object and the .done, .fail, and .always methods.
		var results = location_data.response.venues[0];
        self.street = results.location.formattedAddress[0] ? results.location.formattedAddress[0]: 'No street name found.';
        self.city = results.location.formattedAddress[1] ? results.location.formattedAddress[1]: 'No city name found.';
    }).fail(function() {
        alert('Sorry, there was an error with Foursquare.'); //This is alerting the user if an error in foursquare has occured.
    });

    // Create a marker per location, and put into markers array
    //I used this link to get the animations (my research): https://developers.google.com/maps/documentation/javascript/examples/marker-animations.
    this.marker = new google.maps.Marker({
        position: this.position,
        title: this.title,
        animation: google.maps.Animation.DROP,
        icon: customIcon
    });

    self.filterMarkers = ko.computed(function () {
      //This filters through the search list.
        if(self.visible() === true) {
            self.marker.setMap(map);
            locationBounds.extend(self.marker.position);
            map.fitBounds(locationBounds);
        } else {
            self.marker.setMap(null);
        }
    });

    // Create an onclick even to open an indowindow at each marker
    this.marker.addListener('click', function() {
        populateInfoWindow(this, self.street, self.city, googleMapsInfoWindow);
    });

    // Two event listeners - one for mouseover, one for mouseout, these change the color of the markers.
    this.marker.addListener('mouseover', function() {
        this.setIcon(mousedOverIcon);
    });
    this.marker.addListener('mouseout', function() {
        this.setIcon(customIcon);
    });
    // show item info when selected from list
    this.show = function(location) {
        google.maps.event.trigger
        (self.marker, 'click'); //I researched more information about .trigger in this link: http://api.jquery.com/trigger/.
    };
};

// This function populates the largeInfoWindow when the marker is clicked. The infowindow displays the important information like the name of the Restaurant, the address and its exact location.
function populateInfoWindow(marker, street, city, googleMapsInfoWindow) {
    // This checks if the infowindow is already open.
    if (googleMapsInfoWindow.marker != marker) {
        googleMapsInfoWindow.marker = marker;
        // Make sure the marker property is cleared if the infowindow is closed.
        googleMapsInfoWindow.addListener('closeclick', function() {
            googleMapsInfoWindow.marker = null;
        });
        //This puts the information into all of the the InfoWindows. This is 'how' the information is shown on the infowindows. (what size, what order, etc.)
        googleMapsInfoWindow.setContent('<div>' + '<h2>' + 'Restaurant: ' + marker.title + '</h2>' + '</br>' + 'Position: ' + marker.position + '<p>' + street + "<br>" + city + "</p>" + '</div>');
        googleMapsInfoWindow.open(map, marker);
    }
}

var FilterFunction = function() {
    var self = this;
    this.searchItem = ko.observable('');  //http://knockoutjs.com/documentation/observableArrays.html This link is what I used to research more about observable arrays.
    this.mapList = ko.observableArray([]);

    locations.forEach(function(location) {
        self.mapList.push( new location_marker(location) );
    });

    this.locationList = ko.computed(function() {
        var searchFilter = self.searchItem().toLowerCase();
        if (searchFilter) {
            return ko.utils.arrayFilter(self.mapList(), function(location) {
                var str = location.title.toLowerCase();
                var result = str.includes(searchFilter);
                location.visible(result);
				return result;
			});
        }
        self.mapList().forEach(function(location) {
            location.visible(true);
        });
        return self.mapList();
    }, self);
};

// This function takes in a COLOR, and then creates a new marker
// icon of that color. The icon will be 21 px wide by 34 high, have an origin
// of 0, 0 and be anchored at 10, 34).
function makeMarkerIcon(markerColor) {
    var markerImage = new google.maps.MarkerImage(
        'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor +
        '|40|_|%E2%80%A2',
        new google.maps.Size(21, 34),
        new google.maps.Point(0, 0),
        new google.maps.Point(10, 34),
        new google.maps.Size(21, 34));
    return markerImage;
}
