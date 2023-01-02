@isTest
public class ContentDocumentLinkTriggerTest {
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
        ContentVersion cv = new ContentVersion();
        cv.Title = 'Test Document';
        cv.PathOnClient = 'TestDocument.pdf';
        cv.VersionData = Blob.valueOf('Test Content');
        cv.IsMajorVersion = true;
        Insert cv; 
        
        Id conDocId = [SELECT ContentDocumentId FROM ContentVersion WHERE Id =:cv.Id].ContentDocumentId;
        
        Simploud__Configuration_Item__c configItem = new Simploud__Configuration_Item__c();
        configItem.Name = 'Test Customer 123 ';
        configItem.Simploud__Customer__c = accId;
        INSERT configItem;
        //Create ContentDocumentLink 
        ContentDocumentLink cdl = New ContentDocumentLink();
        cdl.LinkedEntityId = configItem.Id;
        cdl.ContentDocumentId = conDocId;
        cdl.shareType = 'V';
        Insert cdl;
    }
    
     @isTest
    public static Id accountInsert(){
        Simploud__Country__c coun=new Simploud__Country__c(Simploud__Zone__c='Middle East',Name='test');
        insert coun;
        Account acc = new Account(Country__c=coun.Id,Name='Test Account', Simploud_Customer_Security_Token__c='123ABC', Simploud_Customer_Password__c = 'Simp123', Simploud_Customer_Username__c = 'dev@test.com');
        Insert acc;
        acc.Name = 'T1';
        UPDATE acc;
        return acc.Id;
    }
}