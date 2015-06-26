/*
    Ajaxee version 0.8.0
    http://www.ajaxee.org
	
    The MIT License (MIT)
    
    Copyright (c) 2015 Martin Herceg
    
    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:
    
    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.
    
    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    THE SOFTWARE.
 */



(function ($){
	// API
    $.ajaxee = function( param1 ) {
        var options;

        if ( typeof param1 == "string" ) {
            // ajaxee( <url> );
            jQuery.ajax({
                'url' : param1
                ,'success' : function( data , status , xhr ) {
                    ajaxObj.processResponse( xhr );
                }
            });
            
        } else if ( typeof param1 == "object" && param1.constructor == Array ) {
            // ajaxee( {options} );
            options = param1;
            
            if ( typeof options.success !== "undefined" ) {
                options.success = function( data , status , xhr ) {
                    ajaxObj.processResponse( xhr );
                }
            }
            
            jQuery.ajax( options );
        }
            
    }
    
    $.ajaxeeData = function( data ) {
    	return ajaxObj.processJsonResponse( data );
    }
    
    $.ajaxeeJSON = function( jsonString ) {
    	return ajaxObj.processJsonString( jsonString );
    }
    
    // processing
    var ajaxObj = {
    	processResponse:function( jqXHR ) {
            return ajaxObj.processJsonString( jqXHR.responseText );
    	},
    	processJsonString : function ( jsonString ) {
    		var json = jQuery.parseJSON( jsonString );
//    		if (json && json.result && json.result.ret === true){
    			return ajaxObj.processJsonResponse( json );
/*    		} else {
    		  if (jqXHR.status != 0){
          			console.log("Pri operacii nastala chyba:" + jsonString);
          			alert("Chyba servera! " + jsonString);
              	  }
    			return false;
    		}    	    
    		*/
    	},
    	processJsonResponse:function( json ) {
    	    var result;
    	    if ( json.result ) {
    	    	// backward compatibility
    	        result = json.result;
    	    } else {
    	        result = json;
    	    }
    	    
    	    if ( typeof result.type == "undefined" && result.op ) {
    	        result.type = result.op;
    	    }
    	    
    		switch( result.type ) {
    			case "uidialog" :
    				return ajaxObj.processUIDialog( result );
    			case "inline" :
    				return ajaxObj.processInline( result );
    			case "dialog" :
    				return ajaxObj.processDialog( result );
    			case "none" :
    				return ajaxObj.processNone( result );
    			case "confirm" :
    				return ajaxObj.processConfirm( result );
    			case "jsEval" :
    				return ajaxObj.processJSEval( result );
    			case "multi" :
    				return ajaxObj.processMulti( result );
    			case "value" :
    				return ajaxObj.processValue( result );
    			// new
    			case "inner":
    			    return ajaxObj.processInner( result );
    			case "replace":
    			    return ajaxObj.processReplace( result );
    			case "append":
    			    return ajaxObj.processAppend( result );
                case "js" :
    				return ajaxObj.processJSEval( result );
    			default:
    				alert( "ajaxee unknown type:" + result.type );
    		}		
    	},
    	processValue : function( json ) {
    		/*
    		 * json.id - id
    		 * json.selector - jquery css3 selector
    		 * json.data = value
    		 * 
    		 */
    		var el;
    		if ( json.id ) {
    			el = jQuery( document.getElementById( json.id ) );
    		} else if ( json.selector ) {
    			el = jQuery( json.selector );
    		}
    		
    		if ( ( typeof el == "undefined" || el.length <= 0 ) && json.optional !== true ) {
    //			alert("wrn: Cant find id:" + json.id);
    		} else {
    			// TODO : checkbox, select, radiobutton, textarea,
    			el.val( json.data );			
    		}
    		return json.ret;
    	},
    	processUIDialog:function( json ) {
    		/*
    		 * json.id - dialog id
    		 * json.title - dialog title
    		 * json.str - dialog content
    		 * json.op - dialog op "show"/"hide"
    		 * 
    		 */		
    		if ( json.op && json.op === "hide" )
    			ajaxObj.hideUIDialog( json );
    		else
    			ajaxObj.showUIDialog( json );
    		return json.ret;
    	},
    	processDialog:function( json ) {
    		alert( json.data );
    		return json.ret;
    	},
    	processInline:function( json ) {
    		/*
    		 * json.id
    		 * json.selector
    		 * json.data
    		 * json.inlineType - inner/replace
    		 * 
    		 */
    		
    		var el;
    		if ( json.id ) {
    			el = jQuery( document.getElementById( json.id ) );
    		} else if ( json.selector ) {
    			el = jQuery( json.selector );
    		}
    				
    		if ( ( typeof el == "undefined" || el.length <= 0 ) && json.optional !== true ) {
    			//alert("wrn: Cant find id:" + json.id);
    		}
    		if ( json.inlineType == "inner" ) {
    			el.html( json.data );
    		} else if ( json.inlineType == "replace" ) { // replace
    			el.replaceWith( json.data );
    		} else if ( json.inlineType == "innerAppend" ) {
//    			console.log(el.length);
    			el.append( json.data );
    		} else {
    			alert( "ajaxee processInline - unknown type : " + json.inlineType );
    		}
    		return json.ret;
    	},
    	processInner : function( json ) {
    		var el;
    		if ( json.id ) {
    			el = jQuery( document.getElementById( json.id ) );
    		} else if ( json.selector ) {
    			el = jQuery( json.selector );
    		}
    				
    		if ( ( typeof el == "undefined" || el.length <= 0 ) && json.optional !== true ) {
    			//alert("wrn: Cant find id:" + json.id);
    		}

			el.html( json.data );
    		return json.ret;
    	},
    	processReplace : function( json ) {
    		var el;
    		if ( json.id ) {
    			el = jQuery( document.getElementById( json.id ) );
    		} else if ( json.selector ) {
    			el = jQuery( json.selector );
    		}
    				
    		if ( ( typeof el == "undefined" || el.length <= 0 ) && json.optional !== true ) {
    			//alert("wrn: Cant find id:" + json.id);
    		}
    		
			el.replaceWith( json.data );
			
    		return json.ret;
    	},
    	processAppend : function( json ) {
    		var el;
    		if ( json.id ) {
    			el = jQuery( document.getElementById( json.id ) );
    		} else if ( json.selector ) {
    			el = jQuery( json.selector );
    		}
    				
    		if ((typeof el == "undefined" || el.length <= 0) && json.optional !== true){
    			//alert("wrn: Cant find id:" + json.id);
    		}
    		
			el.append( json.data );
			
    		return json.ret;
    	},
    	processNone : function( json ) {
    		return json.ret;
    	},
    	processConfirm : function( json ) {
    		if ( confirm( json.data.str ) ) {
    			// do ajax request
    			$.ajax({
    				url : json.data.url
    				,complete : function( jqXHR ) {
    					ajaxObj.processResponse( jqXHR );
    				}
    			});
    		}
    		return json.ret;
    	},
    	showUIDialog : function( json ) {
    		var minWidth = 400;
    		if ( typeof json.data.minWidth != "undefined" )
    			minWidth = json.data.minWidth;
    			
    		$( "#" + json.id )
    //			.attr("title",json.data.title)
    			.html( json.data.str )
    			.dialog({
    				minWidth : minWidth
    				,title : json.data.title
    			});
    	},
    	hideUIDialog : function( json ) {
    		$( "#" + json.id )
    			.dialog( "destroy" )
    			.html( "" );
    		return json.ret;
    	},
    	processJSEval : function( json ) {
    		eval( json.data );
    		return json.ret;
    	},
    	processMulti : function( json ) {
    		var ret = true;
    		for ( var i = 0; i < json.data.length; i++ ) {
    			if ( ajaxObj.processJsonResponse( json.data[i] ) === false ) {
    				ret = false;
    			}
    		}
    		return json.ret;
    	}
    }
    
    $.fn.ajaxee = $.ajaxee;
    $.fn.ajaxeeData = $.ajaxeeData;
    $.fn.ajaxeeJSON = $.ajaxeeJSON;
    
    return this;
        
}( jQuery ) );
