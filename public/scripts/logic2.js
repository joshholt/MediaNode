$(document).ready(function() {
	var  filesRoot    = '/f/'
			,mediaRoot    = 'media/Music/'
			,path         = []
			,loaded       = false
	    ,manualSeek   = false
			,init ,load ,populate ,up ,clickDir ,clickFile ,addToPlaylist ,addAll
			,play, previous, next ,audio ,loadingIndicator ,positionIndicator
			,timeleft;
	
	init = function() {
		load(path);
		$('#player').bind('ended', next);
		$('#addall').click(addAll);
		$('#previous').click(previous);
		$('#next').click(next);
	};
	
	load = function(path) {
		$.ajax({
			url: filesRoot + path.join('/'),
			dataType: 'json',
			success: populate
		});
	};
	
	populate = function(files) {
		var  browser = $('#browser').empty()
				,add = function add(i, f) {
					if (f.name[0] === '.') return;
					var  dir = f.isDirectory
							,className = dir ? 'dir'  : 'file'
							,evenOrOdd = (i %2 === 0)  ? 'even' : 'odd';
							
					$('<a></a>')
						.text(f.name)
						.data('file', f)
						.data('evenOrOdd', evenOrOdd)
						.addClass(className)
						.appendTo(browser)
						.click(dir ? clickDir : clickFile);
				};
				
		files.sort(function (a, b) {
			a = a.name.toLowerCase();
			b = b.name.toLowerCase();
			if (a > b) return  1;
			if (a < b) return -1;
			return 0;
		});
		
		browser.append(up());
		$.each(files, add);
	};
	
	up = function() {
		return $('<a class="dir">..</a>')
							.click(function() {
								path.pop();
								load(path);
							});
	};
	
	clickDir = function(evt) {
		path.push($(evt.target).data('file').name);
		load(path);
	};
	
	clickFile = function(evt) {
		var className = $('#playlist > a:last').hasClass('even') ? 'odd' : 'even';
		addToPlaylist($(evt.target).data('file'), className);
	};
	
	addToPlaylist = function(f, className) {
		var  playlist = $('#playlist')
				,playNow  = (playlist.find('a').length === 0)
				,item     = $('<a></a>')
											.text(f.name)
											.data('file',f)
											.data('path', mediaRoot + f.path)
											.addClass(className)
											.appendTo(playlist)
											.click(function (evt) { play(evt.target); });
											
		if (playNow) item.click();
	};
	
	addAll = function() {
		var  isEven = $('#playlist > a:last').hasClass('even')
				,cls;
		
		$('#browser a.file').each(function (i, e) {
			cls = isEven ? (i%2 === 0) ? 'odd' : 'even' : (i%2 === 0) ? 'even' : 'odd';
			addToPlaylist($(e).data('file'), cls);
		});
	};
	
	play = function(elem) {
		var  name = $(elem).data('file').name
				,url  = $(elem).data('path');
		
		$('#playlist a').removeClass('playing');
		$(elem).addClass('playing');
		$('#player').attr('src', url);
	};
	
	previous = function() {
		var $prev = $('#playlist a.playing').prev();
		if ($prev.length) {
			setTimeout($prev.click(), 2000);
		}
	};
	
	next = function() {
		var $next = $('#playlist a.playing').next();
		if ($next.length) {
			setTimeout($next.click(), 2000);
		}
	};
	
	// Finally fire off the init...
	init();
	
	// The setup everything for the custom audio player
	audio = $('.player audio').get(0);
	loadingIndicator = $('.player #loading');
	positionIndicator = $('.player #handle');
	timeleft = $('.player #timeleft');

	if (audio && (audio.buffered !== undefined) && (audio.buffered.length !== 0)) {
	  $(audio).bind('progress', function() {
	    var loaded = parseInt(((audio.buffered.end(0) / audio.duration) * 100), 10);
	    loadingIndicator.css({width: loaded + '%'});
	  });
	}
	else {
	  loadingIndicator.remove();
	}
	
	$(audio).bind('timeupdate', function() {

	  var rem = parseInt(audio.duration - audio.currentTime, 10),
	  pos = (audio.currentTime / audio.duration) * 100,
	  mins = Math.floor(rem/60,10),
	  secs = rem - mins*60;

	  timeleft.text('-' + mins + ':' + (secs > 9 ? secs : '0' + secs));
	  if (!manualSeek) { positionIndicator.css({left: pos + '%'}); }
	  if (!loaded) {
	    loaded = true;

	    $('.player #gutter').slider({
	      value: 0,
	      step: 0.01,
	      orientation: "horizontal",
	      range: "min",
	      max: audio.duration,
	      animate: true,          
	      slide: function() {             
	        manualSeek = true;
	      },
	      stop:function(e,ui) {
	        manualSeek = false;         
	        audio.currentTime = ui.value;
	      }
	    });
	  }

	});
	
	$(audio).bind('play',function() {
	  $("#playtoggle").addClass('playing');   
	}).bind('pause', function() {
	  $("#playtoggle").removeClass('playing');    
	});   

	$("#playtoggle").click(function() {     
	  if (audio.paused) { audio.play(); } 
	  else { audio.pause(); }     
	});
});
