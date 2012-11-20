/**
 * aSlider - Animated image slider with preloader
 * (C) 2011 Sawanna Team (http://sawanna.org)
 */

$.fn.aslider=function(settings)
{
	aSlider={
		slider: null,
		params: new Array(),
		images: new Array(),
		titles: new Array(),
		descriptions: new Array(),
		links: new Array(),
		loaded: 0,
		current:-1,
		locked: false,
		data: new Array(),
		init: function(elem,settings) {
			this.params.speed=200;
			this.params.animation='fade';
			this.params.auto=true;
			this.params.delay=5000;
			this.params.pix_count_x=10;
			this.params.pix_count_y=10;
			this.params.pix_effect='none';
			this.params.pix_random=true;
			this.params.src=new Array();
			this.params.btn_opacity=.5;
			this.params.title_opacity=.8;
			this.params.description_opacity=.6;
			
			if (typeof(settings) != 'undefined') {
				try {
					for (s in settings) {
						this.params[s]=settings[s];
					}
				} catch(e) {}
			}
			
			this.slider=elem;
			
			$(this.slider).find('li').each(function(){
				var i=aSlider.images.length;
				aSlider.images[i]=new Image();
				aSlider.images[i].onload=function() {
					var c=aSlider.loaded;
					$('#slider-container').append('<div class="slider-item" id="slider-item-id-'+c+'"></div>');
					$('#slider-item-id-'+c).css({'background-image':'url('+aSlider.images[c].src+')'});
					
					if (typeof(aSlider.links[c]) != 'undefined' && aSlider.links[c].length>0) {
						$('#slider-item-id-'+c).click(function(){
							window.location.href=aSlider.links[c];
						});
						$('#slider-item-id-'+c).css('cursor','pointer');
					}
					
					aSlider.loaded++;
					$('#slider-pager').append('<span class="slider-pager-item" title="'+aSlider.loaded+'">'+aSlider.loaded+'</span>');
					$('#slider-loader').append('.');
					
					if (aSlider.loaded >= aSlider.images.length) {
						window.setTimeout("aSlider.start();",200);
						if (aSlider.params.auto) {
							aSlider.autostart();
						}
					}
				}
				
				aSlider.params.src[i]=$(this).find('img').get(0).src;
				
				aSlider.titles[i]=$(this).find('img').attr('title');
				aSlider.descriptions[i]=$(this).find('img').attr('alt');
				
				aSlider.links[i]=$(this).find('a').attr('href');
			});
			
			$(this.slider).replaceWith('<div id="aslider"><div id="slider-container"><div id="slider-pager"></div></div><div id="slider-l_btn" class="slider-btn"></div><div id="slider-r_btn" class="slider-btn"></div></div>');
			$('#slider-container').append('<div id="slider-title"></div><div id="slider-description"></div><div id="slider-loader">Loading</div>');
			
			for(var i in this.images) {
				aSlider.images[i].src=aSlider.params.src[i];
			}
		},
		start: function() {
			$('.slider-pager-item').click(function(){
				var d=1;
				if (aSlider.current<$(this).attr('title')) { d=-1; }
				aSlider.show(parseInt($(this).attr('title'))-1,d);
			});
			
			$('.slider-pager-item').hover(
				function() {
					$(this).addClass('hover');
				},
				function() {
					$(this).removeClass('hover');
				}
			);
			
			if (this.images.length > 1) {
				$('#slider-l_btn').click(function(){ aSlider.move_left(); });
				$('#slider-r_btn').click(function(){ aSlider.move_right(); });
				
				$('.slider-btn').css({'display':'block',opacity:0});
				$('.slider-btn').animate({opacity:this.params.btn_opacity},500);
				
				$('.slider-btn').hover(
					function() {
						$('.slider-btn').animate({opacity:1},500);
					},
					function() {
						$('.slider-btn').animate({opacity:aSlider.params.btn_opacity},500);
					}
				);
			}
			
			$('#slider-loader').remove();
			
			$('#slider-title').css({'display':'block',opacity:0});
			$('#slider-description').css({'display':'block',opacity:0});
			
			this.show(0);
		},
		move_left: function() {
			this.show(this.current-1,1);
		},
		move_right: function() {
			this.show(this.current+1,-1);
		},
		show: function(slide,direction) {
			if (aSlider.params.auto) {
				this.autostop();
			}
			if (slide == this.current || slide<0 || slide>=this.images.length || this.locked) { return; }
			this.locked=true;
			var elem=$('#slider-item-id-'+slide);
			$('.slider-item').css('z-index',parseInt($(elem).css('z-index')));
			$(elem).css('z-index',parseInt($(elem).css('z-index'))+1);
			$('#slider-container').css('z-index',parseInt($('#slider-container').css('z-index'))+1);
			$('#slider-pager').css('z-index',parseInt($('#slider-pager').css('z-index'))+1);
			$('.slider-pager-item').removeClass('active');
			$('.slider-pager-item[title='+(slide+1)+']').addClass('active');
			$('.slider-btn').css('z-index',parseInt($('.slider-btn').css('z-index'))+1);
			$('#slider-title').css('z-index',parseInt($('#slider-title').css('z-index'))+1);
			$('#slider-description').css('z-index',parseInt($('#slider-description').css('z-index'))+1);
			this.animate(elem,$('#slider-item-id-'+this.current),direction);
			this.current=slide;
			
			$('.slider-btn').css('display','block');
			if (this.current <= 0) {
				$('#slider-l_btn').css('display','none');
			}
			if (this.current >= this.images.length-1) {
				$('#slider-r_btn').css('display','none');
			}
			
			$('#slider-title').stop(true,true).animate({opacity:0},this.params.speed,function(){
				$(this).html(aSlider.titles[aSlider.current]);
				$('#slider-title').animate({opacity:aSlider.params.title_opacity},aSlider.params.speed);
			});
			
			$('#slider-description').stop(true,true).animate({opacity:0},this.params.speed,function(){
				$(this).html(aSlider.descriptions[aSlider.current]);
				$('#slider-description').animate({opacity:aSlider.params.description_opacity},aSlider.params.speed);
			});
			if (aSlider.params.auto) {
				this.autostart();
			}
		},
		animate: function(elem,current,direction) {
			if (this.params.animation == 'show') {
				this.effect_show(elem,current);
			} else if (this.params.animation == 'slide') {
				this.effect_slide(elem,current);
			} else if (this.params.animation == 'wind') {
				if (direction>0) {
					this.effect_wind_right(elem,current);
				} else {
					this.effect_wind_left(elem,current);
				}
			} else if (this.params.animation == 'move') {
				if (direction>0) {
					this.effect_move_right(elem,current);
				} else {
					this.effect_move_left(elem,current);
				}
			} else if (this.params.animation == 'pixel') {
				this.effect_pixel(elem,current);
			} else if (this.params.animation == 'vline') {
				this.effect_vline(elem,current);
			} else if (this.params.animation == 'hline') {
				this.effect_hline(elem,current);
			} else if (typeof(this.params.animation) == 'object') {
				var e=this.params.animation;
				if (typeof(this.data['fx'])=='undefined' || this.data['fx']>=e.length) {
					this.data['fx']=0;
				}
				
				var animation=e[this.data['fx']];
				$(elem).css({
						'left':0
						});
				
				if (animation == 'show') {
					this.effect_show(elem,current);
				} else if (animation == 'slide') {
					this.effect_slide(elem,current);
				} else if (animation == 'wind') {
					if (direction>0) {
						this.effect_wind_right(elem,current);
					} else {
						this.effect_wind_left(elem,current);
					}
				} else if (animation == 'move') {
					if (direction>0) {
						this.effect_move_right(elem,current);
					} else {
						this.effect_move_left(elem,current);
					}
				} else if (animation == 'pixel') {
					this.effect_pixel(elem,current);
				} else if (animation == 'vline') {
					this.effect_vline(elem,current);
				} else if (animation == 'hline') {
					this.effect_hline(elem,current);
				} else {
					this.effect_fade(elem,current);
				} 
				
				this.data['fx']++;
			} else {
				this.effect_fade(elem,current);
			}
		},
		effect_show: function(elem,current) {
			$(elem).stop(true,true).show(this.params.speed,function(){
				$('.slider-item').each(function(){
					if ($(this).attr('id') != $(elem).attr('id')) {
						$(this).css({'display':'none'});
					}
				});
				
				aSlider.locked=false;
			});
		},
		effect_fade: function(elem,current) {
			$(elem).stop(true,true).fadeIn(this.params.speed,function(){
				$('.slider-item').each(function(){
					if ($(this).attr('id') != $(elem).attr('id')) {
						$(this).css({'display':'none'});
					}
				});
				
				aSlider.locked=false;
			});
		},
		effect_slide: function(elem,current) {
			$(elem).stop(true,true).slideDown(this.params.speed,function(){
				$('.slider-item').each(function(){
					if ($(this).attr('id') != $(elem).attr('id')) {
						$(this).css({'display':'none'});
					}
				});
				
				aSlider.locked=false;
			});
		},
		effect_wind_left: function(elem,current) {
			var w=$(elem).width();
			$(elem).css({
						'left':w,
						'width':0,
						'display':'block'
					});
			$(elem).stop(true,true).animate({'width':w,'left':0},this.params.speed,function(){
				$('.slider-item').each(function(){
					if ($(this).attr('id') != $(elem).attr('id')) {
						$(this).css({'display':'none'});
					}
				});
				
				aSlider.locked=false;
			});
		},
		effect_wind_right: function(elem,current) {
			var w=$(elem).width();
			$(elem).css({
						'left':0,
						'width':0,
						'display':'block'
					});
			$(elem).stop(true,true).animate({'width':w,'left':0},this.params.speed,function(){
				$('.slider-item').each(function(){
					if ($(this).attr('id') != $(elem).attr('id')) {
						$(this).css({'display':'none'});
					}
				});
				
				aSlider.locked=false;
			});
		},
		effect_move_left: function(elem,current) {
			var w=$(elem).width();
			$(elem).css({
						'left':w,
						'display':'block'
					});
			$(elem).stop(true,true).animate({'left':0},this.params.speed,function(){
				$('.slider-item').each(function(){
					if ($(this).attr('id') != $(elem).attr('id')) {
						$(this).css({'display':'none'});
					}
				});
				
				aSlider.locked=false;
			});
			$(current).stop(true,true).animate({'left':(-1*w)},this.params.speed);
		},
		effect_move_right: function(elem,current) {
			var w=$(elem).width();
			$(elem).css({
						'left':(-1*w),
						'display':'block'
					});
			$(elem).stop(true,true).animate({'left':0},this.params.speed,function(){
				$('.slider-item').each(function(){
					if ($(this).attr('id') != $(elem).attr('id')) {
						$(this).css({'display':'none'});
					}
				});
				
				aSlider.locked=false;
			});
			$(current).stop(true,true).animate({'left':w},this.params.speed);
		},
		effect_pixel: function(elem,current) {
			this.pixel_init(elem,current,Math.floor($(elem).width()/this.params.pix_count_x),Math.floor($(elem).height()/this.params.pix_count_y));
		},
		effect_vline: function(elem,current) {
			this.pixel_init(elem,current,$(elem).width(),Math.floor($(elem).height()/this.params.pix_count_y));
		},
		effect_hline: function(elem,current) {
			this.pixel_init(elem,current,Math.floor($(elem).width()/this.params.pix_count_x),$(elem).height());
		},
		pixel_init: function(elem,current,w,h) {
			$('#slider-container').append('<div id="slider-pixel-container"></div>');
			$('#slider-pixel-container').css({
											'position':'absolute',
											'left':0,
											'top':0,
											'width':'100%',
											'height':'100%',
											'z-index':parseInt($(elem).css('z-index'))
											});
				
			this.data['elem']=elem;							
											
			this.data['w']=w;
			this.data['h']=h;
			
			this.data['total']=Math.floor(this.params.pix_count_x*this.params.pix_count_y);
			
			this.data['x']=0;
			this.data['y']=0;
			
			this.data['iterator']=-1;
			this.data['ready']=new Array();
			
			this.data['timer']=window.setInterval("aSlider.pixel_draw()",Math.floor(this.params.speed/this.data['total'])+10);
		},
		pixel_draw: function() {
			
			if (this.params.pix_random) {
				this.data['iterator']=Math.floor(Math.random()*this.data['total']);
				if (typeof(this.data['ready'][this.data['iterator']]) != 'undefined') {
					this.pixel_draw();
					return;
				}
			} else {
				this.data['iterator']++;
			}
			
			var w_co=Math.floor($(this.data['elem']).width()/this.data['w']);
			var h_co=Math.floor($(this.data['elem']).height()/this.data['h']);
			this.data['x']=(this.data['iterator']-Math.floor(this.data['iterator']/w_co)*w_co)*this.data['w'];
			this.data['y']=Math.floor(this.data['iterator']/w_co)*this.data['h'];

			$('#slider-pixel-container').append('<div id="slider-pixel-item-'+this.data['iterator']+'"></div>');
			$('#slider-pixel-item-'+this.data['iterator']).css({
										'position':'absolute',
										'left':this.data['x'],
										'top':this.data['y'],
										'width':this.data['w'],
										'height':this.data['h'],
										'background-image':$(this.data['elem']).css('background-image'),
										'background-repeat':'no-repeat',
										'background-position':'-'+this.data['x']+'px -'+this.data['y']+'px',
										'display':'none'
										});
			
			if (this.params.pix_effect == 'fade') {
				$('#slider-pixel-item-'+this.data['iterator']).fadeIn(this.params.speed/this.data['total']);
			} else if (this.params.pix_effect == 'slide') {
				$('#slider-pixel-item-'+this.data['iterator']).slideDown(this.params.speed/this.data['total']);
			} else if (this.params.pix_effect == 'show') {
				$('#slider-pixel-item-'+this.data['iterator']).show(this.params.speed/this.data['total']);
			} else {
				$('#slider-pixel-item-'+this.data['iterator']).css('display','block');
			}
			
			this.data['ready'][this.data['iterator']]=1;
			
			var finished=true;
			
			for (var r=0;r<this.data['total'];r++) {
				if (typeof(this.data['ready'][r])=='undefined' || this.data['ready'][r]!=1)
				{
					finished=false;
					break;
				}
			}
			
			if (finished) { 
				window.clearTimeout(this.data['timer']);
				
				this.data['elem'].css('display','block');
				$('.slider-item').each(function(){
					if ($(this).attr('id') != $(aSlider.data['elem']).attr('id')) {
						$(this).css({'display':'none'});
					}
				});
				
				$('#slider-pixel-container').remove();
				
				aSlider.locked=false;
				return; 
			}
		},
		auto: function() {
			if (this.current+1>=this.images.length) {
				this.show(0,1);
				return;
			}
			
			this.move_right();
		},
		autostart: function() {
			this.data['autostart']=window.setInterval("aSlider.auto()",this.params.delay);
		},
		autostop: function() {
			try {
				window.clearTimeout(this.data['autostart']);
			} catch(e) {}
		}
	}
	
	aSlider.init($(this),settings);
}
