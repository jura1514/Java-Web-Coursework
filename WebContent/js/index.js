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

$("#refreshRequests").click(function()
		{
			populateRequests();
		}
	);
$("#denyRequest").click(function()
		{
		var selectedReqs = $('#requests input:checked').map(function() {
		    return this.id;
		}).toArray();
		
		var arrayLength = selectedReqs.length;
		
		if( !selectedReqs )
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
