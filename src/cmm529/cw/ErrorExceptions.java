package cmm529.cw;

@SuppressWarnings("serial")
public class ErrorExceptions extends Exception {
	String message;
	boolean error;
	public ErrorExceptions ( String message ) {
		super(message);
		this.message = message;
		this.error = true;
	}

	@Override
	public String toString() {
		// TODO Auto-generated method stub
		return this.message;
	}
	
}