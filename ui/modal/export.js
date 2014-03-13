/* globals $, Builder, NPMap, mapId */

$('head').append($('<link rel="stylesheet">').attr('href', 'ui/modal/export.css'));

Builder.ui = Builder.ui || {};
Builder.ui.modal = Builder.ui.modal || {};
Builder.ui.modal.export = (function() {
  var $cmsId = $('#cms-id'),
    $iframeCode = $('#iframe-code');

  function update() {
    var formatted = '',
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
    $cmsId.val(mapId);
    $iframeCode.val('<iframe height="500px" frameBorder="0" width="100%" src="http://www.nps.gov/maps/embed.html?mapId=' + mapId + '"></iframe>');
    $('#modal-export-template img').on('click', function() {
      window.open('http://www.nps.gov/maps/' + this.id.replace('template-', '') + '.html?mapId=' + mapId, '_blank');
    });
  }
  function setHeight() {
    $('#modal-export .tab-content').css({
      height: $(document).height() - 289
    });
  }

  $cmsId.on('click', function() {
    $(this).select();
  });
  $iframeCode.on('click', function() {
    $(this).select();
  });
  $('#modal-export').modal().on('show.bs.modal shown.bs.modal', update);
  Builder.buildTooltips();
  update();
  setHeight();
  $(window).resize(setHeight);

  return {};
})();
