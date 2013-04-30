/// <reference path="../../../../argos-sdk/libraries/ext/ext-core-debug.js"/>
/// <reference path="../../../../argos-sdk/libraries/sdata/sdata-client-debug"/>
/// <reference path="../../../../argos-sdk/libraries/Simplate.js"/>
/// <reference path="../../../../argos-sdk/src/View.js"/>
/// <reference path="../../../../argos-sdk/src/List.js"/>

define('Mobile/SalesLogix/Views/Home', [
    'dojo/_base/declare',
    'dojo/_base/array',
    'dojo/_base/lang',
    'dojo/dom-attr',
    'dojo/store/Memory',
    'argos/GroupedList',
    'argos!application',
    'argos!scene',
    'argos!customizations',
    'Mobile/SalesLogix/SpeedSearchWidget'
], function(
    declare,
    array,
    lang,
    domAttr,
    Memory,
    GroupedList,
    app,
    scene,
    customizations,
    SpeedSearchWidget
) {
    return declare('Mobile.SalesLogix.Views.Home', [GroupedList], {
        //Templates
        rowTemplate: new Simplate([
            '<li data-action="{%= $.action %}" {% if ($.view) { %}data-view="{%= $.view %}"{% } %}>',
            '<div class="list-item-static-selector">',
            '{% if ($.icon) { %}',
            '<img src="{%: $.icon %}" alt="icon" class="icon" />',
            '{% } %}',
            '</div>',
            '<div class="list-item-content">{%! $$.itemTemplate %}</div>',
            '</li>'
        ]),
        itemTemplate: new Simplate([
            '<h3>{%: $.title %}</h3>'
        ]),

        //Localization
        configureText: 'Configure',
        addAccountContactText: 'Add Account/Contact',
        titleText: 'Home',
        actionsText: 'Quick Actions',
        viewsText: 'Go To',
        accountsText: 'Accounts',
        myActivitesText: 'My Acivities',
        contactsText: 'Contacts',
        leadsText: 'Leads',
        opportunitiesText: 'Opportunities',
        ticketsText: 'Tickets',
        calendarText: 'Calendar',
        historyText: 'History',

        //View Properties
        id: 'home',
        expose: false,
        enableSearch: true,
        searchWidgetClass: SpeedSearchWidget,
        customizationSet: 'home',
        configurationView: 'configure',
        addAccountContactView: 'add_account_contact',
        searchView: 'speedsearch_list',
        searchText: 'SpeedSearch',

        navigateToView: function(evt, node) {
            var view = node && domAttr.get(node, 'data-view');
            if (view) scene().showView(view);
        },
        addAccountContact: function() {
            scene().showView(this.addAccountContactView, {
                insert: true
            });
        },
        formatSearchQuery: function(searchQuery) {
            var expression = new RegExp(searchQuery, 'i');

            return function(entry) {
                return expression.test(entry.title);
            };
        },
        getGroupForItem: function(item) {
            if (item.action == 'navigateToView') {
                return {
                    tag: 'view',
                    title: this.viewsText
                };
            }

            return {
                tag: 'action',
                title: this.actionsText
            };
        },
        createToolLayout: function() {
            return this.tools || (this.tools = {
                top: [{
                    id: 'configure',
                    action: 'navigateToConfigurationView'
                }]
            });
        },
        createLayout: function() {
            return this.layout || (this.layout = [{
                id: 'actions',
                children: [{
                    'name': 'AddAccountContactAction',
                    'action': 'addAccountContact',
                    'icon': 'content/images/icons/New_Contact_24x24.png',
                    'title': this.addAccountContactText
                }]
            },{
                id: 'views',
                children: [{
                    'name': 'myactivity_list',
                    'view': 'myactivity_list',
                    'action': 'navigateToView',
                    'default': true,
                    'icon': 'content/images/icons/To_Do_24x24.png',
                    'title': this.myActivitesText
                },{
                    'name': 'calendar_daylist',
                    'view': 'calendar_daylist',
                    'action': 'navigateToView',
                    'defult': true,
                    'icon': 'content/images/icons/Calendar_24x24.png',
                    'title': this.calendarText,
                    'security': null
                },{
                    'name': 'history_list',
                    'view': 'history_list',
                    'action': 'navigateToView',
                    'default': true,
                    'icon': 'content/images/icons/journal_24.png',
                    'title': this.historyText,
                    'security': null
                },{
                    'name': 'account_list',
                    'view': 'account_list',
                    'action': 'navigateToView',
                    'default': true,
                    'icon': 'content/images/icons/Company_24.png',
                    'title': this.accountsText,
                    'security': 'Entities/Account/View'
                },{
                    'name': 'contact_list',
                    'view': 'contact_list',
                    'action': 'navigateToView',
                    'default': true,
                    'icon': 'content/images/icons/Contacts_24x24.png',
                    'title': this.contactsText,
                    'security': 'Entities/Contact/View'
                },{
                    'name': 'lead_list',
                    'view': 'lead_list',
                    'action': 'navigateToView',
                    'default': true,
                    'icon': 'content/images/icons/Leads_24x24.png',
                    'title': this.leadsText,
                    'security': 'Entities/Lead/View'
                },{
                    'name': 'opportunity_list',
                    'view': 'opportunity_list',
                    'action': 'navigateToView',
                    'default': true,
                    'icon': 'content/images/icons/opportunity_24.png',
                    'title': this.opportunitiesText,
                    'security': 'Entities/Opportunity/View'
                },{
                    'name': 'ticket_list',
                    'view': 'ticket_list',
                    'action': 'navigateToView',
                    'default': true,
                    'icon': 'content/images/icons/Ticket_24x24.png',
                    'title': this.ticketsText,
                    'security': 'Entities/Ticket/View'
                }]
            }]);
        },
        createDefaultViewOrder: function(layout) {
            var order = [];

            array.forEach(layout, function(section) {
                array.forEach(section['children'], function(row) {
                    if (row['default']) order.push(row['view']);
                }, this);
            }, this);

            return order;
        },
        createListFrom: function(layout) {
            var configured = lang.getObject('preferences.home.visible', false, app()) || this.createDefaultViewOrder(layout),
                visible = {},
                views = null,
                list = [];

            array.forEach(configured, function(view, index) { this[view] = index; }, visible);
            array.some(layout, function(row) { if (row.id == 'views') { views = row.children; return false; } });
            array.forEach(views, function(view) { view.position = visible.hasOwnProperty(view.view) ? visible[view.view] : -1; });

            views.sort(function(a, b) {
                return a.position < b.position ? -1 : a.position > b.position ? 1 : 0;
            });

            /* todo: move this functionality into it's own store so that filters can be applied dynamically? */

            array.forEach(layout, function(section) {
                 array.forEach(section['children'], function(row) {
                    if (row['position'] <= -1)
                        return;

                    if (row['security'] && !App.hasAccessTo(row['security']))
                        return;

                    if (typeof this.query !== 'function' || this.query(row))
                        list.push(row);
                }, this);
            }, this);

            return list;
        },
        createStore: function() {
            var layout = customizations().apply(customizations().toPath(this.customizationSet, 'home', this.id), this.createLayout()),
                store = new Memory({
                    idProperty: 'name',
                    data: this.createListFrom(layout)
                });

            return store;
        },
        navigateToConfigurationView: function() {
            scene().showView(this.configurationView);
        },
        refreshRequiredFor: function(options) {
            /* todo: fix processing for refresh */
            /*
            var preferences = app().preferences,
                visible = preferences && preferences.home && preferences.home.visible,
                shown = this.feed && this.feed['$resources'];

            if (!visible || !shown || (visible.length != shown.length)) {
                return true;
            }

            for (var i = 0; i < visible.length; i++)
                if (visible[i] != shown[i]['$key']) return true;
            */

            return this.inherited(arguments);
        }
    });
});

