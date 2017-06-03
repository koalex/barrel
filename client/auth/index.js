/*** ✰✰✰ Konstantin Aleksandrov ✰✰✰ ***/
/*
 ================================
 ===       MODULE NAME       ====
 ================================
 */

'use strict';

import React, { Component, PropTypes } from 'react/react.js';
import ReactDOM from 'react-dom';
import { browserHistory } from 'react-router';

export default class Auth extends Component {

    // жизненный цикл компонента
    // https://facebook.github.io/react/docs/component-specs.html
    constructor (props) { // props
        super(props);
        injectTapEventPlugin();
    }

    state = {};

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


    componentDidMount () {
        // console.log('refs =', this.refs);
        // ReactDOM.findDOMNode - нужен для поиска дом в реакктовской компоненте, например <Article ref="test2">
        // console.log('refs 2 =', ReactDOM.findDOMNode(this.refs.test2));

    }

    render () {

        return (
            <h1></h1>
        )
    }

}