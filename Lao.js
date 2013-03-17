(function (win, doc, $, _, Backbone) {

	var LaoGod = new (Backbone.Collection.extend ({
			initialize: function () {
				this.on ("add", this.setView, this);
			},
			setView: function (m) {
				m.view = new LaoView({
					model: m,
					el: m.get("el")
				})
			}
		}))

	var toJSON = function () {
		var o = _.clone(this.attributes), i;
		for (i in o) {
			!o[i] || !_.isFunction(o[i].toJSON) || (o[i] = o[i].toJSON());
		}
		return o;
	};

	var LaoModule = {}, LaoViewModule = {}, privateModules = {}, nameSpaceSplitter = /^(.+)\./, nameSpaces = {};
	var Lao = Backbone.Model.extend({
		initialize: function (attr) {
			LaoGod.add(this);
		},
		create: function (name, data) {
			if (LaoModule[name]) {
				if (this.get("module")) {
					this.get("module").destroy();
				}
				this.set("module", new (Lao.get(name))(data), {"name": name});
			}
		},
		toJSON: toJSON
	});

	Lao.Model = Backbone.Model.extend({
		toJSON: toJSON
	});

	Lao.Collection = Backbone.Collection;

	// Static functions
	_.extend(Lao, {
		define: function (name, inheritsFrom, protoModel, protoView) {
			var namespace;
			if (name && _.isString(name) && inheritsFrom && _.isFunction(inheritsFrom.extend)) {
				LaoModule[name] = inheritsFrom.extend(protoModel);
				LaoViewModule[name] = _.extend({}, this.getView(name) || {}, protoView);

				if ((namespace = nameSpaceSplitter.exec(name))) {
					nameSpaces[namespace.pop()] = true;
				}
			}
			return Lao;
		},
		isNameSpaceDefined: function (namespace) {
			return !!nameSpaces[namespace];
		},
		get: function (name) {
			return LaoModule[name];
		},
		getView: function (name) {
			return LaoViewModule[name];
		}
	})


	var LaoViewProto = {
		initialize: function () {
			this.model.on("change:module", this._resetLaoView, this);
			this.model.on("change:el", this._setElement, this);
		},
		_formerModel: {},
		_setElement: function (m, el) {
			this.setElement(el);
		},
		_resetLaoView: function (formerModel, newModel, options) {
			var name = options.name,
				newViewProto = Backbone.View.extend(Lao.getView(name));

			// Unbound any Listeners and call the reset-function if there is any
			this.undelegateEvents();
			if (_.isFunction(this.reset)) this.reset();

			// remove all previously set functions
			_.each(this, function (v, i) {if (!forbiddenKeys.test(i)) delete this[i]}, this);

			this._formerModel = formerModel;

			// Now create a new View-instance and bind all its properties to this view
			_.each(new newViewProto({
				model: newModel,
				el: newModel.get("el") || formerModel.get("el")
			}), function (v, i) {
				if (!forbiddenKeys.test(i)) {
					this[i] = _.isFunction(v) ? _.bind(v, this) : v;
				}
			}, this);
		}
	},
	forbiddenKeys = new RegExp("^(" + _.keys(LaoViewProto).join("|") + ")$"),
	LaoView = Backbone.View.extend (LaoViewProto);

	Backbone.Lao = Lao;

})(window, window.document, window.jQuery, window._, window.Backbone)