import * as evalExpression from 'eval-expression';
import {toString} from './buildStrings';
import {varDeclarToSymbol} from './code-analyzer';
export const substitutionRec=(parsedAst,symbolValue,input)=>{
    if(!parsedAst) return {ast:null,symbolValue};
    return subsFunc[parsedAst.type](parsedAst,symbolValue,input);  
};

const substitutionFunction = (parsedAst,symbolValue,input)=>
    ({ast:{type:'func',
        name: parsedAst.id.name,
        params: parsedAst.params,
        body: substitutionRec(parsedAst.body,symbolValue,input).ast},
    symbolValue});

const substitutionVariable = (parsedAst,symbolValue)=>{
    const body = parsedAst.declarations.map(elm =>
        ({type: 'assign', left: elm.id.name, right:toString(elm.init) }));
    return {ast:{type:'block',body},symbolValue:varDeclarToSymbol(parsedAst,symbolValue)};
}
const substitutionExpression = (parsedAst,symbolValue,input)=>{
    if(parsedAst.expression.type!=='AssignmentExpression')
        return {ast:null,symbolValue};
    else 
    {
        let expr = toString(parsedAst.expression.right);
        let newSub = varDeclarToSymbol(parsedAst.expression,symbolValue);
        
        return { ast: {type: 'assign', left: parsedAst.expression.left.name, right: expr},
            symbolValue: newSub };
    }
};
const substitutionIf = (parsedAst,symbolValue,input)=>
    ({ast:{type:'ifElse',
        test: ExpressionExpander(parsedAst.test,symbolValue,input),
        consequent: substitutionRec(parsedAst.consequent,symbolValue,input).ast,
        alternate: substitutionRec(parsedAst.alternate,symbolValue,input).ast},
    symbolValue});
const substitutionWhile = (parsedAst,symbolValue,input)=>
    ({ast:{type:'while',
        test: ExpressionExpander(parsedAst.test,symbolValue,input),
        body: substitutionRec(parsedAst.body,symbolValue,input).ast},
    symbolValue});

const substitutionBlockStatement = (parsedAst,symbolValue,input)=>{
    let body=[];
    for(let i=0;i<parsedAst.body.length;i++){
        let astSym = substitutionRec(parsedAst.body[i],symbolValue,input);
        symbolValue = astSym.symbolValue;
        if(astSym.ast.type==='block')
            body=[...body,...astSym.ast.body];
        else
            body=[...body,astSym.ast];
    }
    return {ast:{type:'block',body},
        symbolValue};
};

const substitutionReturn = (parsedAst,symbolValue,input)=>(
    {ast:{type:'return',
        arg: ExpressionExpander(parsedAst.argument,symbolValue,input)},
    symbolValue});



const subsFunc={
    FunctionDeclaration:substitutionFunction,
    VariableDeclaration:substitutionVariable,
    ExpressionStatement:substitutionExpression,
    IfStatement:substitutionIf,
    WhileStatement:substitutionWhile,
    BlockStatement:substitutionBlockStatement,
    ReturnStatement:substitutionReturn};

export const substitute = (ast,symbolTable) =>
    !ast?null:
        subFuncs[ast.type]!==undefined?
            subFuncs[ast.type](ast,symbolTable):null;

const subMemberExpression = (ast,substitution) =>{
    let object = substitute(ast.object,substitution); 
    let property = substitute(ast.property,substitution); 
    return Object.assign(ast,{object,property});
};

const subBinaryExpression= (ast,substitution) => {
    let left = substitute(ast.left,substitution);
    let right = substitute(ast.right,substitution);
    return Object.assign(ast,{left,right});
};

const subUnaryExpression = (ast,substitution) =>{
    let argument = substitute(ast.argument,substitution);  
    return Object.assign(ast,{argument});
};
/*
const subUpdateExpression = (ast,substitution) => {
    let argument = substitute(ast.argument,substitution);  
    return Object.assign(ast,{argument});
};*/
const subIdentifier = (ast,substitution) => substitution[ast.name]===undefined? ast: substitute(substitution[ast.name],substitution);

const subLiteral= (ast) => ast;

const subArrayExpression = (ast,substitution) =>{
    const subWithSubst = (ast)=> substitute(ast,substitution);
    let elements = ast.elements.map(subWithSubst);  
    return Object.assign(ast,{elements});
};

const subFuncs =  { MemberExpression:subMemberExpression,
    StaticMemberExpression:subMemberExpression,
    UnaryExpression:subUnaryExpression,
    BinaryExpression: subBinaryExpression,
    // UpdateExpression: subUpdateExpression,
    Literal : subLiteral,
    Identifier : subIdentifier,
    ArrayExpression: subArrayExpression};

const ExpressionExpander = (expr,symbolValue,input) => {
    let str = toString(expr);
    let expr1 = substitute(expr,symbolValue);
    let strToEval=toString(expr1,input);
    return {expression:str,color:evalExpression(strToEval)?'green':'red',isTrue:evalExpression(strToEval)?true:false};
};