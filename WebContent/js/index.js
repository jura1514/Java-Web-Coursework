//API keys
var openWeatherAPIKey="AIzaSyCaSA7xWB3RTe30NxoeTnY3eD4e1EQOJPs";
var baseURL="api";
var loggedUser;

var markers = [];
var markerUser;
var map;


//the document ready function
try	{
	$(function()
		{
		init();
		}
	);
	} catch (e)
		{
		alert("*** jQuery not loaded. ***");
		}

//
// Initialise page.
//
function init()
{
refreshMap();

$("#checkIn").click(function()
		{
			if( loggedUser )
			{
				if( ( $("#longitude").val().length > 0 ) && ( $("#latitude").val().length > 0 ) )
				{
					if( ($.isNumeric($("#longitude").val())) && ($.isNumeric($("#latitude").val())) )
						{					
							updateUser(markerUser.getPosition());
						}
					else
						{
							alert("Latitude and longitude should be numeric !");
						}
				}
				else
				{
					alert("Enter latitude and longitude!");
				}
			}
			else
			{
				alert("Log in first!");
			}
		}
	);

$("#logIn").click(function()
		{
			if( $("#myId").val().length > 0)
				{
					$( ".panel-body" ).empty();
					
					getUser().then(function(response) {
						  if (response) {
							  saveUser();
						  } else {
							  var user = true;
							  refreshMap();
							  refreshUserData()
							  getUserLocation(loggedUser,map,user);
						  }
						}).catch(function(e) {
						  console.error('Error!');
						  console.error(e);
						});
				}
			else
				{
					alert("Enter your ID!")
				}
		}
	);

$("#sendReq").click(function()
		{
			if( loggedUser )
			{
				if( ( $("#request").val().length > 0 ) )
				{
					getRequest().then(function(response) {
						  if (response) {
							  saveRequest();
						  } else {
						  }
						}).catch(function(e) {
						  console.error('Error!');
						  console.error(e);
						});
				}
				else
				{
					alert("Enter for whom to send request!");
				}
			}
			else
			{
				alert("Log in first!");
			}
		}
	);

$("#refreshRequests").click(function()
		{
			if( loggedUser )
			{
				populateRequests();
			}
			else
			{
				alert("Log in first!");
			}
		}
	);

$("#refreshSubscriptions").click(function()
		{
			if( loggedUser )
			{
				populateSubscribers(map);
			}
			else
			{
				alert("Log in first!");
			}
		}
	);

$("#denyRequest").click(function()
		{
		var selectedReqs = $('#requests input:checked').map(function() {
		    return this.id;
		}).toArray();
		
		var arrayLength = selectedReqs.length;
		
		if( arrayLength == 0 )
			{
				alert("Select request!");
			}
		else
			{
				for( var i=0; i<arrayLength; i++ )
					{
						deleteRequest(selectedReqs[i]);
					}
			}
	
		}
	);
$("#approveRequest").click(function()
		{
		var selectedReqs = $('#requests input:checked').map(function() {
		    return this.id;
		}).toArray();
		
		var arrayLength = selectedReqs.length;
		
		if( arrayLength > 0 )
			{
				for( var i=0; i<arrayLength; i++ )
				{
					(function(counter) {
						getSubscription(selectedReqs[counter]).then(function(response) {
							  if (response) {
								  approveSubscription(selectedReqs[counter]);
							  } else {
							  }
							}).catch(function(e) {
							  console.error('Error!');
							  console.error(e);
							});
					}(i));
				}
			}
		else
			{
				alert("Select request!");
			}
		}
	);

}

function refreshMap()
{
  map=makeMap("map",1,0.0,0.0);	//make Google map
  markerUser=makeMarker(map,0.0,0.0);	//make marker on map, keeping reference	
}

function refreshUserData()
{
	$("#requests").empty();
	$("#subscriptions").empty();
	
    document.getElementById("latitude").value = "";
    document.getElementById("longitude").value = "";
}

function getSubscription(id)
{

var url=baseURL+"/subscription/"+id;

return new Promise(function(resolve, reject) {
    $.getJSON(url, function(jsonData) {
      if ( !jsonData ) {
        resolve(true);
      } else {
  		alert("Subscription for: "+id+" already exist! Please deny! ");
        resolve(false);
      }
    }).fail(reject);
  });
}

function approveSubscription(id)
{
	
var requestName=$("#request").val();
var url=baseURL+"/subscription";
var data={	"subscriber":id,
			"subscribeTo": loggedUser
		}

$.post(	url,
		data,
		function()	
		{
		alert("Request for : "+id+" approved! ");
		$("#"+id ).remove();
		deleteRequest(id);
		}
	);
}

function deleteRequest(id)
{
var selectedId = id;
$("#"+id ).remove();
	
var url=baseURL+"/request/"+loggedUser+"/"+selectedId;
var settings={type:"DELETE"};

$.ajax(url,settings);
}

function getRequest()
{
var requestName=$("#request").val();
var url=baseURL+"/request/"+requestName+"/"+loggedUser;

return new Promise(function(resolve, reject) {
    $.getJSON(url, function(jsonData) {
      if ( !jsonData ) {
        resolve(true);
      } else {
  		alert("You already requested this user: "+jsonData["subscribeTo"]+" ");
        resolve(false);
      }
    }).fail(reject);
  });
}

function saveRequest()
{
var requestName=$("#request").val();
var url=baseURL+"/request";
var data={	"subscriberId":loggedUser,
			"subscriberTo": requestName

		}

$.post(	url,
		data,
		function()	
		{
		alert("Request sent to: "+requestName+" ");
		}
	);
}

function getUser()
{
var name=$("#myId").val();
var url=baseURL+"/user/"+name;

return new Promise(function(resolve, reject) {
    $.getJSON(url, function(jsonData) {
      if ( !jsonData ) {
        resolve(true);
      } else {
        loggedUser=jsonData["id"];
  		$( ".panel-body" ).append( "User: " +loggedUser+"" )
  		alert("User Logged In: "+jsonData["id"]+" ");
  		
        resolve(false);
      }
    }).fail(reject);
  });
}

function saveUser()
{
var name=$("#myId").val();
loggedUser = name;
var url=baseURL+"/user";
var data={	"id":name
		};

$.post(	url,
		data,
		function()	
		{
		alert("User saved: "+name+" ");
		$( ".panel-body" ).append( "User: " +loggedUser+"" );
		}
	);
}

function populateRequests()
{
var url=baseURL+"/request/"+loggedUser;

$.getJSON(url,
		function(requests)
		{
		$("#requests").empty();
		if( !requests )
		{
			var htmlCode="<li>No incoming requests</li>";
			$("#requests").append(htmlCode);
		}
		else
		{
			for (var i in requests)
			{
					var req=requests[i];
					var subscriberTo=req["subscribeTo"];
					var subscriberId=req["subscriberId"];
					var timeStamp = req["timeStamp"];
					var time = new Date(timeStamp);
					var date = new Date(time);
					
					var htmlCode="<div id="+subscriberId+" class='checkbox'><label class='checkbox-inline'><input id="+subscriberId+" type='checkbox'>"+subscriberId+" (requested at:"+date+")</label></div>";

					$("#requests").append(htmlCode);
			}
		}
		}
	);
}

function populateSubscribers(map)
{
var url=baseURL+"/user/subscribedto/"+loggedUser;

$.getJSON(url,
		function(users)
		{
		$("#subscriptions").empty();
			if( !users )
			{
				var htmlCode="<li>No Friend(s) subscribed</li>";
				$("#subscriptions").append(htmlCode);
			}
			else
			{
				for (var i in users)
				{
						var user=users[i];
						var id=user["id"];
						
						var timeStamp = user["lastUpdated"];
						var time = new Date(timeStamp);
						var date = new Date(time);
						
						var htmlCode="<div id="+id+" class='radio'><label><input id="+id+" type='radio' name='optradio'>"+id+" (requested at:"+date+")</label></div>";
	
						$("#subscriptions").append(htmlCode);
						
				}
						var IDs = [];
						$("#subscriptions").find("input").each(function(){ IDs.push(this.id); });
						
						var arrayLength = IDs.length;
						for( var i = 0; i < arrayLength; i++)
						{
							var user = false;
							getUserLocation(IDs[i],map,user);
						}
										
						$("#subscriptions input[name='optradio']").click(function()
						{
							var markersLenght = markers.length;
							for( var k = 0; k < markersLenght; k++)
								{
									if( $(this).attr("id") == markers[k].getTitle())
										{
											map.panTo(markers[k].getPosition());
											map.setZoom(8);

										}
								}
						}
				);
			}
		}
	);
}

function addMarker(latitude,longitude, map, id) {

	var location=new google.maps.LatLng(latitude,longitude);	//create location from coordinates
	var marker=new google.maps.Marker({	"position":location,	//mark options as a map
										"map":map,
										"title": id,
										"label": id });
	
	return marker;
}

function getUserLocation(id,map,user)
{

var url=baseURL+"/user/location/"+id;

$.getJSON(	url,
		function(jsonData)
		{	
		if( !jsonData )
			{
			alert("This user haven't checked in yet!")
			}
		else
			{
			var latitude = jsonData["latitude"];
			var longitude = jsonData["longitude"];
			
			var latv=parseFloat(latitude);
			var lonv=parseFloat(longitude);

			if( user == false )
				{
					var marker = addMarker(latv,lonv,map,id);
					markers.push(marker);
				}
			else
				{
					var location=new google.maps.LatLng(latv,lonv);
					markerUser.setPosition(location);
				}
			}
		}
	);
}

function updateUser(position)
{
var longitude=position.lng();
var latitude=position.lat();
//var longitude=$("#longitude").val();
//var latitude=$("#latitude").val();

var name=$("#myId").val();

var url=baseURL+"/user/"+name;
var data={	"id":name,
			"longitude":longitude,
			"latitude":latitude
		};

$.ajax({
	url : url,
	method : "PUT",
	data : data,
	success : function (r) {
		if ( r.error ) {
			alert(r.message);
		} else {
			alert("Location set to:"+name+", Cardinates:"+longitude+", "+latitude+"");
		}
	}
});
}


//
//create Google Map in a given division, given its centre coordinates
//the map is returned as it is need to place the marker
//
function makeMap(divId,zoom,longitude,latitude)
{
var location=new google.maps.LatLng(latitude,longitude);	//create location from coordinates
var options={zoom:zoom,		//map options as a map
			center:location,
			mapTypeId:google.maps.MapTypeId.HYBRID};
var map=new google.maps.Map(document.getElementById(divId),options);	//create map in the given section or div
return map;	//return map object
} //end function

//
//create a marker on a map
//the marker is returned as we need to get its position later
//
function makeMarker(map,longitude,latitude)
{
var location=new google.maps.LatLng(latitude,longitude);	//create location from coordinates
var marker=new google.maps.Marker({	"position":location,	//mark options as a map
									"map":map,
									"icon":'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png',
									"draggable":true});

google.maps.event.addListener(marker, 'click', function (event) {
    document.getElementById("latitude").value = event.latLng.lat();
    document.getElementById("longitude").value = event.latLng.lng();
});

google.maps.event.addListener(marker, 'click', function (event) {
    document.getElementById("latitude").value = this.getPosition().lat();
    document.getElementById("longitude").value = this.getPosition().lng();
});

google.maps.event.addListener(marker, 'dragend', function (event) {
    document.getElementById("latitude").value = this.getPosition().lat();
    document.getElementById("longitude").value = this.getPosition().lng();
});

return marker;	//return marker object
} //end function
