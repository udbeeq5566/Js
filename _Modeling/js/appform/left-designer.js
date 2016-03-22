define(function (require, exports, module) {
    require("jquery");
    require("jqueryUI");


    var format = require("format");

    var ns = {};
    ns.data = null;
    ns.setData = function (data) {
        this.data = data;
    };
    ns.getData = function () {
        return this.data;
    };

    ns.maxPKId = 0;

    /*初始化表格数据*/
    ns._initFormHtml = function () {
        var template = $("#templateDivCell").html();
        var replace = function (j, item) {
            var t, reg;
            if (item["@type"].toLowerCase() === "blank") {
                t = '<div class="divCell" ><div class="divCellRemove">x</div></div>';
            }
            else {
                $.each(item, function (key, value) {
                    reg = new RegExp('{{' + key + '}}', 'ig');
                    t = (t || template).replace(reg, value);
                });
            }

            if (t) {
                var $sectionBarLastTr = $(".tdSectionBar:last").parent();
                var $divCellLast = $sectionBarLastTr.nextAll().find(".divCell");
                if ($divCellLast.length === 0) {
                    $sectionBarLastTr.after(String.format("<tr><td>{0}</td><td></td><tr>", t));
                }
                else {
                    var $tdLast = $sectionBarLastTr.parent().find(".divCell:last").parent();
                    if ($tdLast.next().length === 0) {
                        $tdLast.parent().after(String.format("<tr><td>{0}</td><td></td><tr>", t));
                    } else {
                        $tdLast.next().html(t);
                    }
                }               
            }
        };

        //item为单数的时候，补充最后一个单元格
        var fillSpace = function () {            
            var $tdLastEmpty = $(".divCell:last").parent().next();
            if ($tdLastEmpty.length == 1 && $tdLastEmpty.children().length == 0) {
                var $divCellTemplate = $("<div class='divCell'></div>");
                $divCellTemplate.droppable(ns.divCellDroppable);
                $tdLastEmpty.html($divCellTemplate);
            }
        };

        //展示section的title
        var initTitle = function (section, index) {
            var showtitle = section["@showtitle"];
            if (showtitle && showtitle.toLowerCase() === "true") {
                var $tr = $(".divCell:last").parent().parent();
                var title = String.format("<tr height='10'><td colspan='2'></td></tr><tr><td class='tdSectionBar' colspan='2'>{0}</td></tr>", section["@title"]);
                index ? $tr.after(title) : $tr.before(title);
                return true;
            }
            return false;
        }

        var data = this.data;
        if (data.form && data.form.tab && data.form.tab.section) {
            //多个section
            if (data.form.tab.section.length) {
                $.each(data.form.tab.section, function (i, section) {
                    //1.展示section的title
                    var showtitle = initTitle(section, 1);

                    //2.展示item
                    $.each(section.item, function (j, item) {
                        if (item["@type"] != "hidden") {
                           replace(j, item);
                        }

                        ns.maxPKId = item["@pkid"] > ns.maxPKId ? item["@pkid"] : ns.maxPKId;
                    });

                    //3.item为单数的时候，补充最后一个空单元格
                    fillSpace();
                });
            }
            else {
                //1.展示section的title
                var section = data.form.tab.section;
                var showtitle = initTitle(section, 0);

                //2.展示item
                $.each(section.item, function (j, item) {
                    if (item["@type"] != "hidden") {
                        replace(j, item);
                    }

                    ns.maxPKId = item["@pkid"] > ns.maxPKId ? item["@pkid"] : ns.maxPKId;
                });

                //3.item为单数的时候，补充最后一个空单元格
                fillSpace();
            }
        }
    };

    /*目标单元格，放置事件*/
    ns.divCellDroppable = {
        hoverClass: "ui-state-hover",
        drop: function (event, ui) {
            var $this = $(this), flag = false;
            var drag = ui.draggable;
            drag.removeAttr("style").css("position", "relative");

            //if ($this.find(".divItem").html().trim() == ui.draggable.html().trim()) {
            //    return;
            //}
            
            drag.removeAttr("style").css("position", "relative");

            if (drag.context.tagName === "LI") {
                flag = true;

                var title, field;
                title = drag.attr("title");
                field = drag.attr("ColumnName");

                drag = $($("#templateDivCell").find(".divCell").html()
                    .replace("{{@title}}", title)
                    .replace("{{@field}}", field)
                    .replace("{{@pkid}}", ++ns.maxPKId)
                    );
                drag.find(".divCell").droppable(ns.divCellDroppable);

                var objItem = {
                    "@type": "text",
                    "@field": field,
                    "@title": title,
                    "@createapi": "1",
                    "@updateapi": "1",
                    "@pkid": ns.maxPKId
                }

                ns.data.form.tab.section.item.push(objItem);
            }

            /*如果目标单元格已存在元素，需新增行再放置*/
            if ($this.find(".divItem").length > 0) {
                //新增行再放置
                var $td = $this.parent();
                var $tr = $td.parent();

                //空行模板
                var $templateTr = $("<tr>" + $("#templateTr").html() + "</tr>");
                $templateTr.find(".divCell").droppable(ns.divCellDroppable)
                    .mouseover(ns._divCellMouseover).mouseout(ns._divCellMouseout);
                $templateTr.find(".divCellRemove").click(ns._removeDivCell);
                if ($td.next().length === 0) {
                    $templateTr.find(".divCell:last").prepend(drag);
                }
                else {
                    $templateTr.find(".divCell:first").prepend(drag);
                }

                $tr.before($templateTr);
            }
            else {
                //直接放在空格上面
                $(this).prepend(drag);
            }

            //todo:绑定优化
            /*绑定拖拽事件*/
            if (flag) {
                ui.draggable.remove();

                $(".divItem").draggable({
                    snapMode: "inner",
                    revert: "invalid",
                    addClasses: false
                });
                
                $(".divItem").mouseover(ns._divItemMouseover).mouseout(ns._divItemMouseout);

                /*删除单元格*/
                $(".divItemRemove").click(ns._removeDivItem);

                /*弹出菜单*/
                $(".divPopup").click(ns._mergeCells);
            }
        }
    }

    /*最外层div放置事件*/
    ns._divAppFormDrappable = {
        drop: function (event, ui) {

        }
    };

    /* divCell 鼠标移入移出事件*/
    ns._divCellMouseover = function () {
        var $tr = $(this).parents("tr:first");
        if ($tr.find(".divItem").length === 0) {            
            $tr.find(".divCellRemove:last").show();
            $tr.addClass("popup-target-active");
        }
    };
    ns._divCellMouseout = function () {
        var $tr = $(this).parents("tr:first");
        if ($tr.find(".divItem").length === 0) {
            $tr.find(".divCellRemove:last").hide();
            $tr.removeClass("popup-target-active");
        }
    };

    /* divItem 鼠标移入移出事件*/
    ns._divItemMouseover = function () {
        var $this = $(this);
        var $pTd = $this.parents("td:first");
        var $pTdNext = $pTd.next();
        $this.addClass("popup-target-active").find(".divItemRemove").show();
        if ($pTd.siblings().length === 0 || ($pTdNext.length > 0 && $pTdNext.find(".divCell").children().length === 0)) {
            $this.find(".divPopup").show();
        }
    };
    ns._divItemMouseout = function () {
        $(this).removeClass("popup-target-active").find(".divItemRemove").hide();
        $(this).find(".divPopup").hide();
    };

    ns._initSectionHtml = function (sectionData) {

    }
    
    /* divItem 删除单元格*/
    ns._removeDivItem = function () {
        var $divCell = $(this).parents(".divCell");
        var title = $divCell.find("div.CellEditableBox").text();
        var columnName = $divCell.find("input.form-control").attr("placeholder");
        if (!title || !columnName) {
            return;
        }

        var $liTemplate = $("#menuField li:first").clone()
            .attr("ColumnName", columnName)
            .attr("title", title)
            .text(title + "(" + columnName + ")").show();
        $liTemplate.draggable({
            appendTo: "body",
            helper: "clone",
            cursor: "move"
        });
        $("#menuField").append($liTemplate);

        //删除item节点
        var $divItem = $divCell.find(".divItem");
        var data_id = $divItem.attr("data-id");
        var arrItems = ns.data.form.tab.section.item;
        $.each(arrItems, function (i, item) {
            if (item["@pkid"] == data_id){
                arrItems.splice(i, 1);
                return false;
            }
        });

        $divItem.remove();
    };

    /* divCell 删除整行*/
    ns._removeDivCell = function () {
        var $tr = $(this).parents("tr:first");
        if ($tr.find(".divItem").length === 0) {
            $tr.remove();
        }
    };

    /*合并单元格、取消合并单元格*/
    ns._mergeCells = function () {
        var $divCellTd = $(this).parents(".divCell").parent();
        if ($divCellTd.next().length > 0 && $divCellTd.next().find("table").length === 0) {
            $divCellTd.next().remove();
            $divCellTd.attr("colspan", "2");
        }
        else if ($divCellTd.attr("colspan") === "2") {
            $divCellTd.attr("colspan", "1");
            var $tempTd = $("<td><div class='divCell ui-droppable'></div></td>");
            $tempTd.find(".divCell").draggable(ns.divCellDroppable);
            $divCellTd.after($tempTd);
            $divCellTd.next().find(".divCell").droppable(ns.divCellDroppable);
        }
    };

    /*事件绑定*/
    ns._bindEvent = function () {
        /*绑定拖拽事件*/
        $(".divItem").draggable({
            snapMode: "inner",
            revert: "invalid",
            cursor: "move",
            addClasses: false
        });

        /*绑定放置事件*/
        $(".divCell").droppable(ns.divCellDroppable);

        /*鼠标移入、移出拖拽单元时的事件*/
        $(".divCell").mouseover(ns._divCellMouseover).mouseout(ns._divCellMouseout);
        $(".divItem").mouseover(ns._divItemMouseover).mouseout(ns._divItemMouseout);

        /*删除单元格*/
        $(".divItemRemove").click(ns._removeDivItem);

        /*删除空白行*/
        $(".divCellRemove").click(ns._removeDivCell);

        /*删除整行*/
        /*$(".divCell").parents("tr").mouseover(function () {
            var $this = $(this);
            if ($this.find(".divItem").length === 0) {
                $this.addClass("popup-target-active").find(".remove:last").show();
            }
        }).mouseout(function () {
            $this.removeClass("popup-target-active").find(".remove:last").hide();
        });*/

        /*弹出菜单*/
        $(".divPopup").click(ns._mergeCells);
    };

    ns.init = function () {
        var me = this;
        me._initFormHtml();
        me._bindEvent();
    };


    /*收集数据*/
    ns.collectData = function () {
        var data = [];
        // 找出所有非隐藏的TR
        var divCells = $("#tbAppForm .divCell").filter(function () { return $(this).parent().parent().css("display") != "none" });

        $.each(divCells, function (key, value) {
            var divItem = $(value).find(".divItem");
            if (divItem && divItem.length > 0) {
                var id = divItem.attr("data-id");
                data.push({ 'data-id': id });
            } else {
                data.push({ 'data-id': '_empty' });
            }
        });

        return data;
    };
    module.exports = ns;
});