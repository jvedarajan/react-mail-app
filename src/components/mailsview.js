import React from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import EmptyMail from '../components/emptymail';
import ViewMail from '../components/viewmail';
import { AppConsumer } from '../context'
import { createBrowserHistory } from "history";
const history = createBrowserHistory();

class AllMails extends React.Component {

    constructor(props) {
        console.log(props);
        super(props);
        this.state = { paths: [], loadMailType: this.props.selected, hover: true };
        this.otherRef = this.focusedRef = this.mailsRef = React.createRef();
    }

    componentWillReceiveProps = (nextprops) => {
        this.setState({ loadMailType: nextprops.selected });
    }

    renderMails = (mailStates) => {
        const loadMailType = this.state.loadMailType;
        const getMails = mailStates[loadMailType];

        return getMails.map((mail, i) => {
            const pathUrl = loadMailType;
            this.state.paths.push(pathUrl);
            const mailContent = mail.content.slice(0, 50).replace(/<\/?[^>]+(>|$)/g, "");
            const setRowId = loadMailType + '_' + i;
            return (<li key={i} id={setRowId} onMouseOver={() => { this.handleOnHoverIn(setRowId) }} onMouseOut={() => { this.handleOnHoverOut(setRowId) }}> <Link to={{ pathname: pathUrl, replace: true, search: '?mId=' + mail.mId }} >
                <h5 className="mail-from">Outlook Team</h5>
                <p className="mail-subject">{mail.subject}</p>
                <p className="mail-content">{mailContent}</p>
            </Link > {this.renderDeleteIcon(loadMailType, i, setRowId)}<div className='tooltip' >{mailContent}</div></li>
            );
        });
    }

    renderDeleteIcon = (loadMailType, i, setRowId) => {
        if (loadMailType !== 'deleted')
            return <span className='delete-icon' onClick={() => this.handleDeleteMail(loadMailType, i)} onMouseOut={() => { this.handleOnHoverOut(setRowId) }}><i className="fa fa-trash" aria-hidden="true"></i></span>
    }

    handleOnHoverIn = (rowId) => {
        this.setState({ hover: true });
        this.handleClassAddTooltip(rowId);
    }

    handleOnHoverOut = (rowId) => {
        this.setState({ hover: false });
    }

    handleDeleteMail = (mailType, rowIndex) => {
        const mailData = this.props.mailStates[mailType][rowIndex];
        this.callApiDeleteMailAction(mailType, mailData);
    }

    callApiDeleteMailAction = async (mailType, mailData) => {
        const deletedMails = this.props.mailStates.deleted;
        const checkFlag = deletedMails.map(function (e) { return e.mId; }).indexOf(mailData.mId) > -1;
        if (!checkFlag) {
            mailData['type'] = mailType;
            const getMails = this.props.mailStates[mailType];
            const getMailIndex = getMails.map(function (o) { return o.mId; }).indexOf(mailData.mId);

            this.props.mailStates[mailType] = getMails.splice(getMailIndex - 1, getMailIndex) ;
            const frozenObj = Object.freeze(mailData);
            this.props.mailStates.deleted = Object.freeze(deletedMails.concat(frozenObj));
            this.renderMails(this.props.mailStates);
        }
        /*  const response = await fetch('/api/deleteMail',
              {
                  method: 'POST',
                  body: JSON.stringify({
                      mailData
                  }),
                  headers: { "Content-Type": "application/json" }
              });
          const body = await response.json();
          if (response.status !== 200) throw Error(body.message);
          if (body.status === "OK") {
  
          }*/
    }

    handleClassAddTooltip = (rowId) => {
        const getElements = this.mailsRef.current;
        const allLi = getElements.querySelectorAll('li');
        // const hoverState = this.state.hover;
        allLi.forEach((element) => {
            const findLiId = element.getAttribute('id');
            element.classList.add(findLiId === rowId ? 'tooltip-on-hover' : 'hoverout');
            if (findLiId === rowId) {
                element.classList.add('hover-li');
            } else {
                element.classList.remove('hover-li');
            }
        });
    }

    changeMailOptions = (type) => {
        if (type === 'focused') {
            this.otherRef.current.classList.remove('active');
            this.focusedRef.current.classList.add('active');
        } else {
            this.otherRef.current.classList.add('active');
            this.focusedRef.current.classList.remove('active');
        }
    }

    render() {
        return (
            <Router history={history}>
                <AppConsumer>
                    {context => {
                        return (
                            <React.Fragment>
                                <div className="all-mails-block">
                                    <div className="all-mails-inbox">
                                        <ul className="focused-other">
                                            <li ref={this.focusedRef} className="active" onClick={() => { this.changeMailOptions('focused') }}>Focused</li>
                                            <li ref={this.otherRef} className="" onClick={() => { this.changeMailOptions('other') }}>Other</li></ul>
                                        <ul ref={this.mailsRef}>
                                            {this.renderMails(this.props.mailStates)}
                                        </ul>
                                    </div>
                                </div>
                                <div className="mail-view-block">
                                    <Route exact path="/" component={EmptyMail} />
                                    <Route path={`/inbox`} component={() => <ViewMail mailStates={context} selected='inbox' />} />
                                    <Route path={`/spam`} component={() => <ViewMail mailStates={context} selected='spam' />} />
                                    <Route path={`/sent`} component={() => <ViewMail mailStates={context} selected='sent' />} />
                                    <Route path={`/deleted`} component={() => <ViewMail mailStates={context} selected='deleted' />} />
                                </div>
                            </React.Fragment>
                        )
                    }}
                </AppConsumer>
            </Router>
        )
    }
}

export default AllMails;