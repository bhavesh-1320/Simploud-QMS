trigger AccountTrigger on Account (before insert, before update) {
    if( Trigger.isBefore ){
        if( Trigger.isInsert ){
            AccountTriggerHelper.encrypt(Trigger.new);
           	AccountTriggerHelper.encryptSecrity( Trigger.new );
            AccountTriggerHelper.encryptPass(Trigger.new);
            AccountTriggerHelper.encryptCred( Trigger.new );
        } else if( Trigger.isUpdate ) {
            AccountTriggerHelper.checkFieldChange(Trigger.oldMap, Trigger.newMap );
            EventBus.publish( new Event_When_Record_Upsert__e( Triggered_From__c = 'Account' ) );
            
          	 AccountTriggerHelper.checkFieldChanges2(Trigger.oldMap, Trigger.newMap );
            
        }
    }
}