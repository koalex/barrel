/*** ✰✰✰ Konstantin Aleksandrov ✰✰✰ ***/
 /* 
   ================================
   ===       MODULE NAME       ====
   ================================ 
*/

'use strict';

/*
 Author: ✰ Konstantin Aleksandrov ✰

 File Structure :
     1.  Reset
     2.  Print

 */


/************************
 1. Styles import
************************/

import styles from './index.styl';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import React, { Component, PropTypes } from 'react/react.js';
// import PureRenderMixin from 'react/lib/ReactComponentWithPureRenderMixin';
import classNames from 'classnames';

import ReactGridLayout, { Responsive, WidthProvider } from 'react-grid-layout';
const ResponsiveReactGridLayout = WidthProvider(Responsive);


import logo from '../assets/img/logo.svg';

export default class Dashboard extends React.Component {
    constructor (props) { // props
        super(props);
    }

    state = {};

    render () {
        const layout = [
            { i: 'a', x: 0, y: 0, w: 1, h: 2, static: true },
            { i: 'b', x: 1, y: 0, w: 3, h: 2, minW: 2, maxW: 4 },
            { i: 'c', x: 4, y: 0, w: 1, h: 2 }
        ];

        const gridClasses = classNames({
            layout: true
        });

        return (
            <div>
                <ReactGridLayout className={gridClasses} layout={layout} cols={12} rowHeight={30} width={1200}>
                    <div key={'a'}>a</div>
                    <div style={{ textAlign: 'center' }} key={'b'}>
                        <img src={logo} className={styles.logo} alt=""/>
                    </div>
                    <div key={'c'}>c</div>
                </ReactGridLayout>

                <ResponsiveReactGridLayout className="layout" layout={layout}
                                           breakpoints={{lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0}}
                                           cols={{lg: 12, md: 10, sm: 6, xs: 4, xxs: 2}}>
                    <div key={'a'}>a</div>
                    <div key={'b'}>b</div>
                    <div style={{ textAlign: 'center' }} key={'c'}>
                        <img src={logo} className={styles.logo} alt=""/>
                    </div>
                </ResponsiveReactGridLayout>
            </div>

        )
    }
}
