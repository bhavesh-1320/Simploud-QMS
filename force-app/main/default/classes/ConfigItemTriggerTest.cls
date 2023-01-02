@isTest
public class ConfigItemTriggerTest {
    @testSetup
    static void testSet(){
        Simploud__SimploudOrgSettings__c run= new Simploud__SimploudOrgSettings__c( Simploud__IgnoreConfigTrigger__c = false );
        INSERT run;
        AWS_Server_EndPoint__c aws= new AWS_Server_EndPoint__c(EndPoint__c='test.com');
        INSERT aws;
    }
    @isTest
    static void unitTest1(){
        Test.setMock(HttpCalloutMock.class, new ServerCallout());
        Id accId = accountInsert();
        List<Simploud__Configuration_Item__c> configItems = new List<Simploud__Configuration_Item__c>();
        for( Integer j = 0; j<10; j++ ){
            Simploud__Configuration_Item__c configItem = new Simploud__Configuration_Item__c();
            configItem.Name = 'Test Customer 123 ' + j;
            configItem.Simploud__Customer__c = accId;
            configItems.add(configItem);
        }
        insert configItems;
        DELETE [SELECT Id FROM Simploud__Configuration_Item__c LIMIT 1];
        
        
        ConfigItemTriggerHelper.getOrgURL(true);
    }
    @isTest
    public static Id accountInsert(){
        
        Simploud__Country__c coun=new Simploud__Country__c(Simploud__Zone__c='Middle East',Name='test');
        insert coun;
        
        Account acc = new Account(Name='Test Account', Simploud_Customer_Security_Token__c='123ABC', Simploud_Customer_Password__c = 'Simp123', Simploud_Customer_Username__c = 'dev@test.com',country__c=coun.id);
        Insert acc;
        acc.Name = 'TestA';
        UPDATE acc;
        Simploud__Project__c sP = new Simploud__Project__c();
        sP.Name = 'Test Project';
        INSERT sP;
        Simploud__Account_Item__c sI = new Simploud__Account_Item__c();
        sI.Name = 'test Item';
        INSERT sI;
        return acc.Id;
    }
}