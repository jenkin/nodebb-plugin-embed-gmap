<div class="row">
	<div class="col-lg-9">
		<div class="panel panel-default">
			<div class="panel-heading">Embed Google Map</div>
			<div class="panel-body">
				<form class="form" id="embedGMap-form">
	<div class="row">
		<div class="col-sm-6 col-xs-12">
			<div class="form-group">
				<label>Google Maps Embed API Key</label>
				<input id="embedGMapAPIKey" type="text" class="form-control" placeholder="Enter Google Maps Embed API Key" data-key="strings.embedGMapAPIKey" value="{settings.embedGMapAPIKey}">
			</div>
		</div>
	</div>
</form>
			</div>
		</div>
	</div>
	<div class="col-lg-3">
		<div class="panel panel-default">
			<div class="panel-heading">Control Panel</div>
			<div class="panel-body">
				<button class="btn btn-primary" id="save">Save Settings</button>
			</div>
		</div>
	</div>
</div>

<input id="csrf_token" type="hidden" value="{csrf}" />

<script>
	require(['settings'], function(settings) {
		var wrapper = $('#embedGMap-form');
		settings.sync('embed-gmap',wrapper);
		$('#save').on('click', function(e) {
			e.preventDefault();
			settings.persist('embed-gmap', wrapper, function() {
				socket.emit('admin.settings.syncEmbedGMap');
			});
		});
	});
</script>
