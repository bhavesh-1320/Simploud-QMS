trigger ConfigItemTrigger on Simploud__Configuration_Item__c (before insert,after insert, after update) {
    
    
    
    Simploud__SimploudOrgSettings__c run=[Select Simploud__IgnoreConfigTrigger__c from Simploud__SimploudOrgSettings__c ]; 
    
    if(!run.Simploud__IgnoreConfigTrigger__c)
    {
        if(Trigger.isBefore){
			if(Trigger.isInsert){
                User usr=[SELECT ID,Name from user where name='Simploud Success' limit 1];
                for(Simploud__Configuration_Item__c CI_record:trigger.new){
                    CI_record.OwnerId=usr.Id;
                }
            }
        }
        if( Trigger.isAfter ){
            if( Trigger.isInsert ){
                Set<Id> insertedConfigItemsId = new Set<Id>();
                for( Simploud__Configuration_Item__c newItems : Trigger.new ){
                    if( newItems.Imported_Record_Id__c == null || newItems.Imported_Record_Id__c == '' ){
                        insertedConfigItemsId.add( newItems.Id );
                    }
                }
                if( insertedConfigItemsId.size() > 0 ){
                    configItemTriggerHelper.configItemCreated( insertedConfigItemsId, 'insertion' );    
                }
            } else if( Trigger.isUpdate ) {
                Set<Id> updatedConfigItemsId = new Set<Id>();
                Map<Id, Simploud__Configuration_Item__c> oldConfigItemsMap = Trigger.oldMap;
                Map<Id, Simploud__Configuration_Item__c> newConfigItemsMap = Trigger.newMap;
                for( Id cId : newConfigItemsMap.keySet() ){
                    if( oldConfigItemsMap.get( cId ).Imported_Record_Id__c == newConfigItemsMap.get(cId).Imported_Record_Id__c
                        && oldConfigItemsMap.get( cId ).Stop_Recursion__c == newConfigItemsMap.get(cId).Stop_Recursion__c
                        ){
                            if(newConfigItemsMap.get(cId).Simploud__External_ID__c==oldConfigItemsMap.get(cId).Simploud__External_ID__c)
                            {
                                if( newConfigItemsMap.get(cId).Deleted_From_Source__c == false ){
                                    updatedConfigItemsId.add( cId ); 	   
                                }
                            }
                    }
                    System.debug('Old Id:'+oldConfigItemsMap.get( cId ).Imported_Record_Id__c);
                    System.debug('New Id:'+newConfigItemsMap.get( cId ).Imported_Record_Id__c);
                }
                if( updatedConfigItemsId.size() > 0 ){
                    configItemTriggerHelper.configItemCreated( updatedConfigItemsId, 'updation' );    
                }
            }
        }
    }
}