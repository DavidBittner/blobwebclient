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

$(document).ready( function() {

    var sessionUUID = null;
    var initialized = false;
    var keys = [];
    
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

                    if( !initialized ) {
                        $("#tree").fancytree({ 
                            source:object.contents, 
                            checkbox:true, 
                            select: function( event, data ) {
                                toggleChildren( keys, data.node );
                            },
                            selectMode:3 }
                        );

                        initialized = true;
                    }else{
                        $("#tree").fancytree("getTree").source = object.contents;
                    }
                    
                    $("body").css("filter", "blur(2px)"); 
                    $("#parent").fadeOut( "fast", function() { 
                        $("#css").attr("href","style/tree.css");
                        $("body").css("filter","blur(0px)");
                        $("#treeparent").fadeIn( "fast" );
                    });
                }catch(e) {
                    if( e.message.includes("Fancytree") ) {
                        console.log(e.message);
                        console.log(this.responseText);
                        alert("No results found.");
                        object = null;
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

        return true;
    });
});
