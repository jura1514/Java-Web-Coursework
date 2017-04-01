package cmm529.cw.addon;

//AWS SDK
import com.amazonaws.auth.*;
import com.amazonaws.services.dynamodbv2.*;
import com.amazonaws.services.dynamodbv2.datamodeling.*;

public class DynamoDBUtil
{
private static AmazonDynamoDB awsClient=null;	//a reusable AWS client
private static DynamoDBMapper mapper=null;		//a reusable DynamoDBMapper

/**
* This method provides a handy way to get a <a href="http://docs.aws.amazon.com/AWSJavaSDK/latest/javadoc/com/amazonaws/services/dynamodbv2/datamodeling/DynamoDBMapper.html">DynamoDBMapper</a> object.
* The same object is reused in different requests.
* 
* @param regionCode		The AWS region to connect to.
* 						Valid values are defines in <a href="http://docs.aws.amazon.com/AWSJavaSDK/latest/javadoc/com/amazonaws/regions/Regions.html">com.amazonaws.regions.Regions</a>.
* 						If you want to connect to a local server, use <code>null</code>.
* @return	A DynamoDBMapper object for accessing DynamoDB.
*/
public static DynamoDBMapper getMapper()
{
if (DynamoDBUtil.mapper!=null)	//already has one
	return DynamoDBUtil.mapper;	//just return it to reuse

if (DynamoDBUtil.awsClient==null)	//no AWS client yet
	{
	AWSCredentials credentials = new DefaultAWSCredentialsProviderChain().getCredentials();	//create credentials
	DynamoDBUtil.awsClient=new AmazonDynamoDBClient(credentials);								//create AWS client
	
	DynamoDBUtil.awsClient.setEndpoint("http://localhost:8000");	//use local server
	

	}

DynamoDBUtil.mapper=new DynamoDBMapper(DynamoDBUtil.awsClient);	//create DynamoDBMapper
return DynamoDBUtil.mapper;
} //end method
} //end class
