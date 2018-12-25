import $ from 'jquery';
import {mainParser} from './code-analyzer';
var flowchart = require('flowchart.js');

const opt={
    'x': 0,
    'y': 0,
    'line-width': 3,
    'line-length': 50,
    'text-margin': 10,
    'font-size': 14,
    'font-color': 'black',
    'line-color': 'black',
    'element-color': 'black',
    'fill': 'white',
    'yes-text': 'true',
    'no-text': 'false',
    'arrow-end': 'block',
    'scale': 1,
    'symbols': {
        'start': {
            'element-color': 'black',
        },
        'end':{
            'fill': 'green',
            'class': 'end-element'
        }
    },
    'flowstate' : {
        'flow' : {'fill' : 'green', 'font-color' : 'red', 'font-weight' : 'bold'},
        'request' : { 'fill' : 'blue'}
    }
};

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let input = $('#inputToFunc').val();
        let parsedCode = mainParser(codeToParse,input);
        const diagram = flowchart.parse(parsedCode);
        diagram.drawSVG('diagram',opt);
    });
});

    
