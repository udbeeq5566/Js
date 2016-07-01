
define(function (require, exports, module) {
    require("jquery");

    var format = require("format"),
        leftDesigner = require("/_Modeling/js/appform/left-designer.js?a=52014"),
        rightDesigner = require("/_Modeling/js/appform/right-designer.js?a=12")



    var ns = {};
    ns.data = null;
    ns.xPath = null;
    ns.setXPath = function (xmlpath) {
        this.xPath = xmlpath || "/Demo/AppFormM2.xml";
    }
    ns.getData = function (ctrlId, xmlpath) {
        var result = null;
        $.ajax({
            type: "Post",
            url: "/_Modeling/LoadData.ashx",
            data: {
                "type": "appform",
                "id": ctrlId,
                "xmlpath": xmlpath
            },
            dataType: "json",
            cache: false,
            timeout: 90000,
            async: false,
            success: function (responseText) {
                result = responseText;
            },
            error: function () {
                alert('非常抱歉,加载内容失败,请重试');
            }
        });

        return result;
    };
    ns._init = function () {
        var me = this;
        me.setXPath();
        var appFormJson = me.getData("appForm", me.xPath);

        // 设置当前操作值
        ns.data = appFormJson;

        leftDesigner.setData(appFormJson);
        leftDesigner.init();

        rightDesigner.setData(appFormJson);
        rightDesigner.init();
    };

    //Array 排序
    ns.by = function (name) {
        return function (o, p) {
        rightDesigner.setData(appFormJson);
        rightDesigner.init();
    };

    //Array 排序
    ns.by = function (name) {
        return function (o, p) {
            var a, b, c;
            if (typeof o === 'object' && typeof p === 'object' && o && p) {
                a = o[name];
                b = p[name];
                if (typeof a === typeof b) {
                    return a < b ? -1 : 1;
                }
                return typeof a < typeof b ? -1 : 1;
            }
        }
    }

    /*事件绑定*/
    ns._bindEvent = function () {
        $("#btnSave").on("click", function () {
            var nsdata = ns.data;
            //标记 排序编码
            var sortnum = 0;
            // 找出所有非隐藏的TR
            $("#tbAppForm tr:visible").each(function () {
                var divCell = $(this).find(".divCell");
                //divCell 过滤一行非空的元素
                if (divCell.find(".divItem").length > 0) {
                    //列补位 
                    $(divCell).each(function () {
                        sortnum++;
                        var divItems = $(this).find(".divItem");
                        var id = $(divItems).attr("data-id");
                        var flag = true;//break 
                        $.each(nsdata.form.tab, function (key, ems) {
                            if (ems.item && divItems.length == 0) {
                                ems.item.push({
                                    "@type": "blank",
                                    "@title": "AppFormBlank" + sortnum,
                                    "html": "补位单元格",
                                    "@colspan": "1",
                                    "@sort": sortnum
                                });
                                flag = false;
                                return flag;
                            }
                            $.each(ems.item, function (key, em) {
                                if (em["@pkid"] == id) {
                                    em["@sort"] = sortnum;
                                    flag = false;
                                    return flag;
                                }
                            })
                            return flag;
                        });
                    });
                }
            });

            //生成顺序
            $.each(nsdata.form.tab, function (key, ems) {
                if (ems.item) {
                    ems.item.sort(ns.by("@sort"))
                    //删除sort
                    $.each(ems.item, function (key, oitem) {
                        if (oitem && oitem["@sort"]) {
                            delete oitem["@sort"]
                        }
                    });
                }

            });

            console.log(nsdata.form.tab);

            //保存后台
            $.ajax({
                type: "Post",
                url: "/_Modeling/LoadData.ashx",
                data: {
                    "type": "save",
                    "xmlpath": ns.xPath,
                    "ojson": JSON.stringify(nsdata)
                },
                cache: false,
                timeout: 90000,
                async: false,
                success: function () {
                    alert("保存成功");
                },
                error: function () {
                    alert('非常抱歉,保存内容失败,请重试');
                }
            });

        });
    }

    ns.save = function () {

    }

    ns._init();
    ns._bindEvent();
    module.exports = ns;
});

///*弹出式菜单popup，start*/
//Function.prototype.binding = function () {
//    if (arguments.length < 2 && typeof arguments[0] == "undefined") return this;
//    var __method = this, args = jQuery.makeArray(arguments), object = args.shift();
//    return function () {
//        return __method.apply(object, args.concat(jQuery.makeArray(arguments)));
//    }
//}
//var Class = function (subclass) {
//    subclass.setOptions = function (options) {
//        this.options = jQuery.extend({}, this.options, options);
//        for (var key in options) {
//            if (/^on[A-Z][A-Za-z]*$/.test(key)) {
//                $(this).bind(key, options[key]);
//            }
//        }
//    }
//    var fn = function () {
//        if (subclass._init && typeof subclass._init == 'function') {
//            this._init.apply(this, arguments);
//        }
//    }
//    if (typeof subclass == 'object') {
//        fn.prototype = subclass;
//    }
//    return fn;
//}
//var PopupLayer = new Class({
//    options: {
//        trigger: null,                            //触发的元素或id,必填参数
//        popupBlk: null,                           //弹出内容层元素或id,必填参数
//        closeBtn: null,                           //关闭弹出层的元素或id
//        popupLayerClass: "popupLayer",            //弹出层容器的class名称
//        eventType: "click",                       //触发事件的类型
//        offsets: {                                //弹出层容器位置的调整值
//            x: 0,
//            y: 0
//        },
//        useFx: false,                             //是否使用特效
//        useOverlay: false,                        //是否使用全局遮罩
//        usePopupIframe: true,                     //是否使用容器遮罩
//        isresize: true,                           //是否绑定window对象的resize事件
//        onBeforeStart: function () { }            //自定义事件
//    },
//    _init: function (options) {
//        this.setOptions(options);                //载入设置
//        this.isSetPosition = this.isDoPopup = this.isOverlay = true;    //定义一些开关
//        this.popupLayer = $(document.createElement("div")).addClass(this.options.popupLayerClass);     //初始化最外层容器
//        this.popupIframe = $(document.createElement("iframe")).attr({ border: 0, frameborder: 0 });         //容器遮罩,用于屏蔽ie6下的select
//        this.trigger = $(this.options.trigger);                         //把触发元素封装成实例的一个属性，方便使用及理解
//        this.popupBlk = $(this.options.popupBlk);                       //把弹出内容层元素封装成实例的一个属性
//        this.closeBtn = $(this.options.closeBtn);                       //把关闭按钮素封装成实例的一个属性
//        $(this).trigger("onBeforeStart");                               //执行自定义事件。
//        this._construct();                                           //通过弹出内容层，构造弹出层，即为其添加外层容器及底层iframe
//        this.trigger.bind(this.options.eventType, function () {            //给触发元素绑定触发事件
//            if (this.isSetPosition) {
//                this.setPosition(this.trigger.offset().left + this.options.offsets.x, this.trigger.offset().top + this.trigger.get(0).offsetHeight + this.options.offsets.y);
//            }
//            this.options.useOverlay ? this._loadOverlay() : null;               //如果使用遮罩则加载遮罩元素
//            (this.isOverlay && this.options.useOverlay) ? this.overlay.show() : null;
//            if (this.isDoPopup && (this.popupLayer.css("display") == "none")) {
//                this.options.useFx ? this.doEffects("open") : this.popupLayer.show();
//            }
//        }.binding(this));
//        this.isresize ? $(window).bind("resize", this.doresize.binding(this)) : null;
//        this.options.closeBtn ? this.closeBtn.bind("click", this.close.binding(this)) : null;   //如果有关闭按钮，则给关闭按钮绑定关闭事件
//    },
//    _construct: function () {                  //构造弹出层
//        this.popupBlk.show();
//        this.popupLayer.append(this.popupBlk.css({ opacity: 1 })).appendTo($(document.body)).css({ position: "absolute", 'z-index': 2, width: this.popupBlk.get(0).offsetWidth, height: this.popupBlk.get(0).offsetHeight });
//        this.options.usePopupIframe ? this.popupLayer.append(this.popupIframe) : null;
//        this.recalculatePopupIframe();
//        this.popupLayer.hide();
//    },
//    _loadOverlay: function () {                //加载遮罩
//        pageWidth = ($.browser.version == "6.0") ? $(document).width() - 21 : $(document).width();
//        this.overlay ? this.overlay.remove() : null;
//        this.overlay = $(document.createElement("div"));
//        this.overlay.css({ position: "absolute", "z-index": 1, left: 0, top: 0, zoom: 1, display: "none", width: pageWidth, height: $(document).height() }).appendTo($(document.body)).append("<div style='position:absolute;z-index:2;width:100%;height:100%;left:0;top:0;opacity:0.3;filter:Alpha(opacity=30);background:#000'></div><iframe frameborder='0' border='0' style='width:100%;height:100%;position:absolute;z-index:1;left:0;top:0;filter:Alpha(opacity=0);'></iframe>")
//    },
//    doresize: function () {
//        this.overlay ? this.overlay.css({ width: ($.browser.version == "6.0") ? $(document).width() - 21 : $(document).width(), height: ($.browser.version == "6.0") ? $(document).height() - 4 : $(document).height() }) : null;
//        if (this.isSetPosition) {
//            this.setPosition(this.trigger.offset().left + this.options.offsets.x, this.trigger.offset().top + this.trigger.get(0).offsetHeight + this.options.offsets.y);
//        }
//    },
//    setPosition: function (left, top) {          //通过传入的参数值改变弹出层的位置
//        this.popupLayer.css({ left: left, top: top });
//    },
//    doEffects: function (way) {                //做特效
//        way == "open" ? this.popupLayer.show("slow") : this.popupLayer.hide("slow");
//    },
//    recalculatePopupIframe: function () {     //重绘popupIframe,这个不知怎么改进，只好先用这个笨办法。
//        this.popupIframe.css({ position: "absolute", 'z-index': -1, left: 0, top: 0, opacity: 0, width: this.popupBlk.get(0).offsetWidth, height: this.popupBlk.get(0).offsetHeight });
//    },
//    close: function () {                      //关闭方法
//        this.options.useOverlay ? this.overlay.hide() : null;
//        this.options.useFx ? this.doEffects("close") : this.popupLayer.hide();
//    }
//});
///*弹出式菜单popup，end*/