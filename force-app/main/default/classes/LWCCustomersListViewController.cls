public with sharing class LWCCustomersListViewController {
    public LWCCustomersListViewController() {

    }
    // @AuraEnabled(cacheable=true)
    // public static List<Account> recordStatusAccording(){
    //     List<Account> Ac = [SELECT Name,Simploud__Status__c FROM Account];

    //     return 
    // }

    @AuraEnabled(cacheable=true)
    public static List<Account> getLastModifiedConfig(){
        
            return [Select id,lastmodifiedDate,(SELECT lastmodifiedDate FROM Simploud__Configuration_Items__r WHERE Simploud__Status__c != 'Closed' order by lastmodifiedDate desc limit 1) from account];
        
    }
    @AuraEnabled
    public static void createBackup( String userName, String password, String sToken, String orgId, string accId,String accName ){
        Account acc = [SELECT Simploud_Customer_Username__c, Simploud_Customer_Password__c, 
                       Simploud_Customer_Security_Token__c, Sandbox_Org_ID__c,CustomerProductionName__c,
                       CustomerProduction__c,CustomerProductionSecurtiy__c 
                       FROM Account WHERE Id = :accId ];
        
        AWS_Server_EndPoint__c aws=[select EndPoint__c from AWS_Server_EndPoint__c limit 1];

        String pass=getDecodedPassword(password);
        System.debug(pass);
        
        String token=getDecodedPassword(sToken);
        System.debug(token);
        
        String prodToken=getDecodedPassword(acc.CustomerProductionSecurtiy__c);
        System.debug(prodToken);
        
        String prodPass=getDecodedPassword(acc.CustomerProduction__c);
        System.debug(prodPass);

        String resBody = '{"userName":"'+userName+'", "sToken":"'+token+'", "password":"'+pass+'", "orgId":"'+orgId+'", "accId":"'+accId+'","CustProductionUserName":"'+acc.CustomerProductionName__c+'","custPRoductionPassword":"'+prodPass+'","custProductionSecurtiy":"'+prodToken+'","accountName":"'+accName+'"}';
        Http h = new Http();
        HttpRequest req = new HttpRequest();
        // req.setEndpoint('https://b73a-103-118-168-153.in.ngrok.io'+'/backupData');
        //req.setEndpoint('https://2799-103-118-168-153.in.ngrok.io'+'/backupData');
        req.setEndpoint(aws.EndPoint__c+'/backupData');
        req.setHeader('Content-Type', 'application/json');
        req.setBody(resBody);
        req.setMethod('POST');
        HttpResponse res = h.send(req);
        
        System.debug(res.getBody());
    }
    @AuraEnabled
    public static string getStatus(){
        try {
            AWS_Server_EndPoint__c aws=[select EndPoint__c from AWS_Server_EndPoint__c limit 1];
            Http h = new Http();
            HttpRequest req = new HttpRequest();
            //  req.setEndpoint('https://b73a-103-118-168-153.in.ngrok.io'+'/getStatus');
            // req.setEndpoint('https://2799-103-118-168-153.in.ngrok.io'+'/getStatus');
            req.setEndpoint(aws.EndPoint__c+'/getStatus');
            req.setMethod('GET');
            HttpResponse res = h.send(req);
            return res.getBody(); 
        } catch (Exception e) {
            System.debug(e);
            return ''+e;
        }
    }
    @AuraEnabled
    public static void compareData(String objUsed, String configArea, Id accId,List<String> relatedObj,String FieldValue){
        AWS_Server_EndPoint__c aws=[select EndPoint__c from AWS_Server_EndPoint__c limit 1];
        System.debug(aws.EndPoint__c);
        Account acc = [SELECT Simploud_Customer_Username__c, Simploud_Customer_Password__c, 
                       Simploud_Customer_Security_Token__c, Sandbox_Org_ID__c,CustomerProductionName__c,
                       CustomerProduction__c,CustomerProductionSecurtiy__c 
                       FROM Account WHERE Id = :accId ];
        system.debug(objUsed+'Object used --------->');  
        
        
        String pass=getDecodedPassword(acc.Simploud_Customer_Password__c);
        System.debug(pass);
        
        String token=getDecodedPassword(acc.Simploud_Customer_Security_Token__c);
        System.debug(token);
        
        String prodToken=getDecodedPassword(acc.CustomerProductionSecurtiy__c);
        System.debug(prodToken);
        
        String prodPass=getDecodedPassword(acc.CustomerProduction__c);
        System.debug(prodPass);
        

        String resBody = '{"userName":"'+acc.Simploud_Customer_Username__c+'", "sToken":"'+token+'", "password":"'+pass+'", "sandboxId":"'+acc.Sandbox_Org_ID__c+'","objUsed":"'+objUsed+'","CustProductionUserName":"'+acc.CustomerProductionName__c+'","custPRoductionPassword":"'+prodPass+'","custProductionSecurtiy":"'+prodToken+'","Deploy":"'+configArea+'","relatedObj":'+JSON.serialize(relatedObj);

        String method='/compareData';

        if( FieldValue == 'Complaince Configuration' ){

            method='/compareCompliance';

            //sObject sobj = Schema.getGlobalDescribe().get('Simploud__Compliance_Configuration__c').newSObject();
            String allFieldName = '';
            Map<String, Schema.SobjectField> allMap = Schema.SobjectType.Simploud__Compliance_Configuration__c.fields.getMap();
            for(Schema.SobjectField field : allMap.values())
            {
                
                Schema.DescribeFieldResult dfr = field.getDescribe();
                if(dfr.isCreateable() && dfr.isUpdateable())
                    allFieldName+=dfr.getName()+',';
            
            }
            if( allFieldName.length() > 0 ){
                allFieldName = allFieldName.substring( 0, allFieldName.length()-1 );
            }
            resBody += ', "ccFields":"'+allFieldName+'"';
        }

        resBody+='}';

        System.debug(resBody);
        Http h = new Http();
        HttpRequest req = new HttpRequest();
        // req.setEndpoint('https://2799-103-118-168-153.in.ngrok.io'+method);
        // req.setEndpoint('https://b73a-103-118-168-153.in.ngrok.io'+method);
        req.setEndpoint(aws.EndPoint__c+method);
        req.setHeader('Content-Type', 'application/json');
        req.setBody(resBody);
        req.setMethod('POST');
        h.send(req);
    }
    @AuraEnabled
    public static string getDecodedPassword(String encoded){
        try {
            
            String algorithmName = 'AES256';
            string keyValue = 'SIMPLWEBHOOKSP'+UserInfo.getOrganizationId();
            Blob pvtKey = Blob.valueOf(keyValue);
            Blob decodePassword = EncodingUtil.base64Decode( encoded );
            Blob iv = Blob.valueOf(UserInfo.getOrganizationId().substring(0,16));
            Blob decrpb = Crypto.decrypt(algorithmName, pvtKey, iv, decodePassword );
            String pass = decrpb.tostring();
            System.debug(pass);
            return pass;

        } catch (Exception e) {
            System.debug(e);
            return ''+e;
        }
    }

    @AuraEnabled
    public static void getSourceTargets( String objUsed, Id accId,List<String> relatedObj){
        System.debug('Logged in');
        Account acc = [SELECT Simploud_Customer_Username__c, Simploud_Customer_Password__c, 
                       Simploud_Customer_Security_Token__c, Sandbox_Org_ID__c,CustomerProductionName__c,
                       CustomerProduction__c,CustomerProductionSecurtiy__c 
                       FROM Account WHERE Id = :accId ];            
        String pass=getDecodedPassword(acc.Simploud_Customer_Password__c);
        System.debug(pass);
        
        String token=getDecodedPassword(acc.Simploud_Customer_Security_Token__c);
        System.debug(token);
        
        String prodToken=getDecodedPassword(acc.CustomerProductionSecurtiy__c);
        System.debug(prodToken);
        
        String prodPass=getDecodedPassword(acc.CustomerProduction__c);
        System.debug(prodPass);

        String resBody = '{"userName":"'+acc.Simploud_Customer_Username__c+'", "sToken":"'+token+'", "password":"'+pass+'", "sandboxId":"'+acc.Sandbox_Org_ID__c+'","objUsed":"'+objUsed+'","CustProductionUserName":"'+acc.CustomerProductionName__c+'","custPRoductionPassword":"'+prodPass+'","custProductionSecurtiy":"'+prodToken+'","relatedObj":'+JSON.serialize(relatedObj);

        String allFieldName = '';
        Map<String, Schema.SobjectField> allMap = Schema.SobjectType.Simploud__Compliance_Configuration__c.fields.getMap();
        for(Schema.SobjectField field : allMap.values())
        {
            Schema.DescribeFieldResult dfr = field.getDescribe();
            if(dfr.isCreateable() && dfr.isUpdateable())
                allFieldName+=dfr.getName()+',';
        }
        if( allFieldName.length() > 0 ){
            allFieldName = allFieldName.substring( 0, allFieldName.length()-1 );
        }
        resBody += ', "ccFields":"'+allFieldName+'"}';
        

        System.debug( resBody );
        AWS_Server_EndPoint__c aws=[select EndPoint__c from AWS_Server_EndPoint__c limit 1];
        System.debug( aws.EndPoint__c );
        Http h = new Http();
        HttpRequest req = new HttpRequest();
        // req.setEndpoint('https://b73a-103-118-168-153.in.ngrok.io'+'/getSourceTargets');
        //req.setEndpoint('https://2799-103-118-168-153.in.ngrok.io'+'/getSourceTargets');
        req.setEndpoint(aws.EndPoint__c+'/getSourceTargets');
        req.setHeader('Content-Type', 'application/json');
        req.setBody(resBody);
        req.setMethod('POST');
        HttpResponse res = h.send(req);
        System.debug(res.getBody());
    }
    @AuraEnabled
    public static void deployAll( String objUsed, Id accId,string FieldValue, List<String> GroupsNames,List<String> Profiles,String entire,list<String> relatedObj){
        Account acc = [SELECT Simploud_Customer_Username__c, Simploud_Customer_Password__c,
                       Simploud_Customer_Security_Token__c, Sandbox_Org_ID__c,CustomerProductionName__c,
                       CustomerProduction__c,CustomerProductionSecurtiy__c
                       FROM Account WHERE Id = :accId ];
        system.debug(objUsed+'Object used --------->');
        String pass=getDecodedPassword(acc.Simploud_Customer_Password__c);
        System.debug(pass);
        String token=getDecodedPassword(acc.Simploud_Customer_Security_Token__c);
        System.debug(token);
        String prodToken=getDecodedPassword(acc.CustomerProductionSecurtiy__c);
        System.debug(prodToken);
        String prodPass=getDecodedPassword(acc.CustomerProduction__c);
        System.debug(prodPass);
        String resBody = '{"userName":"'+acc.Simploud_Customer_Username__c+'", "sToken":"'+token+'", "password":"'+pass+'", "sandboxId":"'+acc.Sandbox_Org_ID__c+'","objUsed":"'+objUsed+'","CustProductionUserName":"'+acc.CustomerProductionName__c+'","custPRoductionPassword":"'+prodPass+'","custProductionSecurtiy":"'+prodToken+'","Deploy":"'+FieldValue+'","relatedObj":'+JSON.serialize(relatedObj);
        System.debug('GNames:'+GroupsNames);
        if( GroupsNames != null && GroupsNames.size() > 0 ){
            resBody+=',"GroupsNames":"'+GroupsNames+'"';
            resBody = resBody.replace( '(', '[' );
            resBody = resBody.replace( ')', ']' );
        }if ( Profiles!=null && Profiles.size() > 0){
            resBody+=',"Profiles":"'+Profiles+'"';
            resBody = resBody.replace( '(', '[' );
            resBody = resBody.replace( ')', ']' );
        }if(entire!=null && entire!=''){
            resBody+=',"Entire":'+entire+'';
            resBody = resBody.replace( '(', '[' );
            resBody = resBody.replace( ')', ']' );
        }
        //sObject sobj = Schema.getGlobalDescribe().get('Simploud__Compliance_Configuration__c').newSObject();
        String allFieldName = '';
        Map<String, Schema.SobjectField> allMap = Schema.SobjectType.Simploud__Compliance_Configuration__c.fields.getMap();
        for(Schema.SobjectField field : allMap.values())
        {
            Schema.DescribeFieldResult dfr = field.getDescribe();
            if(dfr.isCreateable() && dfr.isUpdateable())
                allFieldName+=dfr.getName()+',';
        }
        if( allFieldName.length() > 0 ){
            allFieldName = allFieldName.substring( 0, allFieldName.length()-1 );
        }
        resBody += ', "ccFields":"'+allFieldName+'"';
        resBody+='}';
        System.debug( resBody );
        AWS_Server_EndPoint__c aws=[select EndPoint__c from AWS_Server_EndPoint__c limit 1];
        System.debug( aws.EndPoint__c );
        Http h = new Http();
        HttpRequest req = new HttpRequest();
        if( FieldValue == 'Complaince Configuration' || FieldValue == 'FinalComplainceConfiguration' ){
            //  req.setEndpoint('https://b73a-103-118-168-153.in.ngrok.io'+'/deployCompliance');
            // req.setEndpoint('https://2799-103-118-168-153.in.ngrok.io'+'/deployCompliance');
           req.setEndpoint(aws.EndPoint__c+'/deployCompliance');
        }else{
            //  req.setEndpoint('https://b73a-103-118-168-153.in.ngrok.io'+'/deployData');
            // req.setEndpoint('https://2799-103-118-168-153.in.ngrok.io'+'/deployData');
            req.setEndpoint(aws.EndPoint__c+'/deployData');
        }
        req.setHeader('Content-Type', 'application/json');
        req.setBody(resBody);
        req.setMethod('POST');
        HttpResponse res = h.send(req);
        System.debug(res.getBody());
    }
    @AuraEnabled(cacheable=true)
    public static List<Account> getAllCustomers(){
        
            return [SELECT Name, Type, Customer_Rating__c, Simploud__Status__c, 
                    (SELECT Id, Name, Simploud__Status__c FROM Simploud__Configuration_Items__r 
                    WHERE Simploud__Status__c = 'On Hold' or Simploud__Status__c = 'Opened' or 
                    Simploud__Status__c = 'In Development'  ),
                    Country__r.Name,Country__r.Simploud__Flag__c,createddate,lastModifiedDate,
                    Simploud_Customer_Username__c, Simploud_Customer_Password__c, Simploud_Customer_Security_Token__c,
                    Sandbox_Org_ID__c FROM Account];
        
    }

    @AuraEnabled
    public static List<Simploud__Account_Item__c> getAccountItem( Id accId ){
        return [SELECT Contact__r.Name, CreatedDate, Call_Duration_minutes__c, Comments__c,Owner.Name	FROM Simploud__Account_Item__c WHERE Simploud__Account__c = :accId order by createddate desc];
    }
    @AuraEnabled
    public static Account getCustomer(Id customerId){
        try {
            return [SELECT Name, Type, Customer_Rating__c, Simploud__Status__c FROM Account WHERE Id =: customerId Limit 1];
        } catch (Exception e) {System.debug(e);
            return new Account();
        }
    }

    @AuraEnabled
    public static List<Simploud__Configuration_Item__c> getAllCustomerRelatedConfigItem(Id customerId){
        try {
            Account cust = [SELECT Id, (SELECT Id, Name,Simploud__Production_Issue__c,Simploud__Configuration_Area__c,Simploud__Status__c,Simploud__Item_No__c,CreatedBy.Name,createdDate,Owner.Name FROM Simploud__Configuration_Items__r where Simploud__Status__c = 'Opened' OR Simploud__Status__c = 'In Development' OR  Simploud__Status__c = 'On Hold' order by createddate desc ) FROM Account WHERE Id =: customerId Limit 1];
            
            if(cust.Simploud__Configuration_Items__r.size() > 0) {
                return cust.Simploud__Configuration_Items__r;
            } else {
                return new List<Simploud__Configuration_Item__c>();
            }
        } catch (Exception e) {System.debug(e);
            return new List<Simploud__Configuration_Item__c>();
        }
    }

    @AuraEnabled
    public static List<sObject> search(String searchTerm) {
        String name='%'+searchTerm+'%';
        return [select Name,Id from User where Name like :name And IsActive = true];
    }

    @AuraEnabled
    public static string getUserName(Id configItemID){
        try {
            Simploud__Configuration_Item__c configItem = [SELECT ownerId FROM Simploud__Configuration_Item__c WHERE Id =: configItemID];

            User selectedUser = [SELECT Name FROM User WHERE Id =: configItem.ownerId];
            if(selectedUser.Name != '' || selectedUser.Name != null) {
                return selectedUser.Name;
            } else {return 'No owner user found';}
        } catch (Exception e) {System.debug(e);
            return '';
        }
    }

    @AuraEnabled
    public static string changeConfigItemOwner(String ownerId, Id configItemID){
        try {			
            Simploud__Configuration_Item__c configItem = [select name,ownerId from Simploud__Configuration_Item__c where id = :configItemID];
            configItem.ownerId = ownerId;
 			update configItem;
    		return 'Owner Changed';
        } catch (Exception e) {
            System.debug(e);
            return '';
        }
    }
    
    @AuraEnabled
    public static List<Simploud__Project__c> getProject(String CustomerId)
    {
        try {
            List<Simploud__Project__c> proj = [SELECT Id,Object_in_Use__c,Configuration_Version__c, Name,Simploud__Status__c,createdDate FROM Simploud__Project__c where Customer__c = :CustomerId ];

            system.debug('project list'+proj);
            	if(proj.size() > 0) 
                {
                	return proj;
            	} 
            	else 
                {
                	return new List<Simploud__Project__c>();
            	}
        	}
        catch(Exception e)
        {
            System.debug(e);
            return new List<Simploud__Project__c>();
        }
    }
    
    @AuraEnabled(cacheable=true)
    public static Organization getTimeZone()
    {
            	return [SELECT Id, TimeZoneSidKey FROM Organization];
        	
    }
    
    @AuraEnabled
    public static Simploud__Configuration_Item__c getLastUserWhoContacted(String acId)
    {
        try {
            	return [Select CreatedBy.Name from Simploud__Configuration_Item__c where Simploud__Customer__c=:acId order by lastModifiedDate desc limit 1];
        	}
        catch(Exception e)
        {
            System.debug(e);
            return new Simploud__Configuration_Item__c();
        }
    }
    
    @AuraEnabled
    public static contact getLastCustomerContact(String acId)
    {
        try {
            	return [Select Name from Contact where accountId=:acId order by lastmodifieddate desc limit 1];
        	}
        catch(Exception e)
        {
            System.debug(e);
            return new contact();
        }
    }
    
    @AuraEnabled
 	public static List<sObject> getCycleTime(String acId)
    {
        try {
            	return [select Sum(Simploud__Cycle_Time__c),count(Simploud__Cycle_Time__c) from simploud__configuration_item__c where Simploud__Customer__c=:acId AND Simploud__Status__c = 'Closed'];
        	}
        catch(Exception e)
        {
            System.debug(e);
            return new List<sObject>();
        }
    }
}