public class ServerCallout implements HttpCalloutMock {
    public static HttpResponse respond( HttpRequest req ){
        HttpResponse res = new HttpResponse();
        res.setStatus('200');      
        return res;
    } 
}