define([
  "core/js/adapt",
  "core/js/notify"
], function(Adapt, Notify) {
  
  const notifyView = Backbone.View.extend({
    className: 'notify',

    initialize: function() {
      this.listenTo(Adapt, 'remove', this.remove);
      this.render();
    },

    render: function() {
      _.defer(this.postRender.bind(this));
    },

    postRender: function() {
      const model = this.model;
      const data = model.get('_notifyAnywhere');
      if (!data || !Array.isArray(data)) return;

      // ✅ Keep a global registry of all notify data
      window._notifyAnywhereData = window._notifyAnywhereData || [];

      // avoid duplicates
      data.forEach(item => {
        const exists = window._notifyAnywhereData.some(d => d.id === item.id);
        if (!exists) window._notifyAnywhereData.push(item);
      });

      // ✅ Only attach one global click listener (no doubles)
      if (!window._notifyAnywhereHandlerAttached) {
        document.addEventListener('click', function(event) {
          const clickedItem = event.target.closest(".notify");
          if (!clickedItem) return;

          event.preventDefault();

          const clickedId = clickedItem.id;
          const match = (window._notifyAnywhereData || []).find(d => d.id === clickedId);
          if (!match) return;

          Notify.popup({
            title: match.title || '',
            body: match.body || ''
          });
        });

        window._notifyAnywhereHandlerAttached = true;
      }
    }
  });

  Adapt.on('componentView:postRender', function(view) {
    const notify = view.model.get('_notifyAnywhere');
    if (!notify) return;

    new notifyView({ model: view.model });
  });

});
