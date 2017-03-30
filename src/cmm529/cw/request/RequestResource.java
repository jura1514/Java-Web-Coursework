package cmm529.cw.request;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.ws.rs.DELETE;
import javax.ws.rs.FormParam;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBMapper;
import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBQueryExpression;
import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBScanExpression;
import com.amazonaws.services.dynamodbv2.model.AttributeValue;

import cmm529.coursework.friend.model.SubscriptionRequest;
import cmm529.cw.DynamoDBUtil;
import cmm529.cw.ErrorExceptions;

@Path("/request")
public class RequestResource {
	
	@Path("/{subscriberTo}/{subscriberId}")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public SubscriptionRequest getOneRequest(@PathParam("subscriberTo") String subscriberTo,
											@PathParam("subscriberId") String subscriber)
	{
	DynamoDBMapper mapper=DynamoDBUtil.getMapper();	
    SubscriptionRequest request = null;
	Map<String, AttributeValue> eav = new HashMap<String, AttributeValue>();
    eav.put(":val1", new AttributeValue().withS(subscriberTo));
    eav.put(":val2", new AttributeValue().withS(subscriber));

    DynamoDBQueryExpression<SubscriptionRequest> queryExpression = new DynamoDBQueryExpression<SubscriptionRequest>()
                             .withKeyConditionExpression("subscribeTo = :val1 and subscriber = :val2")
                             .withExpressionAttributeValues(eav);

    List<SubscriptionRequest> listOfRequests = mapper.query(SubscriptionRequest.class, queryExpression);

    if(listOfRequests.size() > 0){
    	request = listOfRequests.get(0);
     }
	
	return request;
	}
	
	@Path("/{subscriberId}")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public Collection<SubscriptionRequest> getAllRequests(@PathParam("subscriberId") String subscriber)
	{
		List<SubscriptionRequest> sortedListOfRequests =  new ArrayList<SubscriptionRequest>();
		DynamoDBMapper mapper=DynamoDBUtil.getMapper();	
		DynamoDBScanExpression scanExpression=new DynamoDBScanExpression();	//create scan expression
		List<SubscriptionRequest> listOfRequests=mapper.scan(SubscriptionRequest.class, scanExpression);
		
		if( listOfRequests.size() > 0 )
		{
			for( int i = 0; i < listOfRequests.size(); i++ )
			{
				if( listOfRequests.get(i).getSubscribeTo().compareTo(subscriber) == 0 )
				{
					SubscriptionRequest Req = listOfRequests.get(i);
					sortedListOfRequests.add(Req);
				}
			}
		}
	    
	    return sortedListOfRequests;
	}
	
	@POST
	@Produces(MediaType.TEXT_PLAIN)
	public Response addRequest(	@FormParam("subscriberId") String subscriber,
								@FormParam("subscriberTo") String subscribTo)
	{
	try	{
		long millis = System.currentTimeMillis();
		String Subscriber;
		String SubscribTo;
		if ( subscriber.isEmpty() || subscribTo.isEmpty() ) {
			throw new ErrorExceptions("Subscriber and SubscribeTo must be defined");
		} else {
			Subscriber = subscriber;
			SubscribTo = subscribTo;
		}
		
		SubscriptionRequest request = new SubscriptionRequest(Subscriber,SubscribTo,millis);
		
		DynamoDBMapper mapper=DynamoDBUtil.getMapper();		
		mapper.save(request);
		
		return Response.status(201).entity("Subscription request sent").build();
		} catch (Exception e)
			{
			return Response.status(400).entity("error in sending subscription request").build();
			}
	}
	
	@Path("/{subscriberTo}/{subscriberId}")
	@DELETE
	public Response deleteOneRequest(@PathParam("subscriberTo") String subscriberTo,
									 @PathParam("subscriberId") String subscriber)
	{
		DynamoDBMapper mapper=DynamoDBUtil.getMapper();	
	    SubscriptionRequest request = null;
		Map<String, AttributeValue> eav = new HashMap<String, AttributeValue>();
	    eav.put(":val1", new AttributeValue().withS(subscriberTo));
	    eav.put(":val2", new AttributeValue().withS(subscriber));
	
	    DynamoDBQueryExpression<SubscriptionRequest> queryExpression = new DynamoDBQueryExpression<SubscriptionRequest>()
	                             .withKeyConditionExpression("subscribeTo = :val1 and subscriber = :val2")
	                             .withExpressionAttributeValues(eav);
	
	    List<SubscriptionRequest> listOfRequests = mapper.query(SubscriptionRequest.class, queryExpression);
	
	    if(listOfRequests.size() > 0){
	    	request = listOfRequests.get(0);
	     }

	    mapper.delete(request);
	    return Response.status(200).entity("deleted").build();
	}
	
}
