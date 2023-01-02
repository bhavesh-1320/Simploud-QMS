import { LightningElement, track, wire, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getCustomer from '@salesforce/apex/LWCCustomersListViewController.getCustomer';
import getAllCustomerRelatedConfigItem from '@salesforce/apex/LWCCustomersListViewController.getAllCustomerRelatedConfigItem';
import getAccountItem from '@salesforce/apex/LWCCustomersListViewController.getAccountItem';
import getProject from '@salesforce/apex/LWCCustomersListViewController.getProject';
import getTimeZone from '@salesforce/apex/LWCCustomersListViewController.getTimeZone';
import getLastUserWhoContacted from '@salesforce/apex/LWCCustomersListViewController.getLastUserWhoContacted';
import getlastCustomerContact from '@salesforce/apex/LWCCustomersListViewController.getLastCustomerContact';
import getCycleTime from '@salesforce/apex/LWCCustomersListViewController.getCycleTime';
import { encodeDefaultFieldValues } from 'lightning/pageReferenceUtils';
import { subscribe, unsubscribe, onError, setDebugFlag, isEmpEnabled } from 'lightning/empApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import lookUp from '@salesforce/apex/LWCCustomersListViewController.search';
import getUserName from '@salesforce/apex/LWCCustomersListViewController.getUserName';
import changeConfigItemOwner from '@salesforce/apex/LWCCustomersListViewController.changeConfigItemOwner';
import compareData from '@salesforce/apex/LWCCustomersListViewController.compareData';
import deployData from '@salesforce/apex/LWCCustomersListViewController.deployAll';
import getStatus from '@salesforce/apex/LWCCustomersListViewController.getStatus';
import Name from '@salesforce/schema/Account.Name';
import getSourceTargets from '@salesforce/apex/LWCCustomersListViewController.getSourceTargets';

import loading from '@salesforce/resourceUrl/Loading_Image';

export default class CustomerDetailView extends NavigationMixin( LightningElement ) {


    compliancRelatedTask='           -           ';
    relatedObjects='';
    noRelatedTask=false;

    staticMapOfRelatedObject={
        Account:['Simploud__Account_Item__c'],
        Simploud__Action__c:['Simploud__Action_Item__c','Simploud__Action_Participant__c'],
        Simploud__Audit__c:['Simploud__Audit_Item__c','Simploud__Audit_Participant__c'],
        Simploud__Audit_Plan__c:['Simploud__Audit_Plan_Item__c','Simploud__Audit_Plan_Participant__c'],
        Simploud__Batch_Record__c:['Simploud__Batch_Item__c','Simploud__Batch_Participant__c'],
        Simploud__Binder__c:['Simploud__Item__c'],
        Simploud__CAPA__c:['Simploud__CAPA_Item__c','Simploud__CAPA_Participant__c'],
        Simploud__Change_Control__c:['Simploud__Change_Item__c','Simploud__Change_Participant__c'],
        Simploud__Claim__c:['Simploud__Claim_Item__c','Simploud__Claim_Participant__c'],
        Simploud__Company_Asset__c:['Simploud__Company_Asset_Item__c'],
        Simploud__Complaint__c:['Simploud__Complaint_Item__c','Simploud__Complaint_Participant__c'],
        Simploud__Controlled_Document__c:['Simploud__Document_Item__c','Simploud__Document_Participant__c'],
        Simploud__Country__c:['Simploud__Country_Item__c'],
        Simploud__Design_History_File__c:['Simploud__DHF_Item__c','Simploud__DHF_Participant__c'],
        Simploud__DHR__c:['Simploud__DHR_Item__c','Simploud__DHR_Participant__c'],
        Simploud__DMR__c:['Simploud__DMR_Item__c','Simploud__DMR_Participant__c'],
        Simploud__Effectiveness_Check__c:['Simploud__EC_Participant__c'],
        Simploud__Employee__c:['Simploud__Employee_Item__c','Simploud__Employee_Participant__c'],
        Simploud__Experiment__c:['Simploud__Experiment_Item__c','Simploud__Experiment_Participant__c'],
        Simploud__Extension_Request__c:['Simploud__ER_Participant__c'],
        Simploud__General_Document__c:['Simploud__General_Document_Item__c','Simploud__General_Document_Participant__c'],
        Simploud__Improvement__c:['Simploud__Improvement_Item__c','Simploud__Improvement_Participant__c'],
        Simploud__Incident__c:['Simploud__Incident_Item__c','Simploud__Incident_Participant__c'],
        Simploud__Ingredient__c:['Simploud__Ingredient_Item__c'],
        Simploud__Inspection__c:['Simploud__Inspection_Item__c','Simploud__Inspection_Participant__c'],
        Simploud__Investigation__c:['Simploud__Investigation_Item__c','Simploud__Investigation_Participant__c'],
        Simploud__Material__c:['Simploud__Material_Item__c','Simploud__Material_Participant__c'],
        Simploud__Material_Order__c:['Simploud__Material_Order_Item__c','Simploud__Material_Order_Participant__c'],
        Simploud__Material_Unit__c:['Simploud__Material_Unit_Item__c','Simploud__Material_Unit_Participant__c'],
        Simploud__Monitoring__c:['Simploud__Monitoring_Item__c','Simploud__Monitoring_Participant__c'],
        Simploud__MRB__c:['Simploud__MRB_Item__c','Simploud__MRB_Participant__c'],
        Simploud__OOX__c:['Simploud__OOX_Item__c','Simploud__OOX_Participant__c'],
        Simploud__Product_Record__c:['Simploud__Product_Item__c'],
        Simploud__Project__c:['Simploud__Project_Item__c','Simploud__Project_Participant__c'],
        Simploud__Quality_Event__c:['Simploud__Event_Item__c','Simploud__Event_Participant__c'],
        Simploud__Recall__c:['Simploud__Recall_Item__c','Simploud__Recall_Participant__c'],
        Simploud__Requirement__c:['Simploud__Requirement_Item__c'],
        Simploud__Risk_Assessment__c:['Simploud__Risk_Item__c'],
        Simploud__Sample__c:['Simploud__Sample_Item__c','Simploud__Sample_Participant__c'],
        Simploud__Service__c:['Simploud__Service_Item__c'],
        Simploud__Shipment__c:['Simploud__Shipment_Item__c','Simploud__Shipment_Participant__c'],
        Simploud__Storage_Location__c:['Simploud__Storage_Location_Item__c','Simploud__Storage_Location_Participant__c'],
        Simploud__Submission__c:['Simploud__Submission_Item__c','Simploud__Submission_Participant__c'],
        Simploud__Template__c:['Simploud__Template_Item__c'],
        Simploud__Training_Material__c:['Simploud__Training_Item__c','Simploud__Training_Material_Participant__c'],
        Simploud__Trial__c:['Simploud__Trial_Item__c','Simploud__Trial_Participant__c'],
        Simploud__Vendor__c:['Simploud__Vendor_Item__c','Simploud__Vendor_Participant__c'],
    };



    lodingimg=loading;

    load=true;


    deployEntireClicked=false;

    permission_profile=false;
    profiles=[];
    showingGroupItemsFor='';

    globalFields=[
        {fieldName:'Groups',source:'43',target:'32'},
        {fieldName:'Permission Sets/Profile',source:'43',target:'32'},
        {fieldName:'Reports',source:'43',target:'32'},
        {fieldName:'Dashboard',source:'43',target:'32'}
    ];
    
    callAfter=false;
    recId;
    isModalOpen=false;
    showFullScreenSpinner=false;
    activeSections = ['A', 'B', 'C', 'D', 'name'];
    activeSectionsMessage = '';
    CustomerName;
    relatedConfigItems;
    relatedCallLogs;
    Status;
    Type;
    subscription = {};
    totalItems=0+'/'+0;
    haveCmpRecord = false;
    selectedItems=[];
    selectedProfiles=[];
    selectedItems2;

    selectItems;
    showItems;
    @api eventName = '/event/Event_When_Record_Upsert__e';
    lastUserRep='-';
    lastCustomerContact='-';
    orgtime;
    @track ObjectUse;
    
    migrateField='';

    showCompare = false;
    selectedName;
    selectedId;
    prevOwner = '';
    isValueSelected;
    currentConfigItemId;
    noOwnerSelectedFlag = false;
    searchTerm='';
    boxClass = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-has-focus';
    inputClass = '';
    searchPlaceholder='Search';
    records=[];
    iconName='standard:user';


    avgCycTime=0;
    closeStatus = false;
    showConfigSpin = false;
    configStatus;
    compareRecords;

    openMigration=false;



    //@api addCallEvent = '/event/InsertCallLog__e';
    actions = [
        { label: 'View', name: 'view'},
        { label: 'Assign Internal Ownership', name: 'AssignIntOwner'}
    ];
    cmpData = [ {label:'Name', fieldName:'label'}, {label:'Changes', fieldName:'value'} ];

    // datatable columns with row actions. Set sortable = true
    sortBy;
    sortDirection;

    columns = [
        { label: 'Name', fieldName: 'NameURL', type: 'url',
            typeAttributes: {
                label: {
                    fieldName: 'Name'
                }
            }
        },
        { label: 'Item No.', fieldName: 'Simploud__Item_No__c', sortable: true },
        { label: 'Config Area', fieldName: 'Simploud__Configuration_Area__c', sortable: true },
        { label: 'Created Date', fieldName: 'CreatedDate', sortable: true, type: 'date', 
        typeAttributes:{
            year: "numeric",
            month: "long",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            timeZone: this.orgtime
        }},
        { label: 'Status', fieldName: 'Simploud__Status__c', sortable: true },
        { label: 'Owner', fieldName: 'OwnerName', sortable: true },
        { label:'Production Issue',fieldName:'Simploud__Production_Issue__c' },
        // { label: 'Type', fieldName: '', sortable: "true"},
        // { label: 'Responsibility', fieldName: 'Simploud__Responsibility__c', sortable: "true"},
        // { label: 'Description', fieldName: 'Simploud__Description__c'},
        {
            type: 'action',
            typeAttributes: {
                rowActions: this.actions,
                menuAlignment: 'right'
            },
        },
    ];


    migrationFields=[    
        {fieldName:'Fields',source:'43',target:'32'},
        {fieldName:'Layout',source:'43',target:'32'},
        {fieldName:'List Views',source:'43',target:'32'},
        {fieldName:'Lightning Page',source:'43',target:'32'},
        {fieldName:'Sharing Settings',source:'43',target:'32'}
    ];

    customSettingsSource=0;
    customSettingsTarget=0;

    complianceSource=0;
    complianceTarget=0;


    //For deploy entire
    
    entireGroup=[];
    entirePermission=[];
    entireReport=[];
    entireDashboard=[];
    entireProfile=[];
    entireCustomSetting=[];
    entireTask=[];
    cusDetail;
    proDetail;
    groupDetails;
    pSetDetails;
    reportDetails;
    dashDetails;
    taskDetails;
    deployEntire = false;



    doSorting(event) {
        this.sortBy = event.detail.fieldName;
        this.sortDirection = event.detail.sortDirection;
        this.sortData(this.sortBy, this.sortDirection);
    }

    sortData(fieldname, direction) {
        let parseData = JSON.parse(JSON.stringify(this.relatedConfigItems));
        // Return the value stored in the field
        let keyValue = (a) => {
            return a[fieldname];
        };
        // cheking reverse direction
        let isReverse = direction === 'asc' ? 1: -1;
        // sorting data
        parseData.sort((x, y) => {
            x = keyValue(x) ? keyValue(x) : ''; // handling null values
            y = keyValue(y) ? keyValue(y) : '';
            // sorting values based on direction
            return isReverse * ((x > y) - (y > x));
        });
        this.relatedConfigItems = parseData;
    }    



    callLogsCol = [
        { label: 'Contact Person', fieldName: 'ContactName'},   
        { label: 'Date', fieldName: 'CreatedDate',  type: 'date', 
        typeAttributes:{
            year: "numeric",
            month: "long",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            timeZone: this.orgtime
        }},
        { label:'Owner ID',fieldName:'OwnerName'},
        { label: 'Duration', fieldName: 'Call_Duration_minutes__c'},
        { label: 'Comment', fieldName: 'Comments__c'},  
    ];

    processUsedCol=[
        { label: 'Process Name', fieldName: 'NameURL', type: 'url',
            typeAttributes: {
                label: {
                    fieldName: 'Name'
                }
            }
        },
        {label:'Configuration Version',fieldName:'Configuration_Version__c'},
        {label:'Status',fieldName:'Simploud__Status__c'},
        {
            type: 'action',
            typeAttributes: {
                rowActions: [{ label: 'View', name: 'view'},
                            { label: 'Migration', name: 'migration'}],
                menuAlignment: 'right'
            },
        },
    ]
    projList=[];

    getUser(name)
    {
        lookUp({searchTerm:name}).then(res=>{
            this.records = JSON.parse(JSON.stringify(res));
            console.log('Users!!!!!!!!!!!!!!!!!! => ',this.records);

            

        }).catch(err=>{
            console.log('Users Error ',err);

        })
    }

    lastUserWhoRep()
    {
        console.log('last user who responded');
        getLastUserWhoContacted({acId:this.recId}).then(res=>{
            console.log('res');
            console.log(res);
            if(res.CreatedBy.Name!=null)
            {
                this.lastUserRep=res.CreatedBy.Name;
            }
            
        }).catch(err=>{
            this.lastUserRep='-';
            console.log(err);
            
        })

    }

    lastCustomerContactFun()
    {
     
        getlastCustomerContact({acId:this.recId}).then(res=>{
            if(res.Name!=undefined&&res.Name!=null&&res.Name!='')
            {
                this.lastCustomerContact=res.Name;
            }
            this.showFullScreenSpinner=false;
        }).catch(err=>{
            this.showFullScreenSpinner=false;
            console.log(err);
            this.lastCustomerContact='-';
        })
    }

    @wire(getTimeZone) fun({error,data})
    {
        if(error)
        console.log(error);
        if(data){
            this.orgtime=data.TimeZoneSidKey;
            console.log('OrgTime:', data.TimeZoneSidKey);
        }
    }

    averageCycleTime()
    {
        getCycleTime({acId:this.recId}).then(res=>{
            console.log('res in Avg Cycle',res);
            let sum=res[0].expr0;
            let count=res[0].expr1;
            if(sum!=undefined&&sum!=null&&count!=undefined&&count!=null)
            {
                this.avgCycTime=sum/count;
            }
        }).catch(err=>{
            console.log('Error in Avg Cycle',err);
        })
    }

    @api
    get customerrecid() {
        return this.recId;
    }
    set customerrecid(id) {
        console.log('cusotmer id in child component-----::>> ' + id);
        if(id != undefined) {
            getCustomer({customerId : id}).then(result => {
                console.log('customer:: ', result);
                // this.oppRecords = result;
                this.CustomerName = result.Name;
                this.Type = result.Type;
                this.Status=result.Simploud__Status__c;
            }).catch(error => {
                console.log(error);
            });

            this.recId = id;

            this.averageCycleTime();
            this.lastUserWhoRep();
            this.lastCustomerContactFun();
            this.getConfigRec();
            this.getProjects();
            this.getAccountItems();
            this.getUser('');
        }        
    }

    connectedCallback() {
        this.showFullScreenSpinner=true;
        this.handleSubscribe();
        console.log('Record Updated!! In ConnectedCallBack');
    }

    getAccountItems(){
        this.showFullScreenSpinner=true;
        getAccountItem( {accId:this.recId} ).then( res=>{
            console.log('Account Item (Call Logs)',res);
            if(res.length > 0) {
                this.relatedCallLogs = JSON.parse(JSON.stringify(res));
                this.relatedCallLogs.forEach( accItem =>{
                    if( accItem.Contact__r != undefined ){
                        accItem['ContactName'] = accItem.Contact__r.Name;
                        accItem['OwnerName']=accItem.Owner.Name;
                    }
                } );
                
                console.log('CallLogs:', res);
            } else {
                this.relatedCallLogs = undefined;
            }
            this.showFullScreenSpinner=false;
            
        }).catch(error => {
            console.log(error);
            this.showFullScreenSpinner=false;
        });
    }
    getConfigRec()
    {
        this.showFullScreenSpinner=true;
        getAllCustomerRelatedConfigItem({customerId : this.recId}).then(result => {
            console.log('getAllCustomerRelatedConfigItem result:: ', result);
            
            let total=result.length;

            if(result.length > 0) {
                this.relatedConfigItems = JSON.parse(JSON.stringify(result));
                this.relatedConfigItems.forEach(element => {
                    element['CreatedByName']=element.CreatedBy.Name;
                    element['OwnerName']=element.Owner.Name;
                    element['NameURL']='/lightning/r/Simploud__Configuration_Item__c/' +element['Id'] +'/view'
                    //element['CreatedDate']=new Date(element.CreatedDate);
                    //element['CreatedDate']=element.CreatedDate.toString();
                });
                console.log('relatedConfigItems:: ' , this.relatedConfigItems);
            } else {                
                this.relatedConfigItems = undefined;
            }

            let open=0;
            this.relatedConfigItems.forEach(ele=>{
                if(ele.Simploud__Status__c=='Opened')
                {
                    open++;
                }
            });

            this.totalItems=open+'/'+(total-open);
            this.showFullScreenSpinner=false;

        }).catch(error => {
            console.log(error);
            this.showFullScreenSpinner=false;
        });
    }

    getProjects()
    {
        this.showFullScreenSpinner=true;
        getProject({CustomerId:this.recId}).then(result=>{
            console.log('Projects ',result);
            // console.log(this.index);
            // this.ObjectUse = result[0].Object_in_Use__c;
            console.log('Object used this ',this.ObjectUse);

            if( result.length > 0 ){    

                this.projList=JSON.parse(JSON.stringify(result ));
                this.projList.forEach(element=>{
                    element['NameURL']='/lightning/r/Simploud__Configuration_Item__c/' +element['Id'] +'/view'
                })
                
            }else{
                this.projList = undefined;
            }
            this.showFullScreenSpinner=false;
        }).catch(err=>{
            console.log(err);
            this.showFullScreenSpinner=true;
        });
    }

    renderedCallback() {
        console.log('Record Updated!! In RenderedCallBack');

        if(this.load){
            this.load=false;
            const style = document.createElement('Style');
    
            style.innerHTML = `
            .slds-scrollable_y {
                min-height: 120px !important;
            }                    
            `;
            this.template.querySelector('.dataTableClass').appendChild(style);

        }

    }
    handleNavigate( rId, objName, mode, type ) {		
        console.log('navigating');
        const config = {		
          type: type,		
          attributes: {		
              recordId: rId,		
              objectApiName: objName,		
              actionName: mode		
            }		
        };		
        this[NavigationMixin.Navigate](config);		
    }
    
    handleNewNavigate( rId, objName, mode, type,field,table) {	
        console.log('Nav');
        console.log('JS');
        var json={};

        json[field]=this.recId;

        if(table)
        {
            json[table]="Call Logs";
        }

        console.log('JSON',json);
        const defaultValues =encodeDefaultFieldValues(json);

        console.log(defaultValues);

        const config = {		
          type: type,		
          attributes: {		
              recordId: rId,		
              objectApiName: objName,		
              actionName: mode		
            },
            state: {
                defaultFieldValues: defaultValues,
                navigationLocation: 'RELATED_LIST'
            }
        };
        console.log(config);
        this[NavigationMixin.Navigate](config);		
    }
    
    
    handleAccountUpdate(){		
        this.handleNavigate( this.recId, "Account", "edit", "standard__recordPage" ).then(res=>{
            console.log('saved');
        });		
    }		
    handleAddCall(){		
        this.handleNewNavigate( undefined, "Simploud__Account_Item__c", "new", "standard__objectPage","Simploud__Account__c","Simploud__Table__c" );		
    }
    handleInsertConfigItemList(){
        
        sessionStorage.setItem('accid',this.recId);

        console.log(sessionStorage.getItem('accid'));

        this.handleNewNavigate( undefined, "Simploud__Configuration_Item__c", "new", "standard__objectPage","Simploud__Customer__c" );
    }
    newProject(){
        this.handleNewNavigate(undefined,"Simploud__Project__c","new","standard__objectPage","Customer__c");
    }
    handleSectionToggle(event) {
        const openSections = event.detail.openSections;
        
        if (openSections.length === 0) {
            this.activeSectionsMessage = 'All sections are closed';
        } else {
            this.activeSectionsMessage =
                'Open sections: ' + openSections.join(', ');
        }
    }

    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        switch (actionName) {
            case 'view':
                console.log('view clicked for:: ', row.Name);
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Success!!',
                    message: 'view clicked for:: ' + row.Name,
                    variant: 'success'
                }),);
                break;
            case 'open_ci':
                console.log('open_ci clicked for:: ', row);
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Success!!',
                    message: 'Open CI clicked for:: ' + row.Name,
                    variant: 'success'
                }),);
                break;
            case 'back_up':
                console.log('back_up clicked for:: ', row);
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Success!!',
                    message: 'Back Up clicked for:: ' + row.Name,
                    variant: 'success'
                }),);
                break;
            default:
        }
    }

    goBack(event) {
        
        console.log('going back!!');

        var showCusList = new CustomEvent("showcuslistview", {
            viewlist: false
        });
        
        this.dispatchEvent(showCusList);
    }

    // Handles subscribe button click
    handleSubscribe() {
        // Callback invoked whenever a new event message is received
        const thisReference = this;
        console.log('Event called');
        const messageCallback = (response) => {
            // console.log('New message received 1: ', JSON.stringify(response));
            // console.log('New message received 2: ', response);
            
            var obj = JSON.parse(JSON.stringify(response));
            console.log('Current Record Id:: ', this.recId);
            console.log( 'Response:', obj );
            if( obj.data.payload.Triggered_From__c == 'Account' ){
                if(this.recId != undefined) {
                    this.showFullScreenSpinner = true;
                    getCustomer({ customerId : this.recId }).then(result => {
                        console.log('customer:: ', result);
                        this.CustomerName = result.Name;
                        this.Type = result.Type;
                        this.status = result.Simploud__Status__c;
                        this.showFullScreenSpinner = false;
                    }).catch(error => {
                        console.log(error);
                        this.showFullScreenSpinner = false;
                    });
                }
            }else if( obj.data.payload.Triggered_From__c == 'AccountItem' ){
                this.getAccountItems();
            } else if( obj.data.payload.Triggered_From__c == 'ProcessUsed' ){
                this.getProjects();
            }
        };
        subscribe(this.eventName, -1, messageCallback).then(response => {
            // Response contains the subscription information on subscribe call
            console.log('Subscription request sent to: ', JSON.stringify(response.channel));
            this.subscription = response;
        });
    }
    handleProcessRow(event)
    {
        var nam=event.detail.action.name;
        var row=JSON.parse(JSON.stringify(event.detail.row));
        console.log('Selected row number',event.detail.selectedRows);
         
        /* var Rownumber = this.template.querySelector("lightningdatatable").getSelectedRows();
        console.log('RowNumber',JSON.stringify(Rownumber)); */

        var index = this.projList.findIndex(user => user.Id == row.Id);
        console.log('idx:',index);
        console.log(this.projList);
        console.log(this.projList[index].Object_in_Use__c);
        if(this.projList[index].Object_in_Use__c != undefined){
            this.ObjectUse=this.projList[index].Object_in_Use__c;
        }
        else
        {
            this.ObjectUse = '     -       ';
        }
         
        // console.log('row');
        console.log(row);
        console.log(event.detail);
        console.log(nam);
        if( nam == 'migration' ){
            if(this.ObjectUse=='     -       ')
            {
                const event = new ShowToastEvent({
                    title: 'No Object Used',
                    message: 'Please select an Object!',
                });
                this.dispatchEvent(event);
            }
            else{
                // console.log('Calling APIII');
                if(this.staticMapOfRelatedObject[this.ObjectUse]!=undefined){

                    this.relatedObjects=this.staticMapOfRelatedObject[this.ObjectUse][0];

                    if(this.staticMapOfRelatedObject[this.ObjectUse][1]!=undefined && this.staticMapOfRelatedObject[this.ObjectUse][1]!=null){
                        this.relatedObjects+=' , '+this.staticMapOfRelatedObject[this.ObjectUse][1];
                    }
                }else{
                    this.relatedObjects='                           -       ';
                }



                this.showFullScreenSpinner = true;

                // this.showFullScreenSpinner = false;
                // this.openMigration = true;
                var tempAr=null;

                if(this.staticMapOfRelatedObject[this.ObjectUse]!=undefined && this.staticMapOfRelatedObject[this.ObjectUse]!=null){
                    tempAr=this.staticMapOfRelatedObject[this.ObjectUse];
                }

                console.log('!!! : : : ',tempAr);

                getSourceTargets( {objUsed : this.ObjectUse,accId:this.recId,relatedObj:tempAr } ).then( res =>{
                    setTimeout( ()=>{
                        var resp = this.getAPiStatus();
                        console.log('Re:',resp);
                    }, 20000 );
                } ).catch( err=>{
                    console.log(err);
                } )
            }

        }else if( nam == 'view' ){
            this.handleNavigate(row.Id,undefined,"view","standard__recordPage");
        }
        
    }

    // handleCallRow(event)
    // {
    //     var nam=event.detail.action.name;
    //     var row=JSON.parse(JSON.stringify(event.detail.row));
    //     console.log('row');
    //     console.log(row);
    //     console.log(event.detail);
    //     console.log(nam); 
    //     this.handleNavigate(row.Id,undefined,"view","standard__recordPage");
    // }

    handleConfigRow(event)
    {
        var nam=event.detail.action.name;
        var row=JSON.parse(JSON.stringify(event.detail.row));
        console.log('RowNumber');
        console.log('row');
        console.log(row);
        console.log(event.detail);
        console.log(nam); 
        switch ( nam ) {
            case 'view':
                this.handleNavigate(row.Id,"Simploud__Configuration_Item__c","view","standard__recordPage");
                break;
           
            case 'AssignIntOwner':
                this.openModal(row.Id);
                break; 
        }
    }

    openModal(configItemId) {
        this.showFullScreenSpinner=true;
        console.log('In openModal:: configItemId:: ', configItemId);
        this.currentConfigItemId = configItemId;

        getUserName({configItemID: configItemId})
        .then(result => {
            console.log(result);
            if(result != 'No owner user found') {
                this.selectedName = result;
                if(this.prevOwner == '') {
                    this.prevOwner = result;
                }
                this.isValueSelected = true;
            }
            this.showFullScreenSpinner=false;
        })
        .catch(error => {
            console.log('error in openModal:: ', error);
            this.showFullScreenSpinner=false;
        })
        // to open modal set isModalOpen tarck value as true
        this.isModalOpen = true;
        this.noOwnerSelectedFlag = false;
    }
    closeModal() {
        // to close modal set isModalOpen tarck value as false
        this.selectedItems=[];
        this.selectedProfiles=[];
        this.selectedItems2=[];

        this.noRelatedTask=false;
        this.deployEntireClicked=false;

        this.entireDashboard=[];
        this.entireGroup=[];
        this.entirePermission=[];
        this.entireReport=[];
        this.entireCustomSetting=[];
        this.entireProfile=[];
        this.entireTask=[];

        this.isModalOpen = false;
        this.openMigration=false;
        this.showItems=false;

        this.relatedObjects='';

        this.getUser('');
    }

    changeInternalOwner(event) {
        // to close modal set isModalOpen tarck value as false
        //Add your code to call apex method or do some processing

        if(this.isValueSelected) {
            console.log(this.selectedName + ' || ' + this.prevOwner + ' || ' + this.currentConfigItemId);
            if(this.selectedName != this.prevOwner) {
                
                console.log('owner changed!');
                console.log(this.selectedName + ' || ' + this.prevOwner);

                this.showFullScreenSpinner=true;
                changeConfigItemOwner({ownerId: this.selectedId, configItemID: this.currentConfigItemId})
                .then(result => {

                    this.getConfigRec();

                    this.showFullScreenSpinner=false;

                    console.log(result);
                    
                    const event = new ShowToastEvent({
                        variant: 'success',
                        title: 'Success!!',
                        message:
                            'Ownership Changed',
                    });
                    this.dispatchEvent(event);
                })
                .catch(error => {
                    this.showFullScreenSpinner=false;

                    console.log('error in changing owner!', error);
                    
                    const event = new ShowToastEvent({
                        variant: 'Error! Owner Not Changed',
                        title: 'Error',
                        message:error,
                    });
                    this.dispatchEvent(event);
                })
            } else {
                console.log('owner not changed!');
            }
            this.isModalOpen = false;
        } else {
            console.log('No value seleted.');
            this.noOwnerSelectedFlag = true;
            this.showErrorToast();
        }
    }
    handleRemovePill() {
        this.isValueSelected = false;
    }
    onChange(event) {
        this.searchTerm = event.target.value;
        this.getUser(this.searchTerm);
    }
    handleUserClick() {
        this.searchTerm = '';
        this.inputClass = 'slds-has-focus';
        this.boxClass = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-has-focus slds-is-open';
    }

    onBlur() {
        this.blurTimeout = setTimeout(() =>  {this.boxClass = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-has-focus'}, 300);
    }
    onSelect(event) {
        this.selectedId = event.currentTarget.dataset.id;
        let selectedName = event.currentTarget.dataset.name;
        const valueSelectedEvent = new CustomEvent('lookupselected', {detail:  this.selectedId });
        this.dispatchEvent(valueSelectedEvent);
        this.isValueSelected = true;
        this.selectedName = selectedName;
        if(this.blurTimeout) {
            clearTimeout(this.blurTimeout);
        }
        this.boxClass = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-has-focus';
    }
    handleCompare( event ){

        this.closeStatus=false;
        this.showConfigSpin = true;
        this.showCompare = false;
        this.openMigration = false;
        this.configStatus = 'Comparing';

        
        var tempAr=null;

        let fieldName='';
        
        if(event.target.dataset.name=='Complaince Configuration'){
            fieldName='Complaince Configuration';
        }

        if(this.staticMapOfRelatedObject[this.ObjectUse]!=undefined && this.staticMapOfRelatedObject[this.ObjectUse]!=null){
            tempAr=this.staticMapOfRelatedObject[this.ObjectUse];
        }
        console.log('!!!! : : : : ',tempAr);

        compareData( {objUsed : this.ObjectUse, configArea:event.target.dataset.carea, accId:this.recId, relatedObj: tempAr,FieldValue:fieldName} ).then( res=>{
            setTimeout( ()=>{
                var resp = this.getAPiStatus();
                console.log('Re:',resp);
            }, 20000 );
        } ).catch( err=>{

        } );
    }
    handleClickDeploy(event)
    {
        try
        {
            console.log('Deploying');
            this.migrateField=event.target.dataset.name;
            let Value2 = event.target.dataset.name;

            if(Value2 == 'Entire' || Value2 == 'Complaince Configuration'){
                this.deployEntireClicked=true;
            }

            this.closeStatus=false;
            this.configStatus = 'Starting';
            this.showConfigSpin = true;
            this.openMigration = false;
            console.log(Value2);


            var tempAr=null;

            if(this.staticMapOfRelatedObject[this.ObjectUse]!=undefined && this.staticMapOfRelatedObject[this.ObjectUse]!=null){
                tempAr=this.staticMapOfRelatedObject[this.ObjectUse];
            }

            console.log('!!! : : : ',tempAr);


            deployData({accId:this.recId,FieldValue :Value2,objUsed:this.ObjectUse,relatedObj: tempAr}).then( res=>{
                console.log('Value:', Value2);
                if( Value2 == 'Complaince Configuration' ){
                    this.configStatus = 'Fetching Records';
                }else{
                    this.configStatus = 'Retrieving Configurations';
                }
                console.log('St:',res);
                setTimeout( ()=>{
                    var resp = this.getAPiStatus();
                    console.log('Re:',resp);
                }, 20000 );  
            } ).catch(err=>{
                console.log(err);
            })
        }
        catch(e)
        {
            console.log(e);
        }
    }
    getAPiStatus(){
        getStatus().then( resp=>{
            console.log('Status:',JSON.parse(JSON.stringify(resp)));
            this.deployEntire = false;
            if(resp.includes('error Wrong Password')){
                this.showFullScreenSpinner = false;
                const event = new ShowToastEvent({
                    title: 'Error',
                    message:resp,
                    variant: 'error'
                });
                this.dispatchEvent(event);
            }
            else if( resp == 'Completed' || resp.includes('error') || resp.includes('Error') || resp.includes('Compare') || resp.includes( 'CC Deployed' ) ){
                this.closeStatus = true;
                this.configStatus = resp;
                this.showFullScreenSpinner = false;
                this.haveCmpRecord = false;
                if( resp.includes('Compare') ){
                    console.log('HidingStatus');
                    this.hideStatus(undefined,'Compare');
                    var cmpRecords = JSON.parse(resp);
                    console.log('CCCCC:');

                    console.log(cmpRecords.Compare);
                    console.log(cmpRecords);
                    if( cmpRecords.Compare != undefined ){
                        var recs = cmpRecords.Compare;
                        if( recs.length > 0 ){
                            this.haveCmpRecord = true;
                            var cmpRecs = {};
                            recs.forEach( rec =>{
                                if( cmpRecs[rec.label] != undefined ){
                                    cmpRecs[rec.label]+=', '+rec.value;
                                }else{
                                    cmpRecs[rec.label] = rec.value;
                                }
                            } );
                            var cmpRecsF = [];
                            for( var v in cmpRecs ){
                                cmpRecsF.push( {label:v, value:cmpRecs[v]} );
                            }
                            this.compareRecords = cmpRecsF;
                        }else{
                            this.haveCmpRecord = false;
                        }
                    }
                    console.log(resp);
                    return resp;
                }
                else if( resp == 'Completed' ){
                    this.configStatus = 'Successfully deployed the configurations';
                    return resp;
                }
                else if( resp == 'CC Deployed' ){
                    this.configStatus = 'Successfully transferred the compliance configuration records';
                    return resp;
                }
            }else if( resp.includes('GroupDetails') ){
                this.deployEntire=false;
                this.permission_profile=false;
                this.closeStatus = true;
                this.configStatus = resp;
                console.log('HidingStatus');
                this.hideStatus(undefined,'GroupDetails');
                var groupDetails1 = JSON.parse(resp);
                var groupDetails = groupDetails1["GroupDetails"];
                console.log(groupDetails);
                console.log(groupDetails1);
                var arr = [];
                var arrItems2 = [];
                for( var val of groupDetails ){
                    arr.push( { label: val, value: val });
                    arrItems2.push( val );                       
                }
                this.selectedItems2 = arrItems2;
                
                this.selectItems = arr;
                console.log(this.selectItems);
                console.log(resp);
                
                
                return resp;
            }else if( resp.includes('ReportDetails') ){
                this.deployEntire=false;
                this.permission_profile=false;
                this.showItems=true;
                this.closeStatus = true;
                this.configStatus = resp;
                console.log('HidingStatus');
                this.hideStatus(undefined,'Reports');
                var groupDetails1 = JSON.parse(resp);
                var groupDetails = groupDetails1["ReportDetails"];
                console.log(groupDetails);
                console.log(groupDetails1);
                var arr = [];
                var arrItems2 = [];
                for( var val of groupDetails ){
                    arr.push( { label: val.name, value: val.id });
                    arrItems2.push( val );   
                }
                this.selectedItems2 = arrItems2;
                
                this.selectItems = arr;
                console.log(this.selectItems);
                console.log(resp);
                return resp;
            }else if( resp.includes('DashboardDetails') ){
                this.deployEntire=false;
                this.permission_profile=false;
                this.showItems=true;
                this.closeStatus = true;
                this.configStatus = resp;
                console.log('HidingStatus');
                this.hideStatus(undefined,'Dashboards');
                var groupDetails1 = JSON.parse(resp);
                var groupDetails = groupDetails1["DashboardDetails"];
                
                console.log('GroupDetails ::: ',groupDetails);
                console.log(groupDetails1);
                var arr = [];
                var arrItems2 = [];
                console.log('!!!<<<<<<<<<<<<<<<<<<<Dashboards values');
                for( var val of groupDetails ){
                    console.log(val);
                    arr.push( { label: val.name, value: val.id });
                    arrItems2.push( val );   
                }
                this.selectedItems2 = arrItems2;
                
                this.selectItems = arr;
                console.log(this.selectItems);
                console.log(resp);
                return resp;
            }else if(resp.includes('PermissionDetails')){
                this.deployEntire=false;
                this.closeStatus = true;
                this.configStatus = resp;
                this.hideStatus(undefined,'PermissionSet');
                var permissionDetails1 = JSON.parse(resp);
                var permissionDetails = permissionDetails1["PermissionDetails"];
                console.log(permissionDetails1);
                console.log(permissionDetails);
                var arr = [];
                var arrItems2 = [];
                
                console.log('Permissionssss!!!!!!!',permissionDetails);
                
                permissionDetails.forEach(ele=>{
                    arr.push( { label: ele, value: ele });
                    arrItems2.push( ele );                       
                })

                if(permissionDetails.length==0){
                    this.noRelatedTask=true;
                }

                this.selectedItems2 = arrItems2;
                
                this.selectItems = arr;
                console.log('Select Items Options',this.selectItems);
                console.log(resp);
                
                
                if(permissionDetails1['Profile']!=undefined)
                {
                    this.permission_profile=true;
                    
                    arr=[];
                    let profileDetails=permissionDetails1['Profile'];
                    profileDetails.forEach(ele=>{
                        arr.push( { label: ele, value: ele });
                    })
                    this.profiles=arr;
                }
                else
                {
                    this.permission_profile=false;
                }
                
                return resp;
            }else if( resp.includes('SelectGlobalItems') ){
                try
                {

                    this.closeStatus = true;
                    this.configStatus = resp;
                    this.deployEntire = true;
                    console.log('HidingStatus');
                    this.hideStatus(undefined,'PermissionSet');
                    var parsedRes = JSON.parse(resp);
                    var selItems = parsedRes["SelectGlobalItems"];
                    console.log('->',selItems);
                    var parsedSelItem = JSON.parse(JSON.stringify(selItems));

                    this.groupDetails=[];
                    this.pSetDetails=[];
                    this.reportDetails=[];
                    this.dashDetails=[];
                    this.cusDetail=[];
                    this.proDetail=[];
                    this.taskDetails=[];

                    this.groupDetails = parsedSelItem.group;
                    this.pSetDetails = parsedSelItem.pSet;
                    this.reportDetails = parsedSelItem.report;
                    this.dashDetails = parsedSelItem.dashboard;
                    this.cusDetail = parsedSelItem.customsetting;
                    this.proDetail = parsedSelItem.profile;
                    this.taskDetails = parsedSelItem.task;


                    console.log('Details:',this.groupDetails,this.pSetDetails,this.reportDetails,this.dashDetails);
                    var arr = [];
                    var arrItems2 = [];
                    for( var val of this.groupDetails ){
                        arr.push( { label: val, value: val });
                        arrItems2.push( val );
                    }
                    this.selectedItems2 = arrItems2;
                    this.selectItems = arr;
                    console.log(this.selectItems);
                    console.log(resp);
                    return resp;
                }
                catch(e)
                {
                    console.log(e);
                }
                
            }else if( resp.includes('AllItems') ){
                this.permission_profile=false;
                
                this.migrationFields=[];
                this.globalFields=[];
                
                this.deployEntire=false;
                
                var r = JSON.parse( JSON.stringify(resp) );
                this.migrationFields = JSON.parse(r).AllItems;
                console.log('Checking');
                let newarr=[];
                var ind=[];
                for(let i=0;i<this.migrationFields.length;i++)
                {
                    try
                    {
                        if(this.migrationFields[i].fieldName=='CustomSettings')
                        {
                            ind.push(i);
                            var customSettings=this.migrationFields[i];
                            console.log('Custom Settings',customSettings);
                            this.customSettingsSource=customSettings.source;
                            this.customSettingsTarget=customSettings.target;
                            console.log('Source :',this.customSettingsSource);
                            console.log('Target :',this.customSettingsTarget);
                        }else if(this.migrationFields[i].fieldName=='Compliance'){
                            ind.push(i);
                            var compliance=this.migrationFields[i];
                            console.log('Complaince',compliance);
                            this.complianceSource=compliance.source;
                            this.complianceTarget=compliance.target;
                            console.log('Source :',this.complianceSource);
                            console.log('Target :',this.complianceTarget);
                        }else if(this.migrationFields[i].fieldName=='relatedTask'){

                            ind.push(i);
                            var relatedTask=this.migrationFields[i];
                            if(relatedTask.arr.length!=0){
                                this.compliancRelatedTask=relatedTask.arr.toString();
                                this.compliancRelatedTask=this.compliancRelatedTask.replaceAll(',',' , ');
                            }else{
                                this.compliancRelatedTask='           -           ';
                            }
                            
                        }else{
                            if(this.migrationFields[i].fieldName == 'Groups'||this.migrationFields[i].fieldName == 'Permission Sets/Profile'||this.migrationFields[i].fieldName == 'Reports'||this.migrationFields[i].fieldName == 'Dashboard')
                            {
                                this.globalFields.push(this.migrationFields[i]);
                            }
                            else
                            {
                                newarr.push(this.migrationFields[i]);
                            }
                        }
                    }
                    catch(e)
                    {
                        console.log(e);
                    }
                }

                
                let temp=this.globalFields;
                this.globalFields=null;
                this.globalFields=temp;
                console.log(this.globalFields);
                
                
                this.migrationFields=newarr;
                this.showFullScreenSpinner = false;
                this.openMigration = true;

                ind.forEach(i=>{
                    this.migrationFields.splice(i,1);
                })

            }else{
                this.configStatus = resp;
                setTimeout( ()=>{
                    this.getAPiStatus();
                }, 20000 );
            }
        } );
    }
    handleDeployExtraItems(){
        console.log(this.selectedItems);
        if(this.selectedItems.length==0 && 
            this.selectedProfiles.length==0 && this.deployEntireClicked==false)
            {
                const event = new ShowToastEvent({
                    title: 'No Item Selected!',
                    message: 'Please select at least 1 item!',
                });
                this.dispatchEvent(event);
            }
        else
        {
            this.noRelatedTask=false;
            if(this.deployEntireClicked){
                this.deployEntireClicked=false;
            }

            console.log('Extra Items');
            console.log(this.selectedItems2);
            this.migrateField = this.migrateField.replaceAll( ' ', '' );
            let jsonToSend={accId:this.recId,FieldValue :'Final'+this.migrateField ,objUsed:this.ObjectUse};
            jsonToSend['GroupsNames']=this.selectedItems;
            jsonToSend['Profiles']=this.selectedProfiles;
            
            
            var tempAr=null;
            
            if(this.staticMapOfRelatedObject[this.ObjectUse]!=undefined && this.staticMapOfRelatedObject[this.ObjectUse]!=null){
                tempAr=this.staticMapOfRelatedObject[this.ObjectUse];
            }
            
            console.log('!!! : : : ',tempAr);
            
            jsonToSend['relatedObj']=tempAr;

            console.log(jsonToSend);

            jsonToSend['entire']=JSON.stringify({Dashboard:this.entireDashboard,Group:this.entireGroup,Permission:this.entirePermission,Report:this.entireReport,ProFile:this.entireProfile,CustomSetting:this.entireCustomSetting,Task:this.entireTask});

    
            console.log('JSON TO SEND',jsonToSend);
            this.openMigration = false;
            this.showCompare = false;
            this.showItems = false;
            this.showConfigSpin = true;
            this.closeStatus = false;
            if( this.migrateField == 'ComplainceConfiguration' ){
                this.configStatus = 'Fetching Records';
            }else{
                this.configStatus = 'Retrieving Configurations';
            }
            console.log('ValueMig:', this.configStatus, this.migrateField);
            deployData(jsonToSend).then( res=>{
                if( this.migrateField == 'ComplainceConfiguration' ){
                    this.configStatus = 'Fetching Records';
                }else{
                    this.configStatus = 'Retrieving Configurations';
                }
                console.log('St:',res);
                this.selectedItems =null;
                this.selectedItems=[];
                this.selectedProfiles=[];

                this.entireDashboard=[];
                this.entireGroup=[];
                this.entirePermission=[];
                this.entireReport=[];
                this.entireCustomSetting=[];
                this.entireProfile=[];
                this.entireTask=[];

                this.selectedItems2=null;
                this.selectedItems2 = [];
                setTimeout( ()=>{
                    var resp = this.getAPiStatus();
                    console.log('Re:',resp);
                }, 20000 );  
            } ).catch(e=>{
                console.log(e);
            })
        }

    }
    handleItemsChange(event){
        if(event.target.dataset.section!=null){
            if(event.target.dataset.section=='group'){

                if(this.entireGroup.includes(event.target.value)){

                    let ind=this.entireGroup.indexOf(event.target.value);
                    console.log(ind);
                    this.entireGroup.splice(ind,1);
                }
                else{
                    this.entireGroup.push(event.target.value);
                }
                console.log('Group:',this.entireGroup);
                
            }else if(event.target.dataset.section=='permissionset'){
                
                if(this.entirePermission.includes(event.target.value)){

                    let ind=this.entirePermission.indexOf(event.target.value);
                    console.log(ind);
                    this.entirePermission.splice(ind,1);
                }
                else{
                    this.entirePermission.push(event.target.value);
                }
                console.log('Permission:',this.entirePermission);
                
            }else if(event.target.dataset.section=='reports'){
                
                if(this.entireReport.includes(event.target.value)){

                    let ind=this.entireReport.indexOf(event.target.value);
                    console.log(ind);
                    this.entireReport.splice(ind,1);
                }
                else{
                    this.entireReport.push(event.target.value);
                }
                
                console.log('Reports',this.entireReport);
            }else if(event.target.dataset.section== 'dashboard'){
                
                if(this.entireDashboard.includes(event.target.value)){

                    let ind=this.entireDashboard.indexOf(event.target.value);
                    console.log(ind);
                    this.entireDashboard.splice(ind,1);
                }
                else{
                    this.entireDashboard.push(event.target.value);
                }
                console.log('Dashboard',this.entireDashboard);
                
            }else if(event.target.dataset.section=='customsetting'){
                
                if(this.entireCustomSetting.includes(event.target.value)){

                    let ind=this.entireCustomSetting.indexOf(event.target.value);
                    console.log(ind);
                    this.entireCustomSetting.splice(ind,1);
                }
                else{
                    this.entireCustomSetting.push(event.target.value);
                }
                console.log('Custom',this.entireCustomSetting);
                
            }else if(event.target.dataset.section=='profile'){
                
                if(this.entireProfile.includes(event.target.value)){

                    let ind=this.entireProfile.indexOf(event.target.value);
                    console.log(ind);
                    this.entireProfile.splice(ind,1);
                }
                else{
                    this.entireProfile.push(event.target.value);
                }
                console.log('Profile',this.entireProfile);
            }
            else if(event.target.dataset.section == 'task'){
                if(this.entireTask.includes(event.target.value)){
                    let ind=this.entireTask.indexOf(event.target.value);
                    console.log(ind);
                    this.entireTask.splice(ind,1);
                }
                else{
                    this.entireTask.push(event.target.value);
                }
                console.log('Task',this.entireTask);
            }
        }
        else{
            console.log(event.target.value);
            if(this.selectedItems.includes(event.target.value))
            {
                let ind=this.selectedItems.indexOf(event.target.value);
                console.log(ind);
                this.selectedItems.splice(ind,1);
            }
            else
            {
                this.selectedItems.push(event.target.value);
            }
            console.log(this.selectedItems);
        }
    }

    selectProfiles(event)
    {
        console.log(event.target.value);
        if(this.selectedProfiles.includes(event.target.value))
        {
            let ind=this.selectedProfiles.indexOf(event.target.value);
            console.log(ind);
            this.selectedProfiles.splice(ind,1);
        }
        else
        {
            this.selectedProfiles.push(event.target.value);
        }
        console.log(this.selectedProfiles);
    }

    hideStatus( event,comp ){

        console.log(comp);
        this.closeStatus = false;
        this.showConfigSpin = false;
        if( comp == 'Compare' ){
            this.showCompare = true;
        }else if( comp == 'GroupDetails'|| comp=='PermissionSet' || comp=='Reports' || comp=='Dashboards'){
            this.showItems = true;
        }else{

            // this.openMigration = true;
            // this.showCompare = false;
            // this.showItems = false;


            if(event!=undefined){
                if(event.target.dataset.compare){
                    this.openMigration = true;
                    this.showCompare = false;
                    this.showItems = false;
                }else{

                    this.selectedItems=[];
                    this.selectedProfiles=[];
                    this.selectedItems2=[];
        
                    this.deployEntireClicked=false;
        
                    this.entireDashboard=[];
                    this.entireGroup=[];
                    this.entirePermission=[];
                    this.entireReport=[];
                    this.entireCustomSetting=[];
                    this.entireProfile=[];
        
        
        
                    this.showFullScreenSpinner = true;
                    this.showCompare = false;
                    this.showItems = false;
            
                        var tempAr=null;

                        if(this.staticMapOfRelatedObject[this.ObjectUse]!=undefined && this.staticMapOfRelatedObject[this.ObjectUse]!=null){
                            tempAr=this.staticMapOfRelatedObject[this.ObjectUse];
                        }

                        console.log('!!! : : : ',tempAr);

                    getSourceTargets( {objUsed : this.ObjectUse,accId:this.recId,relatedObj:tempAr} ).then( res =>{
                        setTimeout( ()=>{
                            var resp = this.getAPiStatus();
                            console.log('Re:',resp);
                        }, 20000 );
                    } ).catch( err=>{
                        console.log(err);
                    } )
                }
            }

        }
    }
}