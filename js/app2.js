var map;
var tour;
var markers = [];
var pageCount = 1;
var totalList = [];
var eventList;
var lastClicked;
var searchTerm;
var searchYear = 2017;
var currArtistID;
var prevYearElement;
var prevArtistElement;

function initMap(locations) {

	var styledMapType = new google.maps.StyledMapType(
	[{"stylers":[{"hue":"#ff1a00"},{"invert_lightness":true},{"saturation":-100},{"lightness":33},{"gamma":0.5}]},{"featureType":"water","elementType":"geometry","stylers":[{"color":"#1b1b1b"}]}],
	{name: 'Styled Map'});

	//initializing map and default settings

	map = new google.maps.Map(document.getElementById("map"), {
    zoom: 5,
    center: { lat: 39.0119, lng: -98.4842 },
    disableDefaultUI: true,
    backgroundColor: "#1b1b1b",
    mapTypeControlOptions: {
      mapTypeIds: ["styled_map"]
    }
  });

	map.mapTypes.set('styled_map', styledMapType);
	map.setMapTypeId('styled_map');	

}  //end of initMap();

function clearMarkers() {

	totalList = [];
	pageCount = 1;
	$('#results-bar').html("");

	if(tour) {
		tour.setMap(null);
	}

	for (var i = 0; i < markers.length; i++) {
	  markers[i].setMap(null);
	}

	markers = [];


}

function setMarkers(events, locations) {

	var count = 1;
	var bounds = new google.maps.LatLngBounds();
	var prevRotation = 0;

	// setting map parameters to fit all markers

		for(i = 0; i < events.length; i++) {
			bounds.extend(events[i].location);
		}

		if(events.length > 1) {
			map.fitBounds(bounds);
			map.panToBounds(bounds);
		}

		else {
		map.setCenter(events[0].location);
		map.setZoom(4);
		}
	
	// loop over locations array and add markers to map

		events.forEach(function(event, i){

			var matchingCount = checkDupilcates(locations, event.location);

			// to determine what angle to place marker at if multiple concerts are played in the same city

			switch (matchingCount) {
				case 1:
					rotation = 0;
					prevRotation = 0;
					break;
				case 2: 
					if(prevRotation === 0) {
						rotation = -60;
						prevRotation = 1;
					} else {
						rotation = 0;
						prevRotation = 0;
					}
					break;
				case 3:
					if(prevRotation === 0) {
						rotation = -60;
						prevRotation = 1;
					} else if(prevRotation === 1){
						rotation = 0;
						prevRotation = 2;
					} else {
						rotation = 60;
						prevRotation = 0;
					}
					break;
				case 4:
					if(prevRotation === 0) {
						rotation = -60;
						prevRotation = 0;
					} else if(prevRotation === 1){
						rotation = 0;
						prevRotation = 2;
					} else if(prevRotation === 2){
						rotation = 60;
						prevRotation = 2;
					} else {
						rotation = 120;
						prevRotation = 0;
					}
					break;
			}
	
			var mapPin = {
				path: 'M25.015 2.4c-7.8 0-14.121 6.204-14.121 13.854 0 7.652 14.121 32.746 14.121 32.746s14.122-25.094 14.122-32.746c0-7.65-6.325-13.854-14.122-13.854z',
				origin: new google.maps.Point(0, 0),
				anchor: new google.maps.Point(25, 48),
				fillColor: '#d8d8d8',
				fillOpacity: 1,
				strokeColor: '#1b1b1b',
				strokeOpacity: 1,
				scale: .9,
				labelOrigin: new google.maps.Point(25,16),
				rotation: rotation
			}

			window.setTimeout(function() {	

				markers.push(new google.maps.Marker({
				position: event.location,
				map: map,
				id: count,
				icon: mapPin,
				label: {
					text: (i+1).toString(),
					color: "#000",
					fontSize: "13px",
					fontWeight: 'bold'
				},
				title: event.name + " "+ event.date,
				animation: google.maps.Animation.DROP

          	}));
			  
			markers[i].addListener('click', function() {

				showClicked(this);
				lastClicked = this;
	         
			});
			  
			  count++;

			}, i * 50);

		});

		tour = new google.maps.Polyline({

			path: locations,
			geodesic: true,
			strokeColor: '#753a88',
			strokeOpacity: 0.75,
			strokeWeight: 2

		});

		tour.setMap(map);
	
	pageCount = 1;

}

function showClicked(marker) {

	//create new icon for clicked and change currently selected icon to reflect current state

	var selectedMapPin = {
		path: 'M25.015 2.4c-7.8 0-14.121 6.204-14.121 13.854 0 7.652 14.121 32.746 14.121 32.746s14.122-25.094 14.122-32.746c0-7.65-6.325-13.854-14.122-13.854z',
		origin: new google.maps.Point(0, 0),
		anchor: new google.maps.Point(25, 48),
		fillColor: '#cf4273',
		fillOpacity: 1,
		strokeColor: '#ffffff',
		strokeOpacity: 1,
		scale: 1.4,
		labelOrigin: new google.maps.Point(25,16),
		rotation: marker.icon.rotation
	}

	//create new icon for unselected state to allow previous icon to be reverted back to an 
	// original state

	if(lastClicked) {

		var unSelectedMapPin = {
			path: 'M25.015 2.4c-7.8 0-14.121 6.204-14.121 13.854 0 7.652 14.121 32.746 14.121 32.746s14.122-25.094 14.122-32.746c0-7.65-6.325-13.854-14.122-13.854z',
			origin: new google.maps.Point(0, 0),
			anchor: new google.maps.Point(25, 48),
			fillColor: '#d8d8d8',
			fillOpacity: 1,
			strokeColor: '#1b1b1b',
			strokeOpacity: 1,
			scale: .9,
			labelOrigin: new google.maps.Point(25,16),
			rotation: lastClicked.icon.rotation

		}

	}

	map.setZoom(9);
	map.setCenter(marker.getPosition());
	marker.setZIndex(google.maps.Marker.MAX_ZINDEX + 1);
	marker.setIcon(selectedMapPin);
	marker.setLabel({
		text: marker.label.text,
		color: "#fff",
		fontSize: "18px",
		fontWeight: 'bold'
	})

	if(lastClicked) {
		lastClicked.setIcon(unSelectedMapPin);
		lastClicked.setLabel({
			text: lastClicked.label.text,
			color: "#000",
			fontSize: "13px",
			fontWeight: 'bold'
		})
		lastClicked.setZIndex(google.maps.Marker.MAX_ZINDEX - 1);
	}

	//// To implement scroll to result when clicking map pin
	//// currently not function correctly.....

	// var scrollToId = marker.id
	// console.log($("#" + scrollToId).position());
	// $('.results').animate({scrollTop: $("#" + scrollToId).position().top, duration: 800});
}

// Watches for click on results sidebar and highlights corresponding map pin

function selectPin() {

  	$(".results").on("click", ".results__item", function() {

	  	var i = $(this).data("id");
		showClicked(markers[i]);
		lastClicked = markers[i];

  });

}

//Function to transform YYYY-MM-DD to Month(long) Day, Year

function parseDate(dateStr) {
	var str_date = dateStr,
		split = str_date.split('-'),
		newDate = {
			year: +split[0],
			month: +split[1],
			day: +split[2]
		},
		months = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

	return months[newDate.month] + ' ' + newDate.day + ', ' + newDate.year;
}

// API Call to Songkick to get all concerts that chosen musical artist played within the 
// currently selected year.

function getEventHistoryFromApi(artistId, year) {
	console.log(artistId, year);
	var myApiKey = "ofqFcyXEVBW3U9se";
	
	var url = "https://api.songkick.com/api/3.0/artists/" + artistId + "/gigography.json?apikey=" + myApiKey + "&min_date=" + year + "-01-01&max_date=" + year + "-12-31";
	
	$.getJSON(url + "&page=" + pageCount + "&jsoncallback=?", function(data){
		console.log(data);
		var eventList = data.resultsPage.results.event;
		
		if (eventList == undefined){
			if(totalList.length >= 1){
				console.log("SERACH TERM", searchTerm);
				$(".results-bar__title").css("visibility", "visible");
				$("#results-title").text(searchTerm);
				$("#results-year").text(searchYear);

				reduceData(totalList);
			}
			else {

				$(".results-bar__title").css("visibility", "visible");
				$("#results-title").text(searchTerm);
				$("#results-year").text(searchYear);

				var errorText = `<div class='error'>
						<p class='error__main'>No results Found!</p>
						<p class='error__text'>
							There were no concerts found matching the artist and year selected. Please try choosing a different Artist or Tour Year above.  Please note taht all information is provided by Songkick and may not be completely accurate.
						</p>
					</div>`;

				$(".results").html(errorText);
				     
				return false;

			}
		}

		else {
			pageCount++;
			totalList = totalList.concat(eventList);
			getEventHistoryFromApi(artistId, year);
		}
	});	
}

function reduceData(totalList){

	var locationsArr = [];

	//takes totalList which contains all the data from songkick about the concerts 
	// and strips out certain data to be used in other functions

	const eventsList = totalList.reduce((eventsArr, event) => {

		if(event) {

			var s = event.displayName;
			var n = s.indexOf('(');
			displayName = s.substring(0, n != -1 ? n : s.length);

			// check for lat and long datapoint.  If none is found, use 
			// arbitrary point set as New York, NY

			if(event.location.lat == null || event.location.lng == null) {
				event.location = {lat: 40.7128, lng: -74.0059}
			}

			//create new object for each event with the relevant data to 
			//be displayed in the results bar

			eventsArr.push({
				name: displayName,
				date: parseDate(event.start.date),
				venue: event.venue.displayName,
				city: event.location.city,
				location: {	lat: event.location.lat,
							lng: event.location.lng
							},
				link: event.uri,
				id: event.id
			});
			
			// make seperate arry to allow for multi marker check

			locationsArr.push({
				lat: event.location.lat,
				lng: event.location.lng
			})

		}

		return eventsArr;

	}, []);

	populateResults(eventsList);
	setMarkers(eventsList, locationsArr);

}

function populateResults(events) {

	$('.results').text("");

	var toAppend = '';
	for(i=0; i < events.length; i++) {
		toAppend += `<div class='results__item' data-id=${i} id='${i+1}'>
							<div class='results__num'>${i+1}</div>
							<div class='results__event'>
								<div class='results__event-date'>${events[i].date}</div>
								<div class='results__event-text'>
									<p>${events[i].venue}</p>
									<p>${events[i].city}</p>
									<a href='${events[i].link}' target='__blank' class='results__event-link'> > More Details</a>
								</div>
							</div>
						
					</div>`;
	}
	$('.results').append(toAppend);
}

function getArtist(artist) {

	var myApiKey = "ofqFcyXEVBW3U9se";
	var url = "https://api.songkick.com/api/3.0/search/artists.json?query="+artist+"&apikey="+myApiKey;

	$.getJSON(url + "&jsoncallback=?", function(data) {
		$(".dropdown-content").text("");
		var artistList = data.resultsPage.results.artist;
		currArtistID = artistList[0].id;
    	
		var create = "";

		$(".user-nav__notification").css("visibility", "visible");
		$(".user-nav__notification").text(artistList.length);

		for(var i = 0; i < artistList.length;i++) {

			var displayName = artistList[i].displayName;
			if (displayName.length > 45) {
				displayName = displayName.substring(0, 42);
				displayName += "..."
			}
						create += `<li data-state='none' value=${artistList[i].id}>${displayName}</li>`;
						
		}

		$(".dropdown-content").append(create);

		getEventHistoryFromApi(currArtistID, searchYear);

  	});
}

function populateYearDropdown() {

	var create = "";
	var year = 2017;
	for (i = 0; i < 48; i++) {
		create += "<li data-state='none' value=" + year + ">" + year + "</li>";
		year--;
	}
	$(".year-dropdown-content").append(create);
  
}

function watchBandSelection() {

	$("ul.dropdown-content").on("click", "li", function() {

		var elem = this;
		searchTerm = $(this).text();
		
		$(".dropdown-content").hide();

		clearMarkers();  
		pageCount = 1;
		var year = searchYear;
		currArtistID = this.value;

		if(prevArtistElement !== undefined) {
			prevArtistElement.setAttribute("data-state", prevArtistElement.getAttribute("data-state") === "selected" ? "none" : "selected");
		}

		elem.setAttribute('data-state', elem.getAttribute('data-state') === 'selected' ? 'none' : 'selected');
		prevArtistElement = elem;

		getEventHistoryFromApi(currArtistID, year);

	});
}

function watchYearSelection() {

	$("ul.year-dropdown-content").on('click', "li", function(){

		var elem = this;
		var text = $(this).text();
		searchYear = $(this).val();

		clearMarkers();
		pageCount = 1;

		if(prevYearElement !== undefined) {
			prevYearElement.setAttribute("data-state", prevYearElement.getAttribute("data-state") === "selected" ? "none" : "selected");
		}
		
		elem.setAttribute('data-state', elem.getAttribute('data-state') === 'selected' ? 'none' : 'selected');
		prevYearElement = elem;

		$(".year-dropdown-content").hide();
		getEventHistoryFromApi(currArtistID, searchYear);

	});  
}

function watchSearch() {

	$('.search__input').keypress(function (e) {

		$(".search__error").css("visibility", "hidden");
		if (e.which == 13) {

			searchTerm = $(".search__input").val();
			
			if( searchTerm.length === 0 ) {

				$(".search__error").css("visibility", "visible");  
				return false;

			} else {
				
				clearMarkers();
				getArtist(searchTerm);
				populateYearDropdown();

				$(".search__input").blur().val('');

				return false; 
			}			
	
		}

	});

	$(".search__button").on('click', function() {

		$(".search__error").css("visibility", "hidden");
		searchTerm = $(".search__input").val();

		if( searchTerm.length === 0 ) {

			$(".search__error").css("visibility", "visible");  
			return false;

		} else {

			clearMarkers();
			getArtist(searchTerm);
			populateYearDropdown();

			$(".search__input").blur().val('');

			return false; 

		}

	})

}

function watchHover() {

	$(".band-select").on("mouseover", function() {
    	$(".dropdown-content").css("display", "flex");
  	});

	$(".band-select").on("mouseout", function() {
    	$(".dropdown-content").css("display", "none");
	  });
	  
	$(".year-select").on("mouseover", function() {
    	$(".year-dropdown-content").css("display", "flex");
  	});

	$(".year-select").on("mouseout", function() {
    	$(".year-dropdown-content").css("display", "none");
  	});
	
}

function checkDupilcates(collection, source) {

	var arr = [];
	var keys = Object.keys(source);

	// Filter array and remove the ones that do not have the keys from source.
	arr = collection.filter(function(obj) {

    	//Use the Array method every() instead of a for loop to check for every key from source.
    	return keys.every(function(key) {

      	// Check if the object has the property and the same value.
      		return obj.hasOwnProperty(key) && obj[key] === source[key];
    	});
  	});

	return arr.length;
	  
}

 $(document).ready(function() {

	watchSearch();
	watchBandSelection();
	watchYearSelection();
	watchHover();
	$('.preloader').hide();
	selectPin();

 });


 $(document).on({
	 ajaxStart: function() { $(".preloader").show();},
     ajaxStop: function() { $(".preloader").hide();}    
 });