
var transition = null;

$(document).ready(function(){
	transition = ImageBlur.init("id_photos");

	$("#id_demo").click(run_demo);	
	$("#id_stop").click(function(){
		transition.stop();	
	})
	;	
})
;

function run_demo()
{
	transition.run();
}

var ImageBlur = {
	init: function(container_id){
		var stages = 5;
		
		//Configure blur factors for each stage.
		var step = stages / 5.0;
		var blur_factors = [];
		for(i=step; i <= 5.0; i += step) blur_factors.push(i);
		if(blur_factors.length < stages) blur_factors.push(5.0);
		
		//Sequence for animations.
		animation_sequence = [];
		var blur_factor_count = blur_factors.length;
		
		//The set of frames.
		var animations_set = [];
		
		//Process each image.
		$("#" + container_id + " img").each(function(index){
			//Create blur animations for each image.
			var transformations = [];
			var orig_img = $(this);
			animations_set.push(orig_img);
			$.each(blur_factors, function(idx, blur_factor){
				var new_jq_img = orig_img.clone().insertAfter(orig_img);
				//new_jq_img.attr('id', ImageBlur.uuid());
				new_jq_img.attr('id', "id-blur-" + index + "-" + idx);
				var new_img = new_jq_img[0];
				var new_elm = Pixastic.process(new_img, "blurfast", {'amount': blur_factor});
				var new_jq_elm = $(new_elm);
				transformations.push(new_jq_elm);
				animations_set.push(new_jq_elm);
			})
			;
			//Add the transformations to the animation sequence.
			//Sequence should go:
			//most blurry ... blurry ... not blurry ... blurry ... most blurry
			animation_sequence = animation_sequence.concat(transformations.slice(0).reverse(), [orig_img], transformations);
		})
		;
		
		//Rotate the initial sequence to the beginning.
		//Makes calculating indexes simpler.
		animation_sequence = animation_sequence.slice(blur_factor_count).concat(animation_sequence.slice(0, blur_factor_count))
		
		//Adjust the zIndexes.
		var frame_count = animation_sequence.length;
		$.each(animation_sequence, function(idx, jq_obj){
			jq_obj.css("zIndex", frame_count - idx);
		})
		;
		
		return {
			'animations': animation_sequence,
			'animations_set': animations_set,
			'current_frame': 0,
			'frame_count': frame_count,
			'delay': 75,
			'pause': 1500,
			'pause_modulo': (blur_factors.length * 2 + 1),
			'run_flag': false,
			'run': function(){
				this.run_flag = true;
				ImageBlur.animate.apply(this);
			},
			'stop':	function(){
				this.run_flag = false;
			},
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
	
	animate: function()
	{
		if(!this.run_flag) return;
		
		//Advance the current frame.
		var current_frame = this.current_frame;
		current_frame++;
		current_frame %= this.frame_count;
		this.current_frame = current_frame;
		
		//Determine the delay time.
		var delay = this.delay;
		if(current_frame % this.pause_modulo == 0) delay = this.pause;
		var self = this;
		
		//Rotate the z-indexes.
		var animations = this.animations;
		var animations_set = this.animations_set;
		var frame_count = this.frame_count;
		$.each(animations_set, function(idx, jq_obj){
			jq_obj.css("zIndex", 0);
		})
		;
		animations[current_frame].css("zIndex", 2);
		animations[(current_frame + 1) % frame_count].css("zIndex", 1);
		
		//
		window.setTimeout(function(){
			ImageBlur.animate.apply(self);	
		}, delay)
		;
	}
}
;


