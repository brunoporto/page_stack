(function(window, $){

    var PageStack = function(options){
        this.options = options;
        this.config = null;
    };

    var _this;

    PageStack.prototype = {
        defaults: {
            form: 'form',
            debug: false,
            loading: true,
            closeOnEsc: false
        },
        init: function() {
            this.config = $.extend({}, this.defaults, this.options);
            _this = this;

            $(document).on('click','.pagestack_close',function(e){
                e.preventDefault();
                _this.close($(this));
            });

            $(document).on('click','.pagestack',function(ev) {
                ev.preventDefault();

                var $elem = $(this);
                var quadroTotal = count();

                if (quadroTotal==0) {
                    var stack = $('<ul id="pagestack_container" class="pagestack_container"></ul>');
                    var wWidth = $(window).width();
                    var wHeight = $(window).height();
                    stack.css({'width': wWidth+'px', 'height': wHeight+'px'});
                    $('body').prepend(stack);
                }

                var index = quadroTotal + 1;
                var item = $('<li id="pagestack-item-'+index+'" class="pagestack_item" data-pagestack-load-url="'+encodeURIComponent($elem.attr('href'))+'" data-pagestack-nivel="'+index+'" style="display: none;"></li>');
                //COPY ALL DATA pagestack attributes
                $.each($elem.prop("attributes"),function() {
                    if (this.name.match(/^data\-pagestack/)) {
                        item.attr(this.name, this.value);
                    }
                });

                //~~ CONTENT BLOCK
                item.append('<div id="pagestack-content-'+index+'" class="pagestack_content"></div>');

                //~~ TITLE
                var title = $('<div id="pagestack-title-'+index+'" class="pagestack_title">'+item.attr('data-pagestack-title')+'</div>');
                var btFechar = $('<a href="javascript:void(0);" class="pagestack_close"></a>');
                var header = $('<div id="pagestack-header-'+index+'" class="pagestack_header"></div>').append(btFechar).append(title);
                if (item.attr('data-pagestack-esc-close')==undefined && _this.config.closeOnEsc==true) {
                    item.attr('data-pagestack-esc-close','true');
                }
                item.prepend(header);

                //~~ STYLE
                item.css({
                    'transform-origin': 'top center',
                    "-webkit-transform": "translateY(30px)",
                    "-ms-transform": "translateY(30px)",
                    "transform": "translateY(30px)"
                });

                //~~ RESIZE
                resize(item);

                //~~ REFRESH EVENT
                item.on('refresh',function(ev) {
                    if (_this.config.debug) console.log('*** REFRESH EVENT CONTENT - ITEM '+item.attr('id'));
                    loadContent(item).done(function(container) {
                        if (_this.config.debug) console.log('=== LOADED CONTENT - ITEM '+container.attr('id'));
                    });
                });

                //~~ APPEND TO CONTAINER
                item.appendTo('#pagestack_container').show("scale",{}, 500);

                //~~ LOAD CONTENT
                loadContent(item).done(function(pagestack_item) {
                    //SUCCESS
                }).fail(function(response) {
                    if (_this.config.debug) console.log(response);
                });

                //~~ REORDER (ANIMATE) CONTAINER ITEMS
                reorder();
            });

            $(document).on('click','[data-dismiss="pagestack"]',function(ev){
                ev.preventDefault();
                _this.close(this);
            });

            $(document).keyup(function(e) {
                if (e.which === 27) { //escape key maps to keycode `27`
                    var $item = $('.pagestack_item[data-pagestack-nivel='+count()+']');
                    if ($item.attr('data-pagestack-esc-close')==='true') {
                        _this.close($item);
                    }
                }
            });

            $( window ).resize(function() {
                //RESIZE CONTAINER
                var wWidth = $(window).width();
                var wHeight = $(window).height();
                $('#pagestack_container').css({'width': wWidth+'px', 'height': wHeight+'px'});
                //RESIZE PAGESTACK
                resize($('#pagestack_container .pagestack_item'));
            });

            return this;
        },
        close: function(elem) {
            var $item = _this.getItem(elem);
            var nivel = $item.attr('data-pagestack-nivel');
            var onclose = $item.attr('data-pagestack-refresh-parent-onclose');
            $item.hide("scale",{percent: 0},300,function() {
                $item.remove();
                if (_this.config.loading) {loading($item, false);}
                reorder();
                if (count()==0) {
                    $('#pagestack_container').remove();
                }
                //VERIFICA SE PRECISA RECARREGAR A PÁGINA
                if (onclose == 'true') {
                    if (nivel==1) {
                        if (_this.config.loading) {loading('body', true, true);}
                        window.location.reload(true);
                    } else {
                        $('.pagestack_item[data-pagestack-nivel="'+(nivel-1)+'"]').trigger('refresh');
                    }
                }
            });
        },
        getItem: function(elemento) {
            return $(elemento).hasClass('pagestack_item') ? $(elemento) : $(elemento).parents('.pagestack_item:first');
        }
    };

    //PRIVATE
    function resize(elements){
        var wWidth = $(window).width()-40;
        var wHeight = $(window).height()-40;
        $.each(elements, function(i, element){
            $(element).css({
                'margin-left': '20px',
                'width': wWidth+'px',
                'height': wHeight+'px'
            });
        });
    }

    function reorder() {
        var totalItens = count();
        for(var i=1; i <= totalItens; i++) {
            var item = $('#pagestack-item-'+i);
            var itemIndex = totalItens-i;
            var newY = 30-(itemIndex*10);
            var newScale = 1-(itemIndex*10/100);
            var newOpacity = 1-(itemIndex*20/100);
            item.css({
                'transform-origin': 'top center',
                "-webkit-transform": "translateY("+newY+"px) scale("+newScale+")",
                "-ms-transform": "translateY("+newY+"px) scale("+newScale+")",
                "transform": "translateY("+newY+"px) scale("+newScale+")",
                "opacity": newOpacity
            });
        }
    }

    function count() {
        return $('ul.pagestack_container li.pagestack_item').length;
    }

    function loadContent(item, _html) {
        var dfd = jQuery.Deferred();

        var content = item.find('.pagestack_content:first');
        if (_this.config.loading) {loading(item);}
        if (_html!==undefined) {
            content.html(_html);
            htmlCallbacks(content);
            if (_this.config.loading){loading(item, false);}
            dfd.resolve(item);
        } else {
            var loadLink = updateQueryStringParameter(decodeURIComponent(item.attr('data-pagestack-load-url')), 'pagestack', true);
            content.load(loadLink, function(response, status, xhr){
                if (status == "error") {
                    content.html(response);
                    dfd.reject(response);
                }
                htmlCallbacks(content);
                if (_this.config.loading){loading(item, false);}
                dfd.resolve(item);
            });
        }
        return dfd.promise();
    }
    //
    function htmlCallbacks(content) {
        //FORMS
        content.find(_this.config.form).each(function(i,form) {
            var $form = $(form);
            var container = _this.getItem(form);
            if ($form.find('.pagestack_container_id').length==0) {
                $form.attr('data-remote', true);
                $form.attr('data-pagestack-replace-content', true);
                $form.append('<input type="hidden" name="pagestack_container_id" value="'+container.attr('id')+'" />');
                $form.attr('action', updateQueryStringParameter($form.attr('action'),'pagestack',true));
                ajaxCallbacks($form);
            }
        });
        //LINKS DELETE
        content.find('[data-method="delete"]').each(function(i,element){
            var $element = $(element);
            if ($element.attr('href').indexOf('pagestack') < 0) {
                $element.attr('data-remote', true);
                $element.attr('href', updateQueryStringParameter($element.attr('href'),'pagestack',true));
                ajaxCallbacks($element);
            }
        });
    }
    //
    function ajaxCallbacks(element) {
        element.bind("ajax:beforeSend", function(xhr, settings){
            if (_this.config.loading) {loading(element)}
            if (_this.config.debug) console.log('ajax:beforeSend', xhr, settings);
        });
        element.bind("ajax:error", function(xhr, status, error) {
            if (_this.config.loading) {loading(element, false);}
            // console.log('ajax:error', xhr, status, error);
        });
        element.bind("ajax:success", function(e, data, status, xhr) {
            if (_this.config.debug) console.log('ajax:success', e, data, status, xhr);
            var item = _this.getItem(element);
            if (_this.config.loading) {loading(item, false);}
            if (data !=='' && element.attr('data-pagestack-replace-content') == 'true') {
                loadContent(item, data);
            } else {
                item.trigger('refresh');
            }
        });
        element.bind("ajax:remotipartComplete", function(e, data){
            if (_this.config.debug) {
                console.log('carregando...');
                console.log(e, data);
            }
            if (_this.config.loading) {loading(element, false);}
        });
        element.bind("ajax:complete", function(data, status, xhr) {
            if (_this.config.debug) console.log('ajax:complete',xhr, status);
            if ( !element.data('remotipartSubmitted') ) {
                if (_this.config.loading) {loading(element, false)}
            }
        });
    }
    //
    function updateQueryStringParameter(uri, key, value) {
        var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
        var separator = uri.indexOf('?') !== -1 ? "&" : "?";
        if (uri.match(re)) {
            return uri.replace(re, '$1' + key + "=" + value + '$2');
        }
        else {
            return uri + separator + key + "=" + value;
        }
    }
    //
    function loading(container, start_stop, fullscreen) {
        var $container = $(container);
        if (start_stop==undefined) start_stop=true;
        if (fullscreen==undefined) fullscreen=false;
        var $loading_icon = $container.find('.pagestack_loading_icon');
        if ($loading_icon.length > 0) {
            if (start_stop!==true) {
                $loading_icon.remove();
                $container.find('.pagestack_loading_overlay').remove();
            }
        } else {
            $container.prepend('<div class="pagestack_loading_icon">Aguarde Carregando...&#8230;</div>');
            if (fullscreen===true) {
                $container.prepend('<div class="pagestack_loading_overlay"></div>');
                $container.find('.pagestack_loading_icon').css({
                    top: ($container.height()/2)+'px'
                });
            }
        }
    }

    PageStack.defaults = PageStack.prototype.defaults;

    window.PageStack = PageStack;
})(window, jQuery);