#global jQuery, Handlebars
jQuery ($) ->
  "use strict"
  Handlebars.registerHelper "eq", (a, b, options) ->
    (if a is b then options.fn(this) else options.inverse(this))

  ENTER_KEY = 13
  ESCAPE_KEY = 27
  util =
    uuid: ->

      #jshint bitwise:false
      i = undefined
      random = undefined
      uuid = ""
      i = 0
      while i < 32
        random = Math.random() * 16 | 0
        uuid += "-"  if i is 8 or i is 12 or i is 16 or i is 20
        uuid += ((if i is 12 then 4 else ((if i is 16 then (random & 3 | 8) else random)))).toString(16)
        i++
      uuid

    pluralize: (count, word) ->
      (if count is 1 then word else word + "s")

    store: (namespace, data) ->
      if arguments.length > 1
        localStorage.setItem namespace, JSON.stringify(data)
      else
        store = localStorage.getItem(namespace)
        (store and JSON.parse(store)) or []

  App =
    init: ->
      @todos = util.store("todos-jquery")
      @cacheElements()
      @bindEvents()
      Router("/:filter": ((filter) ->
        @filter = filter
        @render()
        return
      ).bind(this)).init "/all"
      return

    cacheElements: ->
      @todoTemplate = Handlebars.compile($("#todo-template").html())
      @footerTemplate = Handlebars.compile($("#footer-template").html())
      @$todoApp = $("#todoapp")
      @$header = @$todoApp.find("#header")
      @$main = @$todoApp.find("#main")
      @$footer = @$todoApp.find("#footer")
      @$newTodo = @$header.find("#new-todo")
      @$toggleAll = @$main.find("#toggle-all")
      @$todoList = @$main.find("#todo-list")
      @$count = @$footer.find("#todo-count")
      @$clearBtn = @$footer.find("#clear-completed")
      return

    bindEvents: ->
      list = @$todoList
      @$newTodo.on "keyup", @create.bind(this)
      @$toggleAll.on "change", @toggleAll.bind(this)
      @$footer.on "click", "#clear-completed", @destroyCompleted.bind(this)
      list.on "change", ".toggle", @toggle.bind(this)
      list.on "dblclick", "label", @edit.bind(this)
      list.on "keyup", ".edit", @editKeyup.bind(this)
      list.on "focusout", ".edit", @update.bind(this)
      list.on "click", ".destroy", @destroy.bind(this)
      return

    render: ->
      todos = @getFilteredTodos()
      @$todoList.html @todoTemplate(todos)
      @$main.toggle todos.length > 0
      @$toggleAll.prop "checked", @getActiveTodos().length is 0
      @renderFooter()
      @$newTodo.focus()
      util.store "todos-jquery", @todos
      return

    renderFooter: ->
      todoCount = @todos.length
      activeTodoCount = @getActiveTodos().length
      template = @footerTemplate(
        activeTodoCount: activeTodoCount
        activeTodoWord: util.pluralize(activeTodoCount, "item")
        completedTodos: todoCount - activeTodoCount
        filter: @filter
      )
      @$footer.toggle(todoCount > 0).html template
      return

    toggleAll: (e) ->
      isChecked = $(e.target).prop("checked")
      @todos.forEach (todo) ->
        todo.completed = isChecked
        return

      @render()
      return

    getActiveTodos: ->
      @todos.filter (todo) ->
        not todo.completed


    getCompletedTodos: ->
      @todos.filter (todo) ->
        todo.completed


    getFilteredTodos: ->
      return @getActiveTodos()  if @filter is "active"
      return @getCompletedTodos()  if @filter is "completed"
      @todos

    destroyCompleted: ->
      @todos = @getActiveTodos()
      @filter = "all"
      @render()
      return


    # accepts an element from inside the `.item` div and
    # returns the corresponding index in the `todos` array
    indexFromEl: (el) ->
      id = $(el).closest("li").data("id")
      todos = @todos
      i = todos.length
      return i  if todos[i].id is id  while i--
      return

    create: (e) ->
      $input = $(e.target)
      val = $input.val().trim()
      return  if e.which isnt ENTER_KEY or not val
      @todos.push
        id: util.uuid()
        title: val
        completed: false

      $input.val ""
      @render()
      return

    toggle: (e) ->
      i = @indexFromEl(e.target)
      @todos[i].completed = not @todos[i].completed
      @render()
      return

    edit: (e) ->
      $input = $(e.target).closest("li").addClass("editing").find(".edit")
      $input.val($input.val()).focus()
      return

    editKeyup: (e) ->
      e.target.blur()  if e.which is ENTER_KEY
      $(e.target).data("abort", true).blur()  if e.which is ESCAPE_KEY
      return

    update: (e) ->
      el = e.target
      $el = $(el)
      val = $el.val().trim()
      if $el.data("abort")
        $el.data "abort", false
        @render()
        return
      i = @indexFromEl(el)
      if val
        @todos[i].title = val
      else
        @todos.splice i, 1
      @render()
      return

    destroy: (e) ->
      @todos.splice @indexFromEl(e.target), 1
      @render()
      return

  App.init()
  return
