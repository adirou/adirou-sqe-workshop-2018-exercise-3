import $ from 'jquery';
import {mainParser} from './code-analyzer';
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
    // style symbol types
    'symbols': {
        'start': {
          'font-color': 'red',
          'element-color': 'green',
          'fill': 'yellow'
        },
        'end':{
            'class': 'end-element'
        }
    },
    // even flowstate support ;-)
    'flowstate' : {
        // 'past' : { 'fill' : '#CCCCCC', 'font-size' : 12},
         'flow' : {'fill' : 'green', 'font-color' : 'red', 'font-weight' : 'bold'},
        // 'future' : { 'fill' : '#FFFF99'},
        'request' : { 'fill' : 'blue'}//,
        // 'invalid': {'fill' : '#444444'},
        // 'approved' : { 'fill' : '#58C4A3', 'font-size' : 12, 'yes-text' : 'APPROVED', 'no-text' : 'n/a' },
        // 'rejected' : { 'fill' : '#C45879', 'font-size' : 12, 'yes-text' : 'n/a', 'no-text' : 'REJECTED' }
      }
    };

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let input = $('#inputToFunc').val();
        let parsedCode = mainParser(codeToParse,input);
        //$('#parsedCode').html(parsedCode);
        console.log(parsedCode);
        const diagram = flowchart.parse(parsedCode);
            //`op1=>operation: x = 1\n
//| flow\n`
      //      );

        diagram.drawSVG('diagram',opt);
        //diagram = flowchart.parse('op1=>operation: x = 1 \n | flow');
        //var diagram = flowchart.parse('st=>start: Start:>http://www.google.com[blank]\n' +
        //         'e=>end:>http://www.google.com\n' +
        //         'op1=>operation: My Operation\n' +
        //         'st->op1(right)\n' +
        //         'op2=>operation: Stuff|current\n' +
        //         'sub1=>subroutine: My Subroutine\n' +
        //         'cond=>condition: Yes \n' + // use cond(align-next=no) to disable vertical align of symbols below
        //         'or No?\n:>http://www.google.com\n' +
        //         'c2=>condition: Good idea|rejected\n' +
        //         'io=>inputoutput: catch something...|request\n' +
        //         'op1(right)->cond\n' +
        //         'cond(yes, right)->c2\n' + // conditions can also be redirected like cond(yes, bottom) or cond(yes, right)
        //         'cond(no)->sub1(left)->op1\n' + // the other symbols too...
        //         'c2(true)->io->e\n' +
        //         'c2(false)->op1'  //allow for true and false in conditionals
        //         );
        //  diagram.drawSVG('diagram');

        // you can also try to pass options:

        //diagram.drawSVG('diagram',opt);
    });
    const strr= 'cond1=>condition: true | flow\n'+
    'op1=>operation: x = 5 | flow\n'+
    'op2=>operation: x = 3 | flow\n'+
    'op3=>operation: x = 2 \n'+
    'cond1(yes)->op1\n'+
    'cond1(no)->op2\n';
    console.log(strr);
    //const diagram = flowchart.parse(strr);

    //diagram.drawSVG('diagram',opt);
});
// cond1=>condition: x| flow
// op1=>operation: x = 1
// | flow
// op2=>operation: x = 3
// | flow
// cond1(yes)->op1

//                   cond1(no)->op2
    
