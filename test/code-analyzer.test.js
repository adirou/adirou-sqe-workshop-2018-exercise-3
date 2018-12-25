import assert from 'assert';
import {parseCode,mainParser} from '../src/js/code-analyzer';
import {substitutionRec, substitute} from '../src/js/substituteStatement';
import {toString} from '../src/js/buildStrings';
describe('The javascript parser', () => {
    it('is parsing an empty function correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('')),
            '{"type":"Program","body":[],"sourceType":"script"}'
        );
    });

    it('is parsing a simple variable declaration correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('let a = 1;')),
            '{"type":"Program","body":[{"type":"VariableDeclaration","declarations":[{"type":"VariableDeclarator","id":{"type":"Identifier","name":"a"},"init":{"type":"Literal","value":1,"raw":"1"}}],"kind":"let"}],"sourceType":"script"}'
        );
    });

    it('big test', () => {
        let html = mainParser(`let a=2;
        function f(x,y,z){
        let a=3;c=4;
        if(x+z.length===2){
        while(y){
          x=3;
        }
        }else{
        
        }
        return x;
        }`,'1,2,[1,2,3]');
        assert.equal(html,'st=>start\nop1=>operation: (0)\na = 3\nc = 4| flow\ncond1=>condition: (1)\n--if--\n((x + z.length) === 2)| flow\ncond2=>condition: (2)\n-while-\ny\nop2=>operation: (3)\nx = 3\nop3=>operation: (4)\nempty| flow\nop4=>end: (5)\nreturn x\nst->op1\nop1->cond1\ncond1(yes)->cond2\ncond1(no)->op3\nop2->cond2\ncond2(yes)->op2\ncond2(no)->op4\nop3->op4\n');});
    it('with arrasy and unary and memberfunction', () => {
        let html = mainParser(`function f(x){let a=[2];x=-1; x=a[0];}`,'1');

        assert.equal(html,'st=>start\nop5=>operation: (0)\na = [2]\nx = -1\nx = a[0]| flow\nst->op5\n');
    });
    
    it('if without else', () => {
        let html = mainParser(`function f(x){if(0){if(0){}}else{}}`,'1');
        assert.equal(html,'st=>start\ncond3=>condition: (0)\n--if--\n0| flow\ncond4=>condition: (1)\n--if--\n0\nop6=>operation: (2)\nempty\nop7=>operation: (3)\nempty| flow\nst->cond3\ncond3(yes)->cond4\ncond3(no)->op7\ncond4(yes)->op6\n');
    });
    it('while in flow', () => {
        let html = mainParser(`function f(x){while(x){}}`,'1');
        assert.equal(html,'st=>start\ncond5=>condition: (0)\n-while-\nx| flow\nop8=>operation: (1)\nempty| flow\nst->cond5\nop8->cond5\ncond5(yes)->op8\n');
    });
    it('empty function', () => {
        let html = mainParser(`function f(){}`,'');
        assert.equal(html,'st=>start\nop9=>operation: (0)\nempty| flow\nst->op9\n');
    });
    it('toString', () => {
        let html = toString(null);
        assert.equal(html,'');
    });
    it('toString', () => {
        let html = toString({type:'dd'});
        assert.equal(html,'');
    });
    it('subrec', () => {
        let html = substitutionRec({type:'ExpressionStatement', expression:{type:'dd'}},{});
        assert.equal(JSON.stringify(html),JSON.stringify({ast:null,symbolValue:{}}));
    });
    it('substitute', () => {
        let html = substitute(null,{});
        assert.equal(html,null);
    });
    it('substitute', () => {
        let html = substitute({type:'dd'},{});
        assert.equal(html,null);
    });

});
