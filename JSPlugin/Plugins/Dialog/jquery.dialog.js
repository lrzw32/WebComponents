﻿; (function ($) {
    "use strict";

    window.currentDrag = null;
    window.validEle = null;

    var noDragTag = ["a", "input", "select", "option", "textarea"];

    var dragPara = {
        mouseX: null,
        mouseY: null,
        objX: null,
        objY: null,
        zIndex: 0
    };

    function Drag($ele, options) {
        this.$ele = $ele;
        this.$validEle = $ele.find(".validEle");
        this.options = options;
        this.init();
    }

    Drag.prototype = {
        constructor: Drag,
        init: function () {
            this.bindEvent();

        },
        bindEvent: function () {
            var $ele = this.$ele;
            var that = this;

            $ele.css({
                "marginTop": (parseInt($ele.css("marginTop")) + $ele.scrollTop()) + "px"
            });

            var $validEle = that.$validEle;

            $validEle.on({
                "mouseover": function () {
                    $validEle.css("cursor", "move");
                },
                "mouseout": function () {
                    $validEle.css("cursor", "default");
                },
                "mousedown": function (event) {
                    event = event || window.event;

                    dragPara.mouseX = parseInt(event.clientX) + $ele.scrollLeft();
                    dragPara.mouseY = parseInt(event.clientY) + $ele.scrollTop();

                    currentDrag = $ele;
                    validEle = $validEle;

                    dragPara.objX = parseInt($ele.offset().left) || 0;
                    dragPara.objY = parseInt($ele.offset().top) || 0;

                    dragPara.zIndex = $ele.parent().css("z-index");
                    $ele.css("z-index", ++dragPara.zIndex);
                }
            })

            $(document).on({
                "mouseup": function () {
                    that.clearDrag();
                },
                "mousemove": function (event) {
                    if (currentDrag && validEle) {
                        event = event || window.event;

                        if (!event) {
                            currentDrag.onselectstart = function () {
                                return false;
                            }
                        }

                        var moveLeft = parseInt(event.clientX) + $ele.scrollLeft() - dragPara.mouseX + dragPara.objX;
                        var moveTop = parseInt(event.clientY) + $ele.scrollTop() - dragPara.mouseY + dragPara.objY;

                        //移动的距离不能超过窗口的宽度
                        if (moveLeft > ($(window).width() - currentDrag.width())) {
                            moveLeft = $(window).width() - currentDrag.width();
                        }

                        currentDrag.css({
                            "position": "absolute",
                            "left": (moveLeft > 0 ? moveLeft : 0) + "px",
                            "top": (moveTop > 0 ? moveTop : 0) + "px"
                        });
                    }
                }
            })

            $(window).on("blur", function () {
                that.clearDrag();
            })
        },
        forbid: function () {

        },
        clearDrag: function () {
            currentDrag = null;
            validEle = null;
        }
    };

    //#region 对话框对象
    function Dialog($ele, options) {
        this.options = options;
        this.$mask = null;
        this.$ele = $ele;
        this.renderHtml();
    }

    Dialog.prototype = {
        constructor: Dialog,
        renderHtml: function () {
            if (this.options.modal) {
                var $mask = $("<div></div>");
                $mask.css({
                    "width": "100%",
                    "height": "100%",
                    "position": "fixed",
                    "z-index": "1999",
                    "display": "none"
                }).css(this.options.maskStyle);
                $(document.body).prepend($mask);
                this.$mask = $mask;
            }

            this.setPosition();

            this.bindEvent();
        },
        bindEvent: function () {
            var $window = $(window);
            var that = this;
            $window.on("resize", function () {
                that.$ele.css({

                    top: ($window.height() - that.$ele.height()) / 2,
                    left: ($window.width() - that.$ele.width()) / 2
                });
            });

            if (that.options.drag) {
                $.drag(that.$ele);
            }
        },
        setPosition: function () {
            var position = this.options.fixed ? "fixed" : "absolute";
            var $window = $(window);
            this.$ele.css({
                "z-index": parseInt(this.$mask && this.$mask.css("z-index") || 999, 10) + 1,
                "position": position,
                "top": ($window.height() - this.$ele.height()) / 2,
                "left": ($window.width() - this.$ele.width()) / 2,
                "display": "none",
                "marginTop": 0,
                "marginLeft": 0
            })
        },
        show: function () {
            this.$mask && this.$mask.show();
            this.setPosition();
            this.$ele.slideDown("fast");
        },
        hide: function () {
            this.$mask && this.$mask.hide();
            this.$ele.hide();
        },
        remove: function () {
            this.$mask.remove();
            this.$ele.remove();
        }
    }
    //#endregion 

    $.extend({
        drag: function ($ele) {
            new Drag($ele, {});
        },
        dialog: function ($ele, options) {
            var defaults = {
                modal: true,
                maskStyle: {
                    "background-color": "#a7a7a7",
                    "opacity": "0.3",
                    "filter": "alpha(opacity = 30)"
                },
                drag: true,
                fixed: true,
                html: "<p>弹出对话框</p>"
            };
            options = $.extend(defaults, options || {});
            var dialog = new Dialog($ele, options);
            //dialog.show();

            return dialog;
        }
    });

})(jQuery || $);