/* globals $, Builder, NPMap */

$('head').append($('<link rel="stylesheet" type="text/css">').attr('href', 'ui/modal/loadMap.css'));

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

  return {};
})();

$('#modal-loadMap-code').bind('keyup','textarea',function(){
  var json,
  input = $('#modal-loadMap-code').val();
  console.log('changed!');

  if (input){
    try{
      json=JSON.parse(input);
      $('#modal-loadMap-code').css('background-color', '#CCffCC');
      console.log('jsoned');
    }catch(e){
      console.log(e);
      $('#modal-loadMap-code').css('background-color', '#ffCCCC');
      json = undefined;
      console.log('json crap');
    }
  }

  if (json) {
    $('#modal-loadMap').data({'newMap': json});
    NPMap = json;
    Builder.updateMap();
    console.log('json set');
  }
});

