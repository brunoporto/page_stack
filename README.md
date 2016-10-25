PageStack
=======

Essa GEM fornece a possibilidade de navegação de paǵinas sobrepostas, facilitando assim a abertura de novas páginas em perder o conteúdo anterior.

# Requisitos

- Rails 4.2+
- jQuery 2+
- Remotipart (Envio de formulário por Ajax)

# Instalação

Adicione essa linha no Gemfile do projeto:
```ruby
gem 'page_stack'
```

Instale a gem utilizando o comando abaixo no diretório raiz da aplicação:
```sh
$ bundle install
```

Adicione no seu arquivo `application_controller.rb` a seguinte configuração:
```ruby
class ApplicationController < ActionController::Base
  include PageStack
  layout :pagestack_layout 
end
```

Adicione a seguinte linha no seu arquivo `application.css`:
```css
*= require pagestack
```

Adicione a seguinte linha no seu arquivo `application.js`:
```js
//= require pagestack
//= require jquery.remotipart
```

Para inicializar o plugin você utilizará o código abaixo:
```js
var pagestack = new PageStack().init();
```

Seus eventos são baseados em [delegator](https://learn.jquery.com/events/event-delegation/) do jQuery e estão vinculados ao **document**.

# Configuração

Você possui três parâmetros de configuração para o pagestack:
- form : (padrão: 'form') Informe o elemento form que ele deverá o recurso "submit" via AJAX.
- loading : (padrão: true) Informa se o ícone de *carregando* será exibido para informar ao usuário o progresso de ações AJAX.
- closeOnEsc : (padrão: false) Permite fechar o pagestack ativo com a tecla ESC
- debug : (padrão: false) Exibe as mensagens de testes no console.log

```js
var pagestack = new PageStack({
    form: 'form',
    loading: true,
    closeOnEsc: false,
    debug: false
}).init();
```

# Utilização

Você pode abrir multiplas páginas sobrepostas apenas configurando os links em cada página.

Para indicar que um link abrirá uma pagestack adicione a classe `pagestack` ao seu elemento:
```haml
    = link_to "Abrir Página", root_path, class: 'pagestack'
```

Para indicar o título da nova página utilize o atributo data `pagestack-title`:
```haml
    = link_to "Abrir Página", root_path, class: 'pagestack', data: {'pagestack-title' => 'Título da minha página sobreposta'}
```

Caso você abra uma sub-página sobreposta e precise que ao fechar essa página você recarregue o conteúdo da página origem você precisa indicar o atributo data `pagestack-refresh-parent-onclose`:
```haml
    = link_to "Abrir Página", root_path, class: 'pagestack', data: {'pagestack-refresh-parent-onclose' => true}
```

Caso você precise alterar o conteúdo da própria pagestack (self) ao invés de abrir uma nova você pode informar o atributo `data-pagestack-replace-content`:
```haml
    = link_to "Abrir Página", root_path, class: 'pagestack', data: {'pagestack-refresh-replace-content' => true}
```

Para ativar/desativar o fechamento do pagestack ativo através da tecla ESC utilize o atributo `data-pagestack-close-esc`. O padrão é **false**:
```haml
    = link_to "Abrir Página", root_path, class: 'pagestack', data: {'pagestack-esc-close' => 'true'}
    = link_to "Abrir Página", root_path, class: 'pagestack', data: {'pagestack-esc-close' => 'false'}
```

## Eventos Javascript

Ao iniciar o plugin você recebe o retorno e pode atribuir a uma variável (Ex: `var pagestack` no código  de instalação):
```js
var pagestack = PageStack().init();
var current_page = pagestack.getItem(elemento_dentro_do_pagestack);
pagestack.close(elemento_dentro_do_pagestack);
```

- **init**: Método que inicia o pagestack e atriu os eventos 
- **close(elemento)**: Fecha o pagestack de um elemento indicado (pode ser qualquer elemento dentro daquele pagestack, inclusive o próprio elemento pagestack).
- **getItem(elemento)**: Retorna o elemento "container" do pagestack a partir de um elemento  interno indicado. 

## Comportamento 

**Formulário**
- Receberá por padrão o atributo *data-pagestack-replace-content* para carregar o conteúdo de retorno na própria página do formulário.
- Receberá por padrão o atributo rails *data-remote* para processamento o "submit" por AJAX através do plugin *jquery.remotipart*.

**Links**
- Os links com method=delete *(Links de exclusão)* receberão por padrão o atributo rails *data-remote* para processamento via AJAX.

# Referências

- [Remotipart: Rails jQuery File Uploads](https://github.com/JangoSteve/remotipart)
