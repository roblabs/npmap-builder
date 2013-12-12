/* globals $, Builder, NPMap */

$('head').append($('<link rel="stylesheet">').attr('href', 'ui/modal/addLayer.css'));

Builder.ui = Builder.ui || {};
Builder.ui.modal = Builder.ui.modal || {};
Builder.ui.modal.addLayer = (function() {
  var $attribution = $('#layerAttribution'),
    $description = $('#layerDescription'),
    $name = $('#layerName'),
    $type = $('#layerType'),
    types = {
      arcgisserver: {
        _tiled: false,
        _url: null,
        fields: {
          $layers: $('#arcgisserver-layers'),
          $url: $('#arcgisserver-url').bind('change paste keyup', function() {
            var value = $(this).val(),
                lower = value.toLowerCase();

            if (lower.indexOf('mapserver') === (value.length - 9) || lower.indexOf('mapserver/') === (value.length - 10)) {
              $.ajax({
                dataType: 'json',
                success: function(response) {
                  if (value !== types.arcgisserver._url) {
                    types.arcgisserver.fields.$layers.find('option').remove();
                    $.each(response.layers, function(i, layer) {
                      types.arcgisserver.fields.$layers.append($('<option>', {
                        value: layer.id
                      }).text(layer.id + ': ' + layer.name));
                    });
                    types.arcgisserver.fields.$layers.prop('disabled', false);
                    types.arcgisserver.fields.$layers.selectpicker('refresh');
                    types.arcgisserver._tiled = response.singleFusedMapCache || false;
                    types.arcgisserver._url = value;
                  }
                },
                url: value + '?f=json&callback=?'
              });
            } else {
              types.arcgisserver.fields.$layers.find('option').remove();
              types.arcgisserver.fields.$layers.prop('disabled', true);
              types.arcgisserver.fields.$layers.selectpicker('refresh');
              types.arcgisserver._url = null;
            }
          })
        },
        reset: function() {
          types.arcgisserver.fields.$layers.find('option').remove();
          types.arcgisserver.fields.$layers.prop('disabled', true);
          types.arcgisserver.fields.$layers.selectpicker('refresh');
          types.arcgisserver.fields.$url.val('');
          types.arcgisserver._tiled = false;
          types.arcgisserver._url = null;
        }
      },
      cartodb: {
        fields: {
          $table: $('#cartodb-table'),
          $user: $('#cartodb-user')
        },
        reset: function() {
          types.cartodb.fields.$table.val('');
          types.cartodb.fields.$user.val('');
        }
      },
      geojson: {
        fields: {
          $clickable: $('#geojson-clickable'),
          $url: $('#geojson-url')
        },
        reset: function() {
          types.geojson.fields.$clickable.prop('checked', 'checked');
          types.geojson.fields.$url.val('');
        }
      },
      github: {
        fields: {
          $clickable: $('#github-clickable'),
          $url: $('#github-url')
        },
        reset: function() {
          types.github.fields.$clickable.prop('checked', 'checked');
          types.github.fields.$url.val('');
        }
      },
      kml: {
        fields: {
          $clickable: $('#kml-clickable'),
          $url: $('#kml-url')
        },
        reset: function() {
          types.kml.fields.$clickable.prop('checked', 'checked');
          types.kml.fields.$url.val('');
        }
      },
      mapbox: {
        fields: {
          $id: $('#mapbox-id')
        },
        reset: function() {
          types.mapbox.fields.$id.val('');
        }
      }
    };

  function setHeight() {
    $('#modal-addLayer .tab-content').css({
      height: $(document).height() - 289
    });
  }

  $('#modal-addLayer').modal({
    backdrop: 'static'
  })
    .on('hidden.bs.modal', function() {
      $attribution.val(null);
      $description.val(null);
      $name.val(null);
      $type.val('arcgisserver').trigger('change');
      $('#modal-addLayer .tab-content').css({
        top: 0
      });
      $.each(types, function(type) {
        types[type].reset();
      });
      $.each($('#modal-addLayer .form-group'), function(index, formGroup) {
        var $formGroup = $(formGroup);

        if ($formGroup.hasClass('has-error')) {
          $formGroup.removeClass('has-error');
        }
      });

      Builder.ui.modal.addLayer._editingIndex = -1;
      $('#layerType').removeAttr('disabled');
      $('#modal-addLayer-description').html('You can add an overlay to your map either by typing in information about the overlay or searching the NPMap Catalog for datasets to add <em>(coming soon)</em>. Hover over the help icon above for more information.');
      $('#modal-addLayer-title').html('Add Overlay&nbsp;<img src="img/help.png" rel="tooltip" title="You can add ArcGIS Server, CartoDB, GeoJSON, KML, and MapBox Hosting overlays to your map. The NPMap Catalog includes results from the National Park Service ArcGIS Server (from both ArcGIS Online and public-facing ArcGIS Server instances), CartoDB, GitHub, and MapBox Hosting accounts." data-placement="bottom">');
      $('#modal-addLayer .btn-primary').text('Add to Map');
      Builder.buildTooltips();
    })
    .on('shown.bs.modal', function() {
      $type.focus();
    });
  $($('#modal-addLayer a')[1]).click(function() {
    return false;
  });
  $('#modal-addLayer .btn-primary').click(function() {
    Builder.ui.modal.addLayer._click();
  });
  $('#modal-addLayer-search').typeahead([{
    header: '<h3 class="modal-addLayer-search-type">ArcGIS Online</h3>',
    limit: 10,
    prefetch: 'data/arcgisonline-search.json',
    valueKey: 'n'
  },{
    header: '<h3 class="modal-addLayer-search-type">ArcGIS Server</h3>',
    limit: 10,
    prefetch: 'data/arcgisserver-search.json',
    valueKey: 'n'
  },{
    header: '<h3 class="modal-addLayer-search-type">CartoDB</h3>',
    limit: 10,
    prefetch: 'data/cartodb-search.json',
    valueKey: 'n'
  },{
    header: '<h3 class="modal-addLayer-search-type">GitHub</h3>',
    limit: 10,
    prefetch: 'data/github-search.json',
    valueKey: 'n'
  },{
    header: '<h3 class="modal-addLayer-search-type">MapBox Hosting</h3>',
    limit: 10,
    prefetch: 'data/tilestream-search.json',
    valueKey: 'n'
  }]);
  Builder.buildTooltips();
  setHeight();
  $type.focus();
  $(window).resize(setHeight);
  $(types.arcgisserver.fields.$layers).selectpicker({
    size: 5
  });

  return {
    _editingIndex: -1,
    _click: function() {
      var attribution = $attribution.val() || null,
        config,
        description = $description.val() || null,
        errors = [],
        fields = [$attribution, $description, $name],
        name = $name.val() || null;

      if (!name) {
        errors.push($name);
      }

      if (typeof NPMap.overlays === 'undefined') {
        NPMap.overlays = [];
      }

      if ($('#arcgisserver').is(':visible')) {
        (function() {
          var layers = types.arcgisserver.fields.$layers.val(),
            url = types.arcgisserver.fields.$url.val();

          $.each(types.arcgisserver.fields, function(field) {
            fields.push(field);
          });

          if (!layers) {
            errors.push(types.arcgisserver.fields.$layers);
          } else {
            layers = layers.join(',');
          }

          if (!url) {
            errors.push(types.arcgisserver.fields.$url);
          }

          config = {
            layers: layers,
            opacity: 1,
            tiled: types.arcgisserver._tiled,
            type: 'arcgisserver',
            url: url
          };
        })();
      } else if ($('#cartodb').is(':visible')) {
        (function() {
          var $table = $('#cartodb-table'),
            table = $table.val(),
            $user = $('#cartodb-user'),
            user = $user.val();

          fields.push($table);
          fields.push($user);

          if (!table) {
            errors.push($table);
          }

          if (!user) {
            errors.push($user);
          }

          config = {
            table: table,
            type: 'cartodb',
            user: user
          };
        })();
      } else if ($('#geojson').is(':visible')) {
        (function() {
          var clickable = types.geojson.fields.$clickable.prop('checked'),
            url = types.geojson.fields.$url.val();

          $.each(types.geojson.fields, function(field) {
            fields.push(field);
          });

          if (!url) {
            errors.push(types.geojson.fields.$url);
          }

          config = {
            type: 'geojson',
            url: url
          };

          if (!clickable) {
            config.clickable = false;
          }
        })();
      } else if ($('#github').is(':visible')) {
        (function() {
          var clickable = types.github.fields.$clickable.prop('checked'),
            url = types.github.fields.$url.val().replace('http://github.com/', '').replace('https://github.com/', '').replace('/blob', ''),
            urls = url.split('/'),
            branch, path, repo, user;

          $.each(types.github.fields, function(field) {
            fields.push(field);
          });

          if (!url) {
            errors.push(types.github.fields.$url);
          }

          branch = urls[2];
          repo = urls[1];
          user = urls[0];
          path = url.replace(user + '/', '').replace(repo + '/', '').replace(branch + '/', '');

          config = {
            branch: branch,
            path: path,
            repo: repo,
            type: 'github',
            user: user
          };

          if (!clickable) {
            config.clickable = false;
          }
        })();
      } else if ($('#kml').is(':visible')) {
        (function() {
          var clickable = types.kml.fields.$clickable.prop('checked'),
            url = types.kml.fields.$url.val();

          $.each(types.kml.fields, function(field) {
            fields.push(field);
          });

          if (!url) {
            errors.push(types.kml.fields.$url);
          }

          config = {
            'type': 'kml',
            'url': url
          };

          if (!clickable) {
            config.clickable = false;
          }
        })();
      } else if ($('#mapbox').is(':visible')) {
        (function() {
          var $id = $('#mapbox-id'),
            id = $id.val();

          fields.push($id);

          if (!id) {
            errors.push($id);
          }

          config = {
            'id': id,
            'type': 'mapbox'
          };
        })();
      }

      if (errors.length) {
        $.each(errors, function(i, $el) {
          $el.parent().addClass('has-error');
        });
      } else {
        var $layers = $('#layers'),
          index;

        if (attribution) {
          config.attribution = attribution;
        }

        if (description) {
          config.description = description;
        }

        config.name = name;

        // TODO: Loop through all properties and "sanitize" them.
        
        if (Builder.ui.modal.addLayer._editingIndex === -1) {
          Builder.addOverlay(config);
        } else {
          var $li = $($layers.children()[Builder.ui.modal.addLayer._editingIndex]);

          NPMap.overlays[Builder.ui.modal.addLayer._editingIndex] = config;
          $($li.find('.name')[0]).text(config.name);

          if (config.description) {
            $($li.find('.description')[0]).text(config.description);
          }
        }

        Builder.updateMap();
        $('#modal-addLayer').modal('hide');
      }
    },
    _layerTypeOnChange: function(value) {
      $.each($('#manual div'), function(i, div) {
        var $div = $(div);

        if ($div.attr('id')) {
          if ($div.attr('id') === value) {
            $div.show();
          } else {
            $div.hide();
          }
        }
      });
    },
    _load: function(layer) {
      var type = layer.type;

      $type.val(type).trigger('change');

      for (var prop in layer) {
        var value = layer[prop];

        if (prop === 'attribution' || prop === 'description' || prop === 'name') {
          $('#layer' + (prop.charAt(0).toUpperCase() + prop.slice(1))).val(value);
        } else if (prop !== 'type') {
          $('#' + type + '-' + prop).val(value);
        }
      }

      $('#layerType').attr('disabled', 'disabled');
      $('#modal-addLayer-description').html('Use the form below to update your overlay.');
      $('#modal-addLayer-title').text('Update Overlay');
      $('#modal-addLayer .btn-primary').text('Save Overlay');

      // TODO: Handle checkboxes - clickable

      if (type === 'arcgisserver') {
        var interval;

        types.arcgisserver.fields.$url.trigger('change');
        interval = setInterval(function() {
          if ($('#arcgisserver-layers option').length) {
            clearInterval(interval);
            types.arcgisserver.fields.$layers.selectpicker('val', layer.layers.split(','));
          }
        }, 100);
      }
    },
    _clearAllArcGisServerLayers: function() {
      types.arcgisserver.fields.$layers.val([]);
    },
    _selectAllArcGisServerLayers: function() {
      $('#arcgisserver-layers option').prop('selected', 'selected');
    }
  };
})();
