(function (win, doc, $, _, Backbone) {
	var Lao, toJSON;

	if (!Backbone || !(Lao = Backbone.Lao) || !Lao.define) return;

	Lao
	.define ("List.Item", Backbone.Lao.Model)
	.define ("List", Backbone.Lao.Collection)
	.define ("List.Container", Backbone.Lao.Model)

})(window, window.document, window.jQuery, window._, window.Backbone)