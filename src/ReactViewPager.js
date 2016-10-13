import React, { Component, PropTypes } from 'react';
const INTERPORATION_INTERVAL = 125;

class ReactViewPager extends Component {

  constructor(props) {
    super(props);
    this.getTouchPos = this.getTouchPos.bind(this);
    this.getSize = this.getSize.bind(this);
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);

    const size = this.getSize();
    this.state = {
      startX: 0,
      startY: 0,
      moveX: 0,
      moveY: 0,
      // pivot : 현재 보여줄 페이지의 좌표
      pivotX: props.nowPageX ? props.nowPageX * size.width : 0,
      pivotY: props.nowPageY ? props.nowPageY * size.height : 0,
      endX: 0,
      endY: 0,
      // nowPage : 현재 보여줄 페이지의 번호
      nowPageX: props.nowPageX ? props.nowPageX : 0,
      nowPageY: props.nowPageY ? props.nowPageY : 0,
      // maxPage : 최대로 넘어갈 페이지의 수
      maxPageX: props.nowPageX ? props.maxPageX : props.children.length - 1,
      maxPageY: props.nowPageY ? props.maxPageY : props.children.length - 1,
    };

    this.resetTrigger = false;
    this.interporateTimer = 0;

    this.startTime = new Date();
    this.endTime = new Date();

    this.preMoveX = 0; // 디바운스 인터폴레이션을 위함
    this.preMoveY = 0;

    this.animationCnt = 0;
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
    this.preMoveX = 0;
    this.preMoveY = 0;
    this.setState({ startX, startY });
  }

  handleTouchMove(e) {
    this.endTime = new Date();
    this.interporateTimer += this.endTime - this.startTime;
    this.startTime = this.endTime;

    if (this.interporateTimer >= INTERPORATION_INTERVAL) {
      const { startX, startY } = this.state;
      const touchPos = this.getTouchPos(e);
      this.preMoveX = this.state.moveX;
      this.preMoveY = this.state.moveY;
      const moveX = touchPos.x - startX;
      const moveY = touchPos.y - startY;
      this.setState({ moveX, moveY });
    }
  }

  getSize() {
    return {
      width: window.innerWidth || document.body.clientWidth,
      height: window.innerHeight || document.body.clientHeight,
    };
  }
  getTouchPos(e) {
    return {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY,
    };
  }
  handleTouchEnd(e) {
    const { startX, startY, maxPageX, maxPageY } = this.state;
    let { nowPageX, nowPageY } = this.state;
    const { isHorizontal, isVertical } = this.props;
    let { sensitivity } = this.props;
    if (!sensitivity) sensitivity = 20;
    const size = this.getSize();
    const touchPos = this.getTouchPos(e);
    const endX = touchPos.x;
    const endY = touchPos.y;

    const deltaX = endX - startX;
    const deltaY = endY - startY;

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

    this.preMoveX = 0;
    this.preMoveY = 0;
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
    const fromTransY = isVertical ? `translateY(${endY - startY}px)` : '';
    const toTransX = isHorizontal ? `translateX(${-pivotX}px)` : '';
    const toTransY = isVertical ? `translateY(${-pivotY}px)` : '';

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
      transform: `${toTransX} ${toTransY}`,
      animation: 'reset .3s ease-out',
      height: 'inherit',
    };
  }

  getGroupStyle() {
    const { moveX, moveY, pivotX, pivotY } = this.state;
    const { isHorizontal, isVertical } = this.props;
    const { preMoveX, preMoveY } = this;

    const prePosX = isHorizontal ? preMoveX - pivotX : 0;
    const prePosY = isVertical ? preMoveY - pivotY : 0;
    const posX = isHorizontal ? moveX - pivotX : 0;
    const posY = isVertical ? moveY - pivotY : 0;

    let style = {
      transform: `translateX(${prePosX}px) translateY(${prePosY}px)`,
      height: 'inherit',
    };

    if (this.interporateTimer >= 100) {
      const styleSheet = document.styleSheets[0];
      this.animationCnt += 1;
      const keyframes = `@-webkit-keyframes interpolate${this.animationCnt} {
        from {
          transform: translateX(${prePosX}px) translateY(${prePosY}px);
        }
        to {
          transform: translateX(${posX}px) translateY(${posY}px);
        } 
      }`;
      styleSheet.insertRule(keyframes, styleSheet.cssRules.length);
      style.animation = `interpolate${this.animationCnt} ${this.interporateTimer}ms linear`;
      this.interporateTimer = 0;
    }

    if (this.resetTrigger) {
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
      return children.map((child, sequence) =>
        <div key={`${sequence}`} style={{ ...childStyle, left: size.width * sequence }}>
          {child}
        </div>
      );
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

ReactViewPager.propTypes = {
  children: PropTypes.array.isRequired,
  isHorizontal: PropTypes.bool,
  isVertical: PropTypes.bool,
  nowPageX: PropTypes.number,
  nowPageY: PropTypes.number,
  maxPageX: PropTypes.number,
  maxPageY: PropTypes.number,
  sensitivity: PropTypes.number,
};

export default ReactViewPager;
