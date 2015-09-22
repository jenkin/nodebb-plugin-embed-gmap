(function(module) {
	"use strict";

	var winston = require('winston'),
	    Settings = module.parent.require('./settings'),
	    Cache = module.parent.require('./posts/cache'),
	    SocketAdmin = module.parent.require('./socket.io/admin');

	var constants = Object.freeze({
		"name": "EmbedGMap",
		"admin": {
			"route": "/plugins/embed-gmap/",
			"icon": "fa-th-large",
			"name": "EmbedGMap"
		},
		"namespace": "nodebb-plugin-embed-gmap"
	});

	var defaultSettings = {
		strings: {
			embedGMapAPIKey: ''
		}
	};

	var settings = new Settings('embed-gmap', '0.1.0', defaultSettings, function(){
		winston.info('EmbedGMap settings loaded');
	});

	var EmbedGMap = {};

	var markdown = /\[map ([^\]]+)\]/g;
        
	EmbedGMap.init = function() {
		var api_key = settings.get('strings.embedGMapAPIKey');
		winston.info('EmbedGMap API Key: '+api_key);
	};

	EmbedGMap.parse = function(data, callback) {
	    
		var api_key = settings.get('strings.embedGMapAPIKey') || '',
	    	link = '<a href="'+(api_key ? '#embed-gmap-$1' : '#')+'">$2</a>&nbsp;<a href="https://www.google.it/maps/place/$3/" target="_blank"><i class="fa fa-external-link"></i></a>',	
	    	embed = '<div id="embed-gmap-$1" class="embed-gmap col-xs-12 col-sm-6 col-md-4 col-lg-3"><iframe width="100%" height="360" frameborder="0" style="border:0" src="https://www.google.com/maps/embed/v1/place?key='+api_key+'&q=$2" allowfullscreen></iframe></div>';

	var place = [], index1 = 0, index2 = 0;
        if (!data || !data.postData || !data.postData.content) {
            return callback(null, data);
        }
        if (data.postData.content.match(markdown)) {
	    if (api_key) {
		data.postData.content += '<div class="row">';
	    while (place = markdown.exec(data.postData.content)) {
		winston.info("Map for place #"+index1+": "+place[1]);
		data.postData.content += embed.replace('$1',index1++).replace('$2',encodeURI(place[1].toLowerCase()));
	    }
data.postData.content += '</div>';
	    }
            data.postData.content = data.postData.content.replace(markdown, function(m,g) {
		winston.info("Link for place #"+index2+": "+g);
		return link.replace('$1',index2++).replace('$2',g).replace('$3',encodeURI(g).toLowerCase());
	    });
        }
        callback(null, data);

        };
	
	EmbedGMap.onLoad = function(params, callback) {
		function render(req, res, next) {
			res.render('admin/plugins/embed-gmap');
		}

		params.router.get('/admin/plugins/embed-gmap', params.middleware.admin.buildHeader, render);
		params.router.get('/api/admin/plugins/embed-gmap', render);

		EmbedGMap.init();
		callback();
	};

	EmbedGMap.admin = {
		menu: function (custom_header, callback) {
			custom_header.plugins.push({
				"route": constants.admin.route,
				"icon": constants.admin.icon,
				"name": constants.admin.name
			});
			callback(null, custom_header);
		}
	};

	SocketAdmin.settings.syncEmbedGMap = function() {
		winston.info('EmbedGMap: syncing settings');
		settings.sync(EmbedGMap.init);
	}

	module.exports = EmbedGMap;

}(module));
