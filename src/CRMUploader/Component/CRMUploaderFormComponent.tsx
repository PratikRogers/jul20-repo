/* eslint-disable */
import * as React from 'react';
import { connect } from 'react-redux';
import MessageBox from '../../CommonComponent/MessageBox';
import { UserOps } from '../../ConstConfig/UserOps';
import { reportResponseAction, uploadCMRFile, updateProgressCRM, updateCRMStateMessage, requestCRMStat } from '../../Actions';
import { Configs } from '../../ConstConfig';
import { List } from 'immutable';
import RedUISpinner from '../../Panel/RedUISpinner';
import TableComponent from '../../CommonComponent/Table/TableComponent';
import { formatBytes } from '../utils/CRMUploaderUtil';
// TODO:  Module not found: Error: Can't resolve 'react-intl' - need to be fixed 
// import { FormattedNumber } from 'react-intl';

class CRMUploaderFormComponent extends React.Component<ICRMUploaderFormComponent, {}> {
     state: any;
     refArr: any;
     config: any;
     formData: any;
     fileDetail: any;
     sortedColumn: any;
     tableProps: any;
     searchText: any;

    constructor(props: any) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.refArr = [];

        this.handleSubmit = this.handleSubmit.bind(this);
        this.config = new Configs();
        this.renderFormatPanel = this.renderFormatPanel.bind(this);
        this.onControlsChange = this.onControlsChange.bind(this);
        this.onCheckBoxChange = this.onCheckBoxChange.bind(this);
        this.getDateSortedFormat = this.getDateSortedFormat.bind(this)
        this.getSortedStyle = this.getSortedStyle.bind(this)
        this.customSortStyle = this.customSortStyle.bind(this)
        this.getAllColView = this.getAllColView.bind(this)
        this.searchTextInTable = this.searchTextInTable.bind(this);
        this.populateCRMListTable = this.populateCRMListTable.bind(this);

        this.fileDetail = { name: "", size: 0 };
        this.sortedColumn = "creationTs";
        this.state = { uploadBtnDisabled: " disabled ", browseBtnDisabled: " ", fileName: "" ,fileTransInited:false, chkBoxChecked:false}
    }

    componentDidMount() {
        // window.scrollTo(0, 0)
        this.fileDetail = { name: "", size: 0 };
        this.props.resetProgress();
        this.props.resetUserMessage();
        this.props.handleDisableReportControls();
        this.populateCRMListTable();
    }

    componentDidUpdate() {
        // console.log("File upload status", this.props.progressBarStatus);
        if (this.props.progressBarStatus.loaded !== 1 && (this.props.progressBarStatus.loaded === this.props.progressBarStatus.total) && this.state.browseBtnDisabled === " disabled ") {
            this.setState({ uploadBtnDisabled: "  ", browseBtnDisabled: "  ", fileName: "", fileTransInited: false });
        }
    }

    populateCRMListTable() {
        console.log('UserOps.LISTALL_CRM ==', UserOps.LISTALL_CRM );
        this.props.initCRMList({ url: this.config.getCRMListUrl(), type: UserOps.LISTALL_CRM });
        this.props.initCRMList({ url: "", type: "" });
    }

    handleKey() { }
    renderFormatPanel() {
        if (this.props.CRMUploadStatus.hasOwnProperty("isUpldComp") && !this.props.CRMUploadStatus.isUpldComp) {
            return null;
        }
        return (<div className="col-xl-10 col-md-6 col-sm-8 col-12">
            <div className="form-group leftPos">
                <label htmlFor="formDescription">{this.props.CRMUploadStatus.msg}</label>
            </div>
        </div>)
    }

     onControlsChange(e: any) {
        if (e.target.files.length > 0) {
            this.props.resetProgress();
            this.props.resetUserMessage();

            this.fileDetail = { name: e.target.files[0].name, size: e.target.files[0].size };
            this.formData = new FormData();
            this.formData.append("file", e.target.files[0] || e.dataTransfer.file[0]);
            this.state.fileName = this.fileDetail.name;
            console.log('file picked');
            console.log(e);
            if (this.formData && this.state.chkBoxChecked) {
                this.state = { uploadBtnDisabled: "  ", browseBtnDisabled: "  ", fileName: this.fileDetail.name, fileTransInited:false, chkBoxChecked:true };
            }
            this.setState(this.state);
        }
    }

     onCheckBoxChange(e: any) {
        if (!this.state.fileTransInited) {
            const stateVal = { uploadBtnDisabled: " disabled ", browseBtnDisabled: "  ", fileName: this.fileDetail.name, fileTransInited:false, chkBoxChecked:false };
            if (this.formData && e.target.checked) {
                stateVal.uploadBtnDisabled = "  ";
                stateVal.chkBoxChecked = true;
            }
            else if (e.target.checked) {
                stateVal.chkBoxChecked = true;
            }
            this.setState(stateVal);
        }

    }
    changeCaret(order: any, column: any) { }
     customSortStyle(order: any, dataField: any) {
        if ((order && order === 'desc') || order === 'asc') {
            this.sortedColumn = dataField;
            return 'boldText';
        }
        return '';
    }
     focusText(ref: any, grpButton?: any, itemName?: any) {
        this.refArr.push(ref);
    }

     handleSubmit(e: any) {
        this.props.handleClicks({ url: this.config.getCRMFileUploadUrl(), type: UserOps.UPLOAD_FILE, payload: this.formData, fileSize: this.fileDetail.size, crmReportUrl: this.config.getCRMListUrl()});
        this.setState({ uploadBtnDisabled: " disabled ", browseBtnDisabled: " disabled ", fileName: this.state.fileName, fileTransInited: true });
        this.props.resetUserMessage();
        e.preventDefault();
    }

    searchTextInTable() {
        if (this.searchText && this.searchText != '')
            this.tableProps.search(this.searchText);
    }

    customSerachPanel = (props: any) => {
        this.tableProps = props;
        const contxt = this;
        function search(e: any) {
            contxt.searchText = e.target.value;
            props.search(e.target.value);
        }

        return (
            <div className="row-flex">
                <div className="col-md-12 pl-0 spaceTopTraits spaceTopTraitsmd  spaceTopTraitssmall spaceTopTraitsmob spaceBottom mb-3 order-mb-last">
                    <div className="col-xl-6 col-md-12 col-sm-12 col-12 pl-0 pl-custom pr-0 searchPanel order-mb-1">
                        <input type="text"
                            placeholder="Search by filename"
                            name="search"
                            onChange={search}
                        />
                        <button className=""
                            type="submit"
                            onClick={this.searchTextInTable}
                        >
                            <i className="searchBtnInactive float-right" />
                        </button>

                    </div>
                </div>

            </div>
        );
    };

    getSortedStyle(cell: any, row: any, formatExtraData: any, index: any) {
        const style = formatExtraData === this.sortedColumn ? ' boldText wrapWords' : 'wrapWords';
        if (formatExtraData === "fileStatus") {
            const formattedFileStatus = {
                "FILE_UPLOADED": { value: "Uploaded" },
                "FILE_PROCESSING": { value: "Processing" },
                "FILE_PROCESSED": { value: "Processed" },
                "FILE_FAILED": { value: "Failed" },
            }
            if (cell) {
                cell = formattedFileStatus[cell].value;
            }
        }
        const val = cell ? cell.toString() : '';
        return <span className={style}>{val}</span>;
    }

    getFormattedNumber(cell: any, row: any, formatExtraData: any, index: any) {
        if (cell && cell !== "") {
            console.log('cell===', cell);
            return <span >{cell}
                {/* <FormattedNumber value={cell.toString()}
                    style="decimal" minimumFractionDigits={0}
                    maximumFractionDigits={0} />  */}
                    </span>
        }
        return null;
    }

    getFormattedFileSize(cell: any, row: any, formatExtraData: any, index: any) {
        const val = cell ? cell.toString() : '';
        return <span>{formatBytes(val)}</span>;
    }

    getDateSortedFormat(cell: any, row: any, formatExtraData: any, index: any) {
        const style = formatExtraData === this.sortedColumn ? ' boldText ' : '';
        const respDate = cell.toString();
        return <span className={style}>{respDate}</span>;
    }

    getAllColView(cell: any, row: any, enumObject: any) {
        function getStatus(cell:any) {
            const formattedFileStatus = {
                "FILE_UPLOADED": { value: "Uploaded" },
                "FILE_PROCESSING": { value: "Processing" },
                "FILE_PROCESSED": { value: "Processed" },
                "FILE_FAILED": { value: "Failed" },
            }
            if (cell) {
                cell = formattedFileStatus[cell].value;
            }
            return cell;
        }
        return (
            <div className="listA">
                <div className="row-flex">

                    <div className="col-md-4 pl-0 pr-0">
                        <span>Uploaded On: </span>
                        <span className="wrapWords"> {row.creationTs}</span>
                    </div>
                    <div className="col-md-4 pl-0 pr-0">
                        <span>File Name: </span>
                        <span className="wrapWords"> {row.origFileName}</span>
                    </div>
                    <div className="col-md-4 pl-0 pr-0">
                        <span>File Size: </span>
                        <span > {formatBytes(row.fileSize)}</span>
                    </div>
                    <div className="col-md-4 pl-0 pr-0">
                        <span>Hash Count: </span>
                        <span> {row.hashCount}</span>
                    </div>
                    <div className="col-md-4 pl-0 pr-0">
                        <span>Status: </span>
                        <span> {getStatus(row.fileStatus)}</span>
                    </div>

                </div>
            </div>)
    }

     render() {
        const clsdisabled = this.state.uploadBtnDisabled;
        const pWidth = ((this.props.progressBarStatus.loaded / this.props.progressBarStatus.total) * 100);
        const progress = {
            width: pWidth + "%"
        };
        const lblChckBox = "This file is being uploaded in compliance with the Rogers Data Sharing Agreement and/or Data Sharing Terms & Conditions, as applicable.";
        const disableCheckBox = this.state.fileTransInited ? true : false;
        const spinnerState = { UIConfig: { isSpinnerActive: true } };
        const tableInput = {
            tableContent: this.props.crmItemList,
            tableContents: [
                {
                    dataField: 'logId',
                    dataSort: true,
                    changeCaret: this.changeCaret,
                    dataFormatMethod: this.getSortedStyle,
                    formatExtraData: 'logId',
                    // customSortStyle: this.customSortStyle,
                    searchable: false,
                    Title: 'ID',
                    hidden: true,
                    isKey: true
                },

                {
                    dataField: 'creationTs',
                    dataSort: false,
                    changeCaret: this.changeCaret,
                    dataFormatMethod: this.getSortedStyle,
                    formatExtraData: 'creationTs',
                    // customSortStyle: this.customSortStyle,
                    searchable: false,
                    tdStyle: { border: '1px solid #414042!' },
                    Title: 'Uploaded ON',
                    hidden: false,
                    isKey: false
                },

                {
                    dataField: 'origFileName',
                    dataSort: false,
                    changeCaret: this.changeCaret,
                    dataFormatMethod: this.getSortedStyle,
                    formatExtraData: 'origFileName',
                    // customSortStyle: this.customSortStyle,
                    searchable: true,
                    tdStyle: {},
                    Title: 'File Name',
                    isKey: false
                },
                {
                    dataField: 'fileSize',
                    dataSort: false,
                    changeCaret: this.changeCaret,
                    dataFormatMethod: this.getFormattedFileSize,
                    formatExtraData: 'fileSize',
                    // customSortStyle: this.customSortStyle,
                    searchable: false,
                    tdStyle: {},
                    Title: 'File Size',
                    isKey: false
                },
                {
                    dataField: 'hashCount',
                    dataSort: false,
                    changeCaret: this.changeCaret,
                    dataFormatMethod: this.getFormattedNumber,
                    formatExtraData: 'hashCount',
                    // customSortStyle: this.customSortStyle,
                    searchable: false,
                    tdStyle: {},
                    Title: 'Hash Count',
                    isKey: false
                },
                {
                    dataField: 'fileStatus',
                    dataSort: false,
                    changeCaret: this.changeCaret,
                    dataFormatMethod: this.getSortedStyle,
                    formatExtraData: 'fileStatus',
                    // customSortStyle: this.customSortStyle,
                    searchable: false,
                    tdStyle: {},
                    Title: 'Status',
                    isKey: false
                },
            ],
            pagination: false,
            search: true,
            tableOptions: {
                hidePageListOnlyOnePage: true,
                hideSizePerPage: true,
                sizePerPage: 20, // which size per page you want to locate as default

                searchPosition: 'left',
                customSerachPanel: this.customSerachPanel,

            },
            bordered: false,
            multiColumnSearch: false,
        };
        const tableInputSmall = {
            tableContent: this.props.crmItemList,
            tableContents: [
                {
                    dataField: 'origFileName',
                    dataSort: true,
                    changeCaret: this.changeCaret,
                    dataFormatMethod: this.getAllColView,
                    formatExtraData: 'origFileName',
                    customSortStyle: this.customSortStyle,
                    searchable: false,
                    Title: ' CRM Upload details',
                    hidden: false,
                    isKey: true
                },
            ],
            pagination: false,
            search: true,
            tableOptions: {
                hidePageListOnlyOnePage: true,
                hideSizePerPage: true,
                sizePerPage: 20, // which size per page you want to locate as default

                searchPosition: 'left',
                customSerachPanel: this.customSerachPanel,

            },
            bordered: false,
            multiColumnSearch: false,
        };
        return (
            <main role="main" className="container-fluid">
                <div className="row fixed-header-top ml-0 mr-0">
                    <div className="col-12">
                        <div className="float-left w-100 spacerB36 borderBottomGray">
                            <div className="col-xl-7 col-md-12 col-sm-12 col-12 pl-0 pr-0">
                                <h3 className="float-left">CRM Uploader</h3>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row-flex spaceTop">
                    <div className="w-100">
                        <form>
                            <label className="font-italic spacerB36 padLeftBot ">Please upload an Excel or CSV file. Valid headers for identifiers are email, phone, and device ID</label>
                            <div className="col-xl-9 col-md-8 col-sm-8 col-12">
                                <div className="form-group leftPos proposalSearch">

                                    <label htmlFor="formName">Please choose a CSV file to upload</label>
                                    <div className="form-group leftPos">
                                        <div className="fileinputs">
                                            <input type="file" className="file" onChange={this.onControlsChange} accept="*" />
                                            <div className="fakefile">
                                                <input type="text" value={this.state.fileName} onChange={this.handleKey} />
                                                <img src={require("../../svg/fileUpload.jpg")} height="30px" width="30px" />
                                            </div>
                                        </div>
                                        <div className="crmBox row-flex ">
                                            <input type="checkbox" value={lblChckBox} id={lblChckBox} onChange={this.onCheckBoxChange} disabled={disableCheckBox} /> <label htmlFor={lblChckBox}>{lblChckBox}</label>
                                        </div>
                                        <a className={clsdisabled + " btn btnPrimary float-left  col-md-4 col-sm-4 col-xl-2 "} href="#" role="button" onClick={this.handleSubmit}>Upload</a>
                                    </div>
                                    <div className="hSpacer20" />
                                    {this.props.progressBarStatus.total !== 1 &&
                                        <div className="graph-cont">
                                            <span className="bar-fill position-relative" style={{ ...progress }}>
                                                <span className="txt-center">{Math.trunc(pWidth)}%</span>
                                            </span>
                                        </div>
                                    }
                                </div>
                            </div>
                            {this.renderFormatPanel()}
                        </form>
                    </div>
                </div>
                <div>
                    <div className="col-xl-3 col-md-6 col-sm-8 col-12">
                        <label htmlFor="formName">RECENT UPLOADS</label>
                    </div>
                    <div className="spacerLeft d-desk-block d-ipad-none d-mb-none table-responsive-xl tableRedui">
                        <TableComponent tableInput={tableInput} />
                        <div className="hSpacer20" />
                        <div className="hSpacer20" />
                        <div className="hSpacer20" />
                        <div className="hSpacer20" />
                    </div>
                    <div className="d-desk-none d-ipad-block d-mb-block iPadLandscape-block">
                        <TableComponent tableInput={tableInputSmall} />
                        <div className="hSpacer20" />
                        <div className="hSpacer20" />
                        <div className="hSpacer20" />
                        <div className="hSpacer20" />
                    </div>
                </div>
                <MessageBox />
                <RedUISpinner UIConfStats={spinnerState} />
            </main>
        );
    }
}

function mapStateToProps(state: any) {
    return {
        CRMUploadStatus: state.CRMSMessagetate.hasOwnProperty("data") ? state.CRMSMessagetate.data : { isUpldComp: false, msg: "" },
        UIDialogstats: state.configState.hasOwnProperty("Dialog") && state.configState.Dialog.hasOwnProperty("MessageBox") ? state.configState.Dialog.MessageBox : { MessageBox: { isVisible: false, UserMessage: "", saveFailed: false } },
        crmItemList: state.CRMSListState.hasOwnProperty('CRMSList') ? state.CRMSListState.CRMSList : List([]),
        progressBarStatus: state.ProgressCRMState.hasOwnProperty("data") ? state.ProgressCRMState.data : { loaded: 1, total: 1 },
    };
}

export default connect(mapStateToProps, (dispatch) => {
    return {
        handleClicks(selectedItem: any) {
            const dummyUserObj = { type: UserOps.PULL_REPORT, data: selectedItem };
            dispatch(uploadCMRFile(dummyUserObj));
        },
        initCRMList(selectedItem: any) {
            const dummyUserObj = { type: UserOps.LISTALL_CRM, data: selectedItem };
            dispatch(requestCRMStat(dummyUserObj));
        },
        handleDisableReportControls() {
            const data = { data: { enableExcle: false, enablePPT: false, proposalExist: false, isReportExist: false } }
            dispatch(reportResponseAction(data));
        },
        resetProgress() {
            dispatch(updateProgressCRM({ data: { loaded: 1, total: 1 } }));
        },
        resetUserMessage() {
            dispatch(updateCRMStateMessage({ data: { msg: "" } }));
        }
    }
})(CRMUploaderFormComponent);

// * Need FC instead of Props in updated version to ectend interface.
// * FunctionComponent provides an implicit definition of children .
interface ICRMUploaderFormComponent extends React.FC<any> {
    errorMessage?: any;
    handleClicks?: any;
    initCRMList?: any;
    reportResponse?: any;
    handleDownloadClicks?: any;
    handleReportClick?: any;
    crmItemList?: any;
    handleDisableReportControls?: any;
    UIDialogstats?: any;
    resetProgress?: any;
    progressBarStatus?: any;
    CRMUploadStatus?: any;
    resetUserMessage?: any;
    history?: any;
}
