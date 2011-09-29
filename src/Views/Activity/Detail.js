/// <reference path="../../../../../argos-sdk/libraries/ext/ext-core-debug.js"/>
/// <reference path="../../../../../argos-sdk/libraries/sdata/sdata-client-debug"/>
/// <reference path="../../../../../argos-sdk/libraries/Simplate.js"/>
/// <reference path="../../../../../argos-sdk/src/View.js"/>
/// <reference path="../../../../../argos-sdk/src/Detail.js"/>

define('Mobile/SalesLogix/Views/Activity/Detail', ['Sage/Platform/Mobile/Detail'], function() {

    dojo.declare('Mobile.SalesLogix.Views.Activity.Detail', [Sage.Platform.Mobile.Detail], {
        //Templates
        leaderTemplate: Mobile.SalesLogix.Template.nameLF,

        //Localization
        activityTypeText: {
            'atToDo': 'To-Do',
            'atPhoneCall': 'Phone Call',
            'atAppointment': 'Meeting',
            'atLiterature': 'Literature Request',
            'atPersonal': 'Personal Activity'
        },
        actionsText: 'Quick Actions',
        completeActivityText: 'Complete Activity',
        alarmText: 'reminder',
        alarmTimeText: 'reminder',
        categoryText: 'category',
        durationText: 'duration',
        leaderText: 'leader',
        longNotesText: 'notes',
        priorityText: 'priority',
        regardingText: 'regarding',
        rolloverText: 'auto rollover',
        startTimeText: 'start time',
        allDayText: 'all day',
        timelessText: 'timeless',
        titleText: 'Activity',
        typeText: 'type',
        companyText: 'company',
        leadText: 'lead',
        accountText: 'account',
        contactText: 'contact',
        opportunityText: 'opportunity',
        ticketNumberText: 'ticket',
        whenText: 'When',
        whoText: 'Who',
        startDateFormatText: 'M/d/yyyy h:mm:ss tt',
        timelessDateFormatText: 'M/d/yyyy',
        alarmDateFormatText: 'M/d/yyyy h:mm:ss tt',

        //View Properties
        id: 'activity_detail',
        completeView: 'activity_complete',
        editView: 'activity_edit',
        querySelect: [
            'AccountId',
            'AccountName',
            'Alarm',
            'AlarmTime',
            'Category',
            'Company',
            'ContactId',
            'ContactName',
            'Description',
            'Duration',
            'UserId',
            'LeadId',
            'LeadName',
            'LongNotes',
            'OpportunityId',
            'OpportunityName',
            'Priority',
            'Rollover',
            'StartDate',
            'TicketId',
            'TicketNumber',
            'Timeless',
            'Type'
        ],
        resourceKind: 'activities',

        formatActivityType: function(val) {
            return this.activityTypeText[val] || val;
        },
        completeActivity: function() {
            var view = App.getView(this.completeView);
            if (view)
            {
                this.refreshRequired = true;

                view.show({
                    title: 'Activity Complete',
                    template: {},
                    entry: this.entry
                }, {
                    returnTo: -1
                });
            }
        },
        isActivityForLead: function(entry) {
            return entry && /^[\w]{12}$/.test(entry['LeadId']);
        },
        isActivityTimeless: function(entry) {
            return entry && Sage.Platform.Mobile.Convert.toBoolean(entry['Timeless']);
        },
        doesActivityHaveReminder: function(entry) {
            return Sage.Platform.Mobile.Convert.toBoolean(entry && entry['Alarm']);
        },
        init: function() {
            this.inherited(arguments);
        },
        createToolLayout: function() {
            return this.tools || (this.tools = {
                tbar: [{
                    cls: '',
                    fn: function() {
                        App.navigateToActivityInsertView.call(App, {"id": this.id});
                    },
                    icon: 'content/images/icons/To_Do_24x24.png',
                    name: 'schedule',
                    scope: this,
                    title: this.fbarScheduleTitleText
                }]
            });
        },
        requestLeader: function(userId)
        {
            var request = new Sage.SData.Client.SDataSingleResourceRequest(this.getService())
                .setResourceKind('users')
                .setResourceSelector(dojo.string.substitute("'${0}'", [userId]))
                .setQueryArg('select', [
                    'UserInfo/FirstName',
                    'UserInfo/LastName'
                ].join(','));

            request.allowCacheUse = true;
            request.read({
                success: this.processLeader,
                failure: this.requestLeaderFailure,
                scope: this
            });
        },
        requestLeaderFailure: function(xhr, o) {
        },
        processLeader: function(leader) {
            if (leader)
            {
                this.entry['Leader'] = leader;

                var rowNode = dojo.query('[data-property="Leader"]'),
                    contentNode = rowNode && dojo.query('[data-property="Leader"] > span', this.domNode);

                if (rowNode)
                    dojo.removeClass(rowNode[0], 'content-loading');

                if (contentNode)
                    contentNode[0].innerHTML = this.leaderTemplate.apply(leader['UserInfo']);
            }
        },
        checkCanComplete: function(entry) {
            return !entry || (entry['UserId'] !== App.context['user']['$key'])
        },
        processEntry: function(entry) {
            this.inherited(arguments);

            if (entry && entry['UserId']) this.requestLeader(entry['UserId']);
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
                    label: this.completeActivityText,
                    icon: 'content/images/icons/Clear_Activity_24x24.png',
                    action: 'completeActivity',
                    disabled: this.checkCanComplete
                }]
            },{
                options: {
                    title: this.detailsText
                },
                as: [{
                    name: 'Type',
                    label: this.typeText,
                    renderer: this.formatActivityType.bindDelegate(this)
                },{
                    name: 'Description',
                    label: this.regardingText
                },{
                    name: 'Category',
                    label: this.categoryText
                },{
                    name: 'Priority',
                    label: this.priorityText
                },{
                    name: 'LongNotes',
                    label: this.longNotesText
                }]
            },{
                options: {
                    title: this.whenText
                },
                as: [{
                    name: 'StartDate',
                    label: this.startTimeText,
                    renderer: Mobile.SalesLogix.Format.date.bindDelegate(this, this.startDateFormatText),
                    exclude: this.isActivityTimeless
                },{
                    name: 'StartDate',
                    label: this.allDayText,
                    renderer: Mobile.SalesLogix.Format.date.bindDelegate(this, this.timelessDateFormatText),
                    include: this.isActivityTimeless
                },{
                    name: 'Timeless',
                    label: this.timelessText,
                    type: 'boolean',
                    include: false
                },{
                    name: 'Duration',
                    label: this.durationText,
                    renderer: Mobile.SalesLogix.Format.timespan,
                    exclude: this.isActivityTimeless
                },{
                    name: 'Alarm',
                    label: this.alarmText,
                    exclude: this.doesActivityHaveReminder
                },{
                    name: 'AlarmTime',
                    label: this.alarmTimeText,
                    renderer: Mobile.SalesLogix.Format.date.bindDelegate(this, this.alarmDateFormatText),
                    include: this.doesActivityHaveReminder
                },{
                    name: 'Rollover',
                    label: this.rolloverText,
                    include: this.isActivityTimeless
                }]
            },{
                options: {
                    title: this.whoText
                },
                as: [{
                    name: 'Leader',
                    label: this.leaderText,
                    cls: 'content-loading',
                    value: 'loading...'
                },{
                    name: 'ContactName',
                    exclude: this.isActivityForLead,
                    label: this.contactText,
                    view: 'contact_detail',
                    key: 'ContactId',
                    descriptor: 'ContactName',
                    property: true
                },{
                    name: 'AccountName',
                    exclude: this.isActivityForLead,
                    label: this.accountText,
                    view: 'account_detail',
                    key: 'AccountId',
                    descriptor: 'AccountName',
                    property: true
                },{
                    name: 'OpportunityName',
                    exclude: this.isActivityForLead,
                    label: this.opportunityText,
                    view: 'opportunity_detail',
                    key: 'OpportunityId',
                    descriptor: 'OpportunityName',
                    property: true
                },{
                    name: 'TicketNumber',
                    exclude: this.isActivityForLead,
                    label: this.ticketNumberText,
                    view: 'ticket_detail',
                    key: 'TicketId',
                    descriptor: 'TicketNumber',
                    property: true
                },{
                    name: 'LeadName',
                    include: this.isActivityForLead,
                    label: this.leadText,
                    view: 'lead_detail',
                    key: 'LeadId',
                    descriptor: 'LeadName',
                    property: true
                },{
                    name: 'AccountName',
                    include: this.isActivityForLead,
                    label: this.companyText
                }]
            }]);
        }        
    });
});
