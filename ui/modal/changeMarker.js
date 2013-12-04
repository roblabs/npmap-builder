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
var set = function (layer) {
  var c = $('#color')[0][$('#color')[0].selectedIndex].value;
  var i = $('#icon')[0][$('#icon')[0].selectedIndex].value;

  var regex = new RegExp('url\\((.+?)\\)');
  document.getElementById('iframe-map').contentWindow.L.npmap.icon.maki({name: i, color: c}).createIcon().style.cssText.replace(regex, function(_,url) {
    console.log(url);
    $('#DemoIcon').html('<img src="' + url + '">');
    var layer = $('#modal-changeMarker').data('layer');
    if (layer) {
      layer.icon = {name: i, color: c};//document.getElementById('iframe-map').contentWindow.L.npmap.icon.maki({name: i, color: c})
    }
  });

};

