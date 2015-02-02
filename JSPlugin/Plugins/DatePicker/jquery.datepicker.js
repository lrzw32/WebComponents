﻿; (function ($) {
    "use strict";


    //#region Date扩展

    //计算当前日期与指定日期相差的天数
    Date.prototype.dateDiff = function (otherDate) {
        return (this.getTime() - otherDate.getTime()) / 1000 / 60 / 60 / 24;
    };
    Date.prototype.format = function () {
        var month = this.getMonth() + 1;
        var date = this.getDate();
        month < 10 && (month = "0" + month);
        date < 10 && (date = "0" + date);

        return [this.getFullYear(), month, date].join("-");
    };
    Date.prototype.parse = function (s) {
        if ((s || '') == '')
            return null;

        if (typeof (s) == "object")
            return s;

        if (typeof (s) == 'string') {
            if (/\/Date\(.*\)\//gi.test(s)) {
                return eval(s.replace(/\/Date\((.*?)\)\//gi, "new Date($1)"));
            }
            else if (/(\d{8})/.test(s)) {
                return eval(s.replace(/(\d{4})(\d{2})(\d{2})/, "new Date($1,parseInt($2)-1,$3)"));
            }
            else if (/(\d{4})\W(\d{2})\W(\d{2})T(\d{2})\W(\d{2})\W(\d{2})/.test(s)) {
                return eval(s.replace(/(\d{4})\W(\d{2})\W(\d{2})T(\d{2})\W(\d{2})\W(\d{2})[\w\W]*/, "new Date($1,parseInt($2)-1,$3,$4,$5,$6)"));
            }
            try {
                return new Date(s);
            } catch (e) {
                return null;
            }
        }

        return null;
    };

    //#endregion

    //#region 节假日数据

    //星期几名称
    var weekdayNames = ["日", "一", "二", "三", "四", "五", "六"];

    //节假日名字
    var dayName = {
        "today": "今天",
        "yuandan": "元旦",
        "chuxi": "除夕",
        "chunjie": "春节",
        "yuanxiao": "元宵",
        "qingming": "清明",
        "wuyi": "5.1",
        "duanwu": "端午",
        "zhongqiu": "中秋",
        "guoqing": "国庆",
        "qixi": "七夕",
        "shengdan": "圣诞"
    };
    //2012——2020年节假日数据
    var holidays = {
        today: [new Date().format()],
        yuandan: ["2012-01-01", "2013-01-01", "2014-01-01", "2015-01-01", "2016-01-01", "2017-01-01", "2018-01-01", "2019-01-01", "2020-01-01"],
        chuxi: ["2012-01-22", "2013-02-09", "2014-01-30", "2015-02-18", "2016-02-07", "2017-01-27", "2018-02-15", "2019-02-04", "2020-01-24"],
        chunjie: ["2012-01-23", "2013-02-10", "2014-01-31", "2015-02-19", "2016-02-08", "2017-01-28", "2018-02-16", "2019-02-05", "2020-01-25"],
        yuanxiao: ["2012-02-06", "2013-02-24", "2014-2-14", "2015-03-05", "2016-02-22", "2017-02-11", "2018-03-02", "2019-02-19", "2020-02-8"],
        qingming: ["2012-04-04", "2013-04-04", "2014-04-05", "2015-04-05", "2016-04-04", "2017-04-04", "2018-04-05", "2019-04-05", "2020-04-04"],
        wuyi: ["2012-05-01", "2013-05-01", "2014-05-01", "2015-05-01", "2016-05-01", "2017-05-01", "2018-05-01", "2019-05-01", "2020-05-01"],
        duanwu: ["2012-06-23", "2013-06-12", "2014-06-02", "2015-06-20", "2016-06-09", "2017-05-30", "2018-06-18", "2019-06-07", "2020-06-25"],
        zhongqiu: ["2012-09-30", "2013-09-19", "2014-09-08", "2015-09-27", "2016-09-15", "2017-10-04", "2018-09-24", "2019-09-13", "2020-10-01"],
        guoqing: ["2012-10-01", "2013-10-01", "2014-10-01", "2015-10-01", "2016-10-01", "2017-10-01", "2018-10-01", "2019-10-01", "2020-10-01"],
        qixi: ["2012-08-23", "2013-08-13", "2014-08-02", "2015-08-20", "2016-08-09", "2017-08-28", "2018-08-17", "2019-08-07", "2020-08-25"],
        shengdan: ["2012-12-25", "2013-12-25", "2014-12-25", "2015-12-25", "2016-12-25", "2017-12-25", "2018-12-25", "2019-12-25", "2020-12-25"]

    };
    //#endregion 


    function DatePicker($ele, options) {
        this.$ele = $ele;
        this.options = options;
        this.$container = null;
        this.currentDate = options.currentDate || new Date();
        this.init();
    }


    DatePicker.prototype = {
        constructor: DatePicker,

        init: function () {
            this.renderHtml();
        },
        renderHtml: function () {

            var $container = $('<dl class="datepicker"></dl>');

            $(document.body).append($container);
            this.$container = $container;
            this.refresh();

        },
        refresh: function () {

            var currentYear = this.currentDate.getFullYear();
            var currentMonth = this.currentDate.getMonth();

            var titleHtml = this.createTitleHtml(currentYear, currentMonth);
            var dateListHtml = this.createDateListHtml(currentYear, currentMonth);

            this.$container.html("").append(titleHtml).append(dateListHtml);

            var inputVal = this.$ele.val();
            if (inputVal) {
                this.$container.find("dd .select").removeClass("select");
                this.$container.find("dd>[date=" + inputVal + "]").addClass("select");
            }

            this.bindEvent();
        },
        createTitleHtml: function (currentYear, currentMonth) {
            var titleHtmls =
                ['<dt class="month">',
                    '<a href="javascript:;" class="month-prev"></a>',
                    '<span>' + currentYear + '年' + (currentMonth + 1) + '月</span>',
                    '<a href="javascript:;" class="month-next"></a>',
                "</dt>"];

            $.each(weekdayNames, function (index, value) {
                titleHtmls.push('<dt class="week">' + value + '</dt>');
            })

            return titleHtmls.join("");
        },
        createDateListHtml: function (currentYear, currentMonth) {
            var dateHtml = [];
            dateHtml.push('<dd class="clearfix">');

            var dateList = this.getDateList(currentYear, currentMonth);
            for (var i = 0; i < dateList.length; i++) {
                var date = dateList[i];

                var className = "";
                date.disabled && (className += " disabled");
                date.isHoliday && (className += " holiday");
                //if (date.isSelected) {
                //    className += " select";
                //}

                dateHtml.push('<a date="' + date.format() + '" href="javascript:;" class="' + className + '">' + date.dateText + '</a>');
            }

            dateHtml.push('</dd>');

            return dateHtml.join("");
        },
        getDateList: function (currentYear, currentMonth) {

            var firstDay = new Date(currentYear, currentMonth, 1);
            var lastDay = new Date(currentYear, currentMonth + 1, 0);
            var list = [];

            for (var i = 0; i < firstDay.getDay() ; i++) {
                list.push(this.createDate(new Date(currentYear, currentMonth - 1, i), currentMonth));
            }
            for (var i = 1; i <= lastDay.getDate() ; i++) {
                list.push(this.createDate(new Date(currentYear, currentMonth, i), currentMonth));
            }
            for (var i = 0; i < 6 - lastDay.getDay() ; i++) {
                list.push(this.createDate(new Date(currentYear, currentMonth + 1, i + 1), currentMonth));
            }

            return list;
        },
        createDate: function (date, month) {

            date.disabled = (Math.ceil(date.dateDiff(this.options.minDate)) < 0 || month != date.getMonth());
            //date.isSelected = this.$ele.val() == date.format();

            if (this.options.maxDate && !date.disabled) {
                date.disabled = (Math.ceil(date.dateDiff(this.options.maxDate)) > 0)
            }

            var dateInfo = this.getDayInfo(date);

            date.isHoliday = dateInfo.isHoliday;
            date.dateText = dateInfo.dateText;

            return date;
        },
        getDayInfo: function (date) {
            var formattedDate = date.format();

            var dateInfo = {
                isHoliday: false,
                dateText: date.getDate()
            };

            for (var key in holidays) {
                if (holidays[key].join("").indexOf(formattedDate) > -1) {
                    dateInfo.dateText = dayName[key];
                    dateInfo.isHoliday = true;
                    break;
                }
            }
            return dateInfo;
        },
        bindEvent: function () {
            var that = this;
            that.$container.find("dd>a").on("click", function () {
                var $this = $(this);
                if (!$this.hasClass("disabled")) {
                    var date = $this.attr("date");
                    that.selectDate(date);

                    //var inputVal = $(this).val();
                    //if (inputVal) {
                    that.$container.find("dd .select").removeClass("select");
                    that.$container.find("dd>[date=" + date + "]").addClass("select");
                    //}
                }

            });
            that.$container.find("dt .month-prev").on("click", function () {
                that.prevMonth();
            });
            that.$container.find("dt .month-next").on("click", function () {
                that.nextMonth();
            });
            that.$ele.on({
                "click": function (event) {

                    that.show();

                    event = event || window.event;
                    event.stopPropagation();
                },
                "focus": function () {
                    that.show();
                }
            });

            $(document).on("click", function () {
                that.hide();
            });
            that.$container.on("click", function (event) {
                event = event || window.event;
                event.stopPropagation();
            });
        },
        prevMonth: function () {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.refresh();
        },
        nextMonth: function () {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.refresh();
        },
        selectDate: function (date) {
            this.$ele.val(date);
            this.options.onDateSelected && this.options.onDateSelected(date);
            this.hide();
        },
        hide: function () {
            this.$container.hide();
        },
        show: function () {
            var offset = this.$ele.offset();

            var left = offset.left;
            if (this.options.showCenter) {
                left = left - (this.$ele.outerWidth() / 2);
            }

            this.$container.css({
                "top": offset.top + this.$ele.outerHeight(),
                "left": left,
                "position": "absolute",
                "z-Index": "9999",
                "display": "none"
            });

            this.$container.show();
        },
        setMinDate: function (minDate) {
            this.options.minDate = new Date().parse(minDate);
            this.refresh();
        },
        setMaxDate: function (maxDate) {
            this.options.maxDate = new Date().parse(maxDate);
            this.refresh();
        }
    };

    $.fn.datePicker = function (options) {
        //默认参数放里面，放在外面会污染全局
        var defaults = {
            minDate: new Date(),
            maxDate: null,
            onDateSelected: null,
            showCenter: false
        };
        options = $.extend(defaults, options || {});
        return new DatePicker($(this), options);
    }

})(jQuery || $);