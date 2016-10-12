import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class App extends Component {

  constructor() {
    super();
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);

    this.state = {
      startX: 0,
      startY: 0,
      moveX: 0,
      moveY: 0,
    }
  }

  componentDidMount() {
    window.addEventListener('touchstart', this.handleTouchStart);
    window.addEventListener('touchmove', this.handleTouchMove);
    window.addEventListener('touchend', this.handleTouchEnd);
  }

  handleTouchStart(e) {
    const { moveX, moveY } = this.state;

    const startX = -moveX + e.changedTouches[0].clientX;
    const startY = -moveY + e.changedTouches[0].clientY;
    const touch = true;
    this.setState({ startX, startY, touch });
  }

  handleTouchMove(e) {
    const { startX, startY } = this.state;
    const moveX = e.changedTouches[0].clientX;
    const moveY = e.changedTouches[0].clientY;
    this.setState({ moveX: moveX-startX, moveY: moveY-startY });
  }

  handleTouchEnd(e) {
    const { moveX, moveY } = this.state;
    const endX = moveX;
    const endY = moveY;
    const touch = false;
    this.test = true;
    this.setState({ endX, endY, touch, moveX: 0, moveY: 0 });
  }

  render() {
    let style = {
      transform: `translateX(${this.state.moveX}px) translateY(${this.state.moveY}px)`, height: 'inherit',
    };

    var size = {
      width: window.innerWidth || document.body.clientWidth,
      height: window.innerHeight || document.body.clientHeight
    };
    console.log(size);

    if(this.test) {
      let styleSheet = document.styleSheets[0];
      let keyframes = `@-webkit-keyframes reset2 {
        from { transform: translateX(${this.state.endX}px) translateY(${this.state.endY}px)} 
        to { transform: translateX(0px) translateY(0px) } 
      }`;
      styleSheet.insertRule(keyframes, styleSheet.cssRules.length);

      style = {
        transform: `translateX(0px)`, height: 'inherit',
        animation: 'reset2 .3s ease-out',
      };

      this.test = false;
    }

    return (
      <div className="App" style={{ width: '100%', height: '100%', overflow: 'hidden', zoom: 1 }}>
        <div
          style={style}
        >
          <div className="App-header" style={{ position: 'absolute', left: 0 }}>
            <h2>Welcome to React</h2>
          </div>
          <div className="App-header" style={{ position: 'absolute', left: '100%' }}>
            <h2>Welcome to React</h2>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
