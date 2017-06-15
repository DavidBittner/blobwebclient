$(document).ready( function() {
	$("#dateform").submit( function() {
		var formData = $(this).serialize();

        $("body").css("filter", "blur(2px)"); 
		var xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function() {
			if( this.readyState == 4 && this.status == 200 ) {
                try {

                    var object = JSON.parse( this.responseText ); 
                    object = object.contents;

                    $("#tree").fancytree({ source:object, checkbox:true, selectMode:3 });

                    $("#parent").fadeOut( "fast", function() { 
                        $("#css").attr("href","style/tree.css");
                        $("body").css("filter","blur(0px)");
                        $("#treeparent").fadeIn( "fast" );
                    });
                }catch(e) {
                    console.log(e);
                    alert( this.responseText );
                }
                    
			}
		};

		xhttp.open("GET","/blobwebclient/src/runquery.php?"+formData, true);
		xhttp.send();

		return false;
	});
});
