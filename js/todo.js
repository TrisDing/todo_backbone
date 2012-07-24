$(function () {

    var Todo = Backbone.Model.extend({

        defaults:function () {
            return {
                title:"empty",
                done:false
            }
        },

        initialize:function () {
            if (!this.get('title')) {
                this.set({title:this.defaults.title})
            }
        },

        toggle:function () {
            this.set({done:!this.get("done")});
        },

        clear:function () {
            this.destroy();
        }

    });

    var TodoList = Backbone.Collection.extend({

        model:Todo,

        done:function () {
            return this.filter(function (todo) {
                return todo.get('done');
            });
        },

        remaining:function () {
            return this.without.apply(this, this.done());
        }

    });

    var Todos = new TodoList;

    var TodoView = Backbone.View.extend({

        tagName:'li',

        template:_.template($('#item-template').html()),

        events:{
            "click .toggle":"toggleDone",
            "dblclick .view":"edit",
            "click a.destroy":"clear",
            "keypress .edit":"updateOnEnter",
            "blur .edit":"close"
        },

        initialize:function () {
            this.model.bind('change', this.render, this);
            this.model.bind('destroy', this.remove, this);
        },

        render:function () {
            $(this.el).html(this.template(this.model.toJSON()));
            $(this.el).toggleClass('done', this.model.get('done'));
            this.input = this.$('.edit');
            return this;
        },

        toggleDone:function () {
            this.model.toggle();
        },

        edit:function () {
            $(this.el).addClass("editing");
            this.input.focus();
        },

        close:function () {
            var value = this.input.val();
            if (!value) this.clear();
            this.model.set({title:value});
            this.$el.removeClass("editing");
        },

        updateOnEnter:function (e) {
            if (e.keyCode == 13) this.close();
        },

        clear:function () {
            this.model.clear();
        }

    });

    var AppView = Backbone.View.extend({

        el:$('#todo-app'),

        statsTemplate:_.template($('#stats-template').html()),

        events:{
            "keypress #new-todo":"createOnEnter",
            "click #clear-completed":"clearCompleted"
        },

        initialize:function () {
            this.input = this.$("#new-todo");
            this.footer = this.$('footer');
            this.main = $('#main');

            Todos.bind('add', this.addOne, this);
            Todos.bind('all', this.render, this);

            this.render();
        },

        render:function () {
            var done = Todos.done().length;
            var remaining = Todos.remaining().length;

            if (Todos.length) {
                this.main.show();
                this.footer.show();
                this.footer.html(this.statsTemplate({done:done, remaining:remaining}));
            } else {
                this.main.hide();
                this.footer.hide();
            }
        },

        addOne:function (todo) {
            var view = new TodoView({model:todo});
            this.$("#todo-list").append(view.render().el);
        },

        createOnEnter:function (e) {
            if (e.keyCode != 13 || !this.input.val()) return;
            Todos.add(new Todo({title:this.input.val()}));
            this.input.val('');
        },

        clearCompleted:function () {
            _.each(Todos.done(), function (todo) {
                todo.clear();
            });
        }

    });

    var App = new AppView;

});
