trigger ContentDocumentLinkTrigger on ContentDocumentLink (After insert) {
    
    Simploud__SimploudOrgSettings__c run=[Select Simploud__IgnoreFileTrigger__c from Simploud__SimploudOrgSettings__c ]; 
    
    if(!run.Simploud__IgnoreFileTrigger__c)
    {
            if( Trigger.isAfter ){
                if( Trigger.isInsert ){
                    Set<Id> cLinkIds = new Set<Id>();
                    for( ContentDocumentLink cLink : [SELECT ContentDocument.LatestPublishedVersion.Stop_Recursion__c,LinkedEntityId FROM ContentDocumentLink WHERE Id IN :Trigger.newMap.keySet()] ){
                        System.debug('SR:'+cLink.ContentDocument.LatestPublishedVersion.Stop_Recursion__c);
                        if( cLink.ContentDocument.LatestPublishedVersion.Stop_Recursion__c == false ){
                            
                            String sObjName = cLink.LinkedEntityId.getSObjectType().getDescribe().getName();
                            
                            if( sObjName == 'Simploud__Configuration_Item__c' ){
                                System.debug(sObjName);
                            	cLinkIds.add( cLink.Id );    
                                
                            }
                        }                
                    } 
                    if( cLinkIds.size() > 0 ){
                        ContentDocumentLinkTriggerHelper.uploadDocument( cLinkIds );    
                    }
                }
            }
    }
}