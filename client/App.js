/*** ✰✰✰ Konstantin Aleksandrov ✰✰✰ ***/
/*
 ================================
 ===       MODULE NAME       ====
 ================================
*/

'use strict';

import React, { Component, PropTypes } from 'react/react.js';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
import injectTapEventPlugin from 'react-tap-event-plugin';

import Dashboard from './dashboard';

export default class Logo extends Component {

    // жизненный цикл компонента
    // https://facebook.github.io/react/docs/component-specs.html
    constructor (props) { // props
        super(props);
        injectTapEventPlugin();
        this.state = {};
    }

    // state = {};

    static defaultProps = {
        /*articles: [],
         some: 'defaultProps'*/
    };

    static propTypes = { // https://facebook.github.io/react/docs/reusable-components.html
        // articles: PropTypes.array // articles должен быть массив
        // onLayoutChange: React.PropTypes.func.isRequired
    };

    handleOpen = () => {
        this.setState({ open: true });
    };

    handleClose = () => {
        this.setState({ open: false });
    };

    componentDidMount () {
        // console.log('refs =', this.refs);
        // ReactDOM.findDOMNode - нужен для поиска дом в реакктовской компоненте, например <Article ref="test2">
        // console.log('refs 2 =', ReactDOM.findDOMNode(this.refs.test2));

    }

    render () {

        return (
            <MuiThemeProvider>
                <Dashboard/>
            </MuiThemeProvider>
        )
    }

}