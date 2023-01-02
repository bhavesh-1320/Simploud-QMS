@isTest
public class LWCControlerTest
{
    @testSetup 
    static void setup()
    {
        Simploud__SimploudOrgSettings__c org=new Simploud__SimploudOrgSettings__c(name='null');
        insert org;
        
        Simploud__Account_Item__c ai=new Simploud__Account_Item__c(name='null');
        insert ai;
        
        Simploud__Project__c proj=new Simploud__Project__c(name='null');
        insert proj;
            
        AWS_Server_EndPoint__c aws=new AWS_Server_EndPoint__c(EndPoint__c='http://ec2-3-72-235-182.eu-central-1.compute.amazonaws.com:3000');
        insert aws;
        
        Simploud__Country__c coun=new Simploud__Country__c(Simploud__Zone__c='Middle East',Name='test');
        insert coun;
        
        Account A=new Account(name = 'test',country__c=coun.id,Simploud_Customer_Password__c='password',Simploud_Customer_Security_Token__c='none',CustomerProductionSecurtiy__c='none',CustomerProduction__c='none');
        Simploud__Configuration_Item__c b=new Simploud__Configuration_Item__c(Name='test1',Simploud__Configuration_Area__c='none',Simploud__Type__c='None',Simploud__Description__c='Des',Imported_Record_Id__c='',Stop_Recursion__c='1',Simploud__External_ID__c='0010E00001M3B4rQAF');
        insert a;
        insert b;
    }
    @isTest
    public Static void main()
    {
        Account a=[select name from account where name='test'];
        
        Simploud__Configuration_Item__c b=[select name from Simploud__Configuration_Item__c where name='test1'];
        Test.setMock(HttpCalloutMock.class, new testMockCallout());
        
        LWCCustomersListViewController.deployAll( 'String objUsed', a.id ,'string FieldValue', new list<String>{'hii','by'},new List<String>{'Prof','Files'},'Test',new List<String>{'first','Second'});
        LWCCustomersListViewController.getSourceTargets('Account',a.id,new List<String>{'first','Second'});
        LWCCustomersListViewController.compareData('configArea','objUsed',a.id,new List<String>{'first','Second'},'Complaince Configuration');
        LWCCustomersListViewController.createBackup( 'String userName', 'password', 'String sToken', 'String orgId', a.id ,'test'); 
        
        LWCCustomersListViewController ob=new LWCCustomersListViewController();
		LWCCustomersListViewController.getLastModifiedConfig();
        LWCCustomersListViewController.getAllCustomers();
        LWCCustomersListViewController.getTimeZone();
        LWCCustomersListViewController.getAccountItem(a.id);
        LWCCustomersListViewController.getCustomer(a.id);
        LWCCustomersListViewController.getAllCustomerRelatedConfigItem(a.id);
        LWCCustomersListViewController.search('Sim');
        LWCCustomersListViewController.changeConfigItemOwner(a.id,b.id);
        LWCCustomersListViewController.getProject(a.id);
        LWCCustomersListViewController.getLastUserWhoContacted(a.id);
        LWCCustomersListViewController.getLastCustomerContact(a.id);
        LWCCustomersListViewController.getCycleTime(a.id);
        LWCCustomersListViewController.getUserName(b.id);
        String s=LWCCustomersListViewController.getStatus();
        LWCCustomersListViewController.getDecodedPassword('password');
        
        
    }
}