/* globals alertify, moment */

var Builder, NPMap, mapId;

function ready() {
  Builder = (function() {
    var $activeChangeStyleButton = null,
      $buttonAddAnotherLayer = $('#button-addAnotherLayer'),
      $buttonEditBaseMapsAgain = $('#button-editBaseMapsAgain'),
      $buttonExport = $('#button-export'),
      $buttonSave = $('#button-save'),
      $iframe = $('#iframe-map'),
      $lat = $('#set-center-and-zoom .lat'),
      $lng = $('#set-center-and-zoom .lng'),
      $layers = $('#layers'),
      $modalAddLayer,
      $modalConfirm = $('#modal-confirm'),
      $modalEditBaseMaps,
      $modalExport,
      $modalViewConfig,
      $stepSection = $('section .step'),
      $ul = $('#layers'),
      $zoom = $('#set-center-and-zoom .zoom'),
      abcs = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'],
      description = null,
      descriptionSet = false,
      descriptionZ = null,
      firstLoad = true,
      optionsColor = '',
      optionsMaki = '',
      optionsNpmaki = '',
      settingsSet = false,
      settingsZ = null,
      stepLis = $('#steps li'),
      title = null,
      titleSet = false,
      titleZ = null;

    function disableSave() {
      $buttonSave.prop('disabled', true);
      $buttonExport.text('Export Your Map');
    }
    function enableSave() {
      $buttonSave.prop('disabled', false);
      $buttonExport.text('Save & Export Your Map');
    }
    function generateLayerChangeStyle(name) {
      var sortable;

      if (!optionsColor.length) {
        $.each(document.getElementById('iframe-map').contentWindow.L.npmap.preset.colors, function(prop, value) {
          var color = value.color;

          optionsColor += '<option value="' + color + '">' + color + '</option>';
        });
      }

      if (!optionsMaki.length) {
        var numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
          i;

        sortable = [];

        for (i = 0; i < abcs.length; i++) {
          var letter = abcs[i];

          sortable.push({
            icon: letter.toLowerCase(),
            name: 'Letter "' + letter + '"'
          });
        }

        for (i = 0; i < numbers.length; i++) {
          var number = numbers[i];

          sortable.push({
            icon: number,
            name: 'Number "' + number + '"'
          });
        }

        $.each(document.getElementById('iframe-map').contentWindow.L.npmap.preset.maki, function(prop, value) {
          sortable.push({
            icon: value.icon,
            name: value.name
          });
        });
        sortable.sort(function(a, b) {
          if (a.name < b.name) {
            return -1;
          }

          if (a.name > b.name) {
            return 1;
          }

          return 0;
        });
        $.each(sortable, function(i, icon) {
          optionsMaki += '<option value="' + icon.icon + '">' + icon.name + '</option>';
        });
      }

      if (!optionsNpmaki.length) {
        sortable = [];
        $.each(document.getElementById('iframe-map').contentWindow.L.npmap.preset.npmaki, function(prop, value) {
          sortable.push({
            icon: value.icon,
            name: value.name
          });
        });
        sortable.sort(function(a, b) {
          if (a.name < b.name) {
            return -1;
          }

          if (a.name > b.name) {
            return 1;
          }

          return 0;
        });
        $.each(sortable, function(i, icon) {
          optionsNpmaki += '<option value="' + icon.icon + '">' + icon.name + '</option>';
        });
      }

      return '' +
        '<form class="change-style" id="' + name + '_layer-change-style" role="form">' +
          '<ul class="nav nav-tabs">' +
            '<li class="active"><a href="#point" data-toggle="tab">Point</a></li>' +
            '<li class=""><a href="#line" data-toggle="tab">Line</a></li>' +
            '<li class=""><a href="#polygon" data-toggle="tab">Polygon</a></li>' +
          '</ul>' +
          '<div class="tab-content">' +
            '<div class="tab-pane active in" id="point">' +
              '<fieldset>' +
                '<div class="form-group">' +
                  '<label for="' + name + '_point_marker-library">Library</label>' +
                  '<select id="' + name + '_point_marker-library" onchange="Builder.ui.steps.addAndCustomizeData.handlers.changeMarkerLibrary(this);return false;"><option value="maki">Maki</option><option value="npmaki">NPMaki</option></select>' +
                '</div>' +
                '<div class="form-group">' +
                  '<label for="' + name + '_point_marker-color">Color</label>' +
                  '<select id="' + name + '_point_marker-color" class="simplecolorpicker">' + optionsColor + '</select>' +
                '</div>' +
                '<div class="form-group">' +
                  '<label for="' + name + '_point_marker-size">Size</label>' +
                  '<select id="' + name + '_point_marker-size"><option value="small">Small</option><option value="medium">Medium</option><option value="large">Large</option></select>' +
                '</div>' +
                '<div class="form-group">' +
                  '<label for="' + name + '_point_marker-symbol">Icon</label>' +
                  '<select id="' + name + '_point_marker-symbol"></select>' +
                '</div>' +
              '</fieldset>' +
            '</div>' +
            '<div class="tab-pane" id="line">' +
              '<fieldset>' +
                '<div class="form-group">' +
                  '<label for="' + name + '_line_stroke">Color</label>' +
                  '<select id="' + name + '_line_stroke" class="simplecolorpicker">' + optionsColor + '</select>' +
                '</div>' +
                '<div class="form-group">' +
                  '<label for="' + name + '_line_stroke-width">Width</label>' +
                  '<select id="' + name + '_line_stroke-width"><option value="1">1 pt</option><option value="2">2 pt</option><option value="3">3 pt</option><option value="4">4 pt</option><option value="5">5 pt</option></select>' +
                '</div>' +
                '<div class="form-group">' +
                  '<label for="' + name + '_line_stroke-opacity">Opacity</label>' +
                  '<select id="' + name + '_line_stroke-opacity"><option value="0.1">0.1</option><option value="0.2">0.2</option><option value="0.3">0.3</option><option value="0.4">0.4</option><option value="0.5">0.5</option><option value="0.6">0.6</option><option value="0.7">0.7</option><option value="0.8">0.8</option><option value="0.9">0.9</option><option value="1">1</option></select>' +
                '</div>' +
              '</fieldset>' +
            '</div>' +
            '<div class="tab-pane" id="polygon">' +
              '<fieldset>' +
                '<div class="form-group">' +
                  '<label for="' + name + '_polygon_fill">Color</label>' +
                  '<select id="' + name + '_polygon_fill" class="simplecolorpicker">' + optionsColor + '</select>' +
                '</div>' +
                '<div class="form-group">' +
                  '<label for="' + name + '_polygon_fill-opacity">Opacity</label>' +
                  '<select id="' + name + '_polygon_fill-opacity"><option value="0.1">0.1</option><option value="0.2">0.2</option><option value="0.3">0.3</option><option value="0.4">0.4</option><option value="0.5">0.5</option><option value="0.6">0.6</option><option value="0.7">0.7</option><option value="0.8">0.8</option><option value="0.9">0.9</option><option value="1">1</option></select>' +
                '</div>' +
                '<div class="form-group">' +
                  '<label for="' + name + '_polygon_stroke">Outline Color</label>' +
                  '<select id="' + name + '_polygon_stroke" class="simplecolorpicker">' + optionsColor + '</select>' +
                '</div>' +
                '<div class="form-group">' +
                  '<label for="' + name + '_polygon_stroke-width">Outline Width</label>' +
                  '<select id="' + name + '_polygon_stroke-width"><option value="1">1 pt</option><option value="2">2 pt</option><option value="3">3 pt</option><option value="4">4 pt</option><option value="5">5 pt</option></select>' +
                '</div>' +
                '<div class="form-group">' +
                  '<label for="' + name + '_polygon_stroke-opacity">Outline Opacity</label>' +
                  '<select id="' + name + '_polygon_stroke-opacity"><option value="0.1">0.1</option><option value="0.2">0.2</option><option value="0.3">0.3</option><option value="0.4">0.4</option><option value="0.5">0.5</option><option value="0.6">0.6</option><option value="0.7">0.7</option><option value="0.8">0.8</option><option value="0.9">0.9</option><option value="1">1</option></select>' +
                '</div>' +
              '</fieldset>' +
            '</div>' +
          '</div>' +
        '</form>';
    }
    function getIframeConfig() {
      return document.getElementById('iframe-map').contentWindow.NPMap.config;
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
    function saveMap(callback) {
      var $this = $(this),
        base = '/',
        error = 'You must be connected to the National Park Service network to save a map.';

      Builder.showLoading();
      $this.blur();
      $.ajax({
        data: {
          description: description,
          isPublic: true,
          isShared: true,
          json: JSON.stringify(NPMap),
          mapId: mapId || null,
          name: title
        },
        dataType: 'json',
        error: function() {
          Builder.hideLoading();
          alertify.error(error);

          if (typeof callback === 'function') {
            callback(false);
          }
        },
        success: function(response) {
          Builder.hideLoading();

          if (response) {
            if (response.success) {
              mapId = response.mapId;
              updateSaveStatus(response.modified);
              alertify.success('Your map was saved!');
              if (callback) {
                callback(true);
              }
            } else {
              alertify.error('Sorry, but there was an error saving your map. Please try again.');

              if (callback) {
                callback(false);
              }
            }
          } else {
            alertify.error(error);

            if (callback) {
              callback(false);
            }
          }
        },
        url: base + 'builder/save' + (base === '/' ? '' : '&callback=?')
      });
    }
    function updateInitialCenterAndZoom() {
      $lat.html(NPMap.center.lat.toFixed(2));
      $lng.html(NPMap.center.lng.toFixed(2));
      $zoom.html(NPMap.zoom);
    }
    function updateSaveStatus(date) {
      $('.info-saved p').text('Saved ' + moment(date).format('MM/DD/YYYY') + ' at ' + moment(date).format('h:mm:ssa'));
      $('.info-saved').show();
      disableSave();
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
      _afterUpdateCallbacks: {},
      _defaultStyles: {
        line: {
          'stroke': '#d39800',
          'stroke-opacity': 0.8,
          'stroke-width': 3
        },
        point: {
          'marker-color': '#000000',
          'marker-library': 'maki',
          'marker-size': 'medium',
          'marker-symbol': null
        },
        polygon: {
          'fill': '#d39800',
          'fill-opacity': 0.2,
          'stroke': '#d39800',
          'stroke-opacity': 0.8,
          'stroke-width': 3
        }
      },
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
                var newDescription = $('#metadata .description a').text(),
                  next = $(this).next();

                if (descriptionSet) {
                  if (newDescription !== description) {
                    enableSave();
                  }
                } else {
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
                    $('#metadata .buttons .popover button').focus();
                  }
                }

                description = newDescription;
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
                var newDescription = $('#metadata .description a').text(),
                  newTitle = $('#metadata .title a').text(),
                  next = $(this).next();

                if (!newDescription || newDescription === 'Add a description to give your map context.') {
                  $('#metadata .description a').editable('toggle');
                } else {
                  if (newTitle !== title) {
                    enableSave();
                  }
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

                title = newTitle;
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
              changeMarkerLibrary: function(el) {
                var $el = $('#' + el.id.replace('_marker-library', '') + '_marker-symbol'),
                  options = $(el).val() === 'maki' ? optionsMaki : optionsNpmaki;

                $el.html(options);
                $el.val(null);
              },
              clickApplyStyles: function(elName, overlayName) {
                var overlay;

                for (var i = 0; i < NPMap.overlays.length; i++) {
                  var o = NPMap.overlays[i];

                  if (o.name === overlayName) {
                    overlay = o;
                    break;
                  }
                }

                $.each($('#' + elName + '_layer-change-style .form-group'), function(j, el) {
                  var $select = $($(el).children('select')[0]),
                    sansName = $select.attr('id').replace(elName + '_', ''),
                    type = sansName.split('_')[0];

                  overlay.styles[type][sansName.replace(type + '_', '')] = $select.val();
                });

                $activeChangeStyleButton.popover('toggle');
                $('#mask').hide();
                Builder.updateMap();
              },
              clickLayerChangeStyle: function(el) {
                var $el = $(el);

                if ($el.data('popover-created')) {
                  $el.popover('toggle');
                } else {
                  var overlay = NPMap.overlays[getLayerIndexFromButton(el)],
                    name = overlay.name.replace(' ', '_'),
                    html;

                  html = generateLayerChangeStyle(name) + '<div style="text-align:center;"><button class="btn btn-primary" onclick="Builder.ui.steps.addAndCustomizeData.handlers.clickApplyStyles(\'' + name + '\',\'' + overlay.name + '\');" type="button">Apply Styles</button></div>';

                  $el.popover({
                    animation: false,
                    container: 'body',
                    content: html,
                    html: true,
                    placement: 'right',
                    title: null,
                    trigger: 'manual'
                  })
                    .on('hide.bs.popover', function() {
                      $activeChangeStyleButton = null;
                      $.each($('#' + name + '_layer-change-style select.simplecolorpicker'), function(i, el) {
                        $(el).simplecolorpicker('destroy');
                      });
                    })
                    .on('shown.bs.popover', function() {
                      var $select, prop, style, type, value;

                      $activeChangeStyleButton = $el;
                      $('#mask').show();
                      $.each($('#' + name + '_layer-change-style .simplecolorpicker'), function(i, el) {
                        $(el).simplecolorpicker({
                          picker: true,
                          theme: 'glyphicons'
                        });
                      });

                      if (!overlay.styles) {
                        if (!overlay.styles) {
                          overlay.styles = $.extend({}, Builder._defaultStyles);
                        }
                      }

                      for (type in Builder._defaultStyles) {
                        style = Builder._defaultStyles[type];

                        for (prop in style) {
                          $select = $('#' + name + '_' + type + '_' + prop);
                          value = style[prop];

                          if (prop === 'fill' || prop === 'marker-color' || prop === 'stroke') {
                            $select.simplecolorpicker('selectColor', value);
                          } else {
                            if (prop === 'marker-symbol') {
                              if (Builder._defaultStyles.point['marker-library'] === 'maki') {
                                $select.html(optionsMaki);
                              } else {
                                $select.html(optionsNpmaki);
                              }
                            }

                            $select.val(value);
                          }
                        }
                      }

                      for (type in overlay.styles) {
                        style = overlay.styles[type];

                        for (prop in style) {
                          $select = $('#' + name + '_' + type + '_' + prop);
                          value = style[prop];

                          if (prop === 'fill' || prop === 'marker-color' || prop === 'stroke') {
                            $select.simplecolorpicker('selectColor', value);
                          } else {
                            if (prop === 'marker-symbol') {
                              if (overlay.styles.point['marker-library'] === 'maki') {
                                $select.html(optionsMaki);
                              } else {
                                $select.html(optionsNpmaki);
                              }
                            }

                            $select.val(value);
                          }
                        }
                      }
                    });
                  $el.popover('show');
                  $('.popover.right.in').css({
                    'z-index': 1031
                  });
                  $el.data('popover-created', true);
                  $activeChangeStyleButton = $el;
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
              var index,
                styleable = (overlay.type === 'cartodb' || overlay.type === 'csv' || overlay.type === 'geojson' || overlay.type === 'kml');

              if (!$layers.is(':visible')) {
                $layers.prev().hide();
                $('#customize .content').css({
                  padding: 0
                });
                $layers.show();
              }

              index = $layers.children().length;
              $layers.append($('<li>', {
                html: '' +
                  '<li class="dd-item">' +
                    '<div class="letter">' + abcs[index] + '</div>' +
                    '<div class="details">' +
                      '<span class="name">' + overlay.name + '</span>' +
                      '<span class="description">' + (overlay.description || '') + '</span>' +
                      '<span class="actions">' +
                        '<div style="float:left;">' +
                          '<button class="btn btn-default btn-xs" data-container="section" onclick="Builder.ui.steps.addAndCustomizeData.handlers.clickLayerEdit(this);" type="button"><span class="glyphicon glyphicon-edit"> Edit</span></button>' +
                        '</div>' +
                        '<div style="float:right;">' +
                          (styleable ? '<button class="btn btn-default btn-xs" data-container="section" data-placement="bottom" onclick="Builder.ui.steps.addAndCustomizeData.handlers.clickLayerChangeStyle(this);" rel="tooltip" style="margin-right:5px;" title="Change Style" type="button"><span class="glyphicon glyphicon-map-marker"></span></button>' : '') +
                          '<button class="btn btn-default btn-xs" data-container="section" data-placement="bottom" onclick="Builder.ui.steps.addAndCustomizeData.handlers.clickLayerRemove(this);" rel="tooltip" title="Delete Overlay" type="button"><span class="glyphicon glyphicon-trash"></span></button>' +
                          '</button>' +
                        '</div>' +
                      '</span>' +
                    '</div>' +
                  '</li>' +
                ''
              }));
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
            hookUpFullScreenControl: function(config) {
              var $map = $('#map'),
                map = config.L;

              map.on('enterfullscreen', function() {
                $map.css({
                  left: 0,
                  position: 'fixed'
                });
              });
              map.on('exitfullscreen', function() {
                $map.css({
                  left: '268px',
                  position: 'absolute'
                });
              });
            },
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

                    if (value === 'fullscreenControl') {
                      if (checked) {
                        Builder._afterUpdateCallbacks.fullscreenControl = Builder.ui.steps.additionalToolsAndSettings.hookUpFullScreenControl;
                      } else {
                        delete Builder._afterUpdateCallbacks.fullscreenControl;
                      }
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
                    name = $input.attr('value'),
                    property = NPMap[name];

                  if (typeof property !== 'undefined') {
                    $input.attr('checked', property);

                    if (name === 'fullscreenControl' && property) {
                      var interval = setInterval(function() {
                        var config = getIframeConfig();

                        if (config && config.L) {
                          clearInterval(interval);
                          Builder._afterUpdateCallbacks.fullscreenControl = Builder.ui.steps.additionalToolsAndSettings.hookUpFullScreenControl;
                          Builder.ui.steps.additionalToolsAndSettings.hookUpFullScreenControl(getIframeConfig());
                        }
                      }, 100);
                    }
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
              $('#mask').hide();
              $($('#button-settings span')[2]).popover('hide');
              settingsSet = true;
            }
          },
          init: function() {
            $buttonExport.on('click', function() {
              function openExport() {
                if ($modalExport) {
                  $modalExport.modal('show');
                } else {
                  loadModule('Builder.ui.modal.export', function() {
                    $modalExport = $('#modal-export');
                  });
                }
              }

              if ($(this).text().indexOf('Save') === -1) {
                openExport();
              } else {
                saveMap(function(success) {
                  if (mapId) {
                    if (!success) {
                      alertify.log('Because your map couldn\'t be saved, but was successfully saved at one point, any exports you do here will not include any changes made to the map since the last time it was saved.', 'error', 15000);
                    }

                    openExport();
                  } else {
                    alertify.log('The map cannot be exported until it is saved. Please try again. If this error persists, please report an issue by clicking on the feedback button above.', 'error', 15000);
                  }
                });
              }
            });
            $('#button-config').on('click', function() {
              loadModule('Builder.ui.modal.viewConfig', function() {
                $modalViewConfig = $('#modal-viewConfig');
              });
            });
            $('#button-feedback').on('click', function() {
              window.open('https://github.com/nationalparkservice/npmap-builder/issues', '_blank');
            });
            $('#button-help').on('click', function() {
              window.open('https://github.com/nationalparkservice/npmap-builder/wiki', '_blank');
            });
            $('#button-save').on('click', saveMap);
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

          if (npmap && npmap.config && npmap.config.L) {
            var config = npmap.config;

            clearInterval(interval);

            if (callback) {
              callback(config);
            }

            for (var prop in Builder._afterUpdateCallbacks) {
              Builder._afterUpdateCallbacks[prop](config);
            }

            if (firstLoad) {
              firstLoad = false;
            } else {
              enableSave();
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
    firstLoad = true;
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
  $('#mask').show();

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
