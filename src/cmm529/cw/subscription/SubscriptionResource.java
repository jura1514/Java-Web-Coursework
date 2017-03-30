package cmm529.cw.subscription;

import javax.ws.rs.FormParam;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBMapper;

import cmm529.coursework.friend.model.Subscription;
import cmm529.coursework.friend.model.SubscriptionRequest;
import cmm529.coursework.friend.model.User;
import cmm529.cw.DynamoDBUtil;
import cmm529.cw.ErrorExceptions;

@Path("/subscription")
public class SubscriptionResource {
	
	@Path("/{subscriber}")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public Subscription getOneSubscripion(@PathParam("subscriber") String subscriber)
	{
	DynamoDBMapper mapper=DynamoDBUtil.getMapper();
	Subscription sub=mapper.load(Subscription.class,subscriber);

	return sub;
	}
	
	@POST
	@Produces(MediaType.TEXT_PLAIN)
	public Response addSubscription(	@FormParam("subscriber") String subscriber,
								@FormParam("subscribeTo") String subscribTo)
	{
	try	{
		String Subscriber;
		String SubscribTo;
		if ( subscriber.isEmpty() || subscribTo.isEmpty() ) {
			throw new ErrorExceptions("Subscriber and SubscribeTo must be defined");
		} else {
			Subscriber = subscriber;
			SubscribTo = subscribTo;
		}
		
		Subscription sub = new Subscription(Subscriber,SubscribTo);
		
		DynamoDBMapper mapper=DynamoDBUtil.getMapper();		
		mapper.save(sub);
		
		return Response.status(201).entity("Subscription approved").build();
		} catch (Exception e)
			{
			return Response.status(400).entity("error in approving subscription request").build();
			}
	}

}
