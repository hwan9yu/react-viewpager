import React, { Component } from 'react';
import './App.css';

class ReactViewPager extends Component {

  constructor(props) {
    super(props);
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);
    this.getTouchPos = this.getTouchPos.bind(this);
    this.getSize = this.getSize.bind(this);

    const size = this.getSize();
    this.state = {
      startX: 0,
      startY: 0,
      moveX:  0,
      moveY:  0,
      pivotX: props.nowPageX ? props.nowPageX * size.width : 0, // pivot : 현재 보여줄 페이지의 좌표
      pivotY: props.nowPageY ? props.nowPageY * size.height : 0,
      endX: 0,
      endY: 0,
      nowPageX: props.nowPageX ? props.nowPageX : 0, // nowPage : 현재 보여줄 페이지의 번호
      nowPageY: props.nowPageY ? props.nowPageY : 0,
      maxPageX: props.nowPageX ? props.maxPageX : props.children.length - 1, // maxPage : 최대로 넘어갈 페이지의 수
      maxPageY: props.nowPageY ? props.maxPageY : props.children.length - 1,
    };

    this.resetTrigger = false;
  }

  getSize() {
    return {
      width: window.innerWidth || document.body.clientWidth,
      height: window.innerHeight || document.body.clientHeight
    };
  }

  getTouchPos(e) {
    return {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY,
    }
  }

  componentDidMount() {
    window.addEventListener('touchstart', this.handleTouchStart);
    window.addEventListener('touchmove', this.handleTouchMove);
    window.addEventListener('touchend', this.handleTouchEnd);
  }

  handleTouchStart(e) {
    const { moveX, moveY } = this.state;
    const touchPos = this.getTouchPos(e);
    const startX = touchPos.x - moveX;
    const startY = touchPos.y - moveY;
    this.setState({ startX, startY });
  }

  handleTouchMove(e) {
    const { startX, startY } = this.state;
    const touchPos = this.getTouchPos(e);
    const moveX = touchPos.x;
    const moveY = touchPos.y;
    this.setState({ moveX: moveX-startX, moveY: moveY-startY });
  }

  handleTouchEnd(e) {
    const { startX, startY, maxPageX, maxPageY } = this.state;
    let { pivotX, pivotY, nowPageX, nowPageY } = this.state;
    const { isHorizontal, isVertical } = this.props;
    let { sensitivity } = this.props;
    if (!sensitivity) sensitivity = 20;

    const size = this.getSize();
    const touchPos = this.getTouchPos(e);
    const endX = touchPos.x;
    const endY = touchPos.y;

    const deltaX =  endX - startX;
    const deltaY =  endY - startY;

    if (isHorizontal) {
      if (deltaX >= sensitivity) {
        nowPageX -= 1;
      } else if (deltaX <= -sensitivity) {
        nowPageX += 1;
      }
    }

    if (isVertical) {
      if (deltaY >= sensitivity) {
        nowPageY -= 1;
      } else if (deltaY <= -sensitivity) {
        nowPageY += 1;
      }
    }

    if (nowPageX < 0) nowPageX = 0;
    if (nowPageY < 0) nowPageY = 0;
    if (nowPageX > maxPageX) nowPageX = maxPageX;
    if (nowPageY > maxPageY) nowPageY = maxPageY;

    this.resetTrigger = true;
    this.setState({
      endX: endX - this.state.pivotX, // don't remove this.state.
      endY: endY - this.state.pivotY,
      moveX: 0,
      moveY: 0,
      nowPageX,
      nowPageY,
      pivotX: size.width * nowPageX,
      pivotY: size.height * nowPageY,
    });
  }

  getResetActionStyle() {
    const {
      startX,
      startY,
      endX,
      endY,
      pivotX,
      pivotY,
    } = this.state;
    const { isHorizontal, isVertical } = this.props;
    const fromTransX = isHorizontal ? `translateX(${endX - startX}px)` : '';
    const fromTransY = isVertical? `translateY(${endY - startY}px)` : '';
    const toTransX = isHorizontal ? `translateX(${-pivotX}px)` : '';
    const toTransY = isVertical ? `translateY(${-pivotY}px))` : '';

    const styleSheet = document.styleSheets[0];
    const keyframes = `@-webkit-keyframes reset {
        from {
          transform: ${fromTransX} ${fromTransY};
        } 
        to {
          transform: ${toTransX} ${toTransY};
        } 
      }`;
    styleSheet.insertRule(keyframes, styleSheet.cssRules.length);

    return {
      transform: `translateX(${-pivotX}px) translateY(${-pivotY}px)`,
      animation: 'reset .3s ease-out',
      height: 'inherit',
    };
  }

  getGroupStyle() {
    const { moveX, moveY, pivotX, pivotY } = this.state;
    let { isHorizontal, isVertical } = this.props;
    const posX = isHorizontal ? moveX - pivotX : 0;
    const posY = isVertical ? moveY - pivotY : 0;

    let style = {
      transform: `translateX(${posX}px) translateY(${posY}px)`, height: 'inherit',
    };

    if(this.resetTrigger) {
      style = this.getResetActionStyle();
      this.resetTrigger = false;
    }

    return style;
  }

  createViews() {
    const size = this.getSize();
    const childStyle = {
      width: size.width,
      height: size.height,
      position: 'absolute',
    };

    const { children } = this.props;
    if (children) {
      return children.map((child, sequence) => {
        return (
          <div key={`${sequence}`} style={{ ...childStyle, left: size.width * sequence }}>
            {child}
          </div>
        );
      });
    }
    return [];
  }

  render() {
    const size = this.getSize();
    const style = this.getGroupStyle();

    return (
      <div
        style={{ width: size.width, height: size.height, overflow: 'hidden', zoom: 1 }}
      >
        <div style={style}>
          {this.createViews()}
        </div>
      </div>
    );
  }
}

export default ReactViewPager;
