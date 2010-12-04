/// <reference path="../../../../../argos-sdk/libraries/ext/ext-core-debug.js"/>
/// <reference path="../../../../../argos-sdk/libraries/sdata/sdata-client-debug"/>
/// <reference path="../../../../../argos-sdk/libraries/Simplate.js"/>
/// <reference path="../../../../../argos-sdk/src/View.js"/>
/// <reference path="../../../../../argos-sdk/src/Detail.js"/>

Ext.namespace("Mobile.SalesLogix.Opportunity");

(function() {
    Mobile.SalesLogix.Opportunity.Detail = Ext.extend(Sage.Platform.Mobile.Detail, {
        //Localization
        accountText: 'acct',
        acctMgrText: 'acct mgr',
        estCloseText: 'est close',
        fbarHomeTitleText: 'home',
        fbarScheduleTitleText: 'schedule',
        importSourceText: 'lead source',
        opportunityText: 'opportunity',
        ownerText: 'owner',
        actionsText: 'Actions',
        potentialText: 'sales potential',
        probabilityText: 'close prob',
        relatedActivitiesText: 'Activities',
        relatedContactsText: 'Contacts',
        relatedHistoriesText: 'History',
        relatedItemsText: 'Related Items',
        relatedNotesText: 'Notes',
        resellerText: 'reseller',
        statusText: 'status',
        titleText: 'Opportunity',
        typeText: 'type',
        scheduleActivityText: 'Schedule activity',
        addNoteText: 'Add note',
        moreDetailsText: 'More Details',

        //View Properties
        id: 'opportunity_detail',
        editView: 'opportunity_edit',
        noteEditView: 'note_edit',
        querySelect: [
            'Account/AccountName',
            'AccountManager/UserInfo/FirstName',
            'AccountManager/UserInfo/LastName',
            'CloseProbability',
            'Description',
            'EstimatedClose',
            'LeadSource/Description',
            'Owner/OwnerDescription',
            'Reseller/AccountName',
            'SalesPotential',
            'Stage',
            'Status',
            'Type',
            'Weighted'
        ],
        resourceKind: 'opportunities',

        scheduleActivity: function() {
            App.navigateToActivityInsertView();
        },
        addNote: function() {
            var view = App.getView(this.noteEditView);
            if (view)
            {
                view.show({
                    template: {},
                    insert: true
                });
            }
        },
        formatAccountRelatedQuery: function(entry, fmt) {
            return String.format(fmt, entry['Account']['$key']);
        },                
        createLayout: function() {
            return this.layout || (this.layout = [{
                options: {
                    list: true,
                    title: this.actionsText,
                    cls: 'action-list'
                },
                as: [{
                    name: 'Description',
                    label: this.scheduleActivityText,
                    icon: 'content/images/icons/job_24.png',
                    action: 'scheduleActivity'
                },{
                    name: 'Description',
                    label: this.addNoteText,
                    icon: 'content/images/icons/note_24.png',
                    action: 'addNote'
                }]
            },{
                options: {
                    title: this.detailsText
                },
                as: [{
                    label: this.opportunityText,
                    name: 'Description'
                },{
                    label: this.accountText,
                    key: 'Account.$key',
                    name: 'Account.AccountName',
                    property: true,
                    view: 'account_detail'
                },{
                    label: this.resellerText,
                    key: 'Reseller.$key',
                    name: 'Reseller.AccountName',
                    property: true,
                    view: 'account_detail'
                },{
                    label: this.estCloseText,
                    name: 'EstimatedClose',
                    renderer: Mobile.SalesLogix.Format.date
                },{
                    label: this.potentialText,
                    name: 'SalesPotential',
                    renderer: Mobile.SalesLogix.Format.currency
                },{
                    label: this.statusText,
                    name: 'Status'
                },{
                    label: this.typeText,
                    name: 'Type'
                },{
                    label: this.probabilityText,
                    name: 'CloseProbability'
                }]
            },{
                options: {
                    title: this.moreDetailsText,
                    collapsed: true
                },
                as: [{
                    label: this.acctMgrText,
                    name: 'AccountManager.UserInfo',
                    renderer: Mobile.SalesLogix.Format.nameLF
                },{
                    label: this.importSourceText,
                    name: 'LeadSource.Description'
                }]
            },{
                options: {
                    list: true,
                    title: this.relatedItemsText
                },
                as: [{
                    icon: 'content/images/icons/job_24.png',
                    label: this.relatedActivitiesText,
                    view: 'activity_related',
                    where: this.formatRelatedQuery.createDelegate(
                        this, ['OpportunityId eq "{0}"'], true
                    )
                },{
                    icon: 'content/images/icons/note_24.png',
                    label: this.relatedNotesText,
                    view: 'note_related',
                    where: this.formatRelatedQuery.createDelegate(
                        this, ['OpportunityId eq "{0}" and Type eq "atNote"'], true
                    )
                },{
                    icon: 'content/images/icons/contact_24.png',
                    label: this.relatedContactsText,
                    view: 'contact_related',
                    where: this.formatRelatedQuery.createDelegate(
                        this, ['Opportunities.Opportunity.Id eq "{0}"'], true
                    )
                },{
                    icon: 'content/images/icons/journal_24.png',
                    label: this.relatedHistoriesText,
                    where: this.formatRelatedQuery.createDelegate(
                        this, ['OpportunityId eq "{0}" and Type ne "atNote" and Type ne "atDatabaseChange"'], true
                    ),
                    view: 'history_related'
                }]
            }]);
        }        
    });
})();