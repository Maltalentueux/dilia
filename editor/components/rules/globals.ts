import {Component, View} from 'angular2/core';

let globalsCss = require<string>('./globals.css');
let globalsTemplate = require<string>('./globals.html');

@Component({
    selector: 'rule-editor-globals'
})
@View({
    templateUrl: globalsTemplate,
    styles: [globalsCss]
})
export class RuleEditorGlobals {

}