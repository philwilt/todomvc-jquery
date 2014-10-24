(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
jQuery(function($) {
  "use strict";
  var App, ENTER_KEY, ESCAPE_KEY, util;
  Handlebars.registerHelper("eq", function(a, b, options) {
    if (a === b) {
      return options.fn(this);
    } else {
      return options.inverse(this);
    }
  });
  ENTER_KEY = 13;
  ESCAPE_KEY = 27;
  util = {
    uuid: function() {
      var i, random, uuid;
      i = void 0;
      random = void 0;
      uuid = "";
      i = 0;
      while (i < 32) {
        random = Math.random() * 16 | 0;
        if (i === 8 || i === 12 || i === 16 || i === 20) {
          uuid += "-";
        }
        uuid += (i === 12 ? 4 : (i === 16 ? random & 3 | 8 : random)).toString(16);
        i++;
      }
      return uuid;
    },
    pluralize: function(count, word) {
      if (count === 1) {
        return word;
      } else {
        return word + "s";
      }
    },
    store: function(namespace, data) {
      var store;
      if (arguments.length > 1) {
        return localStorage.setItem(namespace, JSON.stringify(data));
      } else {
        store = localStorage.getItem(namespace);
        return (store && JSON.parse(store)) || [];
      }
    }
  };
  App = {
    init: function() {
      this.todos = util.store("todos-jquery");
      this.cacheElements();
      this.bindEvents();
      return Router({
        "/:filter": (function(filter) {
          this.filter = filter;
          this.render();
        }).bind(this)
      }).init("/all");
    },
    cacheElements: function() {
      this.todoTemplate = Handlebars.compile($("#todo-template").html());
      this.footerTemplate = Handlebars.compile($("#footer-template").html());
      this.$todoApp = $("#todoapp");
      this.$header = this.$todoApp.find("#header");
      this.$main = this.$todoApp.find("#main");
      this.$footer = this.$todoApp.find("#footer");
      this.$newTodo = this.$header.find("#new-todo");
      this.$toggleAll = this.$main.find("#toggle-all");
      this.$todoList = this.$main.find("#todo-list");
      this.$count = this.$footer.find("#todo-count");
      return this.$clearBtn = this.$footer.find("#clear-completed");
    },
    bindEvents: function() {
      var list;
      list = this.$todoList;
      this.$newTodo.on("keyup", this.create.bind(this));
      this.$toggleAll.on("change", this.toggleAll.bind(this));
      this.$footer.on("click", "#clear-completed", this.destroyCompleted.bind(this));
      list.on("change", ".toggle", this.toggle.bind(this));
      list.on("dblclick", "label", this.edit.bind(this));
      list.on("keyup", ".edit", this.editKeyup.bind(this));
      list.on("focusout", ".edit", this.update.bind(this));
      return list.on("click", ".destroy", this.destroy.bind(this));
    },
    render: function() {
      var todos;
      todos = this.getFilteredTodos();
      this.$todoList.html(this.todoTemplate(todos));
      this.$main.toggle(todos.length > 0);
      this.$toggleAll.prop("checked", this.getActiveTodos().length === 0);
      this.renderFooter();
      this.$newTodo.focus();
      return util.store("todos-jquery", this.todos);
    },
    renderFooter: function() {
      var activeTodoCount, template, todoCount;
      todoCount = this.todos.length;
      activeTodoCount = this.getActiveTodos().length;
      template = this.footerTemplate({
        activeTodoCount: activeTodoCount,
        activeTodoWord: util.pluralize(activeTodoCount, "item"),
        completedTodos: todoCount - activeTodoCount,
        filter: this.filter
      });
      return this.$footer.toggle(todoCount > 0).html(template);
    },
    toggleAll: function(e) {
      var isChecked;
      isChecked = $(e.target).prop("checked");
      this.todos.forEach(function(todo) {
        return todo.completed = isChecked;
      });
      return this.render();
    },
    getActiveTodos: function() {
      return this.todos.filter(function(todo) {
        return !todo.completed;
      });
    },
    getCompletedTodos: function() {
      return this.todos.filter(function(todo) {
        return todo.completed;
      });
    },
    getFilteredTodos: function() {
      if (this.filter === "active") {
        return this.getActiveTodos();
      }
      if (this.filter === "completed") {
        return this.getCompletedTodos();
      }
      return this.todos;
    },
    destroyCompleted: function() {
      this.todos = this.getActiveTodos();
      this.filter = "all";
      return this.render();
    },
    indexFromEl: function(el) {
      var i, id, todos;
      id = $(el).closest("li").data("id");
      todos = this.todos;
      i = todos.length;
      while (i--) {
        if (todos[i].id === id) {
          return i;
        }
      }
    },
    create: function(e) {
      var $input, val;
      $input = $(e.target);
      val = $input.val().trim();
      if (e.which !== ENTER_KEY || !val) {
        return;
      }
      this.todos.push({
        id: util.uuid(),
        title: val,
        completed: false
      });
      $input.val("");
      return this.render();
    },
    toggle: function(e) {
      var i;
      i = this.indexFromEl(e.target);
      console.log(this.todos);
      console.log(i);
      this.todos[i].completed = !this.todos[i].completed;
      return this.render();
    },
    edit: function(e) {
      var $input;
      $input = $(e.target).closest("li").addClass("editing").find(".edit");
      return $input.val($input.val()).focus();
    },
    editKeyup: function(e) {
      if (e.which === ENTER_KEY) {
        e.target.blur();
      }
      if (e.which === ESCAPE_KEY) {
        return $(e.target).data("abort", true).blur();
      }
    },
    update: function(e) {
      var $el, el, i, val;
      el = e.target;
      $el = $(el);
      val = $el.val().trim();
      if ($el.data("abort")) {
        $el.data("abort", false);
        this.render();
        return;
      }
      i = this.indexFromEl(el);
      if (val) {
        this.todos[i].title = val;
      } else {
        this.todos.splice(i, 1);
      }
      return this.render();
    },
    destroy: function(e) {
      this.todos.splice(this.indexFromEl(e.target), 1);
      return this.render();
    }
  };
  return App.init();
});



},{}],2:[function(require,module,exports){
var GithubIssues;

GithubIssues = (function() {
  function GithubIssues() {}

  return GithubIssues;

})();

exports.GithubIssues = GithubIssues;



},{}]},{},[1,2]);
