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
    $modalConfirm,
    $modalEditBaseMaps,
    $modalExport,
    $stepSection = $('section .step'),
    $ul = $('#layers'),
    descriptionSet = false,
    descriptionZ = null,
    settingsSet = false,
    settingsZ = null,
    stepLis,
    titleSet = false,
    titleZ = null;

  function getLayerIndexFromButton(el) {
    return $.inArray($(el).parent().parent().parent().prev().text(), Builder._abcs);
  }
  function getLeafletMap() {
    return document.getElementById('iframe-map').contentWindow.NPMap.config.L;
  }
  function goToStep(from, to) {
    $($stepSection[from]).hide();
    $($stepSection[to]).show();
    $(stepLis[from]).removeClass('active');
    $(stepLis[to]).addClass('active');
  }
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
    $('#button-help').on('click', function() {
      window.open('https://github.com/nationalparkservice/npmap-builder/wiki', '_blank');
    });
    $('#button-saveMap').on('click', function() {
      var $this = $(this);

      $this.attr('disabled', true);
      $.ajax({
        error: function() {
          document.alert('Cannot reach status service. You must be on the National Park Service network to save a map.');
        },
        success: function(response) {
          if (response && response.id) {
            var checkboxes = $('#metadata .buttons .popover checkbox'),
              params = {
                id: response.id,
                json: JSON.stringify($.extend(true, {
                  description: $('.description a').text(),
                  isPublic: $(checkboxes[0]).prop('checked'),
                  isShared: $(checkboxes[1]).prop('checked'),
                  name: $('.title a').text()
                }, NPMap))
              };

            $.ajax({
              data: params,
              url: 'http://insidemaps.nps.gov/builder/save'
            });
          } else {
            document.alert('Not logged in. You must be on the National Park Service network to save a map.');
          }
        },
        url: 'http://insidemaps.nps.gov/status/get'
      });
    });
    $('#button-settings').on('click', function() {
      var $this = $(this),
        $span = $($this.children('span')[2]);

      if ($this.hasClass('active')) {
        $span.popover('hide');
        $this.removeClass('active');
      } else {
        $span.popover('show');
        $this.addClass('active');
      }
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
    $($('#button-settings span')[2]).popover({
      animation: false,
      container: '#metadata .buttons',
      content: '<div class="checkbox"><label><input type="checkbox" value="public" checked="checked">Is this map public?</label></div><div class="checkbox"><label><input type="checkbox" value="shared" checked="checked">Share this map with others?</label></div><div style="text-align:center;"><button type="button" class="btn btn-primary" onclick="Builder._handlers.settingsButtonOnClick(this);return false;">Start Building!</button></div>',
      html: true,
      placement: 'bottom',
      trigger: 'manual'
    })
      .on('shown.bs.popover', function() {
        if (settingsSet) {
          $('#metadata .buttons .popover .btn-primary').hide();
        }
      });
    $('.dd').nestable({
      handleClass: 'letter',
      listNodeName: 'ul'
    })
      .on('change', function() {
        var abcs = Builder._abcs,
          overlays = [];

        $.each($ul.children(), function(i, li) {
          var from = $.inArray($($(li).children('.letter')[0]).text(), abcs);

          if (from !== i) {
            overlays.splice(i, 0, NPMap.overlays[from]);
          }

          li.childNodes[0].innerHTML = abcs[i];
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
          $($('#button-settings span')[2]).popover('show');
          next.css({
            'z-index': descriptionZ
          });
          $(next.find('button')[1]).css({
            display: 'block'
          });
          descriptionSet = true;

          if (!settingsSet) {
            next = $('#metadata .buttons .popover');
            settingsZ = next.css('z-index');
            next.css({
              'z-index': 1031
            });
          }
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
    $($('#set-center-and-zoom .btn-block')[1]).on('click', function() {
      var $this = $(this);

      if ($this.hasClass('active')) {
        delete NPMap.maxBounds;
        $this.removeClass('active').text('Restrict Bounds');
      } else {
        var bounds = getLeafletMap().getBounds(),
          northEast = bounds.getNorthEast(),
          southWest = bounds.getSouthWest();

        NPMap.maxBounds = [
          [southWest.lat, southWest.lng],
          [northEast.lat, northEast.lng]
        ];

        $(this).addClass('active').text('Remove Bounds Restriction');
      }

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
        var index = getLayerIndexFromButton(el);

        $modalAddLayer.modal('show');
        Builder.ui.modal.addLayer._load(NPMap.overlays[index]);
        Builder.ui.modal.addLayer._editingIndex = index;
      },
      layerRemoveOnClick: function(el) {
        Builder.showConfirm('Yes, remove the layer', 'Once the layer is removed, you cannot get it back.', 'Are you sure?', function() {
          var index = getLayerIndexFromButton(el);

          Builder.removeLayerLi(el);
          Builder.removeLayer(index);
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
      },
      settingsButtonOnClick: function(el) {
        var $el = $(el);

        $el.parents('.popover').css({
          'z-index': settingsZ
        });
        $('#mask').remove();
        $($('#button-settings span')[2]).popover('hide');
        settingsSet = true;
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
    buildTooltips: function() {
      $('[rel=tooltip]').tooltip({
        animation: false
      });
    },
    removeLayer: function(index) {
      NPMap.overlays.splice(index, 1);
      this.updateMap();
    },
    removeLayerLi: function(el) {
      $($(el).parents('li')[0]).remove();
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
Builder.buildTooltips();
Builder.updateMap(function(config) {
  // TODO: Grab details if this map is being loaded and populate necessary fields.
  NPMap.center = {
    lat: config.center.lat,
    lng: config.center.lng
  };
  NPMap.zoom = config.zoom;
  Builder._updateInitialCenterAndZoom();
});
