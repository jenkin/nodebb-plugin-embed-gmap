(function(module) {
	"use strict";

	var winston = require('winston'),
	    Settings = module.parent.require('./settings'),
	    Cache = module.parent.require('./posts/cache'),
	    SocketAdmin = module.parent.require('./socket.io/admin');

	var constants = Object.freeze({
		"name": "EmbedGMap",
		"admin": {
			"route": "/plugins/embedgmap/",
			"icon": "fa-th-large",
			"name": "EmbedGMap"
		},
		"namespace": "nodebb-plugin-embedgmap"
	});

	var defaultSettings = {
		booleans: {
			hasMarkdown: true
		},
		strings: {
			embedGMapAPIKey: ''
		}
	};

	var settings = new Settings('embedgmap', '0.1.0', defaultSettings, function(){
		winston.info('EmbedGMap settings loaded');
	});

	var EmbedGMap = {},
	    api_key = settings.get('strings.embedGMapAPIKey') || '',
	    link = '<a href="'+(api_key ? '#embed-gmap-$1' : '#')+'">$2</a>&nbsp;<a href="https://www.google.it/maps/place/$3/" target="_blank"><i class="fa fa-external-link"></i></a>',	
	    embed = '<iframe id="embed-gmap-$1" width="640" height="480" frameborder="0" style="border:0" src="https://www.google.com/maps/embed/v1/place?key='+api_key+'&q=$2" allowfullscreen></iframe>';
	var place = [], index1 = 0, index2 = 0;

	var markdown = /\[map ([^\]]+)\]/g;
        
	EmbedGMap.init = function() {
		var api_key = settings.get('strings.embedGMapAPIKey');
		winston.info('EmbedGMap API Key: '+api_key);
	};

	EmbedGMap.parse = function(data, callback) {
        if (!data || !data.postData || !data.postData.content) {
            return callback(null, data);
        }
        if (data.postData.content.match(markdown)) {
	    if (api_key) {
	    while (place = markdown.exec(data.postData.content)) {
		winston.info("Map for place #"+index1+": "+place[1]);
		data.postData.content += '<p>'+embed.replace('$1',index1++).replace('$2',encodeURI(place[1].toLowerCase()))+'</p>';
	    }
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
			res.render('admin/plugins/embedgmap');
		}

		params.router.get('/admin/plugins/embedgmap', params.middleware.admin.buildHeader, render);
		params.router.get('/api/admin/plugins/embedgmap', render);

		EmbedGMap.init();
		callback();
	};

	SocketAdmin.settings.syncEmbedGMap = function(data) {
		winston.info('EmbedGMap: syncing settings');
		settings.sync(EmbedGMap.init);
	}

	SocketAdmin.settings.clearPostCache = function(data) {
		winston.info('Clearing all posts from cache');
		Cache.reset();
		// SocketAdmin.emit('admin.settings.postCacheCleared', {});
	}

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

	module.exports = EmbedGMap;
}(module));
