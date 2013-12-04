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
var set = function () {
  var options = {
    'color': $('#color')[0][$('#color')[0].selectedIndex].value,
    'name': $('#icon')[0][$('#icon')[0].selectedIndex].value
  },
  regex = new RegExp('url\\((.+?)\\)'),
  layer = $('#modal-changeMarker').data('layer');

  //Extract the url from the CSS
  document.getElementById('iframe-map').contentWindow.L.npmap.icon.maki(options).createIcon().style.cssText.replace(regex, function(_,url) {
    // Draw the icon for the demo
    $('#DemoIcon').html('<img src="' + url + '">');
  });
  // Add the icon to the layer
  if (layer) {
    layer.icon = options;
  }


};

