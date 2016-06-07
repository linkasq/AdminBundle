module Creonit.Admin.Component.Helpers {

    var increment = 0;

    function cleanOptions(options:any){
        var result = {};
        $.each(options, function(key, value){
            if(key == '_keys'){
                return;
            }
            if($.isPlainObject(value)){
                result[key] = cleanOptions(value);
            }else{
                result[key] = value;
            }
        });
        return result;
    }

    function resolveIconClass(icon:string){
        if(!icon.match(/^(fa-|glyphicon-)/)){
            icon = 'fa-' + icon;
        }
        return `${icon.split('-', 1)[0]} ${icon}`;
    }


    // Twig Functions

    export function button(caption:string, {size = '', type = 'default', icon = '', className = ''} = {}){
        return `
            <button 
                class="btn btn-${type} ${size ? `btn-${size}` : ''} ${className}" 
                type="button" 
            >
                `+ (icon ? `<i class="${resolveIconClass(icon)}"></i>${caption ? ' ' : ''}` : '') +`${caption}
            </button>
        `;
    }

    export function submit(caption:string, {size = '', type = 'primary', icon = '', className = ''} = {}){
        return `
            <button 
                class="btn btn-${type} ${size ? `btn-${size}` : ''}" 
                type="submit" 
            >
                `+ (icon ? `<i class="${resolveIconClass(icon)}"></i>${caption ? ' ' : ''}` : '') +`${caption}
            </button>
        `;
    }

    export function button_visible(){
        return `<button class="btn btn-default btn-xs" type="submit"><i class="fa fa-eye"></i></button>`;
    }

    export function button_delete(){
        return `<button class="btn btn-danger btn-xs" type="submit"><i class="fa fa-remove"></i></button>`;
    }

    export function component(name:string, query:any, options:any){
        query = JSON.stringify(cleanOptions(query));
        options = JSON.stringify(cleanOptions(options));
        return `<div js-component='${name} ${query} ${options}'></div>`;

    }

    // Twig Filters

    export function tooltip(value:any, [text, placement = 'right']){
        if(!text){
            return value;
        }
        let injection = `data-toggle="tooltip" data-placement="${placement}" title="${text}"`;
        return value.toString().replace(/<(a|div|button)/, `<$1 ${injection}`)
    }

    export function action(value:any, [name, options = {}]){
        if(!value){
            return '';
        }

        options = JSON.stringify(cleanOptions(options));

        let injection = `js-component-action data-name="${name}" data-options='${options}'`;

        if(typeof value == 'object' && value.twig_function){
            return value.toString().replace(/<(div|button)/, `<$1 ${injection}`)
        }

        if(typeof value != 'object' || !value.twig_markup){
            value = Utils.escape(value);
        }

        return `<a href="#" ${injection}>${value}</a>`;
    }

    export function open(value:any, [name, query = {}, options = {}]){
        return action(value, ['openComponent', {name: name, query: query, options: options}]);
    }


    export function text(value:string, options?:any){
        var name = options && options[0] ? options[0] : '';
        var options = options && options[1] ? options[1] : {};

        value = value ? Utils.escape(value.toString()) : '';

        return `<input type="text" class="form-control" name="${name}" value="${value}">`;
    }

    export function file(value:any, options?:any){
        var name = options && options[0] ? options[0] : '',
            output = 'Файл не загружен';

        if(value){
            output = `
                <a href="${value.path}/${value.name}" target="_blank">${value.original_name}</a> (${value.size})
                <div class="checkbox">
                    <label class="small">
                        <input type="checkbox" name="${name}__delete"> Удалить файл
                    </label>
                </div>
            `;
        }


        return `
            <div class="panel panel-default">
                <div class="panel-heading"><input type="file" name="${name}"></div>
                <div class="panel-body">${output}</div>
            </div>
        `;
    }

    export function image(value:any, options?:any){
        var name = options && options[0] ? options[0] : '',
            output = 'Изображение не загружено';

        if(value){
            output = `
                <a href="${value.path}/${value.name}" target="_blank">${value.preview}</a>
                <div class="checkbox">
                    <label class="small">
                        <input type="checkbox" name="${name}__delete"> Удалить изображение
                    </label>
                </div>
            `;
        }

        return `
            <div class="panel panel-default">
                <div class="panel-heading"><input type="file" name="${name}"></div>
                <div class="panel-body">${output}</div>
            </div>
        `;
    }

    
    export function select(value:any, options?:any){
        var name = options && options[0] ? options[0] : '',
            options = value.options.map((option) => {
                return `<option value="${option.value}" ${value.value == option.value ? 'selected' : ''}>${option.title}</option>`;
            }).join('');

        return `<select name="${name}" class="form-control">${options}</select>`;
    }

    export function textarea(value:string, options?:any){
        var name = options && options[0] ? options[0] : '';
        var options = options && options[1] ? options[1] : {};

        value = value ? Utils.escape(value.toString()) : '';

        return `<textarea class="form-control" name="${name}">${value}</textarea>`;
    }

    export function row(body:string, label:string) {
        var id = 'widget_'+(++increment);
        body = body.replace(/<(input|textarea)/i, '<$1 id="'+id+'"');
        if(label){
            return `
            <div class="form-group">
                <label for="${id}" class="control-label">${label}</label>
                ${body}
            </div>
        `;
        }else{
            return `
            <div class="form-group">
                ${body}
            </div>
        `;
        }

    }

    export function buttons(value:string){
        return `<div class="btn-group">${value}</div>`;
    }

    export function registerTwigFunctions(){
        [
            'button',
            'submit',
            'button_visible',
            'button_delete',
            'component'

        ].forEach(function(name:string){
            Twig.extendFunction(name, function(...args){
                var output:any = new String(Helpers[name].apply(this, args));
                output.twig_markup = true;
                output.twig_function = name;
                return output;
            });
        });
    }

    export function registerTwigFilters(){
        [
            'text',
            'textarea',
            'file',
            'image',
            'select',
            'buttons',
            'image',
            'row',
            'tooltip',
            'action',
            'open'

        ].forEach(function(name:string){
            Twig.extendFilter(name, function(...args){
                var output:any = new String(Helpers[name].apply(this, args));
                output.twig_markup = true;
                output.twig_filter = name;
                return output;
            });
        });

        [].forEach(function(name:string){
            Twig.extendFilter(name, Helpers[name]);
        });
    }

    registerTwigFilters();
    registerTwigFunctions();

}