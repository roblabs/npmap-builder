/* globals $, Builder, NPMap */

$('head').append($('<link rel="stylesheet" type="text/css">').attr('href', 'ui/modal/viewConfig.css'));

Builder.ui = Builder.ui || {};
Builder.ui.modal = Builder.ui.modal || {};
Builder.ui.modal.viewConfig = (function() {
  var $code = $('#modal-viewConfig-code'),
    $htmlDiv = $('#modal-viewConfig-html'),
    $htmlInput = $('#modal-viewConfig-html input');

  function setHeight() {
    var height = $(document).height() - 200;

    $('#modal-viewConfig .modal-body').css({
      height: height
    });
    $code.css({
      height: height - $htmlDiv.outerHeight() - 80
    });
  }
  function setConfig() {
    var formatted = 'var NPMap = ',
      html = $htmlInput.prop('checked'),
      json = JSON.stringify(NPMap, null, 2).split('\n'),
      space = html ? '      ' : '';

    $.each(json, function(i, v) {
      if (v !== null) {
        if (i !== 0 && i !== json.length - 1) {
          formatted += v + '\n' + space;
        } else {
          if (i === json.length - 1) {
            formatted +=  v;
          } else {
            formatted += v + '\n' + space;
          }
        }
      }
    });

    formatted += ';\n\n' + space + 'var s = document.createElement(\'script\');\n' + space + 's.src = \'http://d1smq4hh6dg11v.cloudfront.net/npmap.js/0.0.0/npmap-bootstrap.min.js\';\n' + space + 'document.body.appendChild(s);';

    if (html) {
      formatted = '<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <meta charset="utf-8">\n  </head>\n  <body>\n    <div id="map" style="height:500px;width:500px;">\n    </div>\n    <script>\n      ' + formatted + '\n    </script>\n  </body>\n</html>';
    }

    $code.val(formatted);
    $('#modal-viewConfig-code').on('click', function() {
      $(this).select();
    }).select();
  }

  $htmlInput.on('change', setConfig);
  $('#modal-viewConfig').modal().on('show.bs.modal shown.bs.modal', setConfig);
  Builder.buildTooltips();
  setConfig();
  setHeight();
  $(window).resize(setHeight);

  return {};
})();
