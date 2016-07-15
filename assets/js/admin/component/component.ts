module Creonit.Admin.Component {
    

    export class Component extends Scope{
        protected title:string;
        protected name:string;
        protected manager:Manager;
        protected parent:Component;

        protected query:any = {};
        protected options:any = {};
        protected data:any = {};
        protected node:any;

        protected actions:any = {};
        protected events:any = {};

        constructor(node:any, name:string, query:any = {}, options:any = {}, parent?:Component) {
            super();

            this.manager = Manager.getInstance();
            this.name = name;

            this.query = $.extend({}, query);

            this.node = node;
            this.parent = parent;
            this.options = options;

            this.initialize();
            this.loadSchema();
        }

        initialize(){

        }

        getNode(){
            return this.node;
        }

        action(name, options) {
            if (this.actions[name]) {
                return this.actions[name].apply(this, options);
            } else {
                throw new Error(`Undefined method ${name} in component ${this.name}`);
            }
        }

        getName() {
            return this.name;
        }

        getQuery() {
            return $.extend({}, this.query);
        }

        loadSchema() {
            this.node.html('<div class="loading"><i class="fa fa-cog fa-spin fa-fw"></i></div>');
            this.request(Request.TYPE_LOAD_SCHEMA, this.getQuery(), null, (response) => {
                if(this.checkResponse(response, false)){
                    this.applyResponse(response);
                }else{
                    if(this.options.modal){
                        this.node.arcticmodal('close');
                    }else{
                        this.node.html(`<div class="loading is-error"><i class="fa fa-cog fa-spin fa-fw"></i>${response.error['_'] ? response.error['_'].join(", ") : 'Ошибка загрузки компонента'}</div>`);
                    }
                }
            });
        }

        loadData() {
            this.node.stop(true).delay(300).animate({opacity: .7}, 600);
            this.request(Request.TYPE_LOAD_DATA, this.getQuery(), null, (response) => {
                this.node.stop(true).animate({opacity: 1}, 300);
                this.checkResponse(response) && this.applyResponse(response);
            });
        }

        checkResponse(response:any, announce:boolean = true){
            if (response.error) {
                if(announce && response.error['_']){
                    alert(response.error['_'].join("\n"));
                }
                return false;
            }else{
                return true;
            }
        }

        applyResponse(response:Response) {
            console.log(response);

            if (response.schema) {
                this.applySchema(response.schema);
            }

            if(response.query){
                $.extend(this.query, response.query);
            }
            
            this.data = response.data || {};
            this.render();

            this.node.find('[js-component-external-field-reset]')
                .off('.component')
                .on('click.component', (e) => {
                    e.preventDefault();
                    var $input = $(e.currentTarget).prev('a').find('[js-component-external-field]');
                    $input.text($input.data('empty')).parent().parent().next('input').val('');
                });
        }

        applySchema(schema:any) {
            $.each(schema.actions, (name, action) => {
                this.actions[name] = eval('(function(){return ' + action + '})()');
            });

            $.each(schema.events, (name, action) => {
                this.on(name, eval('(function(){return ' + action + '})()'));
            });

            $.extend(this.actions, {
                openComponent: this.openComponent
            });

            if(this.options.external){
                this.actions['external'] = (value, title) => {
                    this.parent.node.find(`[js-component-external-field=${this.options.external}]`).text(title).parent().parent().next('input').val(value);
                    this.node.arcticmodal('close');
                }
            }

            super.applySchema(schema);
        }

        render() {


        }

        trigger(event:string, data:any){
            if(this.events[event]){
                this.events[event].forEach((listener:(data: any) => void) => {
                    listener.call(this, data);
                });
            }

            this.manager.trigger('component_' + event, $.extend({}, data, {component: this}));
        }

        on(event:string, callback: (data: any) => void){
            if(!this.events[event]){
                this.events[event] = [];
            }

            if(this.events[event].indexOf(callback) == -1){
                this.events[event].push(callback);
            }
        }


        protected request(type:string, query:any = {}, data?:any, callback?:(response:any)=>void) {
            this.manager.request(new Request(this, type, query, data, callback));
        }

        openComponent(name:string, query:any = {}, options:any = {}) {
            options.modal = true;
            var interval;

            $(`
                <div class="modal-dialog modal-lg">
                    ${Helpers.component(name, query, options)}
                </div>
            `
            ).arcticmodal({
                beforeOpen: (modal, $modal) => {
                    Utils.initializeComponents($modal, this);
                },
                afterOpen: (modal, $modal) => {
                    var $container = $modal.closest('.arcticmodal-container');

                    interval = setInterval(function(){
                        var $footer = $modal.find('.modal-footer');

                        if(!$footer.length){
                            return;
                        }

                        clearInterval(interval);

                        var fix = () => {
                            $footer.offset({top: $container.height() + $(window).scrollTop() - $footer.outerHeight()});
                            if(parseInt($footer.css('top')) > 0){
                                $footer.removeAttr('style');
                            }
                        };

                        interval = setInterval(fix, 1000);

                        fix();
                        $container.on('scroll', fix);

                    }, 10);


                },
                afterClose: () => {
                    clearInterval(interval);
                }

            });
        }

    }

}