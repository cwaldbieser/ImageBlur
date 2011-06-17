
var blur_obj = null;

$(document).ready(function(){
	blur_obj = ImageBlur.init("id_image");
	$("#id_demo").click(run_demo);	
})
;

function run_demo()
{
	blur_obj.blurOut(function(){
		window.setTimeout(function(){
			blur_obj.blurIn();
		}, 1500)
		;	
	})
	;
}

var ImageBlur = {
	init: function(image_id, options){
		var jq_img = $("#" + image_id);
		var stages = 5;
		var step = stages / 5.0;
		var blur_factors = [];
		for(i=step; i <= 5.0; i += step) blur_factors.push(i);
		if(blur_factors.length < stages) blur_factors.push(5.0);
		var ids = [];
		var img_src = jq_img.attr("src");
		for(var i=0; i < stages; i++)
		{
			var img_id = ImageBlur.uuid();
			ids.push(img_id);
			var new_jq_img = $("<img id='" + img_id + "' src='" + img_src + "' />")
			jq_img.after(new_jq_img);
			var img = new_jq_img[0];
			var blur_factor = blur_factors[i];
			Pixastic.process(img, "blurfast", {amount: blur_factor});
			$('#' + img_id).hide();
		}
		
		return {
				'orig_id': image_id,
				'orig_img': jq_img,
				'visible_img': jq_img,
				'delay': 75,
				'ids': ids,
				'blurOut': ImageBlur.blur_out,
				'blurIn': ImageBlur.blur_in,
				'animate_stages': ImageBlur.animate_stages,
		}
		;
	},	
	
	uuid: function()
	{
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
				var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
				return v.toString(16);
			})
			;
	},
	
	blur_out: function(callback)
	{
		var stage_count = this.ids.length;
		var ids = this.ids.slice(0);
		ids.reverse();
		var stages = [];
		for(var i=0; i < ids.length; i++)
		{
			var jq_img = $('#' + ids[i]);
			var delay = this.delay;
			stages.push([jq_img, delay]);
		}
		
		this.animate_stages(stages, callback);
	},
	
	blur_in: function(callback)
	{
		var stage_count = this.ids.length;
		var ids = [];
		ids.push(this.orig_id);
		ids = ids.concat(this.ids.slice(0));
		var stages = [];
		for(var i=0; i < ids.length; i++)
		{
			var jq_img = $('#' + ids[i]);
			var delay = this.delay;
			stages.push([jq_img, delay]);
		}
		
		this.animate_stages(stages, callback);
	},
	
	animate_stages: function(stages, callback)
	{
		if(stages.length > 0)
		{
			this.visible_img.hide();
			var item = stages.pop();
			var jq_img = item[0];
			var delay = item[1];
			jq_img.show();
			this.visible_img = jq_img;
			var self = this;
			window.setTimeout(function(){
				self.animate_stages(stages, callback);
			}, delay)
			;
		}
		else if(callback) callback();
	},
}
;


