package cmm529.cw.resource;

import javax.ws.rs.FormParam;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import com.amazonaws.services.dynamodbv2.*;
import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBMapper;
import com.amazonaws.services.dynamodbv2.transactions.TransactionManager;
import java.io.*;

import cmm529.coursework.friend.model.*;
import cmm529.cw.DynamoDBUtil;
import cmm529.cw.ErrorExceptions;


@Path("/user")
public class CourseworkServlet {
	
	@Path("/{id}")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public User getOneUser(@PathParam("id") String id)
	{
	DynamoDBMapper mapper=DynamoDBUtil.getMapper();
	User user=mapper.load(User.class,id);

	return user;
	}
	
	@POST
	@Produces(MediaType.TEXT_PLAIN)
	public Response addUser(	@FormParam("id") String name )
	{
	try	{
		long millis = System.currentTimeMillis();;
		String Name;
		if ( name.isEmpty() ) {
			throw new ErrorExceptions("Name must be defined");
		} else {
			Name = name;
		}
		
		User user = new User(Name,null,millis);
		
		DynamoDBMapper mapper=DynamoDBUtil.getMapper();		
		mapper.save(user);
		
		return Response.status(201).entity("user saved").build();
		} catch (Exception e)
			{
			return Response.status(400).entity("error in saving user").build();
			}
	}
	
	@Path("/{id}")
	@PUT
	@Produces(MediaType.TEXT_PLAIN)
	public Response UpdateUser(	@FormParam("id") String id,
								@FormParam("longitude") String longitude,
								@FormParam("latitude") String latitude)
	{
	try	{
		long millis = System.currentTimeMillis();;
		double Longitude;
		double Latitude;
		Location loc;
		
		if( latitude.isEmpty() || longitude.isEmpty() )
		{
			throw new ErrorExceptions("Latitude and Longitude must be defined");
		}
		else
		{
			Longitude = Double.parseDouble(longitude);
			Latitude = Double.parseDouble(latitude);
			
			loc = new Location(Longitude, Latitude);
		}
		DynamoDBMapper mapper=DynamoDBUtil.getMapper();		
		
		User user=mapper.load(User.class,id);
		
		if (user == null )
		{
			throw new ErrorExceptions("Unable to find specified user");
		} 
		else 
		{
			user.setLocation(loc);
			user.setLastUpdated(millis);
		}
		
		mapper.save(user);
		
		return Response.status(201).entity("user saved").build();
		} catch (Exception e)
			{
			return Response.status(400).entity("error in saving user").build();
			}
	}
	
}
