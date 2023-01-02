import { LightningElement, wire, track , api } from 'lwc';
import getAllCustomerRelatedConfigItem from '@salesforce/apex/LWCCustomersListViewController.getAllCustomerRelatedConfigItem';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
import { refreshApex } from '@salesforce/apex';
import { CloseActionScreenEvent } from 'lightning/actions';
import getAllCustomers from '@salesforce/apex/LWCCustomersListViewController.getAllCustomers';
import getLastModifiedConfig from '@salesforce/apex/LWCCustomersListViewController.getLastModifiedConfig';
import createBackup from '@salesforce/apex/LWCCustomersListViewController.createBackup';
import getStatus from '@salesforce/apex/LWCCustomersListViewController.getStatus';

import loading from '@salesforce/resourceUrl/Loading_Image';

// import AccountStatus from '@salesforce/apex/LWCCustomersListViewController.AccountStatus'
const actions = [
    { label: 'View', name: 'view' },
    { label: 'Open CI', name: 'open_ci' },
    { label: 'Back Up', name: 'back_up' },

];

const columns = [
    { label: 'Customer Name', fieldName: 'Name' },
    { label: 'Type', fieldName: 'CustomerStatusType' },
    { label: 'Country', fieldName: '' },
    { label: 'Status', fieldName: '' },
    { label: 'Customer Rating', fieldName: '' },
    { label: 'Open Items', fieldName: '' },
    { label: 'Last Activity', fieldName: '' },
    {
        type: 'action',
        typeAttributes: { rowActions: actions },
    },
];

export default class CustomersListView extends NavigationMixin(LightningElement) {


    loadingimg=loading;
    status = 'Starting';
    closeStatus = false;
    spin = false;
    data = [];
    showFullScreenSpinner=false;
    columns = columns;
    record = {};
    showCustomerList = true;
    showCustomerDetail = false;
    renderTable = true;
    custLst;
    custListStatus;
    customerId;
    customerName;
    wiredRecs;
    configLst;
    tabContent = '';
    showNoConfigItemFoundMsg = false;
    @track isModalOpen = false;
    @track isShowCIModal = false;

    configColumns = [
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
        
        {
            type: 'action',
            typeAttributes: {
                rowActions: [{ label: 'View', name: 'view'}]
            },
        },
    ];

    // @wire(getAllCustomers) getAllCustomersLst(data,error) {

    //     this.wiredRecs = wiredRecords;        
    //     this.custLst = data;
    //     this.custLst.forEach(ele=>{
    //         console.log(ele);
    //     })
    //     console.log('custlst',this.custLst);
    //     // var temp = wiredRecords.data;
    //     // console.log('temp:: ', temp);
    //     // var temp1 = [];

    //     // for(var key in temp) {            
    //     //     if(temp[key].Simploud__Configuration_Items__r == undefined) {
    //     //         temp1[key] = temp[key];
    //     //         temp1[key].Simploud__Configuration_Items__r = [];                
    //     //     } else {
    //     //         temp1[key] = temp[key];
    //     //     }
    //     //     console.log('temp1[key].Simploud__Configuration_Items__r:: after:: ', temp1[key].Simploud__Configuration_Items__r);
    //     // }
    //     console.log('this.custLst:: ', this.custLst);

    // }
    
    // statusClick(event)
    // {
    //     var statusValue = this.querySelectorl(".status");
    //     console.log('Value of tab Of status --------------->',JSON.stringify(statusValue).label);
    // }
    setCustomerId(event) {
        console.log('clicked on this customer Id:: ', event.currentTarget.dataset.recid);
        this.customerId = event.currentTarget.dataset.recid;
        this.showCustomerDetail = true;
        this.showCustomerList = false;
        this.renderTable = false;
        
    }

    // eslint-disable-next-line @lwc/lwc/no-async-await
    async connectedCallback() {
        
        console.log(loading);

        console.log('Chnges');

        this.showFullScreenSpinner=true;

        this.data = await getAllCustomers()
        .then(result => {
            console.log('result ====> ', result);

            this.showFullScreenSpinner=false;
            return result;
        })
        .catch(error => {
            console.log('Error ====> '+ JSON.stringify(error));
            this.dispatchEvent(new ShowToastEvent({
                title: 'Error!!',
                message: error.message,
                variant: 'error'
            }),);
            this.showFullScreenSpinner=false;
        });
        getAllCustomers().then(res=>{
            this.custLst=JSON.parse(JSON.stringify(res));
            this.custLst.forEach(ele=>{
                if(ele.Country__r!=null   )
                {
                    ele['Country']=ele.Country__r.Name+'   ';
                    ele['img']=ele.Country__r.Simploud__Flag__c.split('"')[1];
                }
                console.log('view');
            })
            var nLst=[];
            if(this.custLst != null)
            {
                this.custLst.forEach( cele => {
                    if(cele.Simploud__Status__c =='Pending Evaluation')
                    {
                        nLst.push( cele );
                    }
                });
            }
            this.custListStatus = nLst;
            if( nLst.length == 0 ){
                this.renderTable = false;
                
            }else{
                this.renderTable = true;
                
            }
            getLastModifiedConfig().then(res=>{
                console.log('in');
                this.custLst.forEach(ele=>{
                    res.forEach(e=>{
                        if(ele.Id==e.Id)
                        {
                            if(e.Simploud__Configuration_Items__r!=null&&e.Simploud__Configuration_Items__r!=undefined)
                            {
                                if(Date.parse(e.Simploud__Configuration_Items__r[0].LastModifiedDate) >  Date.parse(e.LastModifiedDate))
                                {
                                    ele['LastModified']=Date.parse(e.Simploud__Configuration_Items__r[0].LastModifiedDate);
                                }
                                else
                                {
                                    ele['LastModified']=Date.parse(e.LastModifiedDate);
                                }
                            }
                            else
                            {
                                ele['LastModified']=Date.parse(ele.LastModifiedDate);
                            }
                        }
                    })
                })
                var temp=this.custLst;
                this.custLst=null;
                this.custLst=temp;
            }).catch(err=>{
                console.log('Last Err');
                console.log(err);
            })
        })
    }
    handleActive(event) {
       try {
        this.tabContent =  `${event.target.label}`;
        console.log(this.tabContent);
        // console.log(this.custLst);
        // console.log('tab');
        var nLst = [];
        if(this.custLst != null)
        {
            this.custLst.forEach( cele => {
                if(cele.Simploud__Status__c == this.tabContent)
                {
                    nLst.push( cele );
                }
            });
        }
        this.custListStatus = nLst;
        if(nLst.length == 0){
            this.renderTable = false;
            
            console.log('value is null');
        }else{
            this.renderTable = true;
            
        }
       } catch (error) {
        console.log(error);
       } // const tab = event.target.value;
       
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

    deleteRow(row) {
        const { id } = row;
        const index = this.findRowIndexById(id);
        if (index !== -1) {
            this.data = this.data
                .slice(0, index)
                .concat(this.data.slice(index + 1));
        }
    }

    findRowIndexById(id) {
        let ret = -1;
        this.data.some((row, index) => {
            if (row.id === id) {
                ret = index;
                return true;
            }
            return false;
        });
        return ret;
    }

    showRowDetails(row) {
        this.record = row;
    }

    handleRadioBtnChange(event) {
        // if (event.target.checked)
        // {
        //     accIds.add(event.target.dataset.id);
        //     console.log('added:: ' + event.target.dataset.id);
        // }
        // else
        // {
        //     accIds.delete(event.target.dataset.id);
        //     console.log('removed:: ' + event.target.dataset.id);
        // }
        // this.selectedRecords = Array.from(accIds);
    }

    openCIAction(event) {
        console.log('event.currentTarget.dataset.recid:: in openCIAction :: ' + event.currentTarget.dataset.recid);

        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: event.currentTarget.dataset.recid,
                actionName: 'view'
            }
        });
        this.isModalOpen = false;
    }

    backUpAction(event) {
        var rowN = event.currentTarget.dataset.rown;
        console.log('ID : ',rowN);
        console.log(this.custLst);

        var creds;
        this.custLst.forEach(ele=>{
            if(ele.Id==rowN){
                creds=ele;
            }
        })

        console.log('!!!!!!!!Name!!!!!!!!!! : ',creds.Name);
        this.status = 'Starting';
        console.log('S:',this.status);
        createBackup( {userName:creds.Simploud_Customer_Username__c, password:creds.Simploud_Customer_Password__c, sToken:creds.Simploud_Customer_Security_Token__c, orgId:creds.Sandbox_Org_ID__c, accId:creds.Id,accName: creds.Name} ).then( res=>{
            this.status = 'Retrieving Configurations';
            this.spin = true;
            console.log('St:',res);
            setTimeout( ()=>{
                var resp = this.getAPiStatus();
                console.log('Re:',resp);
            }, 30000 );
        });
    }
    getAPiStatus(){
        getStatus().then( resp=>{
            console.log('Status:',resp);
            if( resp == 'Completed' || resp.includes('Error') ){
                this.closeStatus = true;
                this.status = resp;
                if( resp == 'Completed' ){
                    this.status = 'Successfully backuped the configurations';
                }
                return resp;
            }else{
                this.status = resp;
                setTimeout( ()=>{
                    this.getAPiStatus();
                }, 40000 );
            }
        } );
    }
    hideStatus(){
        this.closeStatus = false;
        this.spin = false;
    }
    openModal(event) {
        this.configLst = [];
        console.log('event.currentTarget.dataset.recid:: in openCIAction :: ' + event.currentTarget.dataset.recid);
        this.customerName = event.currentTarget.dataset.cusname;
        console.log('event.currentTarget.dataset.cusname:: in openCIAction :: ' + event.currentTarget.dataset.cusname);

        this.showFullScreenSpinner=true;
        
        
        getAllCustomerRelatedConfigItem({customerId: event.currentTarget.dataset.recid})
        .then(result => {

            console.log('getAllCustomerRelatedConfigItem result:: ', result);
            if(result.length > 0) {
                this.configLst = result;
                this.configLst.forEach(element => {
                    element['CreatedByName']=element.CreatedBy.Name;
                    element['OwnerName']=element.Owner.Name;
                    element['NameURL']='/lightning/r/Simploud__Configuration_Item__c/' +element['Id'] +'/view'
                });

            } else {
                this.showNoConfigItemFoundMsg = true;
                this.configLst = [];
            }
            this.showFullScreenSpinner=false;
        })
        .catch(error => {
            console.log(error);
            this.showFullScreenSpinner=false;
        });

        // to open modal set isModalOpen tarck value as true
        this.isModalOpen = true;
    }
    closeModal() {
        // to close modal set isModalOpen tarck value as false
        this.showNoConfigItemFoundMsg = false;
        this.isModalOpen = false;
    }

    submitDetails() {
        // to close modal set isModalOpen tarck value as false
        //Add your code to call apex method or do some processing
        this.showNoConfigItemFoundMsg = false;
        this.isModalOpen = false;
    }

    showListView(event) {
        console.log('called from child:: show customer list view:: before:: ' + this.showCustomerDetail);
        this.showCustomerDetail = false;
        this.showCustomerList = true;
        this.renderTable = true;
        console.log('called from child:: show customer list view:: after:: ' + this.showCustomerDetail);
        console.log('event:: ', event);
        refreshApex(this.wiredRecs);
        // getAllCustomers().then(result => {
        //     this.custLst = result;
        // }).catch(error => {
        //     console.log('error in showing customer list from child comp:: ', error);
        // })
    }
    

    showCIModalBox() {  
        this.isShowCIModal = true;
    }

    hideCIModalBox() {  
        this.isShowCIModal = false;
    }    

    handleConfigRow(event)
    {
        var nam=event.detail.action.name;
        var row=JSON.parse(JSON.stringify(event.detail.row));
        console.log('row');
        console.log(row);
        console.log(event.detail);
        console.log(nam); 
        switch ( nam ) {
            case 'view':
                const config = {		
                    type: "standard__recordPage",		
                    attributes: {		
                        recordId: row.Id,		
                        objectApiName: "Simploud__Configuration_Item__c",		
                        actionName: "view"
                      }		
                  };		
                  this[NavigationMixin.Navigate](config);
                break;
        }
    }

    doSorting(event) {
        this.sortBy = event.detail.fieldName;
        this.sortDirection = event.detail.sortDirection;
        this.sortData(this.sortBy, this.sortDirection);
    }

    sortData(fieldname, direction) {
        let parseData = JSON.parse(JSON.stringify(this.configLst));
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
        this.configLst = parseData;
    }    
}