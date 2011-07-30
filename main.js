
$(document).ready(function(){
	if($("#id_photos img").length == 0) return;
	window.setTimeout(function(){
		var jq_images = $("#id_photos img");
		var image_count = jq_images.length;
		
		$("#id_photos img.hidden").removeClass("hidden");
		var transition = ImageBlur.init("id_photos");
		
		$('#id_demo').click(function(){
			transition.run();
		})
		;
		
		$('#id_stop').click(function(){
			transition.stop();
		})
		;
		
	}, 500)
	;
})
;

