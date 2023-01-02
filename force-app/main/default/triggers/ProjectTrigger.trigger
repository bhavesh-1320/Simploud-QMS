trigger ProjectTrigger on Simploud__Project__c (after insert) {
    if( Trigger.isAfter ){
        if( Trigger.isInsert ){
            EventBus.publish( new Event_When_Record_Upsert__e( Triggered_From__c = 'ProcessUsed' ) );
        }
    }
}