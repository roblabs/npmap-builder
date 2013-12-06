/* globals $, Builder */
/* global NPMap:true */

$('head').append($('<link rel="stylesheet" type="text/css">').attr('href', 'ui/modal/loadMap.css'));

var colors = {
  'valid': '#CCFFCC',
  'error': '#FFCCCC'
},
validateJson =  function(json) {
  var newJson;
  if (json){
    try{
      newJson=JSON.parse(json);
      if (newJson && !newJson.div) {
        newJson = undefined;
      }
    }catch(e){
      newJson = undefined;
    }
  }
  return newJson;
},
setMap = function(json) {
  var validJson = validateJson(json);
  if (validJson) {
    NPMap = validJson;
    Builder.updateMap();
  }
},
updateModal = function() {
  var validJson = validateJson($('#modal-loadMap-code').val());
  $('#modal-loadMap-code').css('background-color', validJson ? colors.valid : colors.error);
  $('#modal-loadMap-set-button').prop('disabled', !validJson);
};

Builder.ui = Builder.ui || {};
Builder.ui.modal = Builder.ui.modal || {};
Builder.ui.modal.loadMap = (function() {

  function setHeight() {
    $('#modal-loadMap .modal-body').css({
      height: $(document).height() - 200
    });
  }

  Builder.buildTooltips();
  setHeight();
  $(window).resize(setHeight);
  updateModal();

  return {};
})();


$('#modal-loadMap-code').bind('keyup paste cut','textarea',function(){
  updateModal();
});
$('#modal-loadMap-set-button').click(function() {
  setMap($('#modal-loadMap-code').val());
});

