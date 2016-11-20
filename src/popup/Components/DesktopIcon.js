import React from 'react';
import { compose, withState } from 'recompose';

const colors = {
  regular: '#1D2D3C',
  hover: '#3899EC',
};

const MobileIconDef = ({ hovered, setHover }) => (
  <div
    onMouseEnter={() => setHover(true)}
    onMouseLeave={() => setHover(false)}
  >
    <svg width="34" height="34" viewBox="0 0 34 34">
      <g fillRule="evenodd" fill={hovered ? colors.hover : colors.regular}>
        <path d="M22 5c1.103 0 2 .897 2 2v20c0 1.103-.897 2-2 2h-9c-1.103 0-2-.897-2-2V7c0-1.103.897-2 2-2h9m0-1h-9a3 3 0 0 0-3 3v20a3 3 0 0 0 3 3h9a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3" />
        <path d="M13 8h9v15h-9V8zm9-1h-9a1 1 0 0 0-1 1v15a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1zM16 26h3v1h-3v-1z" />
      </g>
    </svg>
  </div>
);

const { bool, func, string } = React.PropTypes;
MobileIconDef.propTypes = {
  hoverColor: string,

  // State
  hovered: bool.isRequired,

  // State Actions
  setHover: func.isRequired,
};

const enhance = compose(
  withState('hovered', 'setHover', false)
);

const MobileIcon = enhance(MobileIconDef);
MobileIcon.displayName = 'MobileIcon';

export default MobileIcon;
