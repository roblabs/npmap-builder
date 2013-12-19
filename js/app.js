/* globals alertify */

var Builder, NPMap, mapId;

function ready() {
  Builder = (function() {
    var $buttonAddAnotherLayer = $('#button-addAnotherLayer'),
      $buttonEditBaseMapsAgain = $('#button-editBaseMapsAgain'),
      $iframe = $('#iframe-map'),
      $layers = $('#layers'),
      $modalAddLayer,
      $modalConfirm = $('#modal-confirm'),
      $modalEditBaseMaps,
      $modalExport,
      $stepSection = $('section .step'),
      $ul = $('#layers'),
      abcs = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'],
      colors,
      descriptionSet = false,
      descriptionZ = null,
      settingsSet = false,
      settingsZ = null,
      stepLis = $('#steps li'),
      titleSet = false,
      titleZ = null;

    function generateLayerChangeStyle(name) {
      var optionsColor = '',
        optionsOpacity = '<option value=""></option>';

      if (!colors) {
        colors = document.getElementById('iframe-map').contentWindow.L.npmap.preset.colors;
      }

      $.each(colors, function(prop, value) {
        optionsColor += '<option value="' + value.color + '">' + value.color + '</option>';
      });

      return '' +
        '<form id="' + name + '_layer-change-style" role="form" style="width:150px;">' +
          '<fieldset>' +
            '<legend>Outline</legend>' +
            '<div class="form-group">' +
              '<label for="' + name + '_outline-color">Color</label>' +
              '<select id="' + name + '_outline-color" class="simplecolorpicker">' + optionsColor + '</select>' +
            '</div>' +
            '<div class="form-group">' +
              '<label for="' + name + '_outline-width">Width</label>' +
              '<select id="' + name + '_outline-width"><option value="1">1 pt</option><option value="2">2 pt</option><option value="3">3 pt</option><option value="4">4 pt</option><option value="5">5 pt</option></select>' +
            '</div>' +
            '<div class="form-group">' +
              '<label for="' + name + '_outline-opacity">Opacity</label>' +
              '<select id="' + name + '_outline-opacity"></select>' +
            '</div>' +
          '</fieldset>' +
          '<fieldset>' +
            '<legend>Fill</legend>' +
            '<div class="form-group">' +
              '<label for="' + name + '_fill-color">Color</label>' +
              '<select id="' + name + '_fill-color" class="simplecolorpicker">' + optionsColor + '</select>' +
            '</div>' +
            '<div class="form-group">' +
              '<label for="' + name + '_fill-opacity">Opacity</label>' +
              '<select id="' + name + '_fill-opacity"></select>' +
            '</div>' +
          '</fieldset>' +
          '<fieldset>' +
            '<legend>Marker</legend>' +
            '<div class="form-group">' +
              '<label for="' + name + '_marker-color">Color</label>' +
              '<select id="' + name + '_marker-color" class="simplecolorpicker">' + optionsColor + '</select>' +
            '</div>' +
            '<div class="form-group">' +
              '<label for="' + name + '_marker-size">Size</label>' +
              '<select id="' + name + '_marker-size"><option value="small">Small</option><option value="medium">Medium</option><option value="large">Large</option></select>' +
            '</div>' +
            '<div class="form-group">' +
              '<label for="' + name + '_marker-icon">Icon</label>' +
              '<select id="' + name + '_marker-icon"></select>' +
            '</div>' +
          '</fieldset>' +
        '</form>';
    }
    function getLayerIndexFromButton(el) {
      return $.inArray($(el).parent().parent().parent().prev().text(), abcs);
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
    function updateInitialCenterAndZoom() {
      $('#set-center-and-zoom .lat').html(NPMap.center.lat.toFixed(2));
      $('#set-center-and-zoom .lng').html(NPMap.center.lng.toFixed(2));
      $('#set-center-and-zoom .zoom').html(NPMap.zoom);
    }
    function updateSaveStatus(date) {
      $('.info-saved p').text('Saved ' + moment(date).format('MM/DD/YYYY') + ' at ' + moment(date).format('h:mm:ssa'));
      $('.info-saved').show();
    }

    $(document).ready(function() {
      if (mapId) {
        descriptionSet = true;
        settingsSet = true;
        titleSet = true;
      } else {
        setTimeout(function() {
          $('#metadata .title a').editable('toggle');
        }, 200);
      }
    });

    return {
      ui: {
        app: {
          init: function() {
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
          }
        },
        metadata: {
          init: function() {
            $('#metadata .description a').text(NPMap.description).editable({
              animation: false,
              container: '#metadata div.info',
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
            $('#metadata .title a').text(NPMap.name).editable({
              animation: false,
              emptytext: 'Untitled Map',
              validate: function(value) {
                if ($.trim(value) === '') {
                  return 'Please enter a title for your map.';
                }
              }
            })
              .on('hidden', function() {
                var description = $('#metadata .description a').text(),
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
          },
          load: function() {
            if (NPMap.description) {
              $('#metadata .description a').text(NPMap.description);
            }

            if (NPMap.name) {
              $('#metadata .title a').text(NPMap.name);
            }

            updateSaveStatus(NPMap.modified);
          }
        },
        steps: {
          addAndCustomizeData: {
            handlers: {
              clickLayerChangeStyle: function(el) {
                var $el = $(el);

                if ($el.data('popover-created')) {
                  $el.popover('toggle');
                } else {
                  var html,
                    overlay = NPMap.overlays[getLayerIndexFromButton(el)],
                    name = overlay.name.replace(' ', '_');

                  switch (overlay.type) {
                  case 'arcgisserver':
                    html = 'ArcGIS Online/ArcGIS Server layers cannot be styled.';
                    break;
                  case 'cartodb':
                    html = 'The ability to style CartoDB layers is coming soon.';
                    break;
                  case 'geojson':
                    html = generateLayerChangeStyle(name);
                    break;
                  case 'github':
                    html = generateLayerChangeStyle(name);
                    break;
                  case 'kml':
                    html = generateLayerChangeStyle(name);
                    break;
                  case 'mapbox':
                    html = 'MapBox Hosting layers cannot be styled.';
                    break;
                  }

                  $el.popover({
                    animation: false,
                    container: 'section',
                    content: html,
                    html: true,
                    placement: 'right',
                    //title: 'Customize Shapes',
                    trigger: 'manual'
                  })
                    .on('hide.bs.popover', function() {
                      $.each($('#' + name + '_layer-change-style select.simplecolorpicker'), function(i, el) {
                        $(el).simplecolorpicker('destroy');
                      });
                    })
                    .on('shown.bs.popover', function() {
                      $.each($('#' + name + '_layer-change-style .simplecolorpicker'), function(i, el) {
                        $(el).simplecolorpicker({
                          picker: true,
                          theme: 'glyphicons'
                        });
                      });
                    });
                  $el.popover('show');
                  $el.data('popover-created', true);
                }
              },
              clickLayerEdit: function(el) {
                var index = getLayerIndexFromButton(el);

                function callback() {
                  Builder.ui.modal.addLayer._load(NPMap.overlays[index]);
                  Builder.ui.modal.addLayer._editingIndex = index;
                  $modalAddLayer.off('shown.bs.modal', callback);
                }

                if ($modalAddLayer) {
                  $modalAddLayer
                    .on('shown.bs.modal', callback)
                    .modal('show');
                } else {
                  Builder._pendingLayerEditIndex = index;
                  loadModule('Builder.ui.modal.addLayer', function() {
                    $modalAddLayer = $('#modal-addLayer');
                    callback();
                  });
                }
              },
              clickLayerRemove: function(el) {
                Builder.showConfirm('Yes, remove the layer', 'Once the layer is removed, you cannot get it back.', 'Are you sure?', function() {
                  Builder.ui.steps.addAndCustomizeData.removeLi(el);
                  Builder.removeOverlay(getLayerIndexFromButton(el));
                });
              }
            },
            init: function() {
              $('.dd').nestable({
                handleClass: 'letter',
                listNodeName: 'ul'
              })
                .on('change', function() {
                  var children = $ul.children(),
                    overlays = [];

                  if (children.length > 1) {
                    $.each(children, function(i, li) {
                      var $letter = $($(li).children('.letter')[0]),
                        from = $.inArray($letter.text(), abcs);

                      if (from !== i) {
                        overlays.splice(i, 0, NPMap.overlays[from]);
                      }

                      $letter.text(abcs[i]);
                    });

                    if (overlays.length) {
                      NPMap.overlays = overlays;
                      Builder.updateMap();
                    }

                    Builder.ui.steps.addAndCustomizeData.refreshUl();
                  }
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
            },
            load: function() {
              if ($.isArray(NPMap.overlays)) {
                $.each(NPMap.overlays, function(i, overlay) {
                  Builder.ui.steps.addAndCustomizeData.overlayToLi(overlay);
                });
              }
            },
            overlayToLi: function(overlay) {
              var index;

              if (!$layers.is(':visible')) {
                $layers.prev().hide();
                $('#customize .content').css({
                  padding: 0
                });
                $layers.show();
              }

              index = $layers.children().length;
              $layers.append($([
                '<li class="dd-item">',
                  '<div class="letter">' + abcs[index] + '</div>',
                  '<div class="details">',
                    '<span class="name">' + overlay.name + '</span>',
                    '<span class="description">' + (overlay.description || '') + '</span>',
                    '<span>',
                      '<div style="float:left;">',
                        '<button onclick="Builder.ui.steps.addAndCustomizeData.handlers.clickLayerEdit(this);" data-container="section" data-placement="bottom" rel="tooltip" title="Edit Overlay">',
                          '<img src="img/edit-layer.png">',
                        '</button>',
                      '</div>',
                      '<div style="float:right;">',
                        /*
                        '<button onclick="Builder.ui.steps.addAndCustomizeData.handlers.clickLayerChangeStyle(this);" style="margin-right:10px;">',
                          '<img src="img/edit-style.png">',
                        '</button>',
                        */
                        '<button onclick="Builder.ui.steps.addAndCustomizeData.handlers.clickLayerRemove(this);" data-container="section" data-placement="bottom" rel="tooltip" title="Delete Overlay">',
                          '<img src="img/remove-layer.png">',
                        '</button>',
                      '</div>',
                    '</span>',
                  '</div>',
                '</li>'
              ].join('')));
              Builder.ui.steps.addAndCustomizeData.refreshUl();
            },
            refreshUl: function() {
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
            removeLi: function(el) {
              $($(el).parents('li')[0]).remove();
              
              Builder.ui.steps.addAndCustomizeData.refreshUl();
            }
          },
          additionalToolsAndSettings: {
            init: function() {
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
            },
            load: function() {
              $.each($('#additional-tools-and-settings form'), function(i, form) {
                $.each($(form).find('input'), function(j, input) {
                  var $input = $(input),
                    property = NPMap[$input.attr('value')];

                  if (typeof property !== 'undefined') {
                    $input.attr('checked', property);
                  }
                });
              });
            }
          },
          setCenterAndZoom: {
            init: function() {
              $($('#set-center-and-zoom .btn-block')[0]).on('click', function() {
                var map = getLeafletMap(),
                  center = map.getCenter();

                NPMap.center = {
                  lat: center.lat,
                  lng: center.lng
                };
                NPMap.zoom = map.getZoom();

                updateInitialCenterAndZoom();
                Builder.updateMap();
              });
              $($('#set-center-and-zoom .btn-block')[1]).on('click', function() {
                var $this = $(this);

                if ($this.hasClass('active')) {
                  delete NPMap.maxBounds;
                  $this.removeClass('active').text('Restrict Bounds');
                  $this.next().hide();
                } else {
                  var bounds = getLeafletMap().getBounds(),
                    northEast = bounds.getNorthEast(),
                    southWest = bounds.getSouthWest();

                  NPMap.maxBounds = [
                    [southWest.lat, southWest.lng],
                    [northEast.lat, northEast.lng]
                  ];

                  $(this).addClass('active').text('Remove Bounds Restriction');
                  $this.next().show();
                }

                Builder.updateMap();
              });
              $('#set-zoom').slider({
                //center: 4,
                max: 19,
                min: 0,
                value: [typeof NPMap.minZoom === 'number' ? NPMap.minZoom : 0, typeof NPMap.maxZoom === 'number' ? NPMap.maxZoom : 19]
              })
                .on('slideStop', function(e) {
                  NPMap.maxZoom = e.value[1];
                  NPMap.minZoom = e.value[0];
                  Builder.updateMap();
                });
            },
            load: function() {
              updateInitialCenterAndZoom();

              if (typeof NPMap.maxBounds === 'object') {
                $($('#set-center-and-zoom .btn-block')[1]).addClass('active').text('Remove Bounds Restriction');
              }
            }
          }
        },
        toolbar: {
          handlers: {
            clickSettings: function(el) {
              $(el).parents('.popover').css({
                'z-index': settingsZ
              });
              $('#mask').remove();
              $($('#button-settings span')[2]).popover('hide');
              settingsSet = true;
            }
          },
          init: function() {
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
            $('#button-save').on('click', function() {
              var $this = $(this),
                base = (function () {
                  var host = window.location.host;

                  /*
                  if (host.indexOf('insidemaps') === -1 && host.indexOf('localhost') === -1) {
                    return 'http://insidemaps.nps.gov/';
                  }
                  */

                  return '/';
                })();

              Builder.showLoading();
              $this.blur();
              $.ajax({
                data: {
                  description: $('.description a').text() || null,
                  isPublic: true,
                  isShared: true,
                  json: JSON.stringify(NPMap),
                  mapId: mapId || null,
                  name: $('.title a').text() || null
                },
                dataType: 'json',
                error: function () {
                  Builder.hideLoading();
                  alertify.error('Cannot reach status service. You must be connected to the National Park Service network to save a map.');
                },
                success: function (response) {
                  Builder.hideLoading();

                  if (response) {
                    if (response.success) {
                      mapId = response.mapId;
                      updateSaveStatus(response.modified);
                      alertify.success('Your map was saved!');
                    } else {
                      alertify.error('Your map was not saved.');
                    }
                  } else {
                    alertify.error('Cannot reach status service. You must be connected to the National Park Service network to save a map.');
                  }
                },
                url: base + 'builder/save' + (base === '/' ? '' : '&callback=?')
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
            $($('#button-settings span')[2]).popover({
              animation: false,
              container: '#metadata .buttons',
              content: '<div class="checkbox"><label><input type="checkbox" value="public" checked="checked" disabled>Is this map public?</label></div><div class="checkbox"><label><input type="checkbox" value="shared" checked="checked" disabled>Share this map with others?</label></div><div style="text-align:center;"><button type="button" class="btn btn-primary" onclick="Builder.ui.toolbar.handlers.clickSettings(this);">Start Building!</button></div>',
              html: true,
              placement: 'bottom',
              trigger: 'manual'
            })
              .on('shown.bs.popover', function() {
                if (settingsSet) {
                  $('#metadata .buttons .popover .btn-primary').hide();
                }
              });
          }
        }
      },
      addOverlay: function(overlay) {
        NPMap.overlays.push(overlay);
        Builder.ui.steps.addAndCustomizeData.overlayToLi(overlay);
      },
      buildTooltips: function() {
        $('[rel=tooltip]').tooltip({
          animation: false
        });
      },
      hideLoading: function() {
        $('#loading').hide();
        document.body.removeChild(document.getElementById('loading-backdrop'));
      },
      removeOverlay: function(index) {
        NPMap.overlays.splice(index, 1);
        this.updateMap();
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
      showLoading: function() {
        var div = document.createElement('div');
        div.className = 'modal-backdrop in';
        div.id = 'loading-backdrop';
        document.body.appendChild(div);
        $('#loading').show();
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

  Builder.ui.app.init();
  Builder.ui.metadata.init();
  Builder.ui.steps.addAndCustomizeData.init();
  Builder.ui.steps.additionalToolsAndSettings.init();
  Builder.ui.steps.setCenterAndZoom.init();
  Builder.ui.toolbar.init();

  if (mapId) {
    Builder.ui.metadata.load();
    Builder.ui.steps.addAndCustomizeData.load();
    Builder.ui.steps.additionalToolsAndSettings.load();
    Builder.ui.steps.setCenterAndZoom.load();
    delete NPMap.created;
    delete NPMap.description;
    delete NPMap.isPublic;
    delete NPMap.isShared;
    delete NPMap.modified;
    delete NPMap.name;
    delete NPMap.tags;
  }

  Builder.buildTooltips();
  Builder.updateMap();
}

mapId = (function() {
  var search = document.location.search.replace('&?', ''),
    id = null;

  if (search.indexOf('?') === 0) {
    search = search.slice(1, search.length);
  }

  search = search.split('&');

  for (var i = 0; i < search.length; i++) {
    var param = search[i].split('=');

    if (param[0].toLowerCase() === 'mapid') {
      id = param[1];
      break;
    }
  }

  return id;
})();

if (mapId) {
  $.ajax({
    dataType: 'jsonp',
    jsonpCallback: 'callback',
    success: function(response) {
      NPMap = response;
      ready();
    },
    url: 'http://www.nps.gov/maps/builder/configs/' + mapId + '.jsonp'
  });
} else {
  var mask = document.createElement('div');
  mask.className = 'modal-backdrop in';
  mask.id = 'mask';
  document.body.appendChild(mask);

  NPMap = {
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
  ready();
}
