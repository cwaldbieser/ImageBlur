INTRODUCTION
============

First, ImageBlur is *not* a library for blurring images.  Rather, it is a JavaScript library that can use one of several
image blurring libraries in order to animate a particular kind of transition between photos.  Namely:

PHOTO 1 - BLURRED PHOTO 1 - BLURRED PHOTO 2 - PHOTO 2 

There may be multiple blurry photo stages, and the transition cycles through all the images.

HISTORY
=======

I was looking at a couple sites and saw this cool transition effect where a gray scale photo rapidly became blurry and then rapidly came into focus as a new photo.  The uncool thing was that this effect was programmed using Abode Flash.  On my Ubuntu Linux based desktop, Flash tends to make my CPU sound like a jet engine about to take off.  It really burns through CPU cycles and sometimes makes the browser unresponsive for a long time.

I thought to myself, there must be a way to do this with JavaScript.  I thought I could manually blur some images with ImageMagick, and then cycle through them to create the animation.  Imagine how pleased I was when I discovered that there are actually JavaScript libraries for manipulating image data using new HTML5 features!  I discovered 2 really good libraries.  Pixastic (http://www.pixastic.com/lib/) provides a number of neat effects, but I decided to stick with “blurfast” for my script.  StackBoxBlur (http://www.quasimondo.com/BoxBlurForCanvas/FastBlur2Demo.html) was also a really fast algorithm.  Which to use?  I couldn’t decide, so I coded my script to use either as a back end image processor.

BASIC USAGE
===========

The basic usage is to have a container (like an HTML div) that contains a bunch of img tags.

    var transition = ImageBlur.init("id_photos");
    transition.run();

That’s about as simple as it gets.  Of course, you have to include one of the back end scripts in your page first.  And since I made liberal use of jQuery, you have to include that, too.  Have a look at the demo to see it in action.

Note, your millage may vary.  As I mentioned, you need a browser that supports HTML5 to see the effect at all.  Also, while the libraries that do the blurring are pretty fast, creating all those blurry images can take up some significant CPU time.  I’ve tried to mitigate this by not doing all the processing in a single shot, and by setting some reasonable defaults for the number of animation frames.  If you override the defaults and crank them up, don’t be surprised if your browser freezes up for a couple seconds.

GENERAL USAGE
=============
The ImageBlur.init() function returns an object (the transition) with the properties and methods:

  * run()   : Runs the animation.
  * stop()  : Stops the animation.

ImageBlur.init() takes the ID of the element that contains the images as well as an optional options parameter.  The options parameter is an associative array that can contain the following options:

  * pause_time  : The amount of time in milliseconds that the animation pauses on a non-blurred image.
  * stages      : The number of blur stages per image.
  * delay       : The amount of time in milliseconds spend on each blurred frame of the animation.
  * blur_amount : This setting is dependent on the back end image processor library.  It conrols the amount of
    blurring per frame.


