//API keys
var openWeatherAPIKey="AIzaSyCaSA7xWB3RTe30NxoeTnY3eD4e1EQOJPs";
var baseURL="api";
var loggedUser;

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
var map=makeMap("map",1,0.0,0.0);	//make Google map
var marker=makeMarker(map,0.0,0.0);	//make marker on map, keeping reference

$("#checkIn").click(function()
		{
		  updateUser();
		}
	);

$("#logIn").click(function()
		{
			$( ".panel-body" ).empty();
			
			getUser().then(function(response) {
				  if (response) {
					  saveUser();
				  } else {
				  }
				}).catch(function(e) {
				  console.error('Error!');
				  console.error(e);
				});
		}
	);

$("#sendReq").click(function()
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
	);

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

function updateUser()
{
//var longitude=position.lng();
//var latitude=position.lat();
var longitude=$("#longitude").val();
var latitude=$("#latitude").val();

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
									"draggable":true});
return marker;	//return marker object
} //end function
