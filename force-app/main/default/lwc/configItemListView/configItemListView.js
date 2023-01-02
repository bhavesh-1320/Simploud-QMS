import {LightningElement, wire, track, api} from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import getConfigItems from '@salesforce/apex/LWCCustomersListViewController.getConfigItems';
import lookUp from '@salesforce/apex/LWCCustomersListViewController.search';
import getUserName from '@salesforce/apex/LWCCustomersListViewController.getUserName';
import changeConfigItemOwner from '@salesforce/apex/LWCCustomersListViewController.changeConfigItemOwner';

const actions = [
    { label: 'View', name: 'view'},
    { label: 'Assign Internal Ownership', name: 'AssignIntOwner'}
];

// datatable columns with row actions. Set sortable = true
const columns = [
                    { label: 'Name', fieldName: 'Name', sortable: "true"},
                    { label: 'Type', fieldName: 'Simploud__Type__c', sortable: "true"},
                    { label: 'Responsibility', fieldName: 'Simploud__Responsibility__c', sortable: "true"},
                    { label: 'Description', fieldName: 'Simploud__Description__c'},
                    { label: 'Status', fieldName: 'Simploud__Status__c', sortable: "true" },
                    {
                        type: 'action',
                        typeAttributes: {
                            rowActions: actions,
                            menuAlignment: 'right'
                        },
                    },
                ];

export default class ConfigItemListView extends NavigationMixin(LightningElement) {
    @track data;
    @track initialRecords;
    @track columns = columns;
    @track sortBy='Name';
    @track sortDirection='asc';
    @track noOwnerSelectedFlag = false;
    @track isModalOpen = false;

    // retrieving the data using wire service
    @wire(getConfigItems,{field : '$sortBy',sortOrder : '$sortDirection'})
    contacts({ error, data }) {
        if (data) {
            console.log('result.data:: config Items :: ', data);
            this.data = data;
            this.initialRecords = data;
            // this.processRecords(data);
            this.error = undefined;
        } else if (error) {
            console.log('result.error:: config Items :: ', error);
            this.error = error;
            this.data = undefined;
        }
    }
    doSorting(event) {
        // calling sortdata function to sort the data based on direction and selected field
        console.log('In doSorting:: event.detail.fieldName:: ' + event.detail.fieldName);
        console.log('In doSorting:: event.detail.sortDirection:: ' + event.detail.sortDirection);
        this.sortBy = event.detail.fieldName;
        this.sortDirection = event.detail.sortDirection;
    }

    createNew() {

        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Simploud__Configuration_Item__c',
                actionName: 'new'
            }
        });

    }

    handleRowAction(event) {
        let actionName = event.detail.action.name;

        window.console.log('actionName ====> ' + actionName);

        let row = event.detail.row;

        // eslint-disable-next-line default-case
        switch (actionName) {
            case 'view':
                console.log('row ====> ', row);
                console.log('rowId:: ', row.Id);
                this[NavigationMixin.Navigate]({
                    type: 'standard__recordPage',
                    attributes: {
                        recordId: row.Id,
                        actionName: 'view'
                    }
                });
                break;
            case 'AssignIntOwner':
                window.console.log('You really wanna edit dis row ====> ' + JSON.stringify(row));
                this.openModal(row.Id);
                break;
        }

    }

    openModal(configItemId) {
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
        })
        .catch(error => {
            console.log('error in openModal:: ', error);
        })
        // to open modal set isModalOpen tarck value as true
        this.isModalOpen = true;
        this.noOwnerSelectedFlag = false;
    }
    closeModal() {
        // to close modal set isModalOpen tarck value as false
        this.isModalOpen = false;
    }

    changeInternalOwner(event) {
        // to close modal set isModalOpen tarck value as false
        //Add your code to call apex method or do some processing

        if(this.isValueSelected) {
            console.log(this.selectedName + ' || ' + this.prevOwner + ' || ' + this.currentConfigItemId);
            if(this.selectedName != this.prevOwner) {
                console.log('owner changed!');
                console.log(this.selectedName + ' || ' + this.prevOwner);
                changeConfigItemOwner({ownerName: this.selectedName, configItemID: this.currentConfigItemId})
                .then(result => {
                    console.log(result);
                })
                .catch(error => {
                    console.log('error in changing owner!', error);
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

    @api objName = 'User';
    @api iconName = 'standard:user';
    @api filter = '';
    @api searchPlaceholder='Search';
    @track selectedName;
    @track prevOwner = '';
    @track records;
    @track isValueSelected;
    @track blurTimeout;
    @track currentConfigItemId;
    searchTerm;
    //css
    @track boxClass = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-has-focus';
    @track inputClass = '';

    @wire(lookUp, {searchTerm : '$searchTerm', myObject : '$objName', filter : '$filter'})
    wiredRecords({ error, data }) {
        if (data) {
            console.log('User data:: ', data);
            this.error = undefined;
            this.records = data;
        } else if (error) {
            console.log('User error:: ', error);
            this.error = error;
            this.records = undefined;
        }
    }
    handleClick() {
        this.searchTerm = '';
        this.inputClass = 'slds-has-focus';
        this.boxClass = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-has-focus slds-is-open';
    }

    onBlur() {
        this.blurTimeout = setTimeout(() =>  {this.boxClass = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-has-focus'}, 300);
    }

    onSelect(event) {
        let selectedId = event.currentTarget.dataset.id;
        let selectedName = event.currentTarget.dataset.name;
        const valueSelectedEvent = new CustomEvent('lookupselected', {detail:  selectedId });
        this.dispatchEvent(valueSelectedEvent);
        this.isValueSelected = true;
        this.selectedName = selectedName;
        if(this.blurTimeout) {
            clearTimeout(this.blurTimeout);
        }
        this.boxClass = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-has-focus';
    }

    handleRemovePill() {
        this.isValueSelected = false;
    }

    onChange(event) {
        this.searchTerm = event.target.value;
    }

    showErrorToast() {
        // No Owner selected error toast message
        const event = new ShowToastEvent({
            title: 'No owner selected',
            message: 'Please select a owner',
            variant: 'error',
            mode: 'dismissable'
        });
        this.dispatchEvent(event);
    }

    // updateSearch(event) {
    //     console.log('search value:: ', event.target.value);
    //     var regex = new RegExp(event.target.value,'gi');
    //     var temp = this.data;
    //     this.data = temp.filter( row => {
    //         console.log('row:: ', row);
    //         regex.test(row.Name);
    //     });
    // }

    handleSearch( event ) {
        console.log('event.target.value:: ', event.target.value);
        var searchKey = event.target.value.toLowerCase();
        console.log( 'Search String is:: ', searchKey );

        if ( searchKey ) {

            this.data = this.initialRecords;
            console.log('ConfigItem Records are:: ' + JSON.stringify( this.data ) );
            
            if ( this.data ) {

                let recs = [];
                
                for ( let rec of this.data ) {

                    console.log('Rec is:: ' + JSON.stringify( rec ) );
                    console.log('Rec.Id:: ', rec.Id);
                    if(rec.Simploud__Type__c.toLowerCase().includes( searchKey ) || rec.Simploud__Status__c.toLowerCase().includes( searchKey )) {
                        recs.push( rec );
                    }
                    // let valuesArray = Object.values( rec );
                    // console.log( 'valuesArray is:; ' + JSON.stringify( valuesArray ) );
 
                    // for ( let val of valuesArray ) {
                    //     console.log( 'val is:: ' + val );
                    //     let strVal = String( val );
                        
                    //     if ( strVal ) {
                    //         if ( strVal.toLowerCase().includes( searchKey ) ) {
                    //             recs.push( rec );
                    //             break;                        
                    //         }
                    //     }
                    // }                    
                }

                console.log( 'Matched configItems are ' + JSON.stringify( recs ) );
                this.data = recs;
                // this.processRecords(data);
             }
 
        }  else {
            this.data = this.initialRecords;
            // this.processRecords(data);
        }        

    }

    // ******************************** Pagination **********************************

    @track allSelectedRows = [];
    @track page = 1; 
    @track items = [];
    @track startingRecord = 1;
    @track endingRecord = 0; 
    @track pageSize = 10; 
    @track totalRecountCount = 0;
    @track totalPage = 0;
    isPageChanged = false;
    initialLoad = true;
    mapoppNameVsOpp = new Map();

    processRecords(data){
        this.items = data;
        this.totalRecountCount = data.length; 
        this.totalPage = Math.ceil(this.totalRecountCount / this.pageSize); 
        
        this.data = this.items.slice(0,this.pageSize); 
        this.endingRecord = this.pageSize;
        this.columns = columns;
    }
    //clicking on previous button this method will be called
    previousHandler() {
        console.log('In previoushandler this.page:: ' + this.page);
        this.isPageChanged = true;
        if (this.page > 1) {
            this.page = this.page - 1; //decrease page by 1
            this.displayRecordPerPage(this.page);
        }
          var selectedIds = [];
          for(var i=0; i<this.allSelectedRows.length;i++){
            selectedIds.push(this.allSelectedRows[i].Id);
          }
        this.template.querySelector(
            '[data-id="table"]'
          ).selectedRows = selectedIds;
    }

    //clicking on next button this method will be called
    nextHandler() {
        console.log('In nexthandler this.page:: ' + this.page);
        this.isPageChanged = true;
        if((this.page<this.totalPage) && this.page !== this.totalPage){
            this.page = this.page + 1; //increase page by 1
            this.displayRecordPerPage(this.page);            
        }
          var selectedIds = [];
          for(var i=0; i<this.allSelectedRows.length;i++){
            selectedIds.push(this.allSelectedRows[i].Id);
          }
        this.template.querySelector(
            '[data-id="table"]'
          ).selectedRows = selectedIds;
    }

    //this method displays records page by page
    displayRecordPerPage(page){

        this.startingRecord = ((page -1) * this.pageSize) ;
        this.endingRecord = (this.pageSize * page);

        this.endingRecord = (this.endingRecord > this.totalRecountCount) 
                            ? this.totalRecountCount : this.endingRecord; 

        this.data = this.items.slice(this.startingRecord, this.endingRecord);
        this.startingRecord = this.startingRecord + 1;
    }    
}