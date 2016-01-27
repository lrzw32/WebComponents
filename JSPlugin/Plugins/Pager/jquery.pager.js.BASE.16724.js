(function ($) {
    "use strict";
    var defaults = {
        pageIndex: 0,
        pageSize: 6,
        itemCount: 50,
        maxButtonCount: 7,
        prevText: "上一页",
        nextText: "下一页"
    };

    //思路：生成页码，每次点击页码重新生成所有按钮，而不是改变其中需要改变的按钮
    $.fn.pager = function (options) {
        options = $.extend(defaults, options || {});
        // return this.each(function () {
        //     var self = this;

        var element = $(this);

        function renderHtml() {
            options.pageCount = Math.ceil(options.itemCount / options.pageSize);
            var html = [];

            //生成上一页的按钮
            if (options.pageIndex > 0) {
                html.push('<a page="' + (options.pageIndex - 1) + '" href="' + onGetPageUrl(options.pageIndex + 1) + '" class="flip">' + options.prevText + '</a>');
            } else {
                html.push('<span class="flip noPage">' + options.prevText + '</span>');
            }


            //这里是关键
            //临时的起始页码中间页码，当页码数量大于显示的最大按钮数时使用
            var tempStartIndex = options.pageIndex - Math.floor(options.maxButtonCount / 2) + 1;

            //两种方式计算首尾的页码：
            //先计算终止页码，通过max计算一排按钮中的第一个按钮的页码，然后计算出页数量
            var endIndex = Math.min(options.pageCount, Math.max(0, tempStartIndex) + options.maxButtonCount) - 1;
            var startIndex = Math.max(0, endIndex - options.maxButtonCount + 1);

            //先计算起始页码，通过max计算第一个按钮的页码，注意midPageIndex和pageIndex之间的关系
            //var startIndex = Math.max(0, tempStartIndex);
            //startIndex = Math.min(startIndex, options.pageCount, options.maxButtonCount);
            //var endIndex = Math.min(options.pageCount, startIndex + options.maxButtonCount);

            // 第一页
            if (startIndex > 0) {
                html.push("<a href='" + onGetPageUrl(0) + "' page='" + 0 + "'>1</a> ");
                html.push("<span>...</span>");
            }

            //生成页码按钮
            for (var i = startIndex; i <= endIndex; i++) {
                if (options.pageIndex == i) {
                    html.push('<span class="curPage">' + (i + 1) + '</span>');
                } else {
                    html.push('<a page="' + i + '" href="' + onGetPageUrl(options.pageIndex + 1) + '">' + (i + 1) + '</a>');
                }
            }

            // 最后一页
            if (endIndex < options.pageCount - 1) {
                html.push("<span>...</span> ");
                html.push("<a href='" + onGetPageUrl(options.pageCount - 1) + "' page='" + (options.pageCount - 1) + "'>" + options.pageCount + "</a> ");
            }

            //生成下一页的按钮
            if (options.pageIndex < options.pageCount - 1) {
                html.push('<a page="' + (options.pageIndex + 1) + '" href="' + onGetPageUrl(options.pageIndex + 1) + '" class="flip">' + options.nextText + '</a>');
            } else {
                html.push('<span class="flip noPage">' + options.nextText + '</span>');
            }

            $(element).html(html.join(" ")).find("a").on("click", function () {
                options.pageIndex = parseInt($(this).attr("page"), 10);
                renderHtml();
            })
        }


        function onGetPageUrl(pageIndex) {
            if ($.isFunction(options.onGetPageUrl)) {
                return options.onGetPageUrl(pageIndex);
            }
            return "javascript:;";
        }


        //声明pager对象
        function pager() {
            renderHtml();
        };

        //公开的方法
        pager.prototype = {
            getPageIndex: function () {
                return options.pageIndex;
            },
            setPageIndex: function (pageIndex) {
                options.pageIndex = pageIndex;
                renderHtml();
            },
            setItemCount: function (itemCount) {
                options.pageIndex = 0;
                options.itemCount = itemCount;
                renderHtml();
            }

        }

        return new pager();
        // })

    }

})(jQuery);