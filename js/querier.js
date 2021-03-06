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
    if( $("#dateform").is(":visible") ) {
        $("#parent").fadeOut( "fast", function() { 
            $("#css").attr("href","style/tree.css");
            $("#treeparent").fadeIn( "fast" );
        });
    }else{
        $("#treeparent").fadeOut( "fast", function() { 
            $("#css").attr("href","style/date.css");
            $("#parent").fadeIn( "fast" );
        });
    }
}

function deleteCookie( name ) {
      document.cookie = document.cookie + ";" + name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

function toggleLoading(mode, func) {
    if( mode )
    {
        $("#overlay").fadeIn({ duration: "fast", complete: function() {
            if( func != null )
            {
                func();
            }
        }});
    }else{
        $("#overlay").fadeOut({duration: "fast", complete: function() {
            if( func != null ) {
                func();
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

                    //ew
                    if( object.children[0].children.length > 0 ) {
                        
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
                                dblclick: function( event, data ) {
                                    if( !data.node.folder ) {
                                        window.open("BlobServ?key="+data.node.key);
                                    }
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
                    toggleLoading(false, function(){
                        alert(this.responseText)
                    });
                    return;
                }finally{
                    toggleLoading(false, null);
                }
            }else if( this.readyState == 4 && this.status == 404 )
            {
                toggleLoading(false, function(){
                    alert("404 Error. Are you connected to the internet?")
                });
            }else if( this.readyState == 4 && this.status == 500 )
            {
                toggleLoading(false, function(){
                    alert("500 error. Something went wrong within the server.");
                });
            }
        };

        var formData = $(this).serialize();
        console.log(formData);
        xhttp.open("GET","BlobServ?"+formData, true);
        try
        {
            xhttp.send();
        }catch(err){
            toggleLoading(false, function(){
                alert(err)
            });
        }

        return false;
    });

    $("#treeform").submit( function() {

        toggleLoading(true, null);
        if( keys.length == 0 ) {
            alert( "No attachments selected." );
            return false;
        }

        var keyList = "";
        for( var i = 0; i < keys.length; i++ )
        {
            if( keyList.indexOf(keys[i].key+",") == -1 ) {
                keyList += keys[i].key;
                if( i < keys.length-1 ) {
                    keyList+=",";
                }
            }
        }

        var checked = (document.getElementById('singleDir').checked)?("on"):("off");
        var exclude = $('input[name=incinvoice]:checked', '#dateform').val();
        
        var sessionIDRequest = new XMLHttpRequest();
        sessionIDRequest.open("POST", 'BlobServ?keys='+keyList+"&singleDir=" + checked + "&" + "incinvoice="+exclude, true );
        keys = [];
        
        sessionIDRequest.onreadystatechange = function() {
            
            if( this.readyState == 4 && this.status == 200 ) {
                console.log(this.responseText);
                
                var ret = setInterval(function() {
                    if( document.cookie.indexOf("querierSendFinished") != -1 ) {
                        clearInterval(ret);
                        deleteCookie("querierSendFinished");
                        toggleLoading(false, toggleFade());
                    }
                }, 500);
                
                window.location.href = "BlobServ?sessionid="+this.responseText;
            }else if(this.readyState == 4 && this.status == 404 ) {
                toggleLoading(false, function() {
                    alert("404 error on file download.");
                });
            }
        }
        sessionIDRequest.send();
        
        return false;
    });
});
