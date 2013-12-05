/* globals $, Builder */

$('head').append($('<link rel="stylesheet">').attr('href', 'ui/modal/export.css'));

Builder.ui = Builder.ui || {};
Builder.ui.modal = Builder.ui.modal || {};
Builder.ui.modal.export = (function() {
  function setHeight() {
    $('#modal-export .tab-content').css({
      height: $(document).height() - 289
    });
  }

  $('#modal-export').modal();
  Builder.rebuildTooltips();
  setHeight();
  $(window).resize(setHeight);

  return {};
})();
