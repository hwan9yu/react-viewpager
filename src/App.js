import React, { Component } from 'react';
import ReactViewPager from './ReactViewPager';

class App extends Component {

  render() {
    return (
      <div>
        <ReactViewPager
          isHorizontal={true}
        >
          <div key="1" style={{ background: 'red', height: '100%' }}>
            1
          </div>
          <div key="2" style={{ background: 'green', height: '100%' }}>
            2
          </div>
          <div key="3" style={{ background: 'blue', height: '100%' }}>
            3
          </div>
        </ReactViewPager>
      </div>
    );
  }
}

export default App;
