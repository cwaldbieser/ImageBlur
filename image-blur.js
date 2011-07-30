
/*
Copyright 2011 Carl Waldbieser
*/
var ImageBlur = {
	pause_time: 3500,
	
	init: function(container_id){
		var stages = 5;
		
		//Completion counter object.
		counter = {'count': 0, 'total': 0};
		
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
		var first_img_id = null;
		jQuery("#" + container_id + " img").each(function(index){
			//Create blur animations for each image.
			var transformations = [];
			var orig_img = jQuery(this);
			var orig_img_id = ImageBlur.get_id(orig_img);
			if(first_img_id == null) first_img_id = orig_img_id;
			animations_set.push(orig_img_id);
			jQuery.each(blur_factors, function(idx, blur_factor){
				var new_jq_img = orig_img.clone().css('zIndex', 1).insertAfter(orig_img);
				var img_id = ImageBlur.get_id(new_jq_img, true);
				var new_img = new_jq_img[0];
				counter.total += 1;
				var new_elm = Pixastic.process(new_img, "blurfast", {'amount': blur_factor}, function(res){
						//Increment the count.
						counter.count += 1;
					});
				transformations.push(img_id);
				animations_set.push(img_id);
			})
			;
			//Add the transformations to the animation sequence.
			//Sequence should go:
			//most blurry ... blurry ... not blurry ... blurry ... most blurry
			animation_sequence = animation_sequence.concat(transformations.slice(0).reverse(), [orig_img_id], transformations);
		})
		;
		
		//Rotate the initial sequence to the beginning.
		//Makes calculating indexes simpler.
		animation_sequence = animation_sequence.slice(blur_factor_count).concat(animation_sequence.slice(0, blur_factor_count))
		
		//Record the frame count.
		var frame_count = animation_sequence.length;
		
		//Set the initial z-Index.
		jQuery('#' + first_img_id).css('zIndex', 3);
		
		return {
			'counter': counter, 				// Completion counter.
			'animations': animation_sequence,
			'animations_set': animations_set,
			'current_frame': 0,
			'frame_count': frame_count,
			'delay': 75,
			'pause': ImageBlur.pause_time,
			'pause_modulo': (blur_factors.length * 2 + 1),
			'run_flag': false,
			'run': function(){
				//Delay running until all callbacks have returned.
				if(this.counter.count < this.counter.total)
				{
					var self = this;
					window.setTimeout(function(){
						self.run();
					}, 1000)
					;
				}
				this.run_flag = true;
				ImageBlur.animate.apply(this);
			},
			'stop':	function(){
				this.run_flag = false;
			},
		}
		;
	},	
	
	//Get the ID of a jQuery object or assign and
	//return one if it does not exist.
	get_id: function(jqobj, force_new_id)
	{
		if(typeof(force_new_id) == 'undefined')
		{
			force_new_id = false;
		}
		var elm_id = jqobj.attr('id');
		if(typeof(elm_id) == 'undefined' || force_new_id || elm_id == "")
		{
			elm_id = ImageBlur.uuid();
			jqobj.attr('id', elm_id);
		}
		return elm_id;
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
		jQuery.each(animations_set, function(idx, obj_id){
			var jq_obj = jQuery("#" + obj_id);
			jq_obj.css("zIndex", 1);
		})
		;
		jQuery("#" + animations[current_frame]).css("zIndex", 3);
		jQuery("#" + (animations[(current_frame + 1) % frame_count])).css("zIndex", 2);
		
		//
		window.setTimeout(function(){
			ImageBlur.animate.apply(self);	
		}, delay)
		;
	}
}
;


