//Establish the WebSocket connection and set up event handlers

//everything that's currently buggy
//start logic one player / two player, wait for other player to start timer


var webSocket = new WebSocket("ws://" + location.hostname + ":" + location.port + "/chat/");
webSocket.onmessage = function (msg) { console.log("in on message"); updateChat(msg); };
webSocket.onclose = function () { alert("WebSocket connection closed ") };

function time(stop){
	  var t = Date.parse(stop) - Date.parse(new Date());
	  var seconds = Math.floor((t/1000)%60);
	  var minutes = Math.floor((t/1000/60)%60);
	  return {
	    'minutes': minutes,
	    'seconds': seconds
	  };
}

function n(n){
    return n > 9 ? "" + n: "0" + n;
}

function countdown(){
	var timeLeft = time(stop);
	
	$("#timer").text(n(timeLeft["minutes"])+":"+n(timeLeft["seconds"]));
	if (timeLeft["minutes"]==0 && timeLeft["seconds"]==0){
		alert("you lose :(");
		clearInterval(timer);
	}
}

function wordSize(classes, o){
	var found = null
	for (i in classes){
		var c = classes[i];
		if (o=="down" && c.startsWith("D")){
			found = c;
			break;
		} else if (o=="across" && c.startsWith("A")){
			found = c;
			break;
		}
	}
	if (found != null){
		if (o=="down"){
			return parseFloat(found.split("N")[1])-1;
		} else {
			return parseFloat(found.split("S")[2])-1;
		}
	}
	return 0;
}

function checkCol(c, row, x, check){
	
	var foundUp = true;
	var foundDown = false;
	
	var down = row+1;
	var up=row-1;
	console.log(numRow);
	var block = c[row];
	
	var y = -1;
	var size = 1;
	
	//$(block).addClass("wordActive");
	var word = $(block).val();
	var rSize = wordSize($(block).attr("class").split(" "), "across");
	if (rSize>0){
		y = row;
	}
	
	var col = [];
	col.push(block);

	while (!foundUp || !foundDown){
		if (up<0){
			foundUp=true;
		} else {
			block = c[up];
			if (!$(block).hasClass("filled")){
				word = $(block).val()+word;
				var cSize = wordSize($(block).attr("class").split(" "), "down");
				if (cSize>0){
					y = up;
				}
				col.push(block);
				up--;
				size++;
			} else {
				foundUp = true;
			}
		}
		if (down==numRow){
			foundDown=true;
		} else {
			block = c[down];
			if (!$(block).hasClass("filled")){
				word = word + $(block).val();
				col.push(block);
				down++;
				size++;
			} else {
				foundDown = true;
			}
		}
	}

	if (check && size>1 && word.length == size){
		checkWord(word, x, y, "DOWN");
	}
	if (!check){
		return col;
	}
}

//bug when on last index;
//bug when filling out with already filled letters?

function checkRow(r, col, y, check){
	
	var foundLeft = false;
	var foundRight = false;
	
	var right = col+1;
	var left=col-1;
	
	var block = r[col];

	var x = -1;
	var size = 1;
	
	//$(block).addClass("wordActive");
	var word = $(block).val();
	var cSize = wordSize($(block).attr("class").split(" "), "down");
	if (cSize>0){
		x = col;
	}
	
	var row = [];
	row.push(block);
	
	while (!foundLeft || !foundRight){
		if (left<0){
			foundLeft=true;
		} else {
			block = r[left];
			if (!$(block).hasClass("filled")){
				word = $(block).val()+word;
				var rSize = wordSize($(block).attr("class").split(" "), "across");
				console.log(rSize);
				if (rSize>0){
					x = left;
				}
				row.push(block);
				left--;
				size++;
			} else {
				foundLeft = true;
			}
		}
		if (right==numCol){
			foundRight=true;
		} else {
			block = r[right];
			if (!$(block).hasClass("filled")){
				word = word + $(block).val();
				row.push(block);
				right++;
				size++;
			} else {
				foundRight = true;
			}
		}
	}
	
	console.log(x+" "+y);
	if (check && size>1 && word.length == size){
		checkWord(word, x, y, "ACROSS");
	}
	if (!check){
		return row;
	}
}

function checkWord(word, x, y, o){
	var id = $(".crossword").attr("id");
	var toSend = "DATA;"+word+";"+x+";"+y+";"+o+";"+id;
	webSocket.send(toSend);
}

function exposeLetter(x, y, o){
	var id = $(".crossword").attr("id");
	var toSend = "DATA;"+x+";"+y+";"+o+";"+id;
	webSocket.send(toSend);
}

function wordActive(block){
	$(block).addClass("wordActive");
}

function orient(){
	var classes = $(".active").attr("class").split(" ");
	var row = parseFloat(classes[2][1]);
	var col = parseFloat(classes[1][1]);
	$(".wordActive").removeClass("wordActive");
	if (orientation == "down"){
		wordActive(checkCol($("."+classes[1]), row, col, false));
	} else if (orientation == "across"){
		wordActive(checkRow($("."+classes[2]), col, row, false));
	}
}


function next(dir){
	var curr = $(".active");
	var classes = curr.attr("class").split(" ");
	
	var row = parseFloat(classes[2][1]);
	var col = parseFloat(classes[1][1]);
	var word = $(".c"+col);
	
	if (orientation == "across"){
		word = $(".r"+row);
		var temp = col;
		col = row;
		row = temp;
	}
	
	var block = getNext(dir, col, row, word, classes);
	console.log(block);
	
	if (orientation == "down"){
		checkCol(word, row, col, true);
	} else {
		checkRow(word, row, col, true);
	}
	
	$(".active").removeClass("active");
	$(block).addClass("active");
	$(block).focus();
}

function getNext(dir, i, j, word, classes){
	
	var next;
	if (dir == -1){
		next = j-1;
	} else {
		next = j+1;
	}
	
	if (next<0){
		next = j+wordSize(classes, orientation);
	} else if (next == numRow){
		next = j-wordSize(classes, orientation);
	}
	
	var block = word[next];
	console.log(block);
	
	if ($(block).hasClass("filled")){
		var size = wordSize(classes, orientation);
		if (dir == -1){
			next = j+size;
		} else {
			next = j-size;
		}
		block = word[next];
	}
	if ($(block).attr("disabled")=="disabled"){
		console.log(dir+" "+i+" "+next);
		return getNext(dir, i, next, word, $(block).attr("class").split(" "));
	}
	return block;
}


var orientation = "down";
var numCol = 0;
var numRow = 0;
var stop = new Date();
stop.setMinutes(stop.getMinutes() + 5);
var timer = setInterval(countdown, 1000);

window.onload = function(response) {	

	$("hint1").click(function(){
		$.get( "/hint1", function(data ) {
			$("textarea").click(function(){
				$(".active").removeClass("active");
				$(this).addClass("active");
				orient();
			});
		});
		$("hint1").hide();
	});
	
	$("hint2").click(function(){
		$.get( "/hint2", function(data ) {
			
		});
		$("hint2").hide();
	});
	
	$("hint3").click(function(){
		$.get( "/hint3", function(data ) {
			
		});
		$("hint3").hide();
	});
	
	numRow = $(".row").length;
	if (numRow>0){
		numCol = $(".r0").length;
	}
	
	var player = $("#player").text();
	var playerWords = $("."+player).prev().each(function(){
		var classes = $(this).attr("class").split(" ");
		var row = parseFloat(classes[2][1]);
		var col = parseFloat(classes[1][1]);
		var word = $(".c"+col);
		
		var enabled;
		if (player == "ACROSS"){
			orientation = "across";
			word = $(".r"+row);
			console.log(word);
			enabled = checkRow(word,col, row, false);
		} else {
			enabled = checkCol(word, row, col, false);
		} 
		console.log(enabled);
		$(enabled).attr("disabled", false);
	});
	
	$("textarea").click(function(){
		$(".active").removeClass("active");
		$(this).addClass("active");
		orient();
	});
	
	$("textarea").keydown(function(event) {
	     switch(event.keyCode){
	        case 37:
	        	if (orientation=="across"){
	        		next(-1);
	        	}else {
		        	//orientation = "across";
		        	//orient();
	        	}
	        	break;
	        case 38:
	        	if (orientation=="down"){
	        		next(-1);
	        	}else {
		        	//orientation = "down";
		        	//orient();
	        	}
	        	break;
	        case 39:
	        	if (orientation=="across"){
	        		next(1);
	        	}else {
		        	//orientation = "across";
		        	//orient();
	        	}
	        	break;
	        case 40:
	        	if (orientation=="down"){
	        		next(1);
	        	}else {
		        	//orientation = "down";
		        	//orient();
	        	}
	        	break;
	        case 8:
	        	$(this).val("");
	        default:
	        	if (event.keyCode>64 && event.keyCode<91){
	        		$(this).val(String.fromCharCode(event.keyCode));
	        		console.log("1");
	        		next();
	        	}
	     }
	     event.preventDefault();
	 });
	
}