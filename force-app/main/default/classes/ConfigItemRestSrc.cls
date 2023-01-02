@RestResource( urlmapping = '/createConfigItem/*' )
global class ConfigItemRestSrc {
    
    @HttpPost
    global static void dopost(){
        RestRequest req = RestContext.request;
        Blob body = req.requestBody;
        String requestString = body.toString();
        List<Object> resObj = (List<Object>)JSON.deserializeUntyped(requestString);
        List<Simploud__Configuration_Item__c>configItems = new List<Simploud__Configuration_Item__c>();
        for( Object configItemObj : resObj ){
            Map<String, Object> configItemMap = (Map<String, Object>)configItemObj;
            Simploud__Configuration_Item__c config = new Simploud__Configuration_Item__c();
            config.Name = (String)configItemMap.get('Name');
            config.Simploud__Configuration_Area__c = (String)configItemMap.get('Area');
            config.Simploud__Type__c = (String)configItemMap.get('Type');
            config.Simploud__Description__c = (String)configItemMap.get('Des');
            configItems.add( config );
        }
       	insert configItems;
        
    }
    
}