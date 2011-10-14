/// <reference path="../../../../argos-sdk/libraries/ext/ext-core-debug.js"/>
/// <reference path="../../../../argos-sdk/libraries/sdata/sdata-client-debug"/>
/// <reference path="../../../../argos-sdk/libraries/Simplate.js"/>
/// <reference path="../../../../argos-sdk/src/View.js"/>
/// <reference path="../../../../argos-sdk/src/Detail.js"/>

define('Mobile/SalesLogix/Views/Configure', ['Sage/Platform/Mobile/List'], function() {

    return dojo.declare('Mobile.SalesLogix.Views.Configure', [Sage.Platform.Mobile.List], {
        //Templates
        emptyTemplate: new Simplate(['']),
        itemTemplate: new Simplate([
            '<h3>',
            '{% if ($.icon) { %}',
            '<img src="{%: $.icon %}" alt="icon" class="icon" />',
            '{% } %}',
            '<span>{%: $.$descriptor %}</span>',
            '<span data-action="moveUp"></span>',
            '<span data-action="moveDown"></span>',
            '</h3>'
        ]),

        // Localization
        titleText: 'Configure',
        savePrefsText: 'Save', // TODO: is this no longer in use?

        //View Properties
        id: 'configure',
        expose: false,
        hideSearch: true,
        selectionOnly: true,
        allowSelection: true,
        autoClearSelection: false,

        init: function() {
            this.inherited(arguments);
        },
        createToolLayout: function() {
            return this.tools || (this.tools = {
                tbar: [{
                    id: 'save',
                    fn: this.savePreferences,
                    scope: this
                },{
                    id: 'cancel',
                    side: 'left',
                    fn: ReUI.back,
                    scope: ReUI
                }]
            });
        },
        savePreferences: function() {
            App.preferences.home = App.preferences.home || {};
            App.preferences.configure = App.preferences.configure || {};

            // clear existing
            var visible = App.preferences.home.visible = [];
            var order = App.preferences.configure.order = [];

            // since the selection model does not have ordering, use the DOM
            dojo.query('li', this.domNode).forEach(function(node) {
                var key = dojo.attr(node, 'data-key');
                if (key)
                {
                    order.push(key);

                    if (dojo.hasClass(node, 'list-item-selected'))  {
                        visible.push(key);
                    }
                }
            });

            App.persistPreferences();

            ReUI.back();
        },
        moveUp: function(params) {
            var node = dojo.query(params.$source),
            row = node.parents('li').first();
            if (row)
                row.insertBefore(dojo.query(row).prev('li'))
        },
        moveDown: function(params) {
            var node = dojo.query(params.$source),
            row = node.parents('li').first();
            if (row)
                row.insertAfter(dojo.query(row).next('li'))
        },
        hasMoreData: function() {
            return false;
        },
        requestData: function() {
            var list = [],
                lookup = {},
                exposed = App.getExposedViews(),
                order = (App.preferences.configure && App.preferences.configure.order) || [],
                view, i, n;

            for (i = 0; i < exposed.length; i++)
                lookup[exposed[i]] = true;

            for (i = 0; i < order.length; i++)
                if (lookup[order[i]])
                    delete lookup[order[i]];

            for (n in lookup)
                order.push(n);

            for (i = 0; i < order.length; i++)
            {
                view = App.getView(order[i]);

                if (view)
                {
                    list.push({
                        '$key': view.id,
                        '$descriptor': view.titleText,
                        'icon': view.icon
                    });
                }
                else
                    order.splice(i, 1);
            }

            this.processFeed({'$resources': list});
        },
        processFeed: function(feed) {
            this.inherited(arguments);

            var visible = (App.preferences.home && App.preferences.home.visible) || [],
                row,
                i,
                visibleLength = visible.length;

            for (i = 0; i < visibleLength; i++)
            {
                row = dojo.query((dojo.string.substitute('[data-key="${0}"]', [visible[i]])), this.domNode)[0];

                if (row)
                    this._selectionModel.toggle(visible[i], this.entries[visible[i]], row);
            }
        }
    });
});