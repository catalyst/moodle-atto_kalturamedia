// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/*
 * @package    atto_kalturamedia
 * @copyright  2013 Damyon Wiese  <damyon@moodle.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

/**
 * @module moodle-atto_kalturamedia-button
 */

/**
 * Atto text editor kalturamedia plugin.
 *
 * @namespace M.atto_kalturamedia
 * @class button
 * @extends M.editor_atto.EditorPlugin
 */


var COMPONENTNAME = 'atto_kalturamedia',
    CSS = {
        URLINPUT: 'atto_kalturamedia_urlentry',
        NAMEINPUT: 'atto_kalturamedia_nameentry'
    },
    SELECTORS = {
        URLINPUT: '.' + CSS.URLINPUT,
        NAMEINPUT: '.' + CSS.NAMEINPUT
    };

Y.namespace('M.atto_kalturamedia').Button = Y.Base.create('button', Y.M.editor_atto.EditorPlugin, [], {
    _currentSelection: null,
    
    initializer: function() {
        this.addButton({
                //icon: 'e/icon',
                iconurl: M.cfg.wwwroot + '/lib/editor/atto/plugins/kalturamedia/pix/icon.png',
                title: 'Kaltura',
                buttonName: 'Kaltura',
                callback: this._kalturamedia
            });
    },
    _kalturamedia: function(){
        this._currentSelection = this.get('host').getSelection();
        if (this._currentSelection === false) {
            return;
        }
        
        var dialogue = this.getDialogue({
            headerContent: M.util.get_string('popuptitle', COMPONENTNAME),
            focusAfterHide: true,
            width: '800px',
            focusOnShowSelector: SELECTORS.URLINPUT
        });

        var iframe = Y.Node.create('<iframe></iframe>');
        // We set the height here because otherwise it is really small. That might not look
        // very nice on mobile devices, but we considered that enough for now.
        iframe.setStyles({
            height: '600px',
            border: 'none',
            width: '100%'
        });
        
        var embedButton = Y.Node.create('<button></button>');
        embedButton.setAttribute('id', 'KalturaMediaSubmit');
        embedButton.setAttribute('disabled', 'disabled');
        embedButton.setHTML(M.util.get_string('embedbuttontext', COMPONENTNAME));
        embedButton.hide();
        embedButton.on('click', this.embedItem, this);
        
        iframe.setAttribute('src', this._getIframeURL());
        
        var containter = Y.Node.create('<div></div>');
        containter.append(iframe);
        containter.append(embedButton);
        // Set the dialogue content, and then show the dialogue.
        dialogue.set('bodyContent', containter)
                .show();
    },
    
    _getIframeURL: function() {

        var args = Y.mix({
                    elementid: this.get('host').get('elementid'),
                    contextid: this._getCourseId(),
                    height: '600px',
                    width: '800px'
                },
                this.get('area'));
        return M.cfg.wwwroot + '/lib/editor/atto/plugins/kalturamedia/ltibrowse.php?' +
                Y.QueryString.stringify(args);
    },
    
    _getCourseId: function() {
        var courseId;
        var bodyClasses = document.getElementsByTagName('body')[0].className;
        var classes = bodyClasses.split(' ');
        for(i in classes)
        {
            if(classes[i].indexOf('course-') > -1)
                {
                    var parts = classes[i].split('-');
                    courseId = parts[1];
                }
        }
        
        return courseId;
    },
            
    embedItem: function(what) {
        var dialogue = this.getDialogue({
            focusAfterHide: null
        });        
        
        data = Y.one('#KalturaMediaSubmit')._getDataAttributes();
        embedInfo = {};
        for(param in data)
        {
            var isEmbedInfo = param.split('-');
            if(isEmbedInfo[0] == 'embedinfo')
            {
                embedInfo[isEmbedInfo[1]] = data[param];
            }
        }
        
        var token = M.util.get_string('kalturauritoken', COMPONENTNAME); //'kaltura-kaf-uri.com'; // TODO - replace this to come from lang or something more dynamic (PHP)
        var url = '';
        var parser = document.createElement('a');
        parser.href = embedInfo.url;
        var basePathName = parser.pathname;
        // IE fix because parser.pathname does not return with trailing slash
        if(basePathName.indexOf('/') != 0)
        {
            basePathName = '/' + basePathName;
        }
        url = token + basePathName + parser.search;
        
        var content = '<a href="http://'+url+'">tinymce-kalturamedia-embed||'+embedInfo.title+'||'+embedInfo.width+'||'+embedInfo.height+'</a>';
        
        host = this.get('host');
        host.setSelection(this._currentSelection);
        host.insertContentAtFocusPoint(content);
        this.markUpdated();
        dialogue.set('bodyContent', "").hide();
        
    }
    
}
);
