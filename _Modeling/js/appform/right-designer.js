
define(function (require, exports, module) {
    require("jquery");
    require("jqueryUI");
    require("bootstrap");
    var format = require("format");

    var ns = {};
    ns.data = null;
    ns.setData = function (data) {
        this.data = data;
    };
    /*
      构建所有字段列表加载容器中
    */
    ns._initRightColumn = function () {
        var data = ns.data;
        var menuHtml = $("#menuField").html();
        menuHtml = menuHtml + $.map(data.Columns, function (item) {
            return String.format("<li ColumnName='{ColumnName}' title='{ColumnName}' ColumnType='{ColumnType}' class='list-group-item'>{ColumnName}({ColumnName})</li>", item);
        }).join(' ');

        $("#menuField").html(menuHtml);
    };

    /*
      构建所有字段列表加载From表单中
    */
    ns._initForm = function () {
        /*
              构建所有字段列表加载From表单中
            */
            var $tablehtml = "";
            $.map(ns.data.form.tab, function (ems) {

                $tablehtml = $(String.format("<table id='{0}' class='table table-bordered'><tr><th colspan='2' class='active'>{0}</th></tr></table>", ems["@title"]));

                var trhtml = $("<tr></tr>");
                $.map(ems.item, function (em) {

                    //两个元素为一组
                    if (trhtml.children().length == 2) {
                        $tablehtml.eq(0).append(trhtml);
                        trhtml = $("<tr></tr>");
                    }
                    trhtml.eq(0).append(String.format("<td class='divItem' data-id='{0}' >{1}</td>", em["@pkid"], em["@title"]));
                });
                $("#divAppForm").append($tablehtml);
            });
    };

    ns._bindEvent = function () {
        /*
            测试 根据字段 放置容器中
         */
        $("#menuField li").draggable({
            appendTo: "body",
            helper: "clone",
            cursor: "move"
        });
        $("#menuField").sortable({
            items: "li:not(.placeholder)",
            sort: function () {
                // 获取由 droppable 与 sortable 交互而加入的条目
                // 使用 connectWithSortable 可以解决这个问题，但不允许您自定义 active/hoverClass 选项
                $(this).removeClass("ui-state-default");
            }
        });

        //注册字段托动事件
        //$("#divAppForm td").droppable({
        //    activeClass: "ui-state-default",
        //    hoverClass: "ui-state-hover",
        //    accept: ":not(.ui-sortable-helper)",
        //    drop: function (event, ui) {
        //        //$(this).find(".placeholder").remove();
        //        //ui 来源对象
        //        var drag = ui.draggable;
        //        //this 目标对象
        //        $(this).text(drag.text());
        //        //放置成功后移除
        //        drag.remove();
        //    }
        //});

        //监听show事件
        $('#myModal').on('show.bs.modal',
            function (event) {
                //var button = $(event.relatedTarget) // Button that triggered the modal
                //var recipient = button.data('whatever') // Extract info from data-* attributes
                //// If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
                //// Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
                //var modal = $(this)
                //modal.find('.modal-title').text('New message to ' + recipient)
                //modal.find('.modal-body input').val(recipient)
            }
        );

        //定义Move移动事件处理
        $('div.modal-header').mousedown(
                function (event) {
                    var isMove = true; //移动标识
                    var abs_x = event.pageX - $('div#divModal').offset().left;
                    var abs_y = event.pageY - $('div#divModal').offset().top;
                    //alert(abs_x + "   " + abs_y);
                    $(document).mousemove(function (event) {
                        if (isMove) {
                            var obj = $('div#divModal');
                            //obj.css({ 'left': event.pageX - abs_x, 'top': event.pageY - abs_y });
                            obj.offset({ top: event.pageY - abs_y, left: event.pageX - abs_x });
                        }
                    }
                    ).mouseup(
                            function () {
                                isMove = false;
                            }
                    );
                });

        //绑定下拉框change事件，当下来框改变时调用 SelectChange()方法
        $("#selectOpts").change(function () {
            //获取下拉框选中项的text属性值
            var sel = $(this).find("option:selected");
            //alert(sel.text());
            $("#txtSelectText").val(sel.text());
            $("#txtSelectValue").val(sel.val());

        });

        //注册下拉框select Add button click事件
        $("#btnSelectAdd").click(function () {
            var sel = $("#selectOpts");

            var option = {
                text: $("#txtSelectText").val(),
                value: $("#txtSelectValue").val()
            };

            //不支持Jquery text查找 
            var obj = selectOption(option);
            if (!obj) {
                sel.append(String.format("<option value='{value}'>{text}</option>", option));
                selectRefresh("last");
            }
        });

        //注册下拉框select Del button click事件
        $("#btnSelectDel").click(function () {
            var option = {
                text: $("#txtSelectText").val(),
                value: $("#txtSelectValue").val()
            };

            var obj = selectOption(option);
            if (obj) {
                obj.remove();
                selectRefresh();
            }
        });

        //$.each({ name: "John", lang: "JS" }, function (key, value) {
        //    alert("Name: " + i + ", Value: " + n);
        //});

        // 不支持Jquery text查找 内部查找函数 提供下拉框select 
        var selectOption = function (option) {
            return $.map($("#selectOpts option"), function (o) {
                var op = $(o);
                if (op.text() === option.text) {
                    return op;
                }
            })[0];
        }

        //内部刷新函数 提供下拉框select 刷新
        var selectRefresh = function (order) {
            order = order || "first";
            $("#txtSelectText").val("");
            $("#txtSelectValue").val("");
            $(String.format("#selectOpts option:{0}", order)).attr("selected", true).change();
        }


        //收集------------------json进行提交
        $("#btnSubmit").click(function () {
            //alert("正在更新中....");
            var data = ns.data;
            //进行收集
            var id = $("#formInfo").attr("pkid");
            var flag = true; //jquery flag break
            $.each(data.form.tab, function (key, ems) {

                $.each(ems.item, function (key, em) {
                    if (em["@pkid"] == id) {

                        //属性title
                        em["@title"] = $("#txtTitle").val();

                        //字段必填项
                        em["@req"] = $("#divFieldRequired input:checked").val();

                        //新增默认值
                        em["@defaultvalue"] = $("#txtDefaultValue").val();

                        //修改默认值
                        em["@editvalue"] = $("#txtEditValue").val();

                        //长度
                        if (em.attribute && em.attribute["@maxlength"]) {
                            em.attribute["@maxlength"] = $("#numMaxText").val();
                        }

                        //字段必填项 
                        var apiVal = $("#divRadioReadOnly input:checked").val();
                        /*
                        id="radioReadOnly1" checked="checked" value="1"> 不限制
                        id="radioReadOnly2"  value="2"> 新增只读
                        id="radioReadOnly3" value="3"> 修改只读
                        id="radioReadOnly4" value="4"> 全部只读
                        */

                        //默认值1
                        em["@createapi"] = 1;
                        em["@updateapi"] = 1;

                        if (apiVal == 2) {
                            em["@createapi"] = 0;
                        }
                        else if (apiVal == 3) {
                            em["@updateapi"] = 0;
                        }
                        else if (apiVal == 4) {
                            em["@createapi"] = 0;
                            em["@updateapi"] = 0;
                        }
                        else {
                            em["@createapi"] = 1;
                            em["@updateapi"] = 1;
                        }

                        /*
                         type类型控制显示
                        */
                        var type = em["@type"];
                        if (type === "number") {
                            em["@format"] = $("#txtformat").val();
                            em.attribute["@min"] = $("#numMin").val();
                            em.attribute["@max"] = $("#numMax").val();
                        }
                        else if (type === "datetime") {
                            em["@time"] = $("#selectTime").val();
                        }
                        else if (type === "radio" || type === "select") {
                            //add option {} 
                            em["option"] = $.map($("#selectOpts option"), function (o) {
                                return {
                                    "@value": $(o).val(),
                                    "#text": $(o).text()
                                };
                            });
                        }

                        flag = false;
                        //break
                        return flag;
                    }
                });

                return flag;
            });

            //log 收集 Ajax请求后台处理 
            console.log(data.form.tab);
            console.log("成功！");
            $('#myModal').modal('hide');
        });


        //加载------------字段Model模态窗体中
        $("#divAppForm .divItem").dblclick(function () {
            var data = ns.data;
            var id = $(this).attr("data-id");
            var flag = true; //jquery flag break
            $.each(data.form.tab, function (key, ems) {

                $.each(ems.item, function (key, em) {
                    if (em["@pkid"] == id) {

                        //alert(em["@title"]);
                        $("#txtTitle").val(em["@title"]);
                        $("#txtInfo").val(em["@title"]);
                        $("#formInfo").attr("pkid", id);


                        //字段必填项  测试完成
                        //req  Integer  是否必填项。0 为非必填，1 为必填，2 为建议填写，默认值为 0 。   
                        var req = em["@req"] === undefined ? 0 : em["@req"];
                        $("#divFieldRequired input[name='inlineRadioOptions']").each(function () {
                            var v = $(this).val();
                            //$(this).removeAttr("checked","aaaa");
                            if (v == req) {
                                //alert(req);
                                $(this).attr("checked", "checked");
                                return;
                            }
                        });

                        //新增默认值 测试完成
                        //"@defaultvalue": "外部项目成本库", defaultvalue  String  新增记录时控件的默认值。 
                        $("#txtDefaultValue").val(em["@defaultvalue"]);

                        //修改默认值 测试完成
                        //"@editvalue": "外部项目成本库", defaultvalue  String  新增记录时控件的默认值。 
                        $("#txtEditValue").val(em["@editvalue"]);


                        //长度 测试完成
                        //长度 未有maxlength属性 attribute maxlength="50"  反正不显示
                        if (em.attribute && em.attribute["@maxlength"]) {
                            $("#numMaxText").val(em.attribute["@maxlength"])
                        }
                        else
                        {
                            $("#divMaxLen").hide();
                        }


                        //字段必填项  测试完成
                        //createapi updateapi    
                        //createapi  Integer  新增记录时，控件是否可填。0 为只读，1 为可填，默认值为 1。  
                        //updateapi  Integer  修改记录时，控件是否可填。0 为只读，1 为可填，默认值为 1。  
                        /*
                        id="radioReadOnly1" checked="checked" value="1"> 不限制
                        id="radioReadOnly2"  value="2"> 新增只读
                        id="radioReadOnly3" value="3"> 修改只读
                        id="radioReadOnly4" value="4"> 全部只读
                        */
                        var createapi = em["@createapi"] === undefined ? 1 : em["@createapi"];
                        var updateapi = em["@updateapi"] === undefined ? 1 : em["@updateapi"];
                        if (createapi == 0 && updateapi == 0) {
                            //全部只读
                            $("#radioReadOnly4").attr("checked", "checked");
                        }
                        else if (createapi == 0 && updateapi == 1) {
                            //新增只读
                            $("#radioReadOnly2").attr("checked", "checked");
                        }
                        else if (createapi == 1 && updateapi == 0) {
                            //修改只读
                            $("#radioReadOnly3").attr("checked", "checked");
                        }
                        else {
                            //不限制
                            $("#radioReadOnly1").attr("checked", "checked");
                        }


                        /*
                         type类型控制显示
                        */
                        var type = em["@type"];
                        $("select#selectFieldType").val(type);
                        //隐藏所有div控件
                        $("div.div-control").hide();
                        //显示所属type控件值
                        $(String.format("#div{0}Type", type)).show();

                        //共用Select Option值
                        if (type === "radio") {
                            $(String.format("#div{0}Type", "select")).show();
                        }


                        //number
                        $("#txtformat").val(em["@format"]);
                        if (em.attribute && em.attribute["@min"]) {
                            $("#numMin").val(em.attribute["@min"])
                        }
                        if (em.attribute && em.attribute["@max"]) {
                            $("#numMax").val(em.attribute["@max"])
                        }

                        //datetime
                        $("#selectTime").val(em["@time"]);


                        //select
                        //下拉选项 测试完成 
                        if (em["option"]) {
                            var sel = $("#selectOpts");
                            sel.empty();
                            var options = "";
                            $.map(em.option, function (o) {
                                options += String.format("<option value='{0}'>{1}</option>", o["@value"], o["#text"]);
                            });
                            sel.append(options);
                            //设置下拉框index属性为0的选项 选中触发change
                            selectRefresh();

                        }

                        //显示层控制
                        $('#myModal').modal('show');
                        flag = false;
                        return flag;
                    }
                });

                return flag;
            });
        });

    };


    ns.init = function (IsTest) {
        var me = this;
        me._initRightColumn();
        if (IsTest) {
            me._initForm();
        }
        me._bindEvent();
    }

    module.exports = ns;
});

