/// <reference path="../../../../../argos-sdk/libraries/ext/ext-core-debug.js"/>
/// <reference path="../../../../../argos-sdk/libraries/sdata/sdata-client-debug"/>
/// <reference path="../../../../../argos-sdk/libraries/Simplate.js"/>
/// <reference path="../../../../../argos-sdk/src/View.js"/>
/// <reference path="../../../../../argos-sdk/src/List.js"/>

Ext.namespace("Mobile.SalesLogix.Calendar");

(function() {    
    Mobile.SalesLogix.Calendar.MonthView = Ext.extend(Sage.Platform.Mobile.Calendar, {
        // Localization
        titleText: 'Calendar',
        todayText: 'Today',
        dayText: 'Day',
        weekText: 'Week',
        monthText: 'Month',

        //Templates
        navigationTemplate: new Simplate([
            '<div class="split-buttons">',
                '<button data-tool="today" data-action="getTodayMonthActivities" class="button">{%: $.todayText %}</button>',
                '<button data-tool="day" data-action="navigateToDayView" class="button">{%: $.dayText %}</button>',
                '<button data-tool="week" data-action="navigateToWeekView" class="button">{%: $.weekText %}</button>',
                '<button data-tool="month" class="button">{%: $.monthText %}</button>',
            '</div>'
        ]),
        calendarMonthHeaderTemplate: new Simplate([
            '<tr class="calendar-month-header">',
                '<th class="calendar-prev-month"><button class="button" data-action="goToPreviousMonth"><span></span></button></th>',
                '<th class="calendar-month-name" colspan="5">{%= $.monthName %}&nbsp;{%=$.year %}</span></th>',
                '<th class="calendar-next-month"><button class="button" data-action="goToNextMonth"><span></span></button></th>',
            '</tr>'
        ]),
        calendarActivityCountTemplate: new Simplate([
            '<div><span class="activity-count" title="{0} events">{1}</span></div>'
        ]),

        //View Properties
        id: 'slx_calendar',
        cls: 'activities-for-month',
        activityListView: 'useractivity_list',
        activityWeekView: 'calendar_weeklist',
        insertView: 'activity_types_list',
        currentDate: Date.today(),
        date: Date.today(),
        year: Date.today().getFullYear(),
        month: Date.today().getMonth(),
        activityCache: {},
        resourceKind: 'useractivities',

        _onRefresh: function(o) {
            if (this.resourceKind && o.resourceKind === this.resourceKind)
            {
                this.refreshRequired = true;
            }
            if (o.resourceKind === 'activities'){
                this.refreshRequired = true;
            }
        },
        init: function() {
            Mobile.SalesLogix.Calendar.MonthView.superclass.init.apply(this, arguments);
            this.currentDate = Date.today();
            this.tools.tbar = [{
                id: 'new',
                action: 'navigateToInsertView'
            }];
        },
        initEvents: function() {
            Mobile.SalesLogix.Calendar.MonthView.superclass.initEvents.apply(this, arguments);
            App.on('refresh', this._onRefresh, this);
        },
        render: function() {
            Mobile.SalesLogix.Calendar.MonthView.superclass.render.apply(this, arguments);

            Ext.DomHelper.insertFirst(
                this.contentEl,
                this.navigationTemplate.apply(this),
                true
            );
        },
        selectDay: function(params) {
            Mobile.SalesLogix.Calendar.MonthView.superclass.selectDay.apply(this, arguments);
            this.currentDate = new Date(this.year, this.month, params.date);
        },
        getFirstDayOfCurrentMonth: function(){
            return new Date(this.year, this.month, 1, 0, 0, 0);
        },
        getLastDayOfCurrentMonth: function(){
            return new Date(this.year, this.month, this.daysInMonth[this.month], 23, 59, 59);
        },
        getTodayMonthActivities: function(){
            var today = Date.today();
            this.month = today.getMonth();
            this.year = today.getFullYear();
            this.currentDate = today;
            this.renderCalendar();
        },
        goToNextMonth: function() {
            if (this.month === 11){
                this.year += 1;
            }
            this.month = (this.month + 1) % 12;
            this.currentDate = this.getFirstDayOfCurrentMonth();
            this.renderCalendar();
            if(!this.hasCacheForDate())
                this.refresh();
        },
        goToPreviousMonth: function() {
            if (this.month === 0){
                this.year -= 1;
                this.month = 11;
            } else {
                this.month = (this.month - 1) % 12;
            }
            this.currentDate = this.getFirstDayOfCurrentMonth();
            this.renderCalendar();
            if(!this.hasCacheForDate())
                this.refresh();
        },
        hasCacheForDate: function(date){
            date = date || this.currentDate || new Date();
            return (this.activityCache[Date.CultureInfo.monthNames[date.getMonth()]]);
        },
        refresh: function(){
            this.activityCache[this.monthName] = this.requestData(
                this.getFirstDayOfCurrentMonth(),
                this.getLastDayOfCurrentMonth()
            );
        },
        createRequest: function(where) {
            // get activities feed for current month
            var request = new Sage.SData.Client.SDataResourceCollectionRequest(App.getService())
                .setResourceKind('useractivities')
                .setContractName('dynamic'),
                uri = request.getUri();
            uri.setQueryArg('count','31');
            uri.setQueryArg('startIndex','1');
            uri.setQueryArg('select','Activity/StartDate,Activity/EndDate,Activity/Timeless');
            uri.setQueryArg('orderby','Activity.StartDate asc');
            uri.setQueryArg('where',where);
            return request;
        },
        requestData: function(startDate, endDate) {
            var request = this.createRequest(
                String.format(
                    [
                        'UserId eq "{0}" and (',
                        '(Activity.Timeless eq false and Activity.StartDate between @{1}@ and @{2}@) or ',
                        '(Activity.Timeless eq true and Activity.StartDate between @{3}@ and @{4}@))'
                    ].join(''),
                    App.context['user'] && App.context['user']['$key'],
                    Sage.Platform.Mobile.Convert.toIsoStringFromDate(startDate),
                    Sage.Platform.Mobile.Convert.toIsoStringFromDate(endDate),
                    startDate.toString('yyyy-MM-ddT00:00:00Z'),
                    endDate.toString('yyyy-MM-ddT23:59:59Z')
                )
            );
            request.read({
                success: function(data) {
                    this.onRequestDataSuccess(data);
                },
                failure: function() {
                    this.onRequestDataFailure();
                },
                scope: this
            });
        },
        onRequestDataSuccess: function(data) {
            this.activityCache[this.monthName] = this.processFeed(data);
            this.highlightActivities(this.activityCache[this.monthName]);
        },
        onRequestDataFailure: function(er) {
            console.log( er );
        },
        processFeed: function(sources) {
            var flatList = [],
                dt,
                currentMonthStart = this.getFirstDayOfCurrentMonth(),
                currentMonthEnd = this.getLastDayOfCurrentMonth(),
                r = sources['$resources'],
                sday,
                eday;

            for(var i=0, l=r.length; i<l; i++){
                sday = Sage.Platform.Mobile.Convert.toDateFromString(r[i].Activity.StartDate);
                eday = Sage.Platform.Mobile.Convert.toDateFromString(r[i].Activity.EndDate);
                do { // track No. of activities for each calendar day
                    dt = sday < currentMonthStart ? 1 : (r[i].Activity.Timeless ? sday.getUTCDate() : sday.getDate());
                    flatList[ dt ] = flatList[ dt ] ? 1 + flatList[ dt ] : 1;
                    sday.add({day: 1});
                } while (sday < eday && sday < currentMonthEnd);
            }
            return flatList;
        },
        highlightActivities: function(flatList){
            var template = this.calendarActivityCountTemplate.apply(this);
            Ext.select('.calendar-day').each( function(el) {
                if (flatList[el.dom.textContent]) {
                    el.addClass("activeDay");
                    Ext.DomHelper.insertFirst(el, String.format(
                        template,
                        flatList[el.dom.textContent],
                        flatList[el.dom.textContent]
                    ));
                }
            });
        },
        renderCalendar: function() {
            Mobile.SalesLogix.Calendar.MonthView.superclass.renderCalendar.apply(this, arguments);
            this.timeEl.hide();

            if(this.activityCache[this.monthName]) {
                this.highlightActivities(this.activityCache[this.monthName]);
            }

            if (this.month === this.currentDate.getMonth() && this.year === this.currentDate.getFullYear())
            {
                this.highlightCurrentDate();
            }
        },
        activate: function(tag, data){
            Sage.Platform.Mobile.Calendar.superclass.activate.call(this, tag, data);
            this.renderCalendar();
        },
        show: function(options, transitionOptions) {
            Sage.Platform.Mobile.Calendar.superclass.show.call(this, options);
            this.date = this.currentDate || new Date();
            this.year = this.date.getFullYear();
            this.month = this.date.getMonth();

            this.hideValidationSummary();
            this.renderCalendar();
            this.timeEl.hide();
        },
        getContext: function() {
            return Ext.apply(Mobile.SalesLogix.Calendar.MonthView.superclass.getContext.call(this), {
                resourceKind: this.resourceKind
            });
        },
        highlightCurrentDate: function(){
            var selectedDate = String.format('.calendar-day[data-date={0}]', this.currentDate.toString('d'));
            if (this.selectedDateEl) this.selectedDateEl.removeClass('selected');
            this.selectedDateEl = this.el.child(selectedDate);
            this.selectedDateEl.addClass('selected');
        },
        navigateToWeekView: function() {
            var view = App.getView(this.activityWeekView);
            view.currentDate = this.currentDate.clone() || new Date();
            view.refreshRequired = true;
            view.show();
        },
        navigateToDayView: function() {
            var view = App.getView(this.activityListView);
            view.currentDate = this.currentDate.clone() || new Date();
            view.getActivities();
            view.show();
        },
        navigateToInsertView: function() {
            var view = App.getView(this.insertView);
            view.show({
                returnTo: this.id,
                insert: true
            });
        }
    });
})();