/****************************************************
 Cubbi.es for Safari
 2011 by arlogattonero <http://dia.so/arlogattonero>
 v.1.2.0
*****************************************************/

/*****************************************************************************
 * THIS SNIPPET: Copyright 2004 ThoughtWorks, Inc
 * Licensed under the Apache License, Version 2.0 */
 function absolutify(url,baseUrl){if(/^\w+:/.test(url)){return url}var loc;try{loc=parseUrl(baseUrl)}catch(e){if(/^\w:\\/.test(baseUrl)){baseUrl="file:///"+baseUrl.replace(/\\/g,"/");loc=parseUrl(baseUrl)}else{throw new SeleniumError("baseUrl wasn't absolute: "+baseUrl);}}loc.search=null;loc.hash=null;if(/^\//.test(url)){loc.pathname=url;var result=reassembleLocation(loc);return result}if(!loc.pathname){loc.pathname="/"+url;var result=reassembleLocation(loc);return result}if(/\/$/.test(loc.pathname)){loc.pathname+=url;var result=reassembleLocation(loc);return result}loc.pathname=loc.pathname.replace(/[^\/\\]+$/,url);var result=reassembleLocation(loc);return result}var URL_REGEX=/^((\w+):\/\/)(([^:]+):?([^@]+)?@)?([^\/\?:]*):?(\d+)?(\/?[^\?#]+)?\??([^#]+)?#?(.+)?/;function parseUrl(url){var fields=['url',null,'protocol',null,'username','password','host','port','pathname','search','hash'];var result=URL_REGEX.exec(url);if(!result){throw new SeleniumError("Invalid URL: "+url);}var loc=new Object();for(var i=0;i<fields.length;i++){var field=fields[i];if(field==null){continue}loc[field]=result[i]}return loc}function reassembleLocation(loc){if(!loc.protocol){throw new Error("Not a valid location object: "+o2s(loc));}var protocol=loc.protocol;protocol=protocol.replace(/:$/,"");var url=protocol+"://";if(loc.username){url+=loc.username;if(loc.password){url+=":"+loc.password}url+="@"}if(loc.host){url+=loc.host}if(loc.port){url+=":"+loc.port}if(loc.pathname){url+=loc.pathname}if(loc.search){url+="?"+loc.search}if(loc.hash){var hash=loc.hash;hash=loc.hash.replace(/^#/,"");url+="#"+hash}return url}
/*****************************************************************************/

/*
Copyright (C) 2011 by Diaspora, Inc.

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

var dom = {};
dom.query = jQuery.noConflict(true);
var boxshadow;

var Cubbies = {
  server: 'cubbies.heroku.com',
  protocol: 'https',
  selectedClass: 'cubbies-selected',
  
  initialize: function(){
	Cubbies.appendCSS();
    Cubbies.wrapImages();
    Cubbies.removeGetExtensionLinks();

    // listen for image clicks
    dom.query("img").live("click", function(evt){
      if(evt.shiftKey == 1){
        Cubbies.sendPhoto(dom.query(this));
        return false;
      }
    });

    // listen for iframe close message from server
    if (window.addEventListener) {
      // For standards-compliant web browsers
      window.addEventListener("message", Cubbies.removeIframe, false);
    } else {
      window.attachEvent("onmessage", Cubbies.removeIframe);
    }
  },

  removeGetExtensionLinks: function(evt){
    dom.query('.cubbies-browser-extension-link').remove();
  },
  
  removeIframe: function(evt){
    if (evt.origin + "/" == Cubbies.url()) {
      setTimeout(function(){
        dom.query('#cubbies-overlay').fadeOut(300, function(){ dom.query(this).remove() });
      }, 2000);
    }
  },

  wrapImages: function(){
    dom.query("img").live("mouseover", function(evt){
      element = dom.query(this);
      Cubbies.imageSelected(element,evt);
    });

    dom.query("img").live("mouseout", function(evt){
      dom.query(this).removeClass(Cubbies.selectedClass);
      dom.query(document).unbind("mousemove");
    });
  },

  imageSelected: function(element, evt){
    dom.query(document).mousemove(function(evt){
      if(evt.shiftKey == 1){
        element.addClass(Cubbies.selectedClass);
      } else {
        element.removeClass(Cubbies.selectedClass);
      }
    });
  },

  sendPhoto: function(image){
    var currentPage = Cubbies.attributify(document.location, image),
        imageUrl = absolutify(image.attr('src'), currentPage);
        createLocation = "add_photo.html?url=" + encodeURIComponent(imageUrl) + "&attribution=" + encodeURIComponent(currentPage) + "&height=" + image.height() + "&width=" + image.width() + "&origin=" + document.location.href;

    var iframe = document.createElement('iframe');
    iframe.id = "cubbies-overlay";
    iframe.width = 370;
    iframe.height = 90;
    iframe.src = Cubbies.url() + createLocation;
    document.body.appendChild(iframe);
  },

  url: function(){
    return Cubbies.protocol + "://" + Cubbies.server + "/";
  },

  attributify: function(location, image){
    // special case tumblr's dashboard page to get a more correct attribution link
    if(location.host == "www.tumblr.com"){
      var parentLink = image.parent('a');
      if(parentLink.length > 0){
        return(parentLink.attr('href'));
      }
      return(location.href);
    }
    return(location.href);
  },

  getSettings: function(evt) {
    // get webkit-box-shadow property color from safari settings
	if (evt.name == "boxShadowColor") {
        boxshadow = evt.message;
		Cubbies.debug(boxshadow);
		Cubbies.initialize();
	}
  },

  appendCSS: function(){
	var stylesheet = document.createElement('style');
    stylesheet.innerHTML = "" +
      "img, #cubbies-overlay{ -webkit-transition-property: margin, box-shadow, z-index; -webkit-transition-duration: 0.1s; }\n" +
      ".cubbies-selected{ z-index: 9999; -webkit-box-shadow: 3px 3px 8px -1px #" + boxshadow + " !important; cursor: pointer !important; margin: -3px 3px 3px -3px; }\n" +
      ".cubbies-selected:active{ -webkit-box-shadow: 2px 2px 5px -1px #909 !important; margin: -1px 1px 1px -1px; }\n" +
      "#cubbies-overlay{ position: fixed; z-index: 9999; bottom: 30px; left: 30px; -webkit-box-shadow: 0 2px 3px rgba(0,0,0,0.8); border: none; }\n" +
      "#cubbies-overlay:hover{ -webkit-box-shadow: 0 2px 3px rgb(0,0,0); }"
    document.body.appendChild(stylesheet);
  },

  debug: function(str){
    try {
      console.log(str);
    } catch(e) { } 
  }
},
$window = dom.query(window);

dom.query(document).ready(function(){
   if($window.height() > 100 && $window.width() > 300){
		safari.self.tab.dispatchMessage("getShadowColor", "cubbies-box-shadow");
		safari.self.addEventListener("message", Cubbies.getSettings, false);
		Cubbies.debug('Cubbi.es');
	}
});
