
/**
 * Extensions to Prototype. Tested with v1.6.0.3
 * 
 *  (c) 2009 Eric Nguyen
 *
 *  Freely distributable under the same terms of an MIT-style license that
 *  Prototype uses. For details, see the Prototype web site: 
 *  http://www.prototypejs.org/
 *
 * Includes parts of the following:
 *
 *  - extensions to Form.Element.enable/disable for buttons
 *
 *  - Cursor position code
 *
 *  - getters and setters for form radio and checkbox inputs
 * 
 *  - Ajax.Request.abort
 *    (from http://blog.pothoven.net/2007/12/aborting-ajax-requests-for-prototypejs.html)
 */

Object.extend( Form.Element.Methods, {
  
  getValue: function(element) {
    element = $(element);
    var method;
     // detect radio button and checkbox collections
    if ("length" in element && "type" in element[0] && element[0].type == "radio") {
      method = "manyRadioSelector";
    } else if ("length" in element && "type" in element[0] && element[0].type == "checkbox") {
        method = "manyCheckboxSelector";
    } else {
      method = element.tagName.toLowerCase();
    }
    return Form.Element.Serializers[method](element);
  },
  
  setValue: function(element, value) {
    element = $(element);
    var method;
    // detect radio button and checkbox collections
    if ("length" in element && "type" in element[0] && element[0].type == "radio") {
      method = "manyRadioSelector";
    } else if ("length" in element && "type" in element[0] && element[0].type == "checkbox") {
        method = "manyCheckboxSelector";
    } else {
      method = element.tagName.toLowerCase();
    }
    Form.Element.Serializers[method](element, value);
    return element;
  },
  
  disable: function(element) {
    element = $(element);
    element.disabled = true;
    if ( element.type == "button" ) {
      element.addClassName( "disabled" );
    }
    return element;
  },

  enable: function(element) {
    element = $(element);
    element.disabled = false;
    if ( element.type == "button" ) {
      element.removeClassName( "disabled" );
    }
    return element;
  },
  
  setCursorPosition: function(element, start, end) {
    if (end == null) end = start;
    if( element.setSelectionRange ) {
      element.setSelectionRange(start,end);
    } else if( element.createTextRange ) {
      var range = element.createTextRange();
      range.collapse(true);
      range.moveEnd('character',end);
      range.moveStart('character',start);
      range.select();
    }
    return element;
  },
  
  getCursorPosition: function(element) {
    if (element.setSelectionRange) {
      // Mozilla or FireFox Code
      return element.selectionStart;
      
    } else if (document.selection && document.selection.createRange) {
      // Internet Explorer Code
      // from http://stackoverflow.com/questions/164147/character-offset-in-an-internet-explorer-textrange
      function getRangeOffsetIE( r ) {
        var end = Math.abs( r.duplicate().moveEnd('character', -1000000) );
        // find the anchor element's offset
        var range = r.duplicate();
        r.collapse( false );
        var parentElm = range.parentElement();
        var children = parentElm.getElementsByTagName('*');
        for (var i = children.length - 1; i >= 0; i--) {
          range.moveToElementText( children[i] );
          if ( range.inRange(r) ) {
            parentElm = children[i];
            break;
          }
        }
        range.moveToElementText( parentElm );
        return end - Math.abs( range.moveStart('character', -1000000) );
      }
      return getRangeOffsetIE( document.selection.createRange() );
    }
  }
});

Object.extend( Form.Element.Serializers, {
  manyRadioSelector: function(elements, value) {
    if (Object.isUndefined(value)) {
      var checkedRadio = $A(elements).find(function(radio) { return radio.checked; });
      return (checkedRadio ? checkedRadio.value : null);
    } else {
      var checkedRadio = $A(elements).find(function(radio) { return radio.value == value; });
      if (checkedRadio) checkedRadio.checked = true; 
    }
  },
  
  manyCheckboxSelector: function(elements, values) {
    if (Object.isUndefined(values)) {
      var checkedCbs = $A(elements).findAll(function(cb) { return cb.checked; });
      return (checkedCbs ? checkedCbs.pluck("value") : []);
    } else {
      return $A(elements).findAll( function(cb) { 
       cb.checked = values.member(cb.value);
       return cb.checked;  
      });
    }
  }
});

// Re-bind form element methods
Element.addMethods();
Field = Form.Element;
$F = Form.Element.Methods.getValue;

/**
 * Ajax.Request.abort
 * extend the prototype.js Ajax.Request object so that it supports an abort method
 */
Ajax.Request.prototype.abort = Ajax.Updater.prototype.abort = function() {
  // prevent and state change callbacks from being issued
  this.transport.onreadystatechange = Prototype.emptyFunction;
  // abort the XHR
  this.transport.abort();
  // update the request counter
  Ajax.activeRequestCount--;
};