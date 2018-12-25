let op = 0;
let cond = 0;
const newOp = ()=>`op${++op}`;
const newCond = ()=>`cond${++cond}`;

const link = (key,parent) =>`${parent}->${key}\n`;
const link_cond = (key,parent) => `${parent}(no)->${key}\n`;
const link_h= (key) => (parent)=> parent.isCond?link_cond(key,parent.key):link(key,parent.key);
const generateLinks = (key,parents) => parents.map(link_h(key)).join('');

let richedToRetuen =false;
let boxIndex = 1;
export const generateFC = (func) => {
    boxIndex=0;
    richedToRetuen=false;
    const objWithLinks = FCgeneration(func.body,true);
    return 'st=>start\n'+ objWithLinks.obj+`st->${objWithLinks.key.key}\n`+objWithLinks.links;
};

export const FCgeneration = (ast,inFlow) =>{
    return functionsGeneration[ast.type](ast,inFlow);
};

const generateIfString = (ifSt,inFlow) => {
    const key = newCond();
    const str = `${key}=>condition: (${boxIndex++})\n--if--\n${ifSt.test.expression}${inFlow?'| flow':''}\n`;
    let consequence = FCgeneration(ifSt.consequent,inFlow && ifSt.test.isTrue);
    if(ifSt.alternate){
        let alt = FCgeneration(ifSt.alternate,inFlow && !ifSt.test.isTrue);
        const links = `${key}(yes)->${consequence.key.key}\n${key}(no)->${alt.key.key}\n`;
        return {obj:str + consequence.obj+alt.obj,links:links+consequence.links+alt.links,leaves:[...consequence.leaves, ...alt.leaves],key:{key}};
    }else{
        const links = `${key}(yes)->${consequence.key.key}\n`;
        return {obj:str + consequence.obj,links:links+consequence.links,leaves:[...consequence.leaves,{key,isCond:true}],key:{key}};
    }
     
};

const generateWhileString = (whileSt,inFlow) => {
    const key = newCond();
    const str = `${key}=>condition: (${boxIndex++})\n-while-\n${whileSt.test.expression}${inFlow?'| flow':''}\n`;
    
    const body = FCgeneration(whileSt.body,inFlow && whileSt.test.isTrue);
    const links = `${generateLinks(key,body.leaves)}${key}(yes)->${body.key.key}\n`; 
    return {obj:str +body.obj,links:links+body.links,leaves:[{key,isCond:true}],key:{key}};
};

const generateBlock = (blockSt,inFlow) => {//group assingments
    if(blockSt.body.length ===0){
        const key = newOp();
        return {obj:`${key}=>operation: (${boxIndex++})\nempty${inFlow?'| flow':''}\n`,links:'',leaves:[{key}],key:{key}};
    }
    return block_helper(blockSt.body,inFlow);
};
const checkReturnalready = (inFlow) => inFlow && !richedToRetuen;

const block_helper = (remainsSt,inFlow)=>{
    inFlow = checkReturnalready(inFlow);
    let i=0;
    let first;
    if(remainsSt[0].type==='assign'){
        for( ; i<remainsSt.length && remainsSt[i].type==='assign' ; i++);
        first = generateAssignments(remainsSt.slice(0,i),inFlow);
    }
    else {
        first = FCgeneration(remainsSt[0],inFlow);
        i++;
    }
    if(i===remainsSt.length)
        return {obj:first.obj,links:first.links,leaves:first.leaves,key:first.key};
    let next = block_helper(remainsSt.slice(i),inFlow);
    let links =first.links+generateLinks(next.key.key,first.leaves)+next.links; 
    let str = first.obj+next.obj;
    return {obj:str,links:links ,leaves:next.leaves,key:first.key};
};

const generateReturn = (returnSt,inFlow) => { //fix flow
    const key = newOp();
    richedToRetuen = richedToRetuen || inFlow;
    return {obj:`${key}=>end: (${boxIndex++})\nreturn ${returnSt.arg.expression}\n`,links:'',leaves:[],key:{key}};
};
const generateAssign = (assignSt) => {
    return `${assignSt.left} = ${assignSt.right}`;
};
const generateAssignments = (assignsSt,inFlow)  => {
    const key = newOp();
    const assigns = assignsSt.map(generateAssign).join('\n');
    return {obj:`${key}=>operation: (${boxIndex++})\n${assigns}${inFlow?'| flow':''}\n`,links:'',leaves:[{key}],key:{key}};
};

const functionsGeneration ={assign:generateAssignments,block:generateBlock,ifElse:generateIfString,while:generateWhileString,return:generateReturn};