import React from 'react';
import { withState } from 'recompose';
import Popover from 'material-ui/Popover';
import RaisedButton from 'material-ui/RaisedButton';

const ButtonWithPopup = ({ style, label, onClick, timeout = 1000, children, anchorElement, setAnchorElement }) => {
  let timerId;
  const onMouseDown = ({ target }) => {
    if (timerId) {
      clearTimeout(timerId);
    }

    timerId = setTimeout(() => {
      timerId = 0;
      setAnchorElement(target);
    }, timeout);
  };

  const onMouseUp = () => {
    if (timerId) {
      onClick();
    }
  };

  return (
    <div style={style}>
      <RaisedButton label={label} onMouseDown={onMouseDown} onMouseUp={onMouseUp} />
      <Popover
        open={!!anchorElement}
        anchorEl={anchorElement}
        anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
        targetOrigin={{ horizontal: 'left', vertical: 'top' }}
        onRequestClose={() => setAnchorElement(null)}
      >
        {children}
      </Popover>
    </div>
  );
};

const { PropTypes } = React;
ButtonWithPopup.propTypes = {
  style: PropTypes.object,
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  timeout: PropTypes.number,
  children: PropTypes.object.isRequired,

  // State
  anchorElement: PropTypes.bool,

  // State Actions
  setAnchorElement: PropTypes.func.isRequired,
};

export default withState('anchorElement', 'setAnchorElement', null)(ButtonWithPopup);
