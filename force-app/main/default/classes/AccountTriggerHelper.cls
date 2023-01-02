public class AccountTriggerHelper {
   
      public static void encrypt( List<Account> accs){        
        for( Account acc : accs ){
            if( acc.CustomerProduction__c == null){
                continue;
            }
            system.debug('Inside this for');
            String algorithmName = 'AES256';
            string key='SIMPLWEBHOOKSP'+UserInfo.getOrganizationId();
            Blob privateKey = Blob.valueOf(key);
            Blob iv = Blob.valueOf(UserInfo.getOrganizationId().substring(0,16));
            
            Blob encryptedValueOfPassword = Blob.valueOf(acc.CustomerProduction__c);
            system.debug(encryptedValueOfPassword+'encryptedValueOfPassword value ');
            Blob encrptCustomerPassword = Crypto.encrypt(algorithmName, privateKey, iv, encryptedValueOfPassword);
            acc.CustomerProduction__c = EncodingUtil.base64Encode(encrptCustomerPassword);
        }
    }
    
      public static void encryptSecrity( List<Account> accList){        
        for( Account acc1 : accList ){
            if( acc1.CustomerProductionSecurtiy__c == null ){
                continue;
            }
            String algorithmName = 'AES256';
            string key='SIMPLWEBHOOKSP'+UserInfo.getOrganizationId();
            Blob privateKey = Blob.valueOf(key);
            Blob iv = Blob.valueOf(UserInfo.getOrganizationId().substring(0,16));
            
            Blob encryptedValueOfSToken = Blob.valueOf(acc1.CustomerProductionSecurtiy__c);
            Blob encrptCustomerToken = Crypto.encrypt(algorithmName, privateKey, iv, encryptedValueOfSToken);
            acc1.CustomerProductionSecurtiy__c = EncodingUtil.base64Encode(encrptCustomerToken);
        }
      }
    
    public static void encryptPass( List<Account> accs){        
        for( Account acc : accs ){
            if( acc.Simploud_Customer_Password__c == null){
                continue;
            }
            String algorithmName = 'AES256';
            string key='SIMPLWEBHOOKSP'+UserInfo.getOrganizationId();
            Blob privateKey = Blob.valueOf(key);
            Blob iv = Blob.valueOf(UserInfo.getOrganizationId().substring(0,16));
            
            Blob encryptedValueOfPassword = Blob.valueOf(acc.Simploud_Customer_Password__c);
            Blob encrptCustomerPassword = Crypto.encrypt(algorithmName, privateKey, iv, encryptedValueOfPassword);
            acc.Simploud_Customer_Password__c = EncodingUtil.base64Encode(encrptCustomerPassword);
        }
    }
    public static void encryptCred( List<Account> accs){        
        for( Account acc : accs ){
            if( acc.Simploud_Customer_Security_Token__c == null ){
                continue;
            }
            String algorithmName = 'AES256';
            string key='SIMPLWEBHOOKSP'+UserInfo.getOrganizationId();
            Blob privateKey = Blob.valueOf(key);
            Blob iv = Blob.valueOf(UserInfo.getOrganizationId().substring(0,16));
            
            Blob encryptedValueOfSToken = Blob.valueOf(acc.Simploud_Customer_Security_Token__c );
            Blob encrptCustomerToken = Crypto.encrypt(algorithmName, privateKey, iv, encryptedValueOfSToken);
            acc.Simploud_Customer_Security_Token__c = EncodingUtil.base64Encode(encrptCustomerToken);
        }
    }
    
    public static void checkFieldChange(Map<Id, Account> oldMapAcc, Map<Id, Account> newMapAcc ) {
        List<Account> newPass = new List<Account>();
        List<Account> newCred = new List<Account>();
        for(Id oldAccId : oldMapAcc.keySet()) {
            if(oldMapAcc.get(oldAccId).Simploud_Customer_Password__c != newMapAcc.get(oldAccId).Simploud_Customer_Password__c) {                
                newPass.add(newMapAcc.get(oldAccId));
            }
            if(oldMapAcc.get(oldAccId).Simploud_Customer_Security_Token__c != newMapAcc.get(oldAccId).Simploud_Customer_Security_Token__c){
                newCred.add(newMapAcc.get(oldAccId));
            }
            
        }
        if(newPass.size()>0)
        {
        	encryptPass( newPass );    
        }
        if(newCred.size()>0)
        {
           encryptCred( newCred );     
        }
        
    }
        public static void checkFieldChanges2(Map<Id, Account> oldMapAcc, Map<Id, Account> newMapAcc ) {
        List<Account> newPass = new List<Account>();
        List<Account> newCred = new List<Account>();
        for(Id oldAccId : oldMapAcc.keySet()) {
            if(oldMapAcc.get(oldAccId).CustomerProduction__c != newMapAcc.get(oldAccId).CustomerProduction__c) {                
                newPass.add(newMapAcc.get(oldAccId));
            }
            if(oldMapAcc.get(oldAccId).CustomerProductionSecurtiy__c != newMapAcc.get(oldAccId).CustomerProductionSecurtiy__c){
                newCred.add(newMapAcc.get(oldAccId));
            }
            
        }
        if(newPass.size()>0)
        {
        	encrypt( newPass );    
        }
        if(newCred.size()>0)
        {
           encryptSecrity( newCred );     
        }
     }
}