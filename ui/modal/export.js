/* globals $, Builder, NPMap, mapId */

$('head').append($('<link rel="stylesheet">').attr('href', 'ui/modal/export.css'));

Builder.ui = Builder.ui || {};
Builder.ui.modal = Builder.ui.modal || {};
Builder.ui.modal.export = (function() {
  var $cmsId = $('#cms-id'),
    $code = $('#modal-export-code textarea');
    //Base64 = (function(){return{encode:function(a){var b="",c,d,f,g,h,e,k=0;do c=a.charCodeAt(k++),d=a.charCodeAt(k++),f=a.charCodeAt(k++),g=c>>2,c=(c&3)<<4|d>>4,h=(d&15)<<2|f>>6,e=f&63,isNaN(d)?h=e=64:isNaN(f)&&(e=64),b=b+"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".charAt(g)+"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".charAt(c)+"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".charAt(h)+"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".charAt(e);while(k<a.length);return b},decode:function(a){var b="",c,d,f,g,h,e=0;a=a.replace(/[^A-Za-z0-9\+\/\=]/g,"");do c="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".indexOf(a.charAt(e++)),d="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".indexOf(a.charAt(e++)),g="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".indexOf(a.charAt(e++)),h="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".indexOf(a.charAt(e++)),c=c<<2|d>>4,d=(d&15)<<4|g>>2,f=(g&3)<<6|h,b+=String.fromCharCode(c),64!=g&&(b+=String.fromCharCode(d)),64!=h&&(b+=String.fromCharCode(f));while(e<a.length);return b}}})();

  /*
  function getMapMetadata() {
    var checkboxes = $('#metadata .buttons .popover checkbox');

    return {
      description: $('.description a').text(),
      isPublic: $(checkboxes[0]).prop('checked'),
      isShared: $(checkboxes[1]).prop('checked'),
      name: $('.title a').text()
    };
  }
  */
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
      // TODO: Also update template URL.

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
  /*
  $('#modal-export-template img').on('click', function() {
    window.open('maps/' + this.id.replace('template-', '') + '.html?config=' + Base64.encode(JSON.stringify(NPMap)) + '&meta=' + Base64.encode(JSON.stringify(getMapMetadata())), '_blank');
  });
  */
  $('#modal-export-template img').on('click', function() {
    window.open('maps/' + this.id.replace('template-', '') + '.html?id=' + mapId, '_blank');
  });

  Builder.buildTooltips();
  update();
  setHeight();
  $(window).resize(setHeight);

  return {};
})();
