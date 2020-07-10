import {Button} from "antd";
import React from "react";
import {
    addTaskDefinition,
    doNotSortAfterQuery,
    doSortAfterQuery, generateCode,
    generateIndex,
    makeSortNo,
    makeSortYes, options,
    removeTheLastTask
} from './logic_process';
import 'antd/dist/antd.css';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons';
import './guide.css'
import { Input } from 'antd';
import { InputNumber } from 'antd';
import {UnControlled as CodeMirror} from "react-codemirror2";
import 'codemirror/lib/codemirror.js';
import 'codemirror/mode/python/python';
import 'codemirror/addon/fold/foldcode.js';
import 'codemirror/addon/fold/foldgutter.js';
import 'codemirror/addon/fold/brace-fold.js';
import 'codemirror/addon/fold/comment-fold.js';
import 'codemirror/theme/darcula.css';
import 'codemirror/lib/codemirror.css';
import 'codemirror/addon/fold/foldgutter.css';

const { TextArea } = Input;

function App() {
    return (
        <div className="app-container">
            <div className="app-middle-content">
                <label id="app-title">Guide Of Data Process</label>
                <div id="app-questions">
                    <label id="app-questions-label">step</label>
                    <div id="app-question-one">
                        <p className="app-question-description">1. 是否需要按时间排序？</p>
                        <div id="app-question-one-controller-group">
                            <Button id="app-question-one-button-yes"
                                    type="primary" size="small"
                                    onClick={makeSortYes}
                            >yes</Button>
                            <Button id="app-question-one-button-no"
                                    type="primary" size="small"
                                    onClick={makeSortNo}
                            >no</Button>
                        </div>
                    </div>
                    <div id="app-question-two">
                        <p className="app-question-description">2. 第一次扫描，任务定义（收集＋过滤）： </p>
                        <div id="app-question-two-controller-group">
                            <Button id="app-question-two-button-add"
                                    type="primary"
                                    shape="circle"
                                    size='small'
                                    icon={<PlusOutlined />}
                                    onClick={addTaskDefinition}/>
                            <Button id="app-question-two-button-remove"
                                    type="primary"
                                    shape="circle"
                                    size='small'
                                    icon={<MinusOutlined />}
                                    onClick={removeTheLastTask}/>
                        </div>
                    </div>
                    <div id={"app-question-three"}>
                        <p className="app-question-description">3. 自动查询数据库</p>
                        <div className={""}>

                        </div>
                    </div>
                    <div id={"app-question-six"}>
                        <p className="app-question-description">4. 是否需要对查询数据按时间排序？</p>
                        <div id="app-question-six-controller-group">
                            <Button id="app-question-six-button-yes"
                                    type="primary" size="small"
                                    onClick={doSortAfterQuery}
                            >yes</Button>
                            <Button id="app-question-six-button-no"
                                    type="primary" size="small"
                                    onClick={doNotSortAfterQuery}
                            >no</Button>
                        </div>
                    </div>
                    <div id={"app-question-four"}>
                        <p className="app-question-description">5. 建立索引</p>
                        <div id="app-question-four-controller-group">
                            <Button id="app-question-four-button"
                                    type="primary"
                                    size="small"
                                    onClick={generateIndex}
                            >Gen Index</Button>
                        </div>
                        <div id="app-question-four-indexer-group">

                        </div>
                    </div>
                    <div id={"app-question-seven"}>
                        <p className="app-question-description">6. 申请数据分区：</p>
                        <div id="app-question-seven-controller-group">
                            <label className={"app-label"}>申请数量：</label>
                            <InputNumber id={"app-question-seven-input"} size="small" defaultValue={0}/>
                        </div>
                    </div>
                    <div id={"app-question-five"}>
                        <p className="app-question-description">7. 第二次扫描，定义数据构造器：</p>

                        <div id="app-question-five-controller-group">
                            <Button id="app-question-five-button"
                                    type="primary"
                                    size="small"
                                    onClick={generateCode}
                            >Gen Code</Button>
                        </div>
                        <div className="app-vertical-gap">
                            <TextArea id="app-logic-code"
                                   // placeholder="# Write you logic code here!"
                                   autoSize={{ minRows: 20 }}
                            />
                        </div>
                    </div>
                    <div id={"app-final"}>
                        <Button id="app-question-six-button-no"
                                type="primary" size="small"
                                onClick={doNotSortAfterQuery}
                        >Gen Program</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;