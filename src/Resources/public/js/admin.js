var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
$.arcticmodal('setDefault', {
    modal: false,
    closeOnEsc: false,
    openEffect: {
        type: 'none'
    },
    closeEffect: {
        type: 'none'
    },
    //fixed: '.header.is-fixed',
    closeOnOverlayClick: true
});
$.fn.reverse = [].reverse;
$.fn.serializeObject = function () {
    var json = {};
    $.map($(this).serializeArray(), function (n, i) {
        json[n['name']] = n['value'];
    });
    return json;
};
$(function () {
    Creonit.Admin.Component.Utils.initializeComponents();
});
var Creonit;
(function (Creonit) {
    var Admin;
    (function (Admin) {
        var Component;
        (function (Component) {
            var Scope = (function () {
                function Scope() {
                    this.scopes = [];
                    this.parameters = {};
                }
                Scope.prototype.applySchema = function (schema) {
                    var _this = this;
                    if (schema.template) {
                        this.template = twig({ autoescape: true, data: schema.template });
                        delete schema.template;
                    }
                    if (schema.scopes) {
                        schema.scopes.forEach(function (scope) {
                            var child = new Scope();
                            child.applySchema(scope);
                            _this.addScope(child);
                        });
                        delete schema.scopes;
                    }
                    $.extend(this.parameters, schema);
                };
                Scope.prototype.getScope = function (name) {
                    return this.scopes.filter(function (scope) { return scope.parameters.name == name; })[0];
                };
                Scope.prototype.addScope = function (scope) {
                    scope.setParentScope(this);
                    this.scopes.push(scope);
                    return this;
                };
                Scope.prototype.setParentScope = function (scope) {
                    this.parentScope = scope;
                    return this;
                };
                return Scope;
            }());
            Component.Scope = Scope;
        })(Component = Admin.Component || (Admin.Component = {}));
    })(Admin = Creonit.Admin || (Creonit.Admin = {}));
})(Creonit || (Creonit = {}));
var Creonit;
(function (Creonit) {
    var Admin;
    (function (Admin) {
        var Component;
        (function (Component_1) {
            var Component = (function (_super) {
                __extends(Component, _super);
                function Component(node, name, query, options, parent) {
                    if (query === void 0) { query = {}; }
                    if (options === void 0) { options = {}; }
                    _super.call(this);
                    this.query = {};
                    this.options = {};
                    this.data = {};
                    this.actions = {};
                    this.manager = Component_1.Manager.getInstance();
                    this.name = name;
                    this.query = $.extend({}, query);
                    this.node = node;
                    this.parent = parent;
                    this.options = options;
                    this.loadSchema();
                }
                Component.prototype.action = function (name, options) {
                    if (this.actions[name]) {
                        return this.actions[name].apply(this, options);
                    }
                    else {
                        throw new Error("Undefined method " + name + " in component " + this.name);
                    }
                };
                Component.prototype.getName = function () {
                    return this.name;
                };
                Component.prototype.getQuery = function () {
                    return $.extend({}, this.query);
                };
                Component.prototype.loadSchema = function () {
                    var _this = this;
                    this.request(Component_1.Request.TYPE_LOAD_SCHEMA, this.getQuery(), null, function (response) {
                        _this.checkResponse(response) && _this.applyResponse(response);
                    });
                };
                Component.prototype.loadData = function () {
                    var _this = this;
                    this.request(Component_1.Request.TYPE_LOAD_DATA, this.getQuery(), null, function (response) {
                        _this.checkResponse(response) && _this.applyResponse(response);
                    });
                };
                Component.prototype.checkResponse = function (response) {
                    if (response.error) {
                        if (response.error['_']) {
                            alert(response.error['_'].join("\n"));
                        }
                        return false;
                    }
                    else {
                        return true;
                    }
                };
                Component.prototype.applyResponse = function (response) {
                    console.log(response);
                    if (response.schema) {
                        this.applySchema(response.schema);
                    }
                    if (response.query) {
                        $.extend(this.query, response.query);
                    }
                    this.data = response.data || {};
                    this.render();
                };
                Component.prototype.applySchema = function (schema) {
                    var _this = this;
                    $.each(schema.actions, function (name, action) {
                        _this.actions[name] = eval('(function(){return ' + action + '})()');
                    });
                    $.extend(this.actions, {
                        openComponent: this.openComponent
                    });
                    _super.prototype.applySchema.call(this, schema);
                };
                Component.prototype.render = function () {
                };
                Component.prototype.request = function (type, query, data, callback) {
                    if (query === void 0) { query = {}; }
                    this.manager.request(new Component_1.Request(this, type, query, data, callback));
                };
                Component.prototype.openComponent = function (name, query, options) {
                    var _this = this;
                    if (query === void 0) { query = {}; }
                    if (options === void 0) { options = {}; }
                    options.modal = true;
                    var interval;
                    $("\n                <div class=\"modal-dialog modal-lg\">\n                    " + Component_1.Helpers.component(name, query, options) + "\n                </div>\n            ").arcticmodal({
                        beforeOpen: function (modal, $modal) {
                            Component_1.Utils.initializeComponents($modal, _this);
                        },
                        afterOpen: function (modal, $modal) {
                            var $container = $modal.closest('.arcticmodal-container');
                            interval = setInterval(function () {
                                var $footer = $modal.find('.modal-footer');
                                if (!$footer.length) {
                                    return;
                                }
                                clearInterval(interval);
                                var fix = function () {
                                    $footer.offset({ top: $container.height() + $(window).scrollTop() - $footer.outerHeight() });
                                    if (parseInt($footer.css('top')) > 0) {
                                        $footer.removeAttr('style');
                                    }
                                };
                                interval = setInterval(fix, 1000);
                                fix();
                                $container.on('scroll', fix);
                            }, 10);
                        },
                        afterClose: function () {
                            clearInterval(interval);
                        }
                    });
                };
                return Component;
            }(Component_1.Scope));
            Component_1.Component = Component;
        })(Component = Admin.Component || (Admin.Component = {}));
    })(Admin = Creonit.Admin || (Creonit.Admin = {}));
})(Creonit || (Creonit = {}));
var Creonit;
(function (Creonit) {
    var Admin;
    (function (Admin) {
        var Component;
        (function (Component) {
            var Editor = (function (_super) {
                __extends(Editor, _super);
                function Editor() {
                    _super.apply(this, arguments);
                }
                Editor.prototype.render = function () {
                    var _this = this;
                    this.node.empty();
                    var node = this.node;
                    if (this.options.modal) {
                        this.node.append(node = $("\n                    <div class=\"modal-content\"> \n                        <div class=\"modal-header\"> \n                            <button type=\"button\" class=\"close\"><span>\u00D7</span></button> \n                            <h4 class=\"modal-title\">" + this.parameters.title + "</h4> \n                        </div> \n                        \n                        <div class=\"modal-body\">\n                        </div>\n                   </div>    \n                "));
                        node = node.find('.modal-body');
                        this.node.find('.modal-content').append("<div class=\"modal-footer\">" + Component.Helpers.submit('Сохранить и закрыть', { className: 'editor-save-and-close' }) + " " + Component.Helpers.submit('Сохранить') + " " + Component.Helpers.button('Закрыть') + "</div>");
                        this.node.find('.modal-footer button[type=button], .modal-header .close').on('click', function () {
                            _this.node.arcticmodal('close');
                        });
                    }
                    node.append(this.template.render($.extend({}, this.data, { _query: this.query, _key: this.query.key || null })));
                    if (!this.options.modal) {
                        this.node.append(Component.Helpers.submit('Сохранить'));
                    }
                    var formId = "form" + ++Editor.increment, $form = $("<form id=\"" + formId + "\"></form>");
                    this.node.append($form);
                    this.node.find('input, textarea, select, button').attr('form', formId).filter('input').eq(0).focus();
                    this.node.find('.text-editor').tinymce({
                        doctype: 'html5',
                        element_format: 'html',
                        plugins: ['anchor autolink code image fullscreen hr link media paste nonbreaking visualblocks table'],
                        resize: true,
                        height: 150,
                        visualblocks_default_state: true,
                        relative_urls: false,
                        paste_data_images: true,
                        paste_as_text: true,
                        keep_styles: false,
                        language: 'ru',
                        statusbar: false,
                        //toolbar: 'undo redo | bold italic | styleselect | link image code fullscreen hr link media nonbreaking visualblocks table',
                        toolbar: 'styleselect | bold italic removeformat | link unlink | bullist numlist | table | image media | code fullscreen',
                        image_advtab: true,
                        menubar: false,
                        setup: function (editor) {
                        }
                    });
                    this.node.find('.editor-save-and-close').on('click', function (e) {
                        $(e.currentTarget).attr('clicked', true);
                    });
                    $form.on('submit', function (e) {
                        e.preventDefault();
                        var $form = $(e.currentTarget), data = $form.serializeObject(), query = _this.getQuery(), $buttonCloseAfterSave = _this.node.find('.editor-save-and-close[clicked]'), closeAfterSave = !!$buttonCloseAfterSave.length;
                        $buttonCloseAfterSave.removeAttr('clicked');
                        if (closeAfterSave) {
                            query.closeAfterSave = 1;
                        }
                        _this.node.find("input[type=\"file\"][form=\"" + formId + "\"]").each(function () {
                            var value = $(this)[0].files[0];
                            if (value) {
                                data[$(this).attr('name')] = $(this)[0].files[0];
                            }
                        });
                        _this.node.find('.error-message').each(function () {
                            var $message = $(this), $group = $message.closest('.form-group');
                            $message.remove();
                            $group.removeClass('has-error');
                        });
                        _this.request('send_data', query, data, function (response) {
                            if (_this.checkResponse(response)) {
                                if (closeAfterSave) {
                                    _this.node.arcticmodal('close');
                                }
                                else {
                                    _this.applyResponse(response);
                                }
                                if (_this.parent) {
                                }
                            }
                            else {
                                $.each(response.error, function (scope, messages) {
                                    if ('_' == scope)
                                        return;
                                    _this.node.find("input[name=" + scope + "], select[name=" + scope + "], textarea[name=" + scope + "]").each(function () {
                                        var $control = $(this), $group = $control.closest('.form-group');
                                        $group.addClass('has-error');
                                        $control.after("<span class=\"help-block error-message\">" + messages.join('<br>') + "</span>");
                                    });
                                });
                            }
                        });
                        if (_this.parent) {
                            _this.parent.loadData();
                        }
                    });
                    Component.Utils.initializeComponents(this.node, this);
                };
                Editor.increment = 0;
                return Editor;
            }(Component.Component));
            Component.Editor = Editor;
        })(Component = Admin.Component || (Admin.Component = {}));
    })(Admin = Creonit.Admin || (Creonit.Admin = {}));
})(Creonit || (Creonit = {}));
var Creonit;
(function (Creonit) {
    var Admin;
    (function (Admin) {
        var Component;
        (function (Component) {
            var Helpers;
            (function (Helpers) {
                var increment = 0;
                function cleanOptions(options) {
                    var result;
                    if ($.isArray(options)) {
                        result = [];
                    }
                    else {
                        result = {};
                    }
                    $.each(options, function (key, value) {
                        if (key == '_keys') {
                            return;
                        }
                        if ($.isPlainObject(value)) {
                            result[key] = cleanOptions(value);
                        }
                        else {
                            result[key] = value;
                        }
                    });
                    return result;
                }
                function resolveIconClass(icon) {
                    if (!icon.match(/^(fa-|glyphicon-)/)) {
                        icon = 'fa-' + icon;
                    }
                    return icon.split('-', 1)[0] + " " + icon;
                }
                // Twig Functions
                function button(caption, _a) {
                    var _b = _a === void 0 ? {} : _a, _c = _b.size, size = _c === void 0 ? '' : _c, _d = _b.type, type = _d === void 0 ? 'default' : _d, _e = _b.icon, icon = _e === void 0 ? '' : _e, _f = _b.className, className = _f === void 0 ? '' : _f;
                    return ("<button \n                class=\"btn btn-" + type + " " + (size ? "btn-" + size : '') + " " + className + "\" \n                type=\"button\" \n            >\n                ") + (icon ? "<i class=\"" + resolveIconClass(icon) + "\"></i>" + (caption ? ' ' : '') : '') + (caption + "\n            </button>");
                }
                Helpers.button = button;
                function submit(caption, _a) {
                    var _b = _a === void 0 ? {} : _a, _c = _b.size, size = _c === void 0 ? '' : _c, _d = _b.type, type = _d === void 0 ? 'primary' : _d, _e = _b.icon, icon = _e === void 0 ? '' : _e, _f = _b.className, className = _f === void 0 ? '' : _f;
                    return ("\n            <button \n                class=\"btn btn-" + type + " " + (size ? "btn-" + size : '') + " " + className + "\" \n                type=\"submit\" \n            >\n                ") + (icon ? "<i class=\"" + resolveIconClass(icon) + "\"></i>" + (caption ? ' ' : '') : '') + (caption + "\n            </button>\n        ");
                }
                Helpers.submit = submit;
                function component(name, query, options) {
                    query = JSON.stringify(cleanOptions(query));
                    options = JSON.stringify(cleanOptions(options));
                    return "<div js-component='" + name + " " + query + " " + options + "'></div>";
                }
                Helpers.component = component;
                // Twig Filters
                function tooltip(value, _a) {
                    var text = _a[0], _b = _a[1], placement = _b === void 0 ? 'right' : _b;
                    if (!text) {
                        return value;
                    }
                    var injection = "data-toggle=\"tooltip\" data-placement=\"" + placement + "\" title=\"" + text + "\"";
                    return value.toString().replace(/<(a|div|button)/, "<$1 " + injection);
                }
                Helpers.tooltip = tooltip;
                function icon(value, _a) {
                    var _b = (_a === void 0 ? [''] : _a)[0], icon = _b === void 0 ? '' : _b;
                    if (!icon) {
                        return value;
                    }
                    return "<i class=\"icon " + resolveIconClass(icon) + "\"></i>" + value;
                }
                Helpers.icon = icon;
                function action(value, _a) {
                    var name = _a[0], options = _a.slice(1);
                    if (!value) {
                        return '';
                    }
                    var injection = "js-component-action data-name=\"" + name + "\" data-options='" + JSON.stringify(cleanOptions(options)) + "'";
                    if (typeof value != 'object' || !value.twig_markup) {
                        value = Component.Utils.escape(value);
                    }
                    if (value.toString().match(/<(a|button)/)) {
                        return value.toString().replace(/<(a|button)/, "<$1 " + injection);
                    }
                    return "<a href=\"#\" " + injection + ">" + value + "</a>";
                }
                Helpers.action = action;
                function open(value, _a) {
                    var name = _a[0], _b = _a[1], query = _b === void 0 ? {} : _b, _c = _a[2], options = _c === void 0 ? {} : _c;
                    return action(value, ['openComponent', name, query, options]);
                }
                Helpers.open = open;
                function file(value, _a) {
                    var name = _a[0], _b = _a[1], options = _b === void 0 ? {} : _b;
                    var output = 'Файл не загружен';
                    if (value) {
                        output = "\n                <a href=\"" + value.path + "/" + value.name + "\" target=\"_blank\">" + value.original_name + "</a> (" + value.size + ")\n                <div class=\"checkbox\">\n                    <label class=\"small\">\n                        <input type=\"checkbox\" name=\"" + name + "__delete\"> \u0423\u0434\u0430\u043B\u0438\u0442\u044C \u0444\u0430\u0439\u043B\n                    </label>\n                </div>\n            ";
                    }
                    return "\n            <div class=\"panel panel-default\">\n                <div class=\"panel-heading\"><input type=\"file\" name=\"" + name + "\"></div>\n                <div class=\"panel-body\">" + output + "</div>\n            </div>\n        ";
                }
                Helpers.file = file;
                function image(value, _a) {
                    var _b = _a === void 0 ? ['', {}] : _a, name = _b[0], _c = _b[1], options = _c === void 0 ? {} : _c;
                    options = $.extend({ deletable: true }, options);
                    var output = 'Изображение не загружено';
                    if (value) {
                        output = "<a href=\"" + value.path + "/" + value.name + "\" target=\"_blank\">" + value.preview + "</a>";
                        if (options.deletable) {
                            output += "   \n                    <div class=\"checkbox\">\n                        <label class=\"small\">\n                            <input type=\"checkbox\" name=\"" + name + "__delete\"> \u0423\u0434\u0430\u043B\u0438\u0442\u044C \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u0435\n                        </label>\n                    </div>\n                ";
                        }
                    }
                    return "\n            <div class=\"panel panel-default\">\n                <div class=\"panel-heading\"><input type=\"file\" name=\"" + name + "\"></div>\n                <div class=\"panel-body\">" + output + "</div>\n            </div>\n        ";
                }
                Helpers.image = image;
                function gallery(value, options) {
                    var name = options && options[0] ? options[0] : '', output = 'Изображение не загружено';
                    return component('CreonitUtils.GalleryTable', { field_name: name, gallery_id: value }, {}) + ("<input type=\"hidden\" name=\"" + name + "\" value=\"" + value + "\">");
                }
                Helpers.gallery = gallery;
                function select(value, options) {
                    var name = options && options[0] ? options[0] : '', options = value.options.map(function (option) {
                        return "<option value=\"" + option.value + "\" " + (value.value == option.value ? 'selected' : '') + ">" + option.title + "</option>";
                    }).join('');
                    return "<select name=\"" + name + "\" class=\"form-control\">" + options + "</select>";
                }
                Helpers.select = select;
                function radio(value) {
                    return value;
                }
                Helpers.radio = radio;
                function checkbox(value, _a) {
                    var _b = _a === void 0 ? [] : _a, _c = _b[0], name = _c === void 0 ? '' : _c, _d = _b[1], caption = _d === void 0 ? '' : _d;
                    value = value ? Component.Utils.escape(value.toString()) : '';
                    return "<div class=\"checkbox\"><label><input type=\"checkbox\" name=\"" + name + "\" " + (value ? 'checked' : '') + "> " + caption + "</label></div>";
                }
                Helpers.checkbox = checkbox;
                function text(value, _a) {
                    var name = _a[0], options = _a[1];
                    options = options || {};
                    value = value ? Component.Utils.escape(value.toString()) : '';
                    return "<input type=\"text\" class=\"form-control\" name=\"" + name + "\" value=\"" + value + "\" placeholder=\"" + (options.placeholder || '') + "\">";
                }
                Helpers.text = text;
                function textarea(value, options) {
                    var name = options && options[0] ? options[0] : '';
                    var options = options && options[1] ? options[1] : {};
                    value = value ? Component.Utils.escape(value.toString()) : '';
                    return "<textarea class=\"form-control\" name=\"" + name + "\">" + value + "</textarea>";
                }
                Helpers.textarea = textarea;
                function textedit(value, _a) {
                    var _b = _a === void 0 ? ['', {}] : _a, _c = _b[0], name = _c === void 0 ? '' : _c, _d = _b[1], options = _d === void 0 ? {} : _d;
                    /*        var name = options && options[0] ? options[0] : '';
                            var options = options && options[1] ? options[1] : {};
                    
                            value = value ? Utils.escape(value.toString()) : '';
                    */
                    return "<textarea class=\"text-editor\" name=\"" + name + "\">" + value + "</textarea>";
                }
                Helpers.textedit = textedit;
                function group(body, _a) {
                    var _b = _a === void 0 ? ['', {}] : _a, _c = _b[0], label = _c === void 0 ? '' : _c, _d = _b[1], options = _d === void 0 ? {} : _d;
                    var id = 'widget_' + (++increment);
                    body = body.replace(/<(input|textarea|select)/i, '<$1 id="' + id + '"');
                    if (label) {
                        return "\n            <div class=\"form-group\">\n                <label for=\"" + id + "\" class=\"control-label\">" + label + (options.notice ? "<span class=\"control-label-notice\">" + options.notice + "</span>" : '') + "</label>\n                " + body + "\n            </div>\n        ";
                    }
                    else {
                        return "\n            <div class=\"form-group\">\n                " + body + "\n            </div>\n        ";
                    }
                }
                Helpers.group = group;
                function panel(body) {
                    return "<div class=\"panel panel-default\"><div class=\"panel-body\">" + body + "</div></div>";
                }
                Helpers.panel = panel;
                function col(body, _a) {
                    var _b = (_a === void 0 ? [] : _a)[0], size = _b === void 0 ? 6 : _b;
                    return "<div class=\"col-md-" + size + "\">" + body + "</div>";
                }
                Helpers.col = col;
                function row(body) {
                    return "<div class=\"row\">" + body + "</div>";
                }
                Helpers.row = row;
                function buttons(value) {
                    return "<div class=\"btn-group\">" + value + "</div>";
                }
                Helpers.buttons = buttons;
                function registerTwigFunctions() {
                    [
                        'button',
                        'submit',
                        'buttons',
                        'component',
                        'panel',
                        'group',
                        'row'
                    ].forEach(function (name) {
                        Twig.extendFunction(name, function () {
                            var args = [];
                            for (var _i = 0; _i < arguments.length; _i++) {
                                args[_i - 0] = arguments[_i];
                            }
                            var output = new String(Helpers[name].apply(this, args));
                            output.twig_markup = true;
                            output.twig_function = name;
                            return output;
                        });
                    });
                }
                Helpers.registerTwigFunctions = registerTwigFunctions;
                function registerTwigFilters() {
                    [
                        'checkbox',
                        'radio',
                        'text',
                        'textarea',
                        'textedit',
                        'file',
                        'image',
                        'gallery',
                        'select',
                        'buttons',
                        'group',
                        'tooltip',
                        'icon',
                        'action',
                        'open',
                        'panel',
                        'row',
                        'col'
                    ].forEach(function (name) {
                        Twig.extendFilter(name, function () {
                            var args = [];
                            for (var _i = 0; _i < arguments.length; _i++) {
                                args[_i - 0] = arguments[_i];
                            }
                            var output = new String(Helpers[name].apply(this, args));
                            output.twig_markup = true;
                            output.twig_filter = name;
                            return output;
                        });
                    });
                    [].forEach(function (name) {
                        Twig.extendFilter(name, Helpers[name]);
                    });
                }
                Helpers.registerTwigFilters = registerTwigFilters;
                registerTwigFilters();
                registerTwigFunctions();
            })(Helpers = Component.Helpers || (Component.Helpers = {}));
        })(Component = Admin.Component || (Admin.Component = {}));
    })(Admin = Creonit.Admin || (Creonit.Admin = {}));
})(Creonit || (Creonit = {}));
var Creonit;
(function (Creonit) {
    var Admin;
    (function (Admin) {
        var Component;
        (function (Component) {
            var List = (function (_super) {
                __extends(List, _super);
                function List() {
                    _super.apply(this, arguments);
                }
                List.prototype.render = function () {
                    this.node.html(this.template.render($.extend({}, this.data, { parameters: this.query })));
                    Component.Utils.initializeComponents(this.node, this);
                };
                return List;
            }(Component.Component));
            Component.List = List;
        })(Component = Admin.Component || (Admin.Component = {}));
    })(Admin = Creonit.Admin || (Creonit.Admin = {}));
})(Creonit || (Creonit = {}));
var Creonit;
(function (Creonit) {
    var Admin;
    (function (Admin) {
        var Component;
        (function (Component) {
            var Manager = (function () {
                function Manager() {
                    this.requestStack = [];
                }
                Manager.getInstance = function () {
                    if (!this.instance) {
                        this.instance = new this;
                        this.instance.timer();
                    }
                    return this.instance;
                };
                Manager.prototype.request = function (request) {
                    this.requestStack.push(request);
                    if (this.requestStack.length > 100) {
                        this.requestSend();
                    }
                };
                Manager.prototype.requestSend = function () {
                    var stack = this.requestStack.splice(0, this.requestStack.length), form = new FormData;
                    function getType(any) {
                        return Object.prototype.toString.call(any).slice(8, -1);
                    }
                    function toName(path) {
                        var array = path.map(function (part) { return ("[" + part + "]"); });
                        array[0] = path[0];
                        return array.join('');
                    }
                    stack.forEach(function (request) {
                        var appendToForm = function (path, node, filename) {
                            var name = toName(path);
                            if (typeof filename == 'undefined') {
                                form.append(name, node);
                            }
                            else {
                                form.append(name, node, filename);
                            }
                        };
                        var check = function (node) {
                            var type = getType(node);
                            switch (type) {
                                case 'Array':
                                    return true; // step into
                                case 'Object':
                                    return true; // step into
                                case 'FileList':
                                    return true; // step into
                                default:
                                    return false; // prevent step into
                            }
                        };
                        function iterator(object, parentPath) {
                            $.each(object, function (name, node) {
                                var path = parentPath.slice();
                                path.push(name);
                                var type = getType(node);
                                switch (type) {
                                    case 'Array':
                                        break;
                                    case 'Object':
                                        break;
                                    case 'FileList':
                                        break;
                                    case 'File':
                                        appendToForm(path, node);
                                        break;
                                    case 'Blob':
                                        appendToForm(path, node, node.name);
                                        break;
                                    default:
                                        appendToForm(path, node);
                                        break;
                                }
                                if (check(node)) {
                                    iterator(node, path);
                                }
                            });
                        }
                        iterator(request.getQuery(), ['request[c' + request.getId() + ']']);
                    });
                    $.ajax({
                        url: '/admin/',
                        type: 'post',
                        dataType: 'json',
                        data: form,
                        processData: false,
                        contentType: false,
                        success: function (response) {
                            stack.forEach(function (request, i) {
                                request.passResponse(new Component.Response(response[i]));
                            });
                        },
                        complete: function () {
                        }
                    });
                };
                Manager.prototype.timer = function () {
                    var _this = this;
                    this.timerInstance = setTimeout(function () {
                        if (_this.requestStack.length) {
                            _this.requestSend();
                        }
                        _this.timer();
                    }, 10);
                };
                return Manager;
            }());
            Component.Manager = Manager;
        })(Component = Admin.Component || (Admin.Component = {}));
    })(Admin = Creonit.Admin || (Creonit.Admin = {}));
})(Creonit || (Creonit = {}));
var Creonit;
(function (Creonit) {
    var Admin;
    (function (Admin) {
        var Component;
        (function (Component) {
            var Request = (function () {
                function Request(component, type, query, data, callback) {
                    this.id = Request.increment++;
                    this.component = component;
                    this.name = component.getName();
                    this.type = type;
                    this.query = query;
                    this.data = data;
                    this.callback = callback.bind(component);
                }
                Request.prototype.getId = function () {
                    return this.id;
                };
                Request.prototype.getQuery = function () {
                    return {
                        name: this.name,
                        type: this.type,
                        query: this.query,
                        data: this.data
                    };
                };
                Request.prototype.passResponse = function (response) {
                    this.callback(response);
                };
                Request.TYPE_LOAD_SCHEMA = 'load_schema';
                Request.TYPE_LOAD_DATA = 'load_data';
                Request.increment = 1;
                return Request;
            }());
            Component.Request = Request;
        })(Component = Admin.Component || (Admin.Component = {}));
    })(Admin = Creonit.Admin || (Creonit.Admin = {}));
})(Creonit || (Creonit = {}));
var Creonit;
(function (Creonit) {
    var Admin;
    (function (Admin) {
        var Component;
        (function (Component) {
            var Response = (function () {
                function Response(response) {
                    $.extend(this, response);
                }
                return Response;
            }());
            Component.Response = Response;
        })(Component = Admin.Component || (Admin.Component = {}));
    })(Admin = Creonit.Admin || (Creonit.Admin = {}));
})(Creonit || (Creonit = {}));
var Creonit;
(function (Creonit) {
    var Admin;
    (function (Admin) {
        var Component;
        (function (Component) {
            var Table = (function (_super) {
                __extends(Table, _super);
                function Table() {
                    _super.apply(this, arguments);
                }
                Table.prototype.applySchema = function (schema) {
                    var _this = this;
                    _super.prototype.applySchema.call(this, schema);
                    this.actions['_visible'] = function (options) {
                        var $row = _this.findRowById(options.row_id), $button = $row.find('.table-row-visible'), visible = !$button.hasClass('mod-visible');
                        $button.toggleClass('mod-visible', visible);
                        _this.request('_visible', { key: options.key, scope: options.scope }, { visible: visible }, function (response) {
                            if (_this.checkResponse(response)) {
                                $button.toggleClass('mod-visible', response.data.visible);
                            }
                        });
                    };
                    this.actions['_delete'] = function (options) {
                        if (!confirm('Элемент будет удален, продолжить?')) {
                            return;
                        }
                        _this.findRowById(options.row_id).remove();
                        _this.request('_delete', options, null, function (response) {
                            _this.checkResponse(response);
                        });
                        _this.loadData();
                    };
                };
                Table.prototype.findRowById = function (id) {
                    var result = this.node.find("tr[data-row-id=" + id + "]:eq(0)");
                    return result.length ? result : null;
                };
                Table.prototype.render = function () {
                    var _this = this;
                    this.node.empty();
                    var node = this.node;
                    if (this.options.modal) {
                        this.node.append(node = $("\n                    <div class=\"modal-content\"> \n                        <div class=\"modal-header\"> \n                            <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-label=\"Close\"><span aria-hidden=\"true\">\u00D7</span></button> \n                            <h4 class=\"modal-title\">" + this.parameters.title + "</h4> \n                        </div> \n                        \n                        <div class=\"modal-body\">\n                        </div>\n                   </div>    \n                "));
                        node = node.find('.modal-body');
                        this.node.find('.modal-header .close').on('click', function () {
                            _this.node.arcticmodal('close');
                        });
                    }
                    node.html(this.template.render($.extend({}, this.data, { _query: this.query })));
                    this.scopes.forEach(function (scope) {
                        if (scope.parameters.independent) {
                            if (scope.parameters.recursive) {
                                $.each(_this.parameters.relations, function (i, relation) {
                                    if (relation.source.scope == scope.parameters.name) {
                                        _this.renderRow(scope, relation);
                                        return false;
                                    }
                                });
                            }
                            else {
                                _this.renderRow(scope);
                            }
                        }
                        /*
        
                        */
                    });
                    this.node.find('[js-component-action]').on('click', function (e) {
                        e.preventDefault();
                        var $action = $(e.currentTarget);
                        _this.action($action.data('name'), $action.data('options'));
                    });
                    if (!this.node.find('tbody').children().length) {
                        this.node.find('thead').remove();
                        this.node.find('tbody').html('<tr><td colspan="' + (this.node.find('thead td').length) + '">Список пуст</td></tr>');
                    }
                    this.node.find('[data-toggle="tooltip"]').tooltip();
                    Component.Utils.initializeComponents(this.node, this);
                };
                Table.prototype.renderRow = function (scope, relation, relationValue, level) {
                    var _this = this;
                    if (relation === void 0) { relation = null; }
                    if (relationValue === void 0) { relationValue = null; }
                    if (level === void 0) { level = 0; }
                    this.data.entities[(scope.parameters.name + "." + (relation ? relation.target.scope + "." + (relationValue || '') : '_'))].forEach(function (entity) {
                        var rowId = Component.Utils.generateId();
                        var $entity = $(("<tr data-row-id=\"" + rowId + "\">") + scope.template.render($.extend({}, entity, {
                            _level: function () {
                                return Component.Utils.raw(new Array(level + 1).join('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'));
                            },
                            _visible: function () {
                                return Component.Utils.raw(Component.Helpers.action(Component.Utils.raw(Component.Helpers.button('', { size: 'xs', icon: 'eye', className: "table-row-visible " + (entity.visible ? 'mod-visible' : '') })), ['_visible', { scope: scope.parameters.name, key: entity._key, row_id: rowId }]));
                            },
                            _delete: function () {
                                return Component.Utils.raw(Component.Helpers.action(Component.Utils.raw(Component.Helpers.button('', { size: 'xs', icon: 'remove' })), ['_delete', { scope: scope.parameters.name, key: entity._key, row_id: rowId }]));
                            }
                        })) + '</tr>');
                        _this.node.find('tbody').append($entity);
                        $.each(_this.parameters.relations, function (i, rel) {
                            if (rel.target.scope == scope.parameters.name) {
                                _this.renderRow(_this.getScope(rel.source.scope), rel, entity[rel.target.field], level + 1);
                                return false;
                            }
                        });
                    });
                };
                return Table;
            }(Component.Component));
            Component.Table = Table;
        })(Component = Admin.Component || (Admin.Component = {}));
    })(Admin = Creonit.Admin || (Creonit.Admin = {}));
})(Creonit || (Creonit = {}));
var Creonit;
(function (Creonit) {
    var Admin;
    (function (Admin) {
        var Component;
        (function (Component) {
            var Utils;
            (function (Utils) {
                Utils.ATTR_HANDLER = 'js-component';
                var increment = 0;
                function escape(value) {
                    return value.toString().replace(/&/g, "&amp;")
                        .replace(/</g, "&lt;")
                        .replace(/>/g, "&gt;")
                        .replace(/"/g, "&quot;")
                        .replace(/'/g, "&#039;");
                }
                Utils.escape = escape;
                function createComponent(node, parent) {
                    var componentData = node.attr(Utils.ATTR_HANDLER).match(/^(\w+\.\w+([A-Z][a-z\d]+))\s*(\{\s*.*?\s*\})?(?:\s(\{\s*.*\s*\}))?\s*$/);
                    if (null === componentData) {
                        throw 'Wrong component name format "' + node.attr(Utils.ATTR_HANDLER) + '"';
                    }
                    var componentName = componentData[1], componentType = componentData[2], componentQuery = componentData[3] ? eval('(function(){return ' + componentData[3] + '}())') : {}, componentOptions = componentData[4] ? eval('(function(){return ' + componentData[4] + '}())') : {};
                    switch (componentType) {
                        case 'List':
                            return new Component.List(node, componentName, componentQuery, componentOptions, parent);
                        case 'Table':
                            return new Component.Table(node, componentName, componentQuery, componentOptions, parent);
                        case 'Editor':
                            return new Component.Editor(node, componentName, componentQuery, componentOptions, parent);
                        default:
                            throw 'Component with type "' + componentType + '" not found';
                    }
                }
                Utils.createComponent = createComponent;
                function initializeComponents(context, parent) {
                    $('[' + Utils.ATTR_HANDLER + ']', context).each(function () {
                        var node = $(this);
                        if (true == node.data('creonit-component-initialized'))
                            return;
                        createComponent(node, parent);
                        node.data('creonit-component-initialized', true);
                    });
                }
                Utils.initializeComponents = initializeComponents;
                function raw(string) {
                    var output = new String(string);
                    output.twig_markup = true;
                    return output;
                }
                Utils.raw = raw;
                function generateId() {
                    return ++increment;
                }
                Utils.generateId = generateId;
            })(Utils = Component.Utils || (Component.Utils = {}));
        })(Component = Admin.Component || (Admin.Component = {}));
    })(Admin = Creonit.Admin || (Creonit.Admin = {}));
})(Creonit || (Creonit = {}));
