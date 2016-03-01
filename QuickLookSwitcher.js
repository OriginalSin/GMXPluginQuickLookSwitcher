(function() {
    var pluginName = 'QuickLookSwitcher';
    _translationsHash.addtext('rus', {
        'QuickLookSwitcher.iconTitle'  : 'Переключить режим отображения снимков'
    });
    _translationsHash.addtext('eng', {
        'QuickLookSwitcher.iconTitle'  : 'Switch scene options'
    });

    var clickedIds = {},
        isActive = false,
        onClick = function(ev) {
            var prop = this.getGmxProperties(),
                info = clickedIds[prop.name],
                id = ev.gmx.id;
            info.ids[id] = !info.ids[id];
        },
        hook = function(it) {
            var prop = this.getGmxProperties();
            if (!clickedIds[prop.name].ids[it.id]) { return { skipRasters:true }; }
            return {};
        };

    var chkLayer = function(ev) {
        var layer = ev.layer;
        if (layer instanceof L.gmx.VectorLayer) {
            var prop = layer.getGmxProperties();
            if (prop.Quicklook) {
                var layerName = prop.name;
                if (!clickedIds[layerName]) {
                    clickedIds[layerName] = { ids: {}, event: false };
                }
                var info = clickedIds[layerName];
                if (isActive) {
                    if (!info.event) {
                        layer
                            .on('click', onClick, layer)
                            .setStyleHook(hook.bind(layer));
                    }
                } else {
                    if (info.event) {
                        layer
                            .off('click', onClick, layer)
                            .removeStyleHook()
                            .repaint();
                    }
                }
                info.event = isActive;
            }
        }
    };
    
    var chkHandlers = function() {
        var map = nsGmx.leafletMap;
        if (isActive) {
            map.on('layeradd layerremove', chkLayer)
        } else {
            map.off('layeradd layerremove', chkLayer)
        }
        map.eachLayer(function (layer) {
            chkLayer({layer: layer});
        });
    };

    var publicInterface = {
        pluginName: pluginName,
        afterViewer: function(params, map) {
            var icon = new L.Control.gmxIcon({
                id: pluginName, 
                togglable: true,
                className: 'icon-eye-off',
                title: _gtxt(pluginName + '.iconTitle')
            }).on('statechange', function(ev) {
                isActive = ev.target.options.isActive;
                chkHandlers();
            });
            nsGmx.leafletMap.addControl(icon);
        }
    };
    gmxCore.addModule(pluginName, publicInterface, {
        css: pluginName + '.css'
    });
    
})();