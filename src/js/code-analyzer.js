import * as esprima from 'esprima';
import * as splitter from 'split-string';
import {generateFC} from './flowchart';
import {substitutionRec,substitute} from './substituteStatement';

const parseCode = (codeToParse) => esprima.parseScript(codeToParse);
const apllySubstituteAndMerge = (oldSym,newSym) => {
    return Object.assign({},oldSym,newSym);
};

export const varDeclarToSymbolGlobal = (ast,symbolValue)=>{
    let newSymbols={};
    ast.declarations.forEach(elm => {
        newSymbols[elm.id.name] = substitute(elm.init,symbolValue);
    });
    return apllySubstituteAndMerge(symbolValue,newSymbols);
};


const parseInputs = (inputToParse,funcParams) =>{
    let symbols = {};
    const mapFunction = (e) => e.body[0].expression;
    let parsedInputs = splitter(inputToParse, {brackets: true, separator: ',' }).map(parseCode);
    if(parsedInputs[0].body.length === 0) return symbols;
    let vals = parsedInputs.map(mapFunction);
    for(let i=0; i< funcParams.length;i++){
        symbols[funcParams[i].name]=vals[i];
    }
    return symbols;
};


const getGlobalsAndFunc = (parsedCode)=>{
    let parsedFunc;
    let symbolValue = {};
    let bodyAst = parsedCode.body;
   
    for( let i = 0; i<bodyAst.length ; i++){
        if(bodyAst[i].type==='VariableDeclaration')
            symbolValue = varDeclarToSymbolGlobal(bodyAst[i],symbolValue);
        if(bodyAst[i].type==='FunctionDeclaration'){
            parsedFunc = bodyAst[i];
            break;
        }
    }
    parsedFunc.params.forEach((e)=>{
        symbolValue[e.name]=null;
    });
    
    return {symbolValue, parsedFunc};
};

const mainParser = (codeToParse,inputToParse) =>{
    let parsedCode = parseCode(codeToParse);
    let {symbolValue,parsedFunc} = getGlobalsAndFunc(parsedCode);
    let symbolValueInput = parseInputs(inputToParse, parsedFunc.params);
    let funcAfterSub = substitutionRec(parsedFunc,symbolValue,symbolValueInput);
    let generatedHtml = generateFC(funcAfterSub.ast);
    return generatedHtml;
};


export {parseCode,mainParser};
