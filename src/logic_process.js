import {CodeMirror} from "codemirror/lib/codemirror";
import {fromTextArea} from "codemirror";

let globalContext = {
    "sort": false,
    "first_scan": [],
    "lambdas": [],
    "sort_after_query": false,
    "make_index": []
};

let editor;
export function initCodeEditor() {
    editor = fromTextArea(
        document.getElementById('app-logic-code'),
        {
            mode: "python",
            lineNumbers: true,
            theme: "dracula",
            lineWrapping: true,
            foldGutter: true,
            gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
            matchBrackets: true,
            tabSize: 4,
        }
    );
    editor.doc.setValue("# Write you logic code here!\n");
}

window.onload = initCodeEditor;

export function makeSortYes() {
    globalContext.sort = true;
    console.info(JSON.stringify(globalContext));
    document.getElementById('app-question-one').style.color = '#52c41a';
}

export function makeSortNo() {
    globalContext.sort = false;
    console.info(JSON.stringify(globalContext));
    document.getElementById('app-question-one').style.color = 'white';
}

let taskNumber = 0;

export function addTaskDefinition() {
    taskNumber++;
    let joinKeyLabel = document.createElement('label');
    joinKeyLabel.innerText = 'Join Key:';
    joinKeyLabel.style.color = '#e0861a';
    joinKeyLabel.style.fontWeight = 'bolder';
    joinKeyLabel.style.marginRight = '10px';
    joinKeyLabel.style.fontSize = '13px';
    // joinKeyLabel.style.marginTop = '20px';
    let joinKeyInput = document.createElement('Input');
    joinKeyInput.id = 'task-join-key-' + taskNumber.toString();
    joinKeyInput.placeholder = 'field';
    joinKeyInput.style.backgroundColor = '#3e4145';
    joinKeyInput.style.border = '0';
    // joinKeyInput.style.borderBottom = 'thin solid';
    joinKeyInput.style.marginRight = '10px';
    joinKeyInput.style.width = '110px';
    joinKeyInput.style.fontFamily = "monospace";
    joinKeyInput.style.fontSize = '13px';
    let lambdaLabel = document.createElement('label');
    lambdaLabel.innerText = 'lambda every , _collector_' + taskNumber.toString() + ":";
    lambdaLabel.style.position = 'relative';
    lambdaLabel.style.right = '0';
    lambdaLabel.style.fontWeight = 'bolder';
    lambdaLabel.style.fontSize = '13px';
    lambdaLabel.style.color = '#e0861a';
    lambdaLabel.style.marginRight = '10px';
    let lambdaInput = document.createElement('Input');
    lambdaInput.id = 'task-lambda-' + taskNumber.toString();
    lambdaInput.placeholder = 'python code';
    lambdaInput.style.minWidth = '50%';
    lambdaInput.style.backgroundColor = '#3e4145';
    lambdaInput.style.border = '0';
    lambdaInput.style.fontFamily = "monospace";
    lambdaInput.style.fontSize = '13px';
    // lambdaInput.style.borderBottom = 'thin solid';
    let taskElement = document.createElement('div');
    taskElement.setAttribute('id', 'task-' + taskNumber.toString());
    taskElement.style.marginTop = '10px';
    taskElement.style.marginBottom = '10px';
    taskElement.appendChild(joinKeyLabel);
    taskElement.appendChild(joinKeyInput);
    taskElement.appendChild(lambdaLabel);
    taskElement.appendChild(lambdaInput);
    console.info(JSON.stringify(taskElement));
    document.getElementById('app-question-two').appendChild(taskElement);
    console.info(JSON.stringify(globalContext));
}

export function removeTheLastTask() {
    if (taskNumber < 1) {
        alert("No task can be removed!");
        return;
    }
    let target = document.getElementById('task-' + taskNumber.toString());
    if (target) {
        document.getElementById('app-question-two').removeChild(target);
    }
    taskNumber--;
}

let indexNumber = 0;

export function generateIndex() {
    if (taskNumber < 1) {
        alert("please set step 2 first!");
        return;
    }
    let tasks = [];
    let lambdas = [];
    indexNumber = 0;
    document.getElementById('app-question-four-indexer-group').innerHTML = null;
    for (let idx = 0; idx < taskNumber; idx++) {
        indexNumber++;
        tasks[idx] = document.getElementById("task-join-key-" + (idx + 1).toString()).value;
        lambdas[idx] = document.getElementById('task-lambda-' + (idx + 1).toString()).value;
        globalContext.lambdas = lambdas;
        let indexItem = document.createElement('div');
        indexItem.style.marginTop = '10px';
        indexItem.style.marginBottom = '10px';
        let label = document.createElement('label');
        label.innerText = '索引' + (idx + 1).toString() + ":";
        label.style.right = '0';
        label.style.fontWeight = 'bolder';
        label.style.color = '#e0861a';
        label.style.marginRight = '10px';
        let input = document.createElement('Input');
        input.id = 'task-index-' + (idx + 1).toString();
        input.placeholder = tasks[idx];
        input.value = tasks[idx];
        input.style.minWidth = '70%';
        input.style.backgroundColor = '#3e4145';
        input.style.border = '0';
        input.style.fontFamily = "monospace";
        indexItem.appendChild(label);
        indexItem.appendChild(input);
        document.getElementById('app-question-four-indexer-group').appendChild(indexItem);
    }
    console.info(JSON.stringify(tasks));
}

let currentStep = 1;

export function next() {
    if (currentStep === 2) {

    } else if (currentStep === 4) {

    }
    currentStep++;
}

export function doSortAfterQuery() {
    globalContext.sort_after_query = true;
    document.getElementById('app-question-six').style.color = '#52c41a';
}

export function doNotSortAfterQuery() {
    globalContext.sort_after_query = false;
    document.getElementById('app-question-six').style.color = 'white';
}

export function generateCode() {
    if (taskNumber !== indexNumber) {
        alert("Gen index first!");
        return;
    }

    let tasks = [];
    let singleMulti = [];
    for (let idx = 0; idx < taskNumber; idx++) {
        tasks[idx] = document.getElementById("task-join-key-" + (idx + 1).toString()).value;
    }
    let manyIndex = [];
    for (let idx = 0; idx < taskNumber; idx++) {
        manyIndex[idx] = document.getElementById('task-index-' + (idx + 1).toString()).value;
        if (manyIndex[idx].search(', ')) {
            manyIndex[idx] = manyIndex[idx].split(', ');
        } else if (manyIndex[idx].search(',')) {
            manyIndex[idx] = manyIndex[idx].split(',');
        } else {
            manyIndex[idx] = [manyIndex[idx]];
        }
        if (manyIndex[idx][0] === tasks[idx] && manyIndex[idx].length > 1) {
            singleMulti[idx] = true;
        } else {
            singleMulti[idx] = false;
        }
    }
    let va = "\n";
    let pipelineNumber = document.getElementById('app-question-seven-input').value;
    let comment = "# Variables [";
    if (pipelineNumber > 0) {
        for (let idx = 0; idx < pipelineNumber; idx++) {
            va += "self._pipeline_" + idx.toString() + " = []\n";
            comment += "self._pipeline_" + idx.toString();
            if (idx !== pipelineNumber - 1) {
                comment += ", ";
            }
        }
        va += "self._pipeline_f = []\n";
        comment += ", self._pipeline_f";
    } else {
        va += "self._pipeline_t = []\nself._pipeline_f = []\n";
        comment += "self._pipeline_t, self._pipeline_f";
    }
    comment += "] provided.\n# 'joiner' represent single element, " +
        "\n# while 'joiners' represent multiple elements - list!\n";
    comment += "\ndef constructor(_data";
    for (let idx = 0; idx < taskNumber; idx++) {
        if (idx === 0) {
            comment += ", ";
        }
        comment += "_joiner" + (singleMulti[idx] ? "s" : "") + "_" + idx.toString();
        if (idx !== taskNumber - 1) {
            comment += ", ";
        }
    }
    comment += "):\n    # write your logic here.\n";
    comment += "    return _data";
    editor.doc.setValue(comment);
}