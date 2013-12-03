/* globals $, Builder, NPMap */

Builder.ui = Builder.ui || {};
Builder.ui.modal = Builder.ui.modal || {};
Builder.ui.modal.changeMarker = (function() {
  function setHeight() {
    $('#modal-changeMarker .modal-body').css({
      height: $(document).height() - 200
    });
  }

  $('#modal-changeMarker').modal({
    backdrop: 'static'
  });
  Builder.rebuildTooltips();
  setHeight();
  $(window).resize(setHeight);

  return {};
})();
