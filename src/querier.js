$(document).ready( function() {

    var sessionUUID = null;
    
	$("#dateform").submit( function() {
		var formData = $(this).serialize();

		var xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function() {
			if( this.readyState == 4 && this.status == 200 ) {
                try {
                    var index = this.responseText.indexOf(' ');
                    sessionUUID = this.responseText.substr(0, index);
                    console.log( "Your session ID was retrieved as: " + sessionUUID );

                    var object = JSON.parse( this.responseText.substr( index, this.responseText.length ) ); 
                    object = object.contents;

                    console.log(object);
                    $("#tree").fancytree({ source:object, checkbox:true, selectMode:3 });

                    $("body").css("filter", "blur(2px)"); 
                    $("#parent").fadeOut( "fast", function() { 
                        $("#css").attr("href","style/tree.css");
                        $("body").css("filter","blur(0px)");
                        $("#treeparent").fadeIn( "fast" );
                    });
                }catch(e) {
                    if( e.message.includes("Fancytree") ) {
                        alert("No results found.");
                    }else
                    {
                        alert(e.message);
                    }
                }
                    
			}
		};

		xhttp.open("GET","src/treejson.php?"+formData, true);
		xhttp.send();

		return false;
	});
});
