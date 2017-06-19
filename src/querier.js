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

    var sessionUUID = null;
    var initialized = false;
    
    var keys = [];
    
	$("#dateform").submit( function() {

        startDate = $("#dateform input[name=start]").val().replace(/-/g,"/");
        endDate = $("#dateform input[name=end]").val().replace(/-/g,"/");

        $("#datedisplay").html( startDate + " - " + endDate );

        //Create a new XMLHttpRequest for retrieving the JSON from Java
		var xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function() {
            
            //Once the request comes back with valid data...
			if( this.readyState == 4 && this.status == 200 ) {

                //This trims off the session ID from the beginning of the reponse.
                var index = this.responseText.indexOf(' ');
                sessionUUID = this.responseText.substr(0, index);
                console.log( "Your session ID was retrieved as: " + sessionUUID );

                //The JSON is then parsed (or attempted to be parsed).
                var object = JSON.parse( this.responseText.substr( index, this.responseText.length ) ); 
                object = object.contents;

                if( object.hasOwnProperty("children") ) {
                    
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
                }else {
                    alert( "No results found. Try a different range." );
                    return;
                }
                
                //This is just the fade in for the second screen
                toggleFade();
                
            }
		};

		var formData = $(this).serialize();
		xhttp.open("GET","src/treejson.php?"+formData, true);
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
            keyList += "'" + keys[i].key + "'";
            if( i < keys.length-1 ) {
                keyList+=",";
            }
        }

        window.open('./src/blobquery.php?sessionid='+sessionUUID+'&keylist='+keyList);

        toggleFade();
        return false;
    });
});
