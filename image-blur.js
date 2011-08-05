
/*
Copyright 2011 Carl Waldbieser
*/
var ImageBlur = {
    pause_time: 3500,
    
    backend: function(){
        if(typeof(stackBoxBlurImage) != 'undefined') return 'stackboxblur'; 
        else if(typeof(Pixastic) != 'undefined' && Pixastic.Actions.blurfast && Pixastic.Actions.blurfast) return 'pixastic.blurfast';
        //Default.
        return 'stackboxblur';
    }(),

    processors: {
        'stackboxblur': {
            'defaults': {
                'blur_amount': 21.0,
                'stages': 3,
                'delay': 75
            },
            create_blurred_element_placeholder: function(jq_orig_img){
                return jQuery('<canvas></canvas>').css('zIndex', 1).insertAfter(jq_orig_img);
            },
            blur_image_data: function(src_img_id, dst_elm, blur_amount, ready_map){
                    var dst_id = jQuery(dst_elm).attr('id')
                    stackBoxBlurImage(src_img_id, dst_id, blur_amount, false, 1.0);
                    ready_map[dst_id] = true;
            }
        },
        'pixastic.blurfast': {
            'defaults': {
                'blur_amount': 3.0,
                'stages': 3,
                'delay': 75
            },
            create_blurred_element_placeholder: function(jq_orig_img){
                return jq_orig_img.clone().css('zIndex', 1).insertAfter(jq_orig_img);
            },
            blur_image_data: function(src_img_id, dst_elm, blur_amount, ready_map){
                var new_elm = Pixastic.process(dst_elm, "blurfast", {'amount': blur_amount}, function(res){
                        //Mark this ID as ready.
                        var processed_elm_id = jQuery(res).attr('id');
                        ready_map[processed_elm_id] = true;
                    });
            }
        }
    },

    init: function(container_id, options){
        if(!ImageBlur.supports_canvas())
        {
            return {
                'run': function(){},
                'stop': function(){}    
            }
            ;
        }

        //Select back end processor.
        var backend = ImageBlur.backend;
        var processor = ImageBlur.processors[backend];
        
        var blur_amount = processor.defaults.blur_amount;
        var stages = processor.defaults.stages;
        var delay = processor.defaults.delay;
        
        //Configure blur factors for each stage.        
        var step = blur_amount / stages;
        var blur_factors = [];
        for(i=step; i <= blur_amount; i += step) blur_factors.push(i);
        if(blur_factors.length < stages) blur_factors.push(blur_amount);
        
        //Sequence for animations.
        animation_sequence = [];
        var blur_factor_count = blur_factors.length;
        
        //The set of frames.
        var animations_set = [];
        
        var process_queue = [];
        
        //The map of processed image IDs.
        var ready_map = {};
        
        //Process each image.
        var first_img_id = null;
        jQuery("#" + container_id + " img").each(function(index){
            //Create blur animations for each image.
            var transformations = [];
            var orig_img = jQuery(this);
            var orig_img_id = ImageBlur.get_id(orig_img);
            ready_map[orig_img_id] = true;
            if(first_img_id == null) first_img_id = orig_img_id;
            animations_set.push(orig_img_id);
            jQuery.each(blur_factors, function(idx, blur_factor){
                var new_jq_img = processor.create_blurred_element_placeholder(orig_img);
                var img_id = ImageBlur.get_id(new_jq_img, true);
                var new_img = new_jq_img[0];
                
                process_queue = [orig_img_id, new_img, blur_factor].concat(process_queue);
                
                window.setTimeout(function(){
                    var blur_amt = process_queue.pop();
                    var img_obj = process_queue.pop();
                    var src_img_id = process_queue.pop();                    
                    
                    processor.blur_image_data(src_img_id, img_obj, blur_amt, rval.ready_map)
                    
                }, (index) * (ImageBlur.pause_time) + (idx + 1) * delay)
                ;
                
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
        
        var rval = {
            'ready_map': ready_map,
            'animations': animation_sequence,
            'animations_set': animations_set,
            'current_frame': 0,
            'frame_count': frame_count,
            'delay': delay,
            'pause': ImageBlur.pause_time,
            'pause_modulo': (blur_factors.length * 2 + 1),
            'run_flag': false,
            'run': function(){
                this.run_flag = true;
                ImageBlur.animate.apply(this);
            },
            'stop': function(){
                this.run_flag = false;
            },
        }
        ;
        return rval;
    },  
    
    //Check if the HTML 5 <canvas> tag is supported ...
    supports_canvas: function() {
        return !!document.createElement('canvas').getContext;
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
        
        var self = this;
        var delay = this.delay;
        
        //Advance the current frame.
        var current_frame = this.current_frame;
        current_frame++;
        current_frame %= this.frame_count;
        var animations = this.animations;
        var img_id = animations[current_frame];
        if(img_id in this.ready_map)
        {
            this.current_frame = current_frame;
            
            //Determine the delay time.
            if(current_frame % this.pause_modulo == 0) delay = this.pause;
            
            //Rotate the z-indexes.
            var animations_set = this.animations_set;
            var frame_count = this.frame_count;
            jQuery.each(animations_set, function(idx, obj_id){
                var jq_obj = jQuery("#" + obj_id);
                jq_obj.css("zIndex", 1);
            })
            ;
            jQuery("#" + animations[current_frame]).css("zIndex", 3);
            jQuery("#" + (animations[(current_frame + 1) % frame_count])).css("zIndex", 2);
        }
        //
        window.setTimeout(function(){
            ImageBlur.animate.apply(self);  
        }, delay)
        ;
    }
}
;


