/* globals $, Builder, NPMap, mapId */

$('head').append($('<link rel="stylesheet">').attr('href', 'ui/modal/export.css'));

Builder.ui = Builder.ui || {};
Builder.ui.modal = Builder.ui.modal || {};
Builder.ui.modal.export = (function() {
  var $cmsId = $('#cms-id'),
    $code = $('#modal-export-code textarea');

  function returnFalse() {
    return false;
  }
  function update() {
    var children = $('#modal-export li'),
      formatted = '',
      json = JSON.stringify(NPMap, null, 2).split('\n');

    $.each(json, function(i, v) {
      if (v !== null) {
        if (i !== 0 && i !== json.length - 1) {
          formatted += v + '\n';
        } else {
          if (i === json.length - 1) {
            formatted +=  v;
          } else {
            formatted += v + '\n';
          }
        }
      }
    });
    $code.val('var NPMap = ' + formatted + ';');

    if (mapId) {
      $('#cms-id').val(mapId);
      $('#modal-export-template img').on('click', function() {
        window.open('/maps/' + this.id.replace('template-', '') + '.html?mapId=' + mapId, '_blank');
      });
      $('#modal-export ul a:first').tab('show');
      $(children[0]).removeClass('disabled');
      $(children[1]).removeClass('disabled');
      $($('#modal-export a')[0]).off('click');
      $($('#modal-export a')[1]).off('click');
      $(children[0]).popover('destroy');
      $(children[1]).popover('destroy');
    } else {
      $('#modal-export ul a:last').tab('show');
      $(children[0]).addClass('disabled');
      $(children[1]).addClass('disabled');
      $($('#modal-export a')[0]).click(returnFalse);
      $($('#modal-export a')[1]).click(returnFalse);
      $(children[0]).popover({
        animation: false,
        content: 'You must save your map before exporting it to a template.',
        trigger: 'hover'
      });
      $(children[1]).popover({
        animation: false,
        content: 'You must save your map before exporting it to nps.gov.',
        trigger: 'hover'
      });
    }
  }
  function setHeight() {
    $('#modal-export .tab-content').css({
      height: $(document).height() - 289
    });
  }

  $cmsId.on('click', function() {
    $(this).select();
  });
  $code.on('click', function() {
    $(this).select();
  });
  $('#modal-export').modal().on('show.bs.modal shown.bs.modal', update);
  Builder.buildTooltips();
  update();
  setHeight();
  $(window).resize(setHeight);

  return {};
})();
