var NPMap = {
  baseLayers: ['nps-lightStreets'],
  center: {
    lat: 39,
    lng: -96
  },
  div: 'map',
  homeControl: true,
  smallzoomControl: true,
  zoom: 4
};
var Builder = (function() {
  var $buttonAddAnotherLayer,
    $buttonEditBaseMapsAgain,
    $iframe = $('#iframe-map'),
    $modalAddLayer,
    $modalChangeMarker,
    $modalConfirm,
    $modalEditBaseMaps,
    $modalExport,
    $stepSection = $('section .step'),
    $ul = $('#layers'),
    descriptionSet = false,
    descriptionZ = null,
    stepLis,
    titleSet = false,
    titleZ = null;

  /**
   * Gets the Leaflet map object from the map iframe.
   * @return {Object}
   */
  function getLeafletMap() {
    return document.getElementById('iframe-map').contentWindow.NPMap.config.L;
  }
  /**
   * Changes the step.
   * @param {Number} from
   * @param {Number} to
   */
  function goToStep(from, to) {
    $($stepSection[from]).hide();
    $($stepSection[to]).show();
    $(stepLis[from]).removeClass('active');
    $(stepLis[to]).addClass('active');
  }
  /**
   * Loads a UI module.
   * @param {String} module
   * @param {Function} callback (Optional)
   */
  function loadModule(module, callback) {
    module = module.replace('Builder.', '').replace(/\./g,'/');

    $.ajax({
      dataType: 'html',
      success: function (html) {
        $('body').append(html);
        $.getScript(module + '.js', function() {
          if (callback) {
            callback();
          }
        });
      },
      url: module + '.html'
    });
  }
  /**
   * Sets a height for each of an accordion's child panels.
   * @param {String} selector
   */
  function setAccordionHeight(selector) {
    var $accordion = $(selector),
      outerHeight = $accordion.outerHeight();

    if (outerHeight) {
      var panels = $accordion.find('.panel'),
        headerHeight = panels.length * 37;

      $.each(panels, function(i, panel) {
        var $child = $(panel).find('.panel-collapse');

        $($child.children()[0]).height(outerHeight - headerHeight - 30 - 5);
      });
    }
  }

  $(document).ready(function() {
    $buttonAddAnotherLayer = $('#button-addAnotherLayer');
    $buttonEditBaseMapsAgain = $('#button-editBaseMapsAgain');
    $modalConfirm = $('#modal-confirm');
    stepLis = $('#steps li');

    $.each($('#additional-tools-and-settings form'), function(i, form) {
      $.each($(form).find('input'), function(j, input) {
        $(input).on('change', function() {
          var checked = $(this).prop('checked'),
            value = this.value;

          if (value === 'overviewControl') {
            if (checked) {
              NPMap[value] = {
                layer: (function() {
                  for (var i = 0; i < NPMap.baseLayers.length; i++) {
                    var baseLayer = NPMap.baseLayers[0];

                    if (typeof baseLayer.visible === 'undefined' || baseLayer.visible === true) {
                      return baseLayer;
                    }
                  }
                })()
              };
            } else {
              NPMap[value] = false;
            }
          } else {
            NPMap[value] = checked;
          }

          Builder.updateMap();
        });
      });
    });
    $('#button-addAnotherLayer, #button-addLayer').on('click', function() {
      if ($modalAddLayer) {
        $modalAddLayer.modal('show');
      } else {
        loadModule('Builder.ui.modal.addLayer', function() {
          $modalAddLayer = $('#modal-addLayer');
        });
      }
    });
    $('#button-editBaseMaps, #button-editBaseMapsAgain').on('click', function() {
      if ($modalEditBaseMaps) {
        $modalEditBaseMaps.modal('show');
      } else {
        loadModule('Builder.ui.modal.editBaseMaps', function() {
          $modalEditBaseMaps = $('#modal-editBaseMaps');
        });
      }
    });
    $('#button-export').on('click', function() {
      if ($modalExport) {
        $modalExport.modal('show');
      } else {
        loadModule('Builder.ui.modal.export', function() {
          $modalExport = $('#modal-export');
        });
      }
    });
    $('#button-feedback').on('click', function() {
      window.open('https://github.com/nationalparkservice/npmap-builder/issues', '_blank');
    });
    $('#button-saveMap').on('click', function() {
      var config = {'userJson': $.extend(true, {}, NPMap)},
        serverUrl = 'http://162.243.77.34/builder';

      config.mapName = $('.title a').text();
      config.isPublic = true;
      config.isShared = true;
      config.userJson.description = $('.description a').text();

      $('#button-saveMap').attr('disabled', 'disabled');
      $.ajax({
        beforeSend: function (xhr) {
          xhr.setRequestHeader ('Authorization', 'Basic ' + btoa('npmap_builder:321redliub_pampn'));
        },
        contentType: false,
        data: JSON.stringify(config),
        error: function(data) {
          //console.log('error', data);
          $('#button-saveMap').removeAttr('disabled');
        },
        processData: false,
        success: function(data) {
          //console.log('success', data);
          $('#button-saveMap').removeAttr('disabled');
        },
        type: 'POST',
        url: serverUrl,
        xhrFields: { withCredentials: true },
      });
    });
    $($('section .step .btn-primary')[0]).on('click', function() {
      goToStep(0, 1);
    });
    $($('section .step .btn-primary')[1]).on('click', function() {
      goToStep(1, 2);
    });
    $.each(stepLis, function(i, li) {
      $(li.childNodes[0]).on('click', function() {
        var currentIndex = -1;

        for (var j = 0; j < stepLis.length; j++) {
          if ($(stepLis[j]).hasClass('active')) {
            currentIndex = j;
            break;
          }
        }

        if (currentIndex !== i) {
          goToStep(currentIndex, i);
        }
      });
    });
    $('.dd').nestable({
      handleClass: 'letter',
      listNodeName: 'ul'
    })
      .on('change', function() {
        var overlays = [];

        $.each($ul.children(), function(i, li) {
          var from = parseInt($(li).attr('data-id'), 10);

          if (from !== i) {
            overlays.splice(i, 0, NPMap.overlays[from]);
          }

          $(li).attr('data-id', i.toString());
          li.childNodes[0].innerHTML = Builder._abcs[i];
        });

        if (overlays.length) {
          //NPMap.overlays = overlays.reverse();
          NPMap.overlays = overlays;
          Builder.updateMap();
        }

        Builder._refreshLayersUl();
      });
    $('#metadata .description a').editable({
      animation: false,
      container: '#metadata span.info',
      emptytext: 'Add a description to give your map context.',
      validate: function(value) {
        if ($.trim(value) === '') {
          return 'Please enter a description for your map.';
        }
      }
    })
      .on('hidden', function() {
        var next = $(this).next();

        if (!descriptionSet) {
          $('#mask').remove();
          next.css({
            'z-index': descriptionZ
          });
          $(next.find('button')[1]).css({
            display: 'block'
          });
          descriptionSet = true;
        }
      })
      .on('shown', function() {
        var next = $(this).parent().next();

        if (!descriptionSet) {
          descriptionZ = next.css('z-index');
          next.css({
            'z-index': 1031
          });
          $(next.find('button')[1]).css({
            display: 'none'
          });
        }

        next.find('textarea').css({
          'resize': 'none'
        });
      });
    $('#metadata .title a').editable({
      animation: false,
      emptytext: 'Untitled Map',
      validate: function(value) {
        if ($.trim(value) === '') {
          return 'Please enter a title for your map.';
        }
      }
    })
      .on('hidden', function() {
        var description = $('#metadata .description a').html(),
            next = $(this).next();

        if (!description || description === 'Add a description to give your map context.') {
          $('#metadata .description a').editable('toggle');
        }

        if (!titleSet) {
          next.css({
            'z-index': titleZ
          });
          $(next.find('button')[1]).css({
            display: 'block'
          });
          titleSet = true;
        }
      })
      .on('shown', function() {
        var next = $(this).next();

        if (!titleSet) {
          titleZ = next.css('z-index');
          next.css({
            'z-index': 1031
          });
          $(next.find('button')[1]).css({
            display: 'none'
          });
        }

        next.find('.editable-clear-x').remove();
        next.find('input').css({
          'padding-right': '10px'
        });
      });
    $($('#set-center-and-zoom .btn-block')[0]).on('click', function() {
      var map = getLeafletMap(),
        center = map.getCenter();

      NPMap.center = {
        lat: center.lat,
        lng: center.lng
      };
      NPMap.zoom = map.getZoom();
      Builder._updateInitialCenterAndZoom();
      Builder.updateMap();
    });
    $('#set-center-and-zoom .bounds-clear a').on('click', function() {
      delete NPMap.maxBounds;
      $('#set-center-and-zoom .bounds').html('No');
      $('#set-center-and-zoom .bounds-clear').hide();
      Builder.updateMap();
    });
    $($('#set-center-and-zoom .btn-block')[1]).on('click', function() {
      var bounds = getLeafletMap().getBounds(),
        northEast = bounds.getNorthEast(),
        southWest = bounds.getSouthWest();

      NPMap.maxBounds = [
        [southWest.lat, southWest.lng],
        [northEast.lat, northEast.lng]
      ];

      $('#set-center-and-zoom .bounds').html('Yes');
      $('#set-center-and-zoom .bounds-clear').show();
      Builder.updateMap();
    });
    $('#set-zoom').slider({
      //center: 4,
      max: 19,
      min: 0,
      value: [0, 19]
    })
      .on('slideStop', function(e) {
        NPMap.maxZoom = e.value[1];
        NPMap.minZoom = e.value[0];
        Builder.updateMap();
      });
    $(window).resize(function() {
      setAccordionHeight('#accordion-step-1');
    });
    setAccordionHeight('#accordion-step-1');
    setTimeout(function() {
      $('#metadata .title a').editable('toggle');
    }, 200);
  });

  return {
    _abcs: ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'],
    _handlers: {
      layerChangeStyleOnClick: function(el) {
        /*
        var layerIndex = $(el).parent().parent().parent().data('id');
        var layer = document.getElementById('iframe-map').contentWindow.NPMap.config.overlays[layerIndex];

        // TODO: Clean this up a little
        if ($modalChangeMarker) {
          $modalChangeMarker.modal('show');
          $modalChangeMarker.data({'layer': layer});
          $modalChangeMarker.on('hidden', function () {
            Builder.updateMap();
          });
        } else {
          loadModule('Builder.ui.modal.changeMarker', function() {
            $modalChangeMarker = $('#modal-changeMarker');
            $modalChangeMarker.data({'layer': layer});
            $modalChangeMarker.on('hidden', function () {
              Builder.updateMap();
            });
          });
        }
        */

        $(el).popover({
          animation: false,
          container: 'body',
          html: 'This is only a test.',
          placement: 'right'
        });
      },
      layerEditOnClick: function(el) {
        $modalAddLayer.modal('show', function() {
          // TODO: Not being called.
          console.log(NPMap.overlays[$.inArray($(el).parent().parent().prev().text(), Builder._abcs)]);
          console.log(Builder.ui.modal.addLayer);
          Builder.ui.modal.addLayer.load(NPMap.overlays[$.inArray($(el).parent().parent().prev().text(), Builder._abcs)]);
        });
      },
      layerRemoveOnClick: function(el) {
        Builder.showConfirm('Yes, remove the layer', 'Once the layer is removed, you cannot get it back.', 'Are you sure?', function() {
          Builder.removeLayerLi(el);
          Builder.removeLayer($(el).parent().prev()[0].innerHTML);
        });
        return false;
      },
      loadMap: function () {
        var preLoadModule = function(module, callback) {
          var preLoaders = {}; //TODO: move this
          if (preLoaders.module) {
            callback(preLoaders.module);
          } else {
            loadModule(module, function() {
              preLoaders.module = $('#modal-' + module.split('.').pop());
              callback(preLoaders.module);
            });
          }
        };
        preLoadModule('Builder.ui.modal.loadMap', function(loader) {
          loader.modal('show');
        });
      }
    },
    _refreshLayersUl: function() {
      var previous = $ul.parent().prev();

      if ($ul.children().length === 0) {
        $buttonAddAnotherLayer.hide();
        $buttonEditBaseMapsAgain.hide();
        previous.show();
      } else {
        $buttonAddAnotherLayer.show();
        $buttonEditBaseMapsAgain.show();
        previous.hide();
      }
    },
    _updateInitialCenterAndZoom: function() {
      $('#set-center-and-zoom .lat').html(NPMap.center.lat.toFixed(2));
      $('#set-center-and-zoom .lng').html(NPMap.center.lng.toFixed(2));
      $('#set-center-and-zoom .zoom').html(NPMap.zoom);
    },
    rebuildTooltips: function() {
      $('[rel=tooltip]').tooltip({
        animation: false
      });
    },
    removeLayer: function(name) {
      NPMap.overlays = $.grep(NPMap.overlays, function(layer) {
        return layer.name !== name;
      });
      this.updateMap();
    },
    removeLayerLi: function(el) {
      $(el).parent().parent().parent().remove();
      this._refreshLayersUl();
    },
    showConfirm: function(button, content, title, callback) {
      $($modalConfirm.find('.btn-primary')[0]).html(button).on('click', function() {
        $modalConfirm.modal('hide');
        callback();
      });
      $($modalConfirm.find('.modal-body')[0]).html(content);
      $($modalConfirm.find('h4')[0]).html(title);
      $modalConfirm.modal('show');
    },
    updateMap: function(callback) {
      $iframe.attr('src', 'iframe.html?c=' + encodeURIComponent(JSON.stringify(NPMap)));
      var interval = setInterval(function() {
        var npmap = document.getElementById('iframe-map').contentWindow.NPMap;

        if (npmap && npmap.config && npmap.config.center) {
          clearInterval(interval);

          if (callback) {
            callback(npmap.config);
          }
        }
      }, 100);
    }
  };
})();
Builder.rebuildTooltips();
Builder.updateMap(function(config) {
  // TODO: Grab details if this map is being loaded and populate necessary fields.
  NPMap.center = {
    lat: config.center.lat,
    lng: config.center.lng
  };
  NPMap.zoom = config.zoom;
  Builder._updateInitialCenterAndZoom();
});
