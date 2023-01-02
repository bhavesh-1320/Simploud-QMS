@isTest
public class AccountHelperTest {
	@isTest
    public static Id accountInsert(){
        
        Simploud__Country__c coun=new Simploud__Country__c(Simploud__Zone__c='Middle East',Name='test');
        insert coun;
        
        Account acc = new Account(Name='Test Account', Simploud_Customer_Security_Token__c='123ABC', Simploud_Customer_Password__c = 'Simp123', Simploud_Customer_Username__c = 'dev@test.com',country__c=coun.id,CustomerProduction__c='newtrue',CustomerProductionSecurtiy__c='true');
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