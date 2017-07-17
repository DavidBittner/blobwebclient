//Adds all of the children to the list of checked items, or removes them if unchecked
function toggleChildren( keys, node ) {

    if( node.children != null ) {
        for( var i = 0; i < node.children.length; i++ )
        {
            toggleChildren( keys, node.children[i] );
        }
    }

    if( node.selected && !node.folder ) {
        keys.push(node);
    }else if( !node.folder ){
        var index = keys.indexOf( node );
        keys.splice( index, 1 );
    }
}

function toggleFade() {
    $("body").css("filter", "blur(2px)"); 

    if( $("#dateform").is(":visible") ) {
        $("#parent").fadeOut( "fast", function() { 
            $("#css").attr("href","style/tree.css");
            $("body").css("filter","blur(0px)");
            $("#treeparent").fadeIn( "fast" );
        });
    }else{
        $("#treeparent").fadeOut( "fast", function() { 
            $("#css").attr("href","style/date.css");
            $("body").css("filter","blur(0px)");
            $("#parent").fadeIn( "fast" );
        });
    }
}

function toggleLoading(mode, msg) {
    if( mode )
    {
        $("#overlay").fadeIn({ duration: "fast", complete: function() {
            if( msg != null )
            {
                alert(msg);
            }
        }});
    }else{
        $("#overlay").fadeOut({duration: "fast", complete: function() {
            if( msg != null ) {
                alert(msg);
            }
        }});
    }
}

$(document).ready( function() {

    var today = new Date();
    $("#start").val(today.toLocaleDateString("en-US"));
    $("#end").val(today.toLocaleDateString("en-US"));

    location.hash = "nb";
    $(window).on('hashchange', function() {
        if( location.hash === '' && !$("#dateform").is(":visible") ) {
            toggleFade();
            location.hash = "nb";
        }
    });

    var startDate = null;
    var endDate = null;
    
    var initialized = false;
    
    var keys = [];
    
	$("#dateform").submit( function() {
        toggleLoading(true, null);

        startDate = $("#dateform input[name=start]").val().replace(/-/g,"/");
        endDate = $("#dateform input[name=end]").val().replace(/-/g,"/");

        $("#datedisplay").html( startDate + " - " + endDate );

        //Create a new XMLHttpRequest for retrieving the JSON from Java
		var xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function() {
            
            //Once the request comes back with valid data...
			if( this.readyState == 4 && this.status == 200 ) {
                //The JSON is then parsed (or attempted to be parsed).
                try
                {
                	var object = JSON.parse( this.responseText ); 

                    if( object.children.length > 0 ) {
                        
                        if( initialized ) {
                            var tree = $("#tree").fancytree("getTree");
                            tree.reload( object );
                        }else
                        {
                            $("#tree").fancytree({ 
                                source:object, 
                                checkbox:true, 
                                select: function( event, data ) {
                                    toggleChildren( keys, data.node );
                                },
                                selectMode:3 
                            });
                        }

                        initialized = true;
                        toggleFade();
                    }else {
                    	console.log("Error: not valid JSON. Assuming error message.");
                        alert( "No results found. Try a different range." );
                        return;
                    }
                }catch( er )
                {
                	alert( this.responseText );
                	return;
                }finally{
                    toggleLoading(false);
                }
            }else if( this.readyState == 4 && this.status == 404 )
            {
                toggleLoading(false, "404 Error. Are you connected to the internet?");
            }
		};

		var formData = $(this).serialize();
		xhttp.open("GET","BlobServ?"+formData, true);
		xhttp.send();

		return false;
	});

    $("#treeform").submit( function() {

        if( keys.length == 0 ) {
            alert( "No attachments selected." );
            return false;
        }

        var keyList = "";
        for( var i = 0; i < keys.length; i++ )
        {
        	if( keyList.indexOf(keys[i].key+",") == -1 ) {
        		keyList += "'" + keys[i].key + "'";
                if( i < keys.length-1 ) {
                    keyList+=",";
                }
        	}
        }

        console.log("Keys requested: " + keyList);
        var checked = (document.getElementById('singleDir').checked)?("on"):("off");

		var xhttp = new XMLHttpRequest();
        xhttp.open("POST", 'BlobServ?keys='+keyList+"&singleDir=" + checked );
        xhttp.send();

        toggleFade();
        return false;
    });
});
