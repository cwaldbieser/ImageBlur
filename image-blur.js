
$(document).ready(function(){
	$("#id_demo").click(run_demo);	
})
;

/*
function run_demo()
{
	var img = $("#id_image")[0];
	Pixastic.process(img, "blurfast", {amount:5});
}
*/

function run_demo()
{
	blur_stages();
}

function blur_stages()
{
	var interval = 75;
	var apex_interval = 1500;
	
	blur_stage(0.1);
	
	window.setTimeout(function(){
		blur_stage(0.5);
		window.setTimeout(function(){
			blur_stage(1.0);
			window.setTimeout(function(){
				blur_stage(2.5);
				window.setTimeout(function(){
					blur_stage(3.75);	
					window.setTimeout(function(){
						blur_stage(5.0); //apex
						window.setTimeout(function(){
							blur_stage(3.75);
							window.setTimeout(function(){
								blur_stage(2.5);
								window.setTimeout(function(){
									blur_stage(1.0);
									window.setTimeout(reset_image, interval);
								},interval);
							},interval);
						},interval);
					}, apex_interval);
				},interval);
			},interval);
		}, interval);	
	}, interval);
}

function blur_stage(amount)
{
	reset_image();
	var img = $("#id_image")[0];
	Pixastic.process(img, "blurfast", {amount: amount});
}

function reset_image()
{
	var baseimg = $("#id_baseimage")[0];
	$("#id_image").replaceWith("<img id='id_image' src='" + baseimg.src + "' />");
}
