(function (win, doc, $, _, Backbone) {
	var Lao, Parser, domFactory, prefix = "lao-table-";

	if (!Backbone || !(Lao = Backbone.Lao) || !Lao.define || !Lao.isNameSpaceDefined("List")) return;


	Parser = {
		parseCell: function (data) {
			return _.extend(data, this.parseTable(data))
		},
		parseTableList: function (data, type) {
			var attributes = {}, children = [];
			_.each(data, function (v, i) {
				if (_.isObject (v)) {
					children.push( _.extend({name: i}, v) )
				} else {
					attributes[i] = v;
				}
			}, this);
			return _.map(children, function (child) {
				return this.parseCell(_.extend({}, attributes, child))
			}, this);
		},
		parseCols: function (data) {
			return this.parseTableList(data, "col");
		},
		parseRows: function (data) {
			return this.parseTableList(data, "row");
		},
		parseTable: function (data) {
			//debugger;
			if (!data || !data.children) data = {children:[]};
			return _.extend(data, {
				children: data.orient ? (data.orient === "horizontal" ? this.parseRows (data.children) : this.parseCols (data.children)) : []
			});
		}
	};

	domFactory = {
		createEl: function (tagname, className, styles, additionalAttrs) {
			var el = doc.createElement(tagname);
			el.className = className;
			return $(el).css(styles || {}).attr(additionalAttrs || {});
		},
		createCell: function (type, styles, additionalAttrs) {
			return this.createEl("div", prefix + type, styles, additionalAttrs).html(type !== "table" ? "&nbsp;" : undefined);
		}
	};

	Lao
	.define ("Table", Lao.get("List.Container"), {
		defaults: {
			orient: "horizontal",
			type: "table"
		},
		initialize: function (data) {
			data = Parser.parseTable(data);
			this.set("children", data.orient === "vertical" ? new (Lao.get("Table.Cols"))(data.children) : new (Lao.get("Table.Rows"))(data.children));
		}
	}, {
		initialize: function () {
			this.build(this.model, this.$el);
		},
		build: function (model, container) {
			var children = model.get("children"),
				type = model.get("type"),
				c = domFactory.createCell(type).appendTo(container);
			if (type !== "table" && children.length) {
				c = domFactory.createCell("table").appendTo(c.empty());
			}
			if (_.isFunction(children.each)) {
				children.each(function (m) {
					this.build(m, c);
				}, this);
			} else {
				this.build(children, c);
			}
		}
	})
	.define ("Table.Cell", Lao.get("Table"))
	.define ("Table.Row", Lao.get("Table.Cell"), {
		defaults: {
			type: "row"
		},
		orient: "horizontal"
	})
	.define ("Table.Col", Lao.get("Table.Cell"), {
		defaults: {
			type: "col"
		},
		orient: "vertical"
	})
	.define ("Table.List", Lao.get("List"))
	.define ("Table.Rows", Lao.get("Table.List"), {
		defaults: {
			type: "rows"
		},
		orient: "horizontal",
		model: Lao.get("Table.Row")
	})
	.define ("Table.Cols", Lao.get("Table.List"), {
		defaults: {
			type: "cols"
		},
		orient: "vertical",
		model: Lao.get("Table.Col")
	});

})(window, window.document, window.jQuery, window._, window.Backbone)