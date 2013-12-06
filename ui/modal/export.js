/* globals $, Builder, NPMap */

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
  $('#template .btn-primary').on('click', function() {
    window.open('maps/full.html?config=' + Builder.ui.modal.export.Base64.encode(JSON.stringify(NPMap)) + '&meta=' + Builder.ui.modal.export.Base64.encode(JSON.stringify(Builder.ui.modal.export._getMapMetadata())), '_blank');
  });
  Builder.buildTooltips();
  setHeight();
  $(window).resize(setHeight);

  return {
    _getMapMetadata: function() {
      var checkboxes = $('#metadata .buttons .popover checkbox');

      return {
        description: $('.description a').text(),
        isPublic: $(checkboxes[0]).prop('checked'),
        isShared: $(checkboxes[1]).prop('checked'),
        name: $('.title a').text()
      };
    },
    Base64: (function(){return{encode:function(a){var b="",c,d,f,g,h,e,k=0;do c=a.charCodeAt(k++),d=a.charCodeAt(k++),f=a.charCodeAt(k++),g=c>>2,c=(c&3)<<4|d>>4,h=(d&15)<<2|f>>6,e=f&63,isNaN(d)?h=e=64:isNaN(f)&&(e=64),b=b+"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".charAt(g)+"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".charAt(c)+"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".charAt(h)+"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".charAt(e);while(k<a.length);return b},decode:function(a){var b="",c,d,f,g,h,e=0;a=a.replace(/[^A-Za-z0-9\+\/\=]/g,"");do c="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".indexOf(a.charAt(e++)),d="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".indexOf(a.charAt(e++)),g="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".indexOf(a.charAt(e++)),h="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".indexOf(a.charAt(e++)),c=c<<2|d>>4,d=(d&15)<<4|g>>2,f=(g&3)<<6|h,b+=String.fromCharCode(c),64!=g&&(b+=String.fromCharCode(d)),64!=h&&(b+=String.fromCharCode(f));while(e<a.length);return b}}})()
  };
})();
